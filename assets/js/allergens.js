/**
 * allergens.js — Allergen information page (allergens.html)
 *
 * Everything on this page is generated from the JSON content files:
 *   - allergen list & labels   → content.json  ui_strings.allergens
 *   - dishes, categories, tags → menu.json     dishes / categories
 *   - page copy                → content.json  allergens_page
 * so it stays in sync with the menu automatically.
 */

// Material Symbols icon per allergen key (falls back to a generic icon).
const ALLERGEN_ICONS = {
    dairy: 'water_drop',
    gluten: 'bakery_dining',
    nuts: 'forest',
    peanuts: 'eco',
    eggs: 'egg',
    soy: 'grass',
    sesame: 'grain',
    mustard: 'spa',
    shellfish: 'set_meal',
    fish: 'phishing',
    sulphites: 'wine_bar',
};

// Allergens the visitor has chosen to avoid (dishes containing them are hidden).
const _excludedAllergens = new Set();

const ap = () => C.allergens_page || {};
const allergenLabel = (key) => t(C.ui_strings?.allergens?.[key]) || key;
const availableDishes = () => (C.menu?.dishes || []).filter((d) => d.is_available !== false);
const dishAllergens = (dish) => (Array.isArray(dish.allergens) ? dish.allergens : []);

function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text || '';
}

/* ── Static copy ─────────────────────────────────────────────────────────── */

function renderAllergensHero() {
    const p = ap();
    document.title = t(p.seo_title) || document.title;
    setText('allergens-eyebrow', t(p.eyebrow));
    setText('allergens-title', t(p.title));
    setText('allergens-subtitle', t(p.subtitle));
    setText('allergens-filter-title', t(p.filter_title));
    setText('allergens-filter-hint', t(p.filter_hint));
    setText('allergens-filter-reset', t(p.filter_reset));
    setText('allergens-dishes-title', t(p.dishes_title));
    setText('allergens-back-label', t(p.back_label));

    const crumb = $('allergens-breadcrumb');
    if (crumb) {
        const sep = `<span class="gallery-breadcrumb__sep" aria-hidden="true">›</span>`;
        const menuLabel =
            t(C.ui_strings?.section_labels?.menu) || (lang === 'fr' ? 'La carte' : 'Menu');
        crumb.innerHTML = `
            <a href="index.html" class="gallery-breadcrumb__link">${esc(lang === 'fr' ? 'Accueil' : 'Home')}</a>${sep}
            <a href="index.html#menu" class="gallery-breadcrumb__link">${esc(menuLabel)}</a>${sep}
            <span class="gallery-breadcrumb__current" aria-current="page">${esc(t(p.title))}</span>`;
    }
}

function renderAllergensWarning() {
    const el = $('allergens-warning');
    if (!el) return;
    const p = ap();
    const waPhone =
        C.settings.contact_info?.whatsapp?.tel ||
        C.settings.contact_info?.primary_phone?.tel ||
        C.contact?.primary_action?.phone_e164;
    const eyebrow = t(p.warning_eyebrow);
    const note = t(p.warning_cta_note);
    // Same banner component as the events "free quote" CTA (.events-cta).
    const action =
        waPhone && t(p.warning_cta)
            ? `<div class="events-cta__action">
                   <a class="events-cta__btn" href="${esc(waUrl(waPhone, t(p.warning_cta_message)))}" target="_blank" rel="noopener">
                       ${waSvg('currentColor', 20)} ${esc(t(p.warning_cta))}
                   </a>
                   ${note ? `<span class="events-cta__note">${esc(note)}</span>` : ''}
               </div>`
            : '';
    el.innerHTML = `
        <div class="events-cta__content">
            ${eyebrow ? `<span class="events-cta__eyebrow">${esc(eyebrow)}</span>` : ''}
            <h2 class="events-cta__title">${esc(t(p.warning_title))}</h2>
            <p class="events-cta__subtitle">${esc(t(p.warning_text))}</p>
        </div>
        ${action}`;
}

/* ── Filter chips ────────────────────────────────────────────────────────── */

function renderAllergenChips() {
    const el = $('allergens-chips');
    if (!el) return;
    const dishes = availableDishes();
    el.innerHTML = Object.keys(C.ui_strings?.allergens || {})
        .map((key) => {
            const count = dishes.filter((d) => dishAllergens(d).includes(key)).length;
            const active = _excludedAllergens.has(key);
            return `
            <button type="button" class="allergen-chip${active ? ' is-active' : ''}"
                data-allergen="${esc(key)}" aria-pressed="${active}">
                <span class="material-symbols-outlined" aria-hidden="true">${ALLERGEN_ICONS[key] || 'warning'}</span>
                <span>${esc(allergenLabel(key))}</span>
                <span class="allergen-chip__count">${count}</span>
            </button>`;
        })
        .join('');

    const reset = $('allergens-filter-reset');
    if (reset) reset.hidden = _excludedAllergens.size === 0;
}

/* ── Dishes by category ──────────────────────────────────────────────────── */

