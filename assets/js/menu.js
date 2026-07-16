/**
 * menu.js — Menu item builder, category renderer, and filter
 */

function buildMenuItem(dish) {
    const name = t(dish.name);
    const desc = t(dish.description);
    const u = C.ui_strings;
    const isVeg = dish.tags?.includes('vegetarian') || dish.tags?.includes('vegan');
    const isHalal = dish.tags?.includes('halal');

    // Badges
    let badges = '';
    if (dish.is_signature)
        badges += `<span class="badge badge--signature">${esc(t(u.badges.signature))}</span>`;
    if (dish.is_new) badges += `<span class="badge badge--new">${esc(t(u.badges.new))}</span>`;
    if (isVeg) badges += `<span class="badge badge--veg">🌱</span>`;
    if (isHalal && !isVeg) badges += `<span class="badge badge--halal">H</span>`;

    const spice = clamp(dish.spice_level ?? 0, 0, 5);
    if (dish.is_spicy || spice > 0) {
        const flames = spice > 0 ? spice : 1;
        badges += `<span class="badge badge--spicy">${'🌶'.repeat(Math.min(flames, 5))}</span>`;
    }

    // Price
    let priceHtml = '';
    if (C.settings.show_prices && dish.price_eur != null) {
        const disc = dish.discount_percent;
        if (disc) {
            const discounted = (dish.price_eur * (1 - disc / 100)).toFixed(2);
            priceHtml = `
                <div class="menu-item__price">
                    <span style="text-decoration:line-through;font-size:0.75rem;color:var(--muted);">${dish.price_eur.toFixed(2)}€</span>
                    <span>${discounted}€</span>
                </div>`;
        } else {
            priceHtml = `<span class="menu-item__price">${dish.price_eur.toFixed(2)}€</span>`;
        }
    }

    // Calories
    let caloriesHtml = '';
    if (C.settings.show_calories && dish.calories_kcal != null) {
        caloriesHtml = `<span class="menu-item__calories">${dish.calories_kcal} ${t(u.labels?.calories) || 'kcal'}</span>`;
    }

    // Allergens
    let allergensHtml = '';
    if (C.settings.show_allergens && dish.allergens?.length) {
        const tags = dish.allergens
            .map((a) => {
                const al = u.allergens?.[a];
                const label = al ? t(al) : a;
                return `<span class="allergen-tag">${esc(label)}</span>`;
            })
            .join('');
        allergensHtml = `<div class="menu-item__allergens">${tags}</div>`;
    }

    // Image
    const imageHtml = dish.image
        ? `<img data-src="${esc(dish.image)}" alt="${esc(t(dish.image_alt))}" loading="lazy">`
        : `<div class="menu-item__placeholder">${esc(name[0] || '?')}</div>`;

    const metaHtml =
        caloriesHtml || allergensHtml
            ? `<div class="menu-item__meta">${caloriesHtml}${allergensHtml}</div>`
            : '';

    return `
        <div class="menu-item" data-dish="${esc(dish.id)}">
            <div class="menu-item__image">${imageHtml}</div>
            <div class="menu-item__body">
                <div class="menu-item__header">
                    <span class="menu-item__name">${esc(name)}</span>
                    <div class="menu-item__actions">
                        ${priceHtml}
                        <div class="menu-item__cart" data-cart-control="${esc(dish.id)}"></div>
                    </div>
                </div>
                ${badges ? `<div class="menu-item__badges">${badges}</div>` : ''}
                <p class="menu-item__desc">${esc(desc)}</p>
                ${metaHtml}
            </div>
        </div>
    `;
}

function renderMenu() {
    const m = C.menu;
    const u = C.ui_strings;

    // Title
    const title = $('menu-title');
    if (title) {
        title.innerHTML = `<span class="font-script text-primary">${esc(t(m.section_title))}</span>`;
    }

    // Footnote
    const footnote = $('menu-footnote');
    if (footnote) footnote.textContent = t(m.footnote);

    // Allergen link
    const allergenLink = $('allergen-link');
    if (allergenLink) {
        allergenLink.href = m.allergen_button.url || '#';
        const linkText = allergenLink.childNodes[allergenLink.childNodes.length - 1];
        if (linkText) linkText.textContent = ' ' + t(m.allergen_button.label);
    }

    // Download menu button
    const downloadBtn = $('download-menu-btn');
    if (downloadBtn && m.download_button) {
        downloadBtn.href = m.download_button.url || 'assets/Menu.pdf';
        const btnText = downloadBtn.querySelector('[data-i18n="download_menu"]');
        if (btnText) btnText.textContent = t(m.download_button.label);
    }

    const cats = m.categories || [];
    const available = (m.dishes || []).filter((d) => d.is_available !== false);

    // Category filters
    const filters = $('menu-filters');
    if (filters) {
        filters.innerHTML = cats
            .map(
                (cat) => `
            <button class="menu-filter${cat.id === activeCategory ? ' active' : ''}"
                    data-cat="${esc(cat.id)}" aria-pressed="${cat.id === activeCategory}">
                ${esc(t(cat.label))}
            </button>
        `,
            )
            .join('');

        filters.querySelectorAll('.menu-filter').forEach((btn) => {
            btn.addEventListener('click', () => filterMenu(btn.dataset.cat));
        });
    }

    // Menu grid grouped by category
    const grid = $('menu-grid');
    if (!grid) return;

    if (!available.length) {
        grid.innerHTML = `<p style="text-align:center;color:var(--muted);padding:2rem;">${esc(t(u.labels.menu_empty))}</p>`;
        return;
    }

    const dataCats = cats.filter((c) => c.id !== 'all');
    grid.innerHTML = dataCats
        .map((cat) => {
            const dishes = available.filter((d) => d.category === cat.id);
            if (!dishes.length) return '';

            return `
            <div class="menu-group" data-cat-group="${esc(cat.id)}">
                <div class="menu-group-header">
                    <h3>
                        <span class="material-symbols-outlined">${esc(cat.icon || 'restaurant_menu')}</span>
                        ${esc(t(cat.label))}
                    </h3>
                </div>
                <div class="menu-items">
                    ${dishes.map(buildMenuItem).join('')}
                </div>
            </div>
        `;
        })
        .join('');

    // Lazy load images
    grid.querySelectorAll('img[data-src]').forEach((img) => {
        img.src = img.dataset.src;
        const nameEl = img.closest('.menu-item')?.querySelector('.menu-item__name');
        imgFallback(img, nameEl?.textContent);
    });

    filterMenu(activeCategory, false);
}

function filterMenu(catId, animate = true) {
    activeCategory = catId;

    $$('.menu-filter').forEach((btn) => {
        const active = btn.dataset.cat === catId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
    });

    $$('.menu-group').forEach((group) => {
        const match = catId === 'all' || group.dataset.catGroup === catId;
        group.classList.toggle('menu-group--hidden', !match);
    });
}
