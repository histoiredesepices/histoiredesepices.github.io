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
    const badge = $('cart-fab-badge');
    const count = getCartCount();
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
    const waMsg =
        lang === 'fr'
            ? `Bonjour ! Je souhaite commander : ${name}`
            : `Hello! I'd like to order: ${name}`;
    const waHref = waPhone ? waUrl(waPhone, waMsg) : null;
    const waLinkHtml = waHref
        ? `<a class="dish-modal__wa-link" href="${esc(waHref)}" target="_blank" rel="noopener">${waSvg('currentColor', 15)} ${esc(lang === 'fr' ? 'Commander directement sur WhatsApp' : 'Order directly on WhatsApp')}</a>`
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

        const waHref = waPhone ? waUrl(waPhone, msg) : null;
        const clearLabel = lang === 'fr' ? 'Vider le panier' : 'Clear cart';
        const orderLabel =
            lang === 'fr' ? 'Envoyer la commande sur WhatsApp' : 'Send order on WhatsApp';

        footerEl.innerHTML = `
            ${hasPrice && total > 0 ? `<div class="cart-total"><span>${lang === 'fr' ? 'Total estimé' : 'Estimated total'}</span><strong>${total.toFixed(2)} €</strong></div>` : ''}
            <div class="cart-footer__actions">
                ${waHref ? `<a class="cart-order-btn" href="${esc(waHref)}" target="_blank" rel="noopener">${waSvg('white', 20)} ${esc(orderLabel)}</a>` : ''}
                <button class="cart-clear-btn" id="cart-clear-btn">${esc(clearLabel)}</button>
            </div>`;

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
    });
}