function renderDishRow(dish) {
    const p = ap();
    const badges = C.ui_strings?.badges || {};
    const tags = dish.tags || [];
    const diet = [
        tags.includes('vegan')
            ? `<span class="allergen-dish__diet allergen-dish__diet--veg">${esc(t(badges.vegan))}</span>`
            : tags.includes('vegetarian')
              ? `<span class="allergen-dish__diet allergen-dish__diet--veg">${esc(t(badges.vegetarian))}</span>`
              : '',
        tags.includes('halal')
            ? `<span class="allergen-dish__diet allergen-dish__diet--halal">${esc(t(badges.halal))}</span>`
            : '',
    ].join('');

    const allergens = dishAllergens(dish);
    const allergenHtml = allergens.length
        ? `<span class="allergen-dish__contains">${esc(t(p.contains))}</span>
           ${allergens
               .map(
                   (a) => `<span class="allergen-tag-pill">
                       <span class="material-symbols-outlined" aria-hidden="true">${ALLERGEN_ICONS[a] || 'warning'}</span>${esc(allergenLabel(a))}
                   </span>`,
               )
               .join('')}`
        : `<span class="allergen-dish__unknown">
               <span class="material-symbols-outlined" aria-hidden="true">help</span>${esc(t(p.not_specified))}
           </span>`;

    return `
        <li class="allergen-dish">
            <div class="allergen-dish__head">
                <span class="allergen-dish__name">${esc(t(dish.name))}</span>
                ${diet}
            </div>
            <div class="allergen-dish__allergens">${allergenHtml}</div>
        </li>`;
}

function renderAllergenCategories() {
    const el = $('allergens-categories');
    if (!el) return;
    const dishes = availableDishes();
    const visible = (d) => !dishAllergens(d).some((a) => _excludedAllergens.has(a));

    el.innerHTML = (C.menu?.categories || [])
        .filter((cat) => cat.id !== 'all')
        .map((cat) => {
            const inCat = dishes.filter((d) => d.category === cat.id);
            if (!inCat.length) return '';
            const shown = inCat.filter(visible);
            return `
            <section class="allergen-category">
                <h3 class="allergen-category__title">
                    <span class="material-symbols-outlined" aria-hidden="true">${esc(cat.icon || 'restaurant')}</span>
                    ${esc(t(cat.label))}
                    <span class="allergen-category__count">${shown.length}/${inCat.length}</span>
                </h3>
                ${
                    shown.length
                        ? `<ul class="allergen-dish-list">${shown.map(renderDishRow).join('')}</ul>`
                        : `<p class="allergen-category__empty">${esc(t(ap().filter_empty))}</p>`
                }
            </section>`;
        })
        .join('');
}

/* ── Dietary options ─────────────────────────────────────────────────────── */

function renderDietOptions() {
    const el = $('allergens-diet');
    if (!el) return;
    const p = ap();
    const dishes = availableDishes();
    const count = (tag) => dishes.filter((d) => (d.tags || []).includes(tag)).length;
    const cards = [
        {
            icon: 'eco',
            label: t(C.ui_strings?.badges?.vegetarian),
            text: t(p.diet_vegetarian),
            n: count('vegetarian'),
        },
        {
            icon: 'verified',
            label: t(C.ui_strings?.badges?.halal),
            text: t(p.diet_halal),
            n: count('halal'),
        },
    ].filter((c) => c.n > 0 && c.text);

    el.hidden = !cards.length;
    el.innerHTML = cards.length
        ? `<h2 class="allergens-section-title">${esc(t(p.diet_title))}</h2>
           <div class="allergens-diet-grid">
               ${cards
                   .map(
                       (c) => `
                   <div class="allergens-diet-card">
                       <div class="allergens-diet-card__icon" aria-hidden="true">
                           <span class="material-symbols-outlined">${c.icon}</span>
                       </div>
                       <div>
                           <h3 class="allergens-diet-card__title">${esc(c.label)}</h3>
                           <p class="allergens-diet-card__text">${esc(c.text.replace('{count}', c.n))}</p>
                       </div>
                   </div>`,
                   )
                   .join('')}
           </div>`
        : '';
}

/* ── Orchestration ───────────────────────────────────────────────────────── */

function renderAllergensPage() {
    window._navAnchorBase = 'index.html';
    renderTicker();
    renderNav();
    renderFooter();
    renderFloatingWA();

    renderAllergensHero();
    renderAllergensWarning();
    renderAllergenChips();
    renderAllergenCategories();
    renderDietOptions();
    initScrollReveal();
}

function refreshAllergenFilter() {
    renderAllergenChips();
    renderAllergenCategories();
}

async function bootAllergens() {
    try {
        C = await loadContent();
    } catch (err) {
        console.error('Failed to load content:', err);
        return;
    }

    lang = getLang() || C.settings?.default_language || 'fr';
    initSubpageChrome(renderAllergensPage); // privacy.js: lang toggle, mobile menu, header
    renderAllergensPage();

    $('allergens-chips')?.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-allergen]');
        if (!chip) return;
        const key = chip.dataset.allergen;
        _excludedAllergens.has(key) ? _excludedAllergens.delete(key) : _excludedAllergens.add(key);
        refreshAllergenFilter();
    });

    $('allergens-filter-reset')?.addEventListener('click', () => {
        _excludedAllergens.clear();
        refreshAllergenFilter();
    });
}

document.addEventListener('DOMContentLoaded', bootAllergens);
