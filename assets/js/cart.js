/**
 * cart.js — Shopping cart state, UI controls, modal, and WhatsApp order integration
 */

const CART_KEY = 'hde_cart';

// ── Persistence ───────────────────────────────────────────────────────────────

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
        cart = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
}

// ── Cart state mutations ───────────────────────────────────────────────────────

function getCartItem(id) {
    return cart.find((i) => i.id === id);
}

function addToCart(id) {
    const item = getCartItem(id);
    if (item) {
        item.qty++;
    } else {
        cart.push({ id, qty: 1 });
    }
    saveCart();
    onCartChange();
}

function removeFromCart(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    onCartChange();
}

function updateCartQty(id, delta) {
    const item = getCartItem(id);
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) {
        removeFromCart(id);
        return;
    }
    saveCart();
    onCartChange();
}

function clearCart() {
    cart = [];
    saveCart();
    onCartChange();
}

function getCartCount() {
    return cart.reduce((s, i) => s + i.qty, 0);
}

function getCartTotal() {
    const dishes = C.menu?.dishes || [];
    return cart.reduce((s, item) => {
        const dish = dishes.find((d) => d.id === item.id);
        if (dish?.price_eur == null) return s;
        const price = dish.discount_percent
            ? dish.price_eur * (1 - dish.discount_percent / 100)
            : dish.price_eur;
        return s + price * item.qty;
    }, 0);
}

// ── UI sync ───────────────────────────────────────────────────────────────────

function updateCartFab() {
    const fab = $('cart-fab');
    const badge = $('cart-fab-badge');
    const count = getCartCount();
    if (fab) fab.hidden = count === 0;
    if (!badge) return;
    badge.textContent = count;
    badge.hidden = count === 0;
}

function onCartChange() {
    updateCartFab();
    updateMenuCartButtons();
}

function updateMenuCartButtons() {
    const addLabel = lang === 'fr' ? 'Ajouter au panier' : 'Add to cart';
    document.querySelectorAll('[data-cart-control]').forEach((el) => {
        const id = el.dataset.cartControl;
        const item = getCartItem(id);
        if (item) {
            el.innerHTML = `
                <div class="menu-item__qty-wrap">
                    <button class="cart-qty-btn menu-cart-btn" data-dish-id="${esc(id)}" data-action="dec" data-context="menu" aria-label="Retirer">−</button>
                    <span class="cart-qty-value menu-cart-qty">${item.qty}</span>
                    <button class="cart-qty-btn menu-cart-btn" data-dish-id="${esc(id)}" data-action="inc" data-context="menu" aria-label="Ajouter">+</button>
                </div>`;
        } else {
            el.innerHTML = `
                <button class="menu-item__add-btn" data-add-to-cart="${esc(id)}" aria-label="${esc(addLabel)}">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>`;
        }
    });
}

// ── Order scheduling (date/time picked before sending to WhatsApp) ─────────────

function getOrderingCutoffHour() {
    const hour = C.settings?.ordering?.same_day_cutoff_hour;
    return Number.isFinite(hour) ? clamp(hour, 0, 23) : 9;
}

// Minimum preparation lead time in hours: no slot earlier than now + this.
function getOrderingLeadHours() {
    const hours = C.settings?.ordering?.same_day_cutoff_window;
    return Number.isFinite(hours) ? clamp(hours, 0, 168) : 0;
}

const TIME_STR_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_SLOT_STEP_MINUTES = 15;
const DEFAULT_TIME_WINDOW = { start: '12:00', end: '21:00' };

function getOrderingTimeWindow() {
    const o = C.settings?.ordering || {};
    const start = TIME_STR_RE.test(o.earliest_delivery_time)
        ? o.earliest_delivery_time
        : DEFAULT_TIME_WINDOW.start;
    const end = TIME_STR_RE.test(o.latest_delivery_time)
        ? o.latest_delivery_time
        : DEFAULT_TIME_WINDOW.end;
    // Guard against a misconfigured window (start after end) by falling back
    // to the default rather than producing an empty hour dropdown.
    return start <= end ? { start, end } : DEFAULT_TIME_WINDOW;
}

