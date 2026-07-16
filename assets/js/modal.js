/**
 * modal.js — Dish detail popup modal
 */

const SPICE_LABELS = {
    fr: ['', 'Doux', 'Modéré', 'Épicé', 'Très épicé', 'Extrême'],
    en: ['', 'Mild', 'Medium', 'Spicy', 'Very spicy', 'Extreme'],
};

function openDishModal(dishId, triggerEl) {
    const dish = (C.menu?.dishes || []).find((d) => d.id === dishId);
    if (!dish) return;

    const u = C.ui_strings;
    const name = t(dish.name);
    const desc = t(dish.description);

    // ── Image ────────────────────────────────────────────────────────────────
    const imageWrap = $('modal-image-wrap');
    if (imageWrap) {
        if (dish.image) {
            const img = document.createElement('img');
            img.alt = t(dish.image_alt) || name;
            img.loading = 'eager';
            img.onerror = function () {
                const ph = document.createElement('div');
                ph.className = 'dish-modal__img-placeholder';
                ph.textContent = (name[0] || '?').toUpperCase();
                this.replaceWith(ph);
            };
            imageWrap.innerHTML = '';
            imageWrap.appendChild(img);
            img.src = dish.image;
        } else {
            imageWrap.innerHTML = `<div class="dish-modal__img-placeholder">${esc((name[0] || '?').toUpperCase())}</div>`;
        }
    }

    // ── Badges ───────────────────────────────────────────────────────────────
    const badgesEl = $('modal-badges');
    if (badgesEl) {
        let html = '';
        if (dish.is_signature)
            html += `<span class="badge badge--signature">${esc(t(u.badges.signature))}</span>`;
        if (dish.is_new) html += `<span class="badge badge--new">${esc(t(u.badges.new))}</span>`;
        if (dish.tags?.includes('vegan'))
            html += `<span class="badge badge--veg">🌱 ${esc(t(u.badges.vegan))}</span>`;
        else if (dish.tags?.includes('vegetarian'))
            html += `<span class="badge badge--veg">🌱 ${esc(t(u.badges.vegetarian))}</span>`;
        if (dish.tags?.includes('halal'))
            html += `<span class="badge badge--halal">H ${esc(t(u.badges.halal))}</span>`;
        if (dish.tags?.includes('gluten_free'))
            html += `<span class="badge badge--veg">${esc(t(u.badges.gluten_free))}</span>`;
        if (dish.tags?.includes('dairy_free'))
            html += `<span class="badge badge--veg">${esc(t(u.badges.dairy_free))}</span>`;
        badgesEl.innerHTML = html;
    }

    // ── Name & description ───────────────────────────────────────────────────
    const nameEl = $('modal-dish-name');
    if (nameEl) nameEl.textContent = name;

    const descEl = $('modal-desc');
    if (descEl) descEl.textContent = desc;

    // ── Detail rows ──────────────────────────────────────────────────────────
    const detailsEl = $('modal-details');
    if (detailsEl) {
        let rows = '';

        const isVeg = dish.tags?.includes('vegetarian') || dish.tags?.includes('vegan');
        const isHalal = dish.tags?.includes('halal');
        const dietLabel = lang === 'fr' ? 'Régime alimentaire' : 'Dietary';
        let dietValue = '';
        if (isVeg && isHalal)
            dietValue = lang === 'fr' ? 'Végétarien · Halal' : 'Vegetarian · Halal';
        else if (isVeg) dietValue = lang === 'fr' ? 'Végétarien' : 'Vegetarian';
        else if (isHalal) dietValue = 'Halal';
        else dietValue = lang === 'fr' ? 'Non végétarien' : 'Non-vegetarian';

        rows += `
            <div class="dish-modal__detail-row">
                <div class="dish-modal__detail-icon">
                    <span class="material-symbols-outlined">${isVeg ? 'eco' : 'restaurant'}</span>
                </div>
                <div>
                    <span class="dish-modal__detail-label">${esc(dietLabel)}</span>
                    <span class="dish-modal__detail-value">${esc(dietValue)}</span>
                </div>
            </div>`;

        const spice = clamp(dish.spice_level ?? 0, 0, 5);
        if (dish.is_spicy || spice > 0) {
            const flames = spice > 0 ? spice : 1;
            const spiceText = (SPICE_LABELS[lang] || SPICE_LABELS.fr)[flames] || '';
            rows += `
                <div class="dish-modal__detail-row">
                    <div class="dish-modal__detail-icon">
                        <span class="material-symbols-outlined">local_fire_department</span>
                    </div>
                    <div>
                        <span class="dish-modal__detail-label">${esc(t(u.labels?.spice_level) || (lang === 'fr' ? "Niveau d'épice" : 'Spice level'))}</span>
                        <div class="dish-modal__spice-row">
                            <span>${'🌶'.repeat(Math.min(flames, 5))}</span>
                            <span class="dish-modal__detail-value">${esc(spiceText)}</span>
                        </div>
                    </div>
                </div>`;
        }

        const allergenLabel =
            t(u.labels?.contains_allergens) || (lang === 'fr' ? 'Contient' : 'Contains');
        if (dish.allergens?.length) {
            const tags = dish.allergens
                .map((a) => {
                    const al = u.allergens?.[a];
                    const label = al ? t(al) : a;
                    return `<span class="allergen-tag">${esc(label)}</span>`;
                })
                .join('');
            rows += `
                <div class="dish-modal__detail-row">
                    <div class="dish-modal__detail-icon">
                        <span class="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                        <span class="dish-modal__detail-label">${esc(allergenLabel)}</span>
                        <div class="dish-modal__allergen-list">${tags}</div>
                    </div>
                </div>`;
        } else {
            const noAllergenText =
                lang === 'fr' ? 'Aucun allergène déclaré' : 'No declared allergens';
            rows += `
                <div class="dish-modal__detail-row">
                    <div class="dish-modal__detail-icon">
                        <span class="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                        <span class="dish-modal__detail-label">${esc(allergenLabel)}</span>
                        <span class="dish-modal__detail-value dish-modal__no-allergens">${esc(noAllergenText)}</span>
                    </div>
                </div>`;
        }

        if (C.settings.show_calories && dish.calories_kcal != null) {
            rows += `
                <div class="dish-modal__detail-row">
                    <div class="dish-modal__detail-icon">
                        <span class="material-symbols-outlined">nutrition</span>
                    </div>
                    <div>
                        <span class="dish-modal__detail-label">${esc(t(u.labels?.calories) || 'Calories')}</span>
                        <span class="dish-modal__detail-value">${dish.calories_kcal} kcal</span>
                    </div>
                </div>`;
        }

        if (C.settings.show_prices && dish.price_eur != null) {
            const disc = dish.discount_percent;
            let priceStr = '';
            if (disc) {
                const discounted = (dish.price_eur * (1 - disc / 100)).toFixed(2);
                priceStr = `<s style="color:var(--muted);font-size:0.8rem;">${dish.price_eur.toFixed(2)}€</s> <strong>${discounted}€</strong>`;
            } else {
                priceStr = `<strong>${dish.price_eur.toFixed(2)} €</strong>`;
            }
            rows += `
                <div class="dish-modal__detail-row">
                    <div class="dish-modal__detail-icon">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                        <span class="dish-modal__detail-label">${lang === 'fr' ? 'Prix' : 'Price'}</span>
                        <span class="dish-modal__detail-value">${priceStr}</span>
                    </div>
                </div>`;
        }

        detailsEl.innerHTML = rows;
    }

    // ── CTA (add to cart + direct WhatsApp) ──────────────────────────────────
    _currentDishId = dish.id;
    renderModalCta(dish.id);

    // ── Show modal ───────────────────────────────────────────────────────────
    const modal = $('dish-modal');
    if (modal) {
        const closeLabel = modal.querySelector('.dish-modal__close-label');
        if (closeLabel) closeLabel.textContent = lang === 'fr' ? 'Fermer' : 'Close';
        _modalPrevFocus = triggerEl || document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        $('modal-close')?.focus();
    }
}

function closeDishModal() {
    const modal = $('dish-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (_modalPrevFocus && typeof _modalPrevFocus.focus === 'function') {
        _modalPrevFocus.focus();
    }
    _modalPrevFocus = null;
}

function initDishModal() {
    $('modal-close')?.addEventListener('click', closeDishModal);
    $('modal-backdrop')?.addEventListener('click', closeDishModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDishModal();
    });

    document.addEventListener('click', (e) => {
        const modal = $('dish-modal');
        if (modal && !modal.hidden) return;
        if (
            e.target.closest('[data-add-to-cart],[data-open-cart],[data-cart-remove],.cart-qty-btn')
        )
            return;
        const item = e.target.closest('[data-dish]');
        if (item?.dataset.dish) {
            openDishModal(item.dataset.dish, item);
        }
    });
}