function formatTimeForDisplay(timeStr) {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(Number(h), Number(m), 0, 0);
    const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

const minutesToTime = (mins) =>
    `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// Earliest moment an order can be delivered, given the preparation lead time.
function getEarliestDeliveryDateTime() {
    return new Date(Date.now() + getOrderingLeadHours() * 3600000);
}

// All selectable "HH:MM" slots for a given date: every 15 minutes inside the
// delivery window, excluding anything before now + lead time.
function getAvailableTimeSlots(dateStr) {
    const { start, end } = getOrderingTimeWindow();
    const earliest = getEarliestDeliveryDateTime();
    const earliestDateStr = formatDateInputValue(earliest);
    if (!dateStr || dateStr < earliestDateStr) return [];

    const minMinutes =
        dateStr === earliestDateStr ? earliest.getHours() * 60 + earliest.getMinutes() : 0;
    const slots = [];
    for (let m = timeToMinutes(start); m <= timeToMinutes(end); m += TIME_SLOT_STEP_MINUTES) {
        if (m >= minMinutes) slots.push(minutesToTime(m));
    }
    return slots;
}

function fillSelect(select, values, preferred) {
    select.innerHTML = values.map((v) => `<option value="${v}">${v}</option>`).join('');
    if (values.includes(preferred)) select.value = preferred;
}

// Populate the hour/minute <select> dropdowns with only the slots available
// for the chosen date (rather than relying on native <input type="time">
// min/max, which mobile browsers don't enforce).
function populateTimeSelects(dateStr, preferredTime = '') {
    const hourSelect = $('schedule-time-hour');
    const minuteSelect = $('schedule-time-minute');
    if (!hourSelect || !minuteSelect) return;

    const slots = getAvailableTimeSlots(dateStr);
    const [prefHour, prefMinute] = preferredTime.split(':');
    fillSelect(hourSelect, [...new Set(slots.map((s) => s.slice(0, 2)))], prefHour);
    populateMinuteSelect(slots, prefMinute);
}

function populateMinuteSelect(slots, preferredMinute = '') {
    const hourSelect = $('schedule-time-hour');
    const minuteSelect = $('schedule-time-minute');
    if (!hourSelect || !minuteSelect) return;
    const minutes = slots
        .filter((s) => s.startsWith(`${hourSelect.value}:`))
        .map((s) => s.slice(3));
    fillSelect(minuteSelect, minutes, preferredMinute);
}

function getSelectedTimeValue() {
    const hourSelect = $('schedule-time-hour');
    const minuteSelect = $('schedule-time-minute');
    if (!hourSelect?.value || !minuteSelect?.value) return '';
    return `${hourSelect.value}:${minuteSelect.value}`;
}

// ── Order log (optional Google Sheets webhook) ──────────────────────────────────
// Best-effort, fire-and-forget: a row is appended to the owner's Google Sheet
// via a free Apps Script Web App (see doc/ORDER_LOG_SETUP.md). If no webhook
// is configured in content.json, this silently does nothing — the WhatsApp
// order flow is never blocked or delayed by it.
function logOrderToSheet(payload) {
    const url = C.settings?.order_log?.m4Rx;
    if (!url) return;
    const body = JSON.stringify({
        ...payload,
        secret: C.settings?.order_log?.k7Qz || '',
    });
    try {
        // Sent as text/plain to avoid a CORS preflight request, which Apps
        // Script Web Apps don't handle; the script parses JSON from the body.
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body,
            keepalive: true,
        }).catch(() => {});
    } catch (_) {}
}

// Earliest selectable date: tomorrow if past the same-day cutoff hour, then
// pushed forward further until a date actually has a slot left after the
// preparation lead time.
function getMinOrderDate() {
    const cutoffHour = getOrderingCutoffHour();
    const min = new Date();
    if (min.getHours() >= cutoffHour) {
        min.setDate(min.getDate() + 1);
    }
    min.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14 && !getAvailableTimeSlots(formatDateInputValue(min)).length; i++) {
        min.setDate(min.getDate() + 1);
    }
    return min;
}

function formatDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatScheduleDateForMessage(dateStr) {
    const date = new Date(`${dateStr}T00:00:00`);
    if (isNaN(date)) return dateStr;
    const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function appendScheduleToMessage(baseMsg, dateStr, timeStr) {
    const u = C.ui_strings?.ordering || {};
    const dateLabel =
        t(u.whatsapp_date_label) ||
        (lang === 'fr' ? 'Date de commande souhaitée' : 'Requested desired date');
    const timeLabel =
        t(u.whatsapp_time_label) || (lang === 'fr' ? 'Heure souhaitée' : 'Requested desired time');
    return `${baseMsg}\n\n• ${dateLabel} : ${formatScheduleDateForMessage(dateStr)}\n• ${timeLabel} : ${timeStr}`;
}

function openScheduleModal(onConfirm) {
    const modal = $('schedule-modal');
    if (!modal) {
        onConfirm?.();
        return;
    }

    const u = C.ui_strings?.ordering || {};
    const cutoffHour = getOrderingCutoffHour();
    const minDateStr = formatDateInputValue(getMinOrderDate());
    const sameDayAvailable = minDateStr === formatDateInputValue(new Date());
    const noteText = (
        t(sameDayAvailable ? u.same_day_available_note : u.same_day_closed_note) || ''
    ).replace('{hour}', cutoffHour);

    const titleEl = $('schedule-modal-title');
    if (titleEl)
        titleEl.textContent =
            t(u.modal_title) ||
            (lang === 'fr'
                ? 'Quand souhaitez-vous votre commande ?'
                : 'When would you like your order?');

    const dateLabelEl = $('schedule-date-label');
    if (dateLabelEl)
        dateLabelEl.textContent =
            t(u.date_label) || (lang === 'fr' ? 'Date souhaitée' : 'Desired date');

    const timeLabelEl = $('schedule-time-label');
    if (timeLabelEl)
        timeLabelEl.textContent =
            t(u.time_label) || (lang === 'fr' ? 'Heure souhaitée' : 'Desired time');

    const cancelBtn = $('schedule-cancel-btn');
    if (cancelBtn)
        cancelBtn.textContent = t(u.cancel_button) || (lang === 'fr' ? 'Annuler' : 'Cancel');

    const confirmLabelEl = $('schedule-confirm-label');
    if (confirmLabelEl)
        confirmLabelEl.textContent =
            t(u.confirm_button) ||
            (lang === 'fr' ? 'Continuer sur WhatsApp' : 'Continue on WhatsApp');

    const noteEl = $('schedule-note');
    if (noteEl) noteEl.textContent = noteText;

    const dateInput = $('schedule-date-input');
    if (dateInput) {
        dateInput.min = minDateStr;
        dateInput.value = minDateStr;
    }

    const { start: windowStart, end: windowEnd } = getOrderingTimeWindow();
    const leadHours = getOrderingLeadHours();
    const timeWindowNoteEl = $('schedule-time-window-note');
    if (timeWindowNoteEl) {
        let hint = (
            t(u.time_window_note) ||
            (lang === 'fr'
                ? 'Livraison possible entre {start} et {end}.'
                : 'Delivery available between {start} and {end}.')
        )
            .replace('{start}', formatTimeForDisplay(windowStart))
            .replace('{end}', formatTimeForDisplay(windowEnd));
        if (leadHours > 0) {
            hint += ` ${(
                t(u.lead_time_note) ||
                (lang === 'fr'
                    ? 'Délai de préparation minimum : {hours} h.'
                    : 'Minimum preparation time: {hours} h.')
            ).replace('{hours}', leadHours)}`;
        }
        timeWindowNoteEl.textContent = hint;
    }
    populateTimeSelects(minDateStr);

    const errorEl = $('schedule-error');
    if (errorEl) errorEl.hidden = true;

    _scheduleConfirmCallback = onConfirm;
    _schedulePrevFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    dateInput?.focus();
}

function closeScheduleModal() {
    const modal = $('schedule-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (_schedulePrevFocus?.focus) _schedulePrevFocus.focus();
    _schedulePrevFocus = null;
    _scheduleConfirmCallback = null;
}

function initScheduleModal() {
    $('schedule-close')?.addEventListener('click', closeScheduleModal);
    $('schedule-backdrop')?.addEventListener('click', closeScheduleModal);
    $('schedule-cancel-btn')?.addEventListener('click', closeScheduleModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeScheduleModal();
    });

    // Available slots depend on the chosen date (lead time only trims the
    // earliest day), so refresh the time dropdowns whenever date/hour change.
    $('schedule-date-input')?.addEventListener('change', (e) => {
        populateTimeSelects(e.target.value, getSelectedTimeValue());
    });
    $('schedule-time-hour')?.addEventListener('change', () => {
        populateMinuteSelect(
            getAvailableTimeSlots($('schedule-date-input')?.value),
            $('schedule-time-minute')?.value,
        );
    });

    $('schedule-confirm-btn')?.addEventListener('click', () => {
        const dateInput = $('schedule-date-input');
        const errorEl = $('schedule-error');
        const u = C.ui_strings?.ordering || {};

        // Mobile browsers (notably iOS Safari) only commit the native date
        // picker's scrolled value to the input on blur — force that commit here
        // before reading .value, otherwise we can read a stale pre-scroll value.
        dateInput?.blur();

        if (!dateInput?.value) {
            if (errorEl) {
                errorEl.textContent =
                    t(u.error_required) ||
                    (lang === 'fr'
                        ? 'Merci de choisir une date et une heure.'
                        : 'Please choose a date and time.');
                errorEl.hidden = false;
            }
            return;
        }

        // Some mobile browsers (notably iOS Safari) don't enforce the native
        // date input's min/max while scrolling the wheel picker, so re-validate
        // the chosen date against the cutoff rule here before accepting it.
        const minDateStr = formatDateInputValue(getMinOrderDate());
        if (dateInput.value < minDateStr) {
            if (errorEl) {
                errorEl.textContent = (
                    t(u.error_date_too_early) ||
                    (lang === 'fr'
                        ? 'Merci de choisir une date à partir du {date}.'
                        : 'Please choose a date from {date} onward.')
                ).replace('{date}', formatScheduleDateForMessage(minDateStr));
                errorEl.hidden = false;
            }
            dateInput.min = minDateStr;
            dateInput.value = minDateStr;
            populateTimeSelects(minDateStr, getSelectedTimeValue());
            return;
        }

        // The dropdowns only list valid slots, but re-check at confirm time:
        // the lead time keeps moving while the modal is open, so a slot that
        // was valid when the modal opened may no longer be.
        const timeVal = getSelectedTimeValue();
        if (!getAvailableTimeSlots(dateInput.value).includes(timeVal)) {
            if (errorEl) {
                errorEl.textContent =
                    t(u.error_time_unavailable) ||
                    (lang === 'fr'
                        ? "Ce créneau n'est plus disponible, merci d'en choisir un autre."
                        : 'This time slot is no longer available, please choose another.');
                errorEl.hidden = false;
            }
            populateTimeSelects(dateInput.value, timeVal);
            return;
        }

        const callback = _scheduleConfirmCallback;
        const dateVal = dateInput.value;
        closeScheduleModal();
        callback?.(dateVal, timeVal);
    });
}

// ── Dish modal CTA ────────────────────────────────────────────────────────────

function renderModalCta(dishId) {
    const ctaEl = $('modal-cta');
    if (!ctaEl) return;

    const dish = (C.menu?.dishes || []).find((d) => d.id === dishId);
    if (!dish) return;

    const name = t(dish.name);
    const cartItem = getCartItem(dishId);

    const wa = C.contact?.primary_action;
    const waPhone =
        C.settings.contact_info?.whatsapp?.tel ||
        C.settings.contact_info?.primary_phone?.tel ||
        wa?.phone_e164;
    const waLinkHtml = waPhone
        ? `<button type="button" class="dish-modal__wa-link" data-wa-quick-order="${esc(dishId)}">${waSvg('currentColor', 15)} ${esc(lang === 'fr' ? 'Commander directement sur WhatsApp' : 'Order directly on WhatsApp')}</button>`
        : '';

    if (cartItem) {
        const viewLabel =
            lang === 'fr' ? `Voir le panier (${getCartCount()})` : `View cart (${getCartCount()})`;
        ctaEl.innerHTML = `
            <div class="dish-modal__qty-controls">
                <button class="cart-qty-btn" data-dish-id="${esc(dishId)}" data-action="dec" aria-label="${lang === 'fr' ? 'Retirer un' : 'Remove one'}">−</button>
                <span class="cart-qty-value">${cartItem.qty}</span>
                <button class="cart-qty-btn" data-dish-id="${esc(dishId)}" data-action="inc" aria-label="${lang === 'fr' ? 'Ajouter un' : 'Add one'}">+</button>
                <span class="cart-qty-label">${lang === 'fr' ? 'dans le panier' : 'in cart'}</span>
            </div>
            <button class="dish-modal__view-cart" data-open-cart>
                <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:-2px;">shopping_cart</span>
                ${esc(viewLabel)}
            </button>
            ${waLinkHtml}`;
    } else {
        const addLabel = lang === 'fr' ? 'Ajouter au panier' : 'Add to cart';
        ctaEl.innerHTML = `
            <button class="dish-modal__add-cart" data-add-to-cart="${esc(dishId)}">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                ${esc(addLabel)}
            </button>
            ${waLinkHtml}`;
    }
}

// ── Cart modal renderer ───────────────────────────────────────────────────────

function renderCartModal() {
    const itemsEl = $('cart-items');
    const footerEl = $('cart-footer');
    const titleEl = $('cart-modal-title');

    const count = getCartCount();
    const dishes = C.menu?.dishes || [];

    if (titleEl) {
        titleEl.textContent = lang === 'fr' ? `Mon Panier (${count})` : `My Cart (${count})`;
    }

    if (!cart.length) {
        if (itemsEl)
            itemsEl.innerHTML = `
                <div class="cart-empty">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    <p>${lang === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}</p>
                </div>`;
        if (footerEl) footerEl.innerHTML = '';
        return;
    }

    if (itemsEl) {
        itemsEl.innerHTML = cart
            .map((item) => {
                const dish = dishes.find((d) => d.id === item.id);
                if (!dish) return '';
                const name = t(dish.name);
                const disc = dish.discount_percent;
                const unitPrice =
                    dish.price_eur != null
                        ? disc
                            ? dish.price_eur * (1 - disc / 100)
                            : dish.price_eur
                        : null;
                const lineTotal = unitPrice != null ? (unitPrice * item.qty).toFixed(2) : null;
                const unitLabel =
                    unitPrice != null
                        ? `${unitPrice.toFixed(2)}€ / ${lang === 'fr' ? 'unité' : 'unit'}`
                        : '';

                const imgHtml = dish.image
                    ? `<img src="${esc(dish.image)}" alt="${esc(name)}" loading="lazy" onerror="this.style.display='none'">`
                    : `<div class="cart-item__placeholder">${esc((name[0] || '?').toUpperCase())}</div>`;

                return `
                    <div class="cart-item">
                        <div class="cart-item__img">${imgHtml}</div>
                        <div class="cart-item__info">
                            <span class="cart-item__name">${esc(name)}</span>
                            ${unitLabel ? `<span class="cart-item__unit-price">${esc(unitLabel)}</span>` : ''}
                        </div>
                        <div class="cart-item__controls">
                            <button class="cart-qty-btn" data-dish-id="${esc(item.id)}" data-action="dec" data-context="cart" aria-label="${lang === 'fr' ? 'Retirer' : 'Remove'}">−</button>
                            <span class="cart-qty-value">${item.qty}</span>
                            <button class="cart-qty-btn" data-dish-id="${esc(item.id)}" data-action="inc" data-context="cart" aria-label="${lang === 'fr' ? 'Ajouter' : 'Add'}">+</button>
                        </div>
                        ${lineTotal != null ? `<span class="cart-item__total">${lineTotal}€</span>` : ''}
                        <button class="cart-item__remove" data-cart-remove="${esc(item.id)}" aria-label="${lang === 'fr' ? 'Supprimer' : 'Remove item'}">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>`;
            })
            .join('');
    }

    if (footerEl) {
        const total = getCartTotal();
        const hasPrice = cart.some((item) => {
            const dish = dishes.find((d) => d.id === item.id);
            return dish?.price_eur != null;
        });

        const wa = C.contact?.primary_action;
        const waPhone =
            C.settings.contact_info?.whatsapp?.tel ||
            C.settings.contact_info?.primary_phone?.tel ||
            wa?.phone_e164;

        let msg =
            lang === 'fr'
                ? 'Bonjour ! Je souhaite passer commande pour les plats suivants :\n\n'
                : 'Hello! I would like to place an order for the following dishes:\n\n';
        cart.forEach((item) => {
            const dish = dishes.find((d) => d.id === item.id);
            if (!dish) return;
            const name = t(dish.name);
            const disc = dish.discount_percent;
            const price =
                dish.price_eur != null
                    ? disc
                        ? dish.price_eur * (1 - disc / 100)
                        : dish.price_eur
                    : null;
            msg += `• ${item.qty}x ${name}`;
            if (price != null) msg += ` — ${(price * item.qty).toFixed(2)}€`;
            msg += '\n';
        });
        if (hasPrice && total > 0) {
            msg += `\n${lang === 'fr' ? 'Total estimé' : 'Estimated total'} : ${total.toFixed(2)}€`;
        }
        msg += `\n\n${lang === 'fr' ? 'Merci !' : 'Thank you!'}`;

        const clearLabel = lang === 'fr' ? 'Vider le panier' : 'Clear cart';
        const orderLabel =
            lang === 'fr' ? 'Envoyer la commande sur WhatsApp' : 'Send order on WhatsApp';

        footerEl.innerHTML = `
            ${hasPrice && total > 0 ? `<div class="cart-total"><span>${lang === 'fr' ? 'Total estimé' : 'Estimated total'}</span><strong>${total.toFixed(2)} €</strong></div>` : ''}
            <div class="cart-footer__actions">
                ${waPhone ? `<button type="button" class="cart-order-btn" id="cart-order-btn">${waSvg('white', 20)} ${esc(orderLabel)}</button>` : ''}
                <button class="cart-clear-btn" id="cart-clear-btn">${esc(clearLabel)}</button>
            </div>`;

        $('cart-order-btn')?.addEventListener('click', () => {
            openScheduleModal((dateVal, timeVal) => {
                const finalMsg = appendScheduleToMessage(msg, dateVal, timeVal);
                const itemsSummary = cart
                    .map((item) => {
                        const dish = dishes.find((d) => d.id === item.id);
                        return dish ? `${item.qty}x ${t(dish.name)}` : null;
                    })
                    .filter(Boolean)
                    .join(', ');
                // logOrderToSheet({
                //     deliveryDate: dateVal,
                //     deliveryTime: timeVal,
                //     itemsSummary,
                //     totalAmount: hasPrice && total > 0 ? Number(total.toFixed(2)) : null,
                //     language: lang,
                //     source: 'cart',
                // });
                window.open(waUrl(waPhone, finalMsg), '_blank', 'noopener');
            });
        });

        $('cart-clear-btn')?.addEventListener('click', () => {
            clearCart();
            renderCartModal();
        });
    }
}

// ── Cart modal open/close ─────────────────────────────────────────────────────

function openCartModal() {
    renderCartModal();
    const modal = $('cart-modal');
    if (!modal) return;
    _cartPrevFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('cart-close')?.focus();
}

function closeCartModal() {
    const modal = $('cart-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (_cartPrevFocus?.focus) _cartPrevFocus.focus();
    _cartPrevFocus = null;
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initCart() {
    loadCart();
    updateCartFab();
    updateMenuCartButtons();

    $('cart-fab')?.addEventListener('click', openCartModal);
    $('cart-close')?.addEventListener('click', closeCartModal);
    $('cart-backdrop')?.addEventListener('click', closeCartModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCartModal();
    });

    document.addEventListener('click', (e) => {
        // Add to cart (menu card or dish modal)
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
            const id = addBtn.dataset.addToCart;
            addToCart(id);
            const dishModal = $('dish-modal');
            if (dishModal && !dishModal.hidden && _currentDishId === id) {
                renderModalCta(id);
            }
            return;
        }

        // Qty +/- (menu card, dish modal, or cart modal)
        const qtyBtn = e.target.closest('.cart-qty-btn');
        if (qtyBtn) {
            const { dishId, action, context } = qtyBtn.dataset;
            updateCartQty(dishId, action === 'inc' ? 1 : -1);
            if (context === 'cart') {
                renderCartModal();
            } else if (context !== 'menu' && _currentDishId) {
                renderModalCta(_currentDishId);
            }
            return;
        }

        // Remove item from cart modal
        const removeBtn = e.target.closest('[data-cart-remove]');
        if (removeBtn) {
            removeFromCart(removeBtn.dataset.cartRemove);
            renderCartModal();
            return;
        }

        // "View cart" button inside dish modal
        if (e.target.closest('[data-open-cart]')) {
            closeDishModal();
            openCartModal();
            return;
        }

        // Quick "order this dish directly on WhatsApp" button inside dish modal
        const quickOrderBtn = e.target.closest('[data-wa-quick-order]');
        if (quickOrderBtn) {
            const dishId = quickOrderBtn.dataset.waQuickOrder;
            const dish = (C.menu?.dishes || []).find((d) => d.id === dishId);
            if (!dish) return;
            const wa = C.contact?.primary_action;
            const waPhone =
                C.settings.contact_info?.whatsapp?.tel ||
                C.settings.contact_info?.primary_phone?.tel ||
                wa?.phone_e164;
            if (!waPhone) return;
            const name = t(dish.name);
            const baseMsg =
                lang === 'fr'
                    ? `Bonjour ! Je souhaite commander : ${name}`
                    : `Hello! I'd like to order: ${name}`;
            openScheduleModal((dateVal, timeVal) => {
                const finalMsg = appendScheduleToMessage(baseMsg, dateVal, timeVal);
                logOrderToSheet({
                    deliveryDate: dateVal,
                    deliveryTime: timeVal,
                    itemsSummary: `1x ${name}`,
                    totalAmount: dish.price_eur != null ? dish.price_eur : null,
                    language: lang,
                    source: 'quick-order',
                });
                window.open(waUrl(waPhone, finalMsg), '_blank', 'noopener');
            });
            return;
        }
    });
}
