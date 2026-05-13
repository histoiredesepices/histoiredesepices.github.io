/**
 * app.js — L'Histoire des Épices (Modern Redesign)
 * Loads content.json, hydrates the DOM, handles language toggle, menu filter, and interactions.
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

let C = null;
let lang = 'fr';
let activeCategory = 'all';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const esc = (s) =>
    String(s ?? '').replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );

const t = (obj) => (!obj ? '' : obj[lang] || obj.fr || obj.en || '');

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, isNaN(n) ? lo : n));

const safeLang = (l) => {
    try {
        localStorage.setItem('lang', l);
    } catch (_) {}
};

const getLang = () => {
    try {
        return localStorage.getItem('lang');
    } catch (_) {
        return null;
    }
};

function waUrl(phone, msg) {
    const n = String(phone).replace(/\D/g, '').replace(/^0/, '33');
    return `https://wa.me/${n.startsWith('33') ? n : '33' + n}?text=${encodeURIComponent(msg)}`;
}

function imgFallback(img, initial) {
    img.loading = 'lazy';
    img.onerror = function () {
        const placeholder = document.createElement('div');
        placeholder.className = this.closest('.specialty-card')
            ? 'specialty-card__placeholder'
            : this.closest('.menu-item')
              ? 'menu-item__placeholder'
              : 'heritage-image-placeholder';
        placeholder.textContent = (initial || '?')[0].toUpperCase();
        placeholder.setAttribute('aria-hidden', 'true');
        this.replaceWith(placeholder);
    };
}

// WhatsApp SVG
const WA_PATH =
    'M16 2C8.27 2 2 8.27 2 16c0 2.44.65 4.74 1.79 6.73L2 30l7.51-1.97A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.46 11.46 0 01-5.84-1.6l-.42-.25-4.46 1.17 1.19-4.33-.28-.44A11.5 11.5 0 1116 27.5zm6.3-8.6c-.34-.17-2.02-1-2.34-1.11-.32-.12-.55-.17-.78.17s-.9 1.11-1.1 1.34c-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.6.09-.91.43s-1.2 1.17-1.2 2.85c0 1.68 1.23 3.3 1.4 3.53.17.23 2.43 3.71 5.88 5.2.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.83 2.3-1.63.29-.8.29-1.49.2-1.63-.08-.15-.31-.23-.65-.4z';
const waSvg = (fill = 'white', size = 28) =>
    `<svg viewBox="0 0 32 32" fill="${fill}" width="${size}" height="${size}" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;

// ═══════════════════════════════════════════════════════════════════════════
// SEO
// ═══════════════════════════════════════════════════════════════════════════

function updateSEO() {
    const s = C.seo;
    document.title = t(s.title);
    document.documentElement.lang = lang;

    const setMeta = (sel, val) => {
        const m = document.querySelector(sel);
        if (m) m.content = val;
    };

    setMeta('meta[name="description"]', t(s.description));
    setMeta('meta[property="og:title"]', t(s.title));
    setMeta('meta[property="og:description"]', t(s.description));
    setMeta('meta[name="twitter:title"]', t(s.title));
    setMeta('meta[name="twitter:description"]', t(s.description));
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function renderNav() {
    const items = C.navigation?.items || [];
    const wa = C.contact?.primary_action;
    const waHref = wa ? waUrl(wa.phone_e164, t(wa.prefilled_message)) : '#contact';

    // Desktop nav links
    const navLinks = $('nav-links');
    if (navLinks) {
        navLinks.innerHTML = items
            .map((item) => `<a href="#${esc(item.id)}" class="nav-link">${esc(t(item.label))}</a>`)
            .join('');
    }

    // Mobile nav links
    const mobileLinks = $('mobile-nav-links');
    if (mobileLinks) {
        mobileLinks.innerHTML = items
            .map(
                (item) =>
                    `<a href="#${esc(item.id)}" class="nav-link-mobile">${esc(t(item.label))}</a>`,
            )
            .join('');
    }

    // Mobile WhatsApp
    const mobileWa = $('mobile-nav-whatsapp');
    if (mobileWa && wa) {
        mobileWa.innerHTML = `
            <a href="${esc(waHref)}" class="btn-primary" target="_blank" rel="noopener" style="width:100%;justify-content:center;">
                ${waSvg('currentColor', 20)} ${esc(t(wa.label))}
            </a>`;
    }

    // Brand text
    const brand = $('nav-brand-text');
    if (brand) brand.textContent = C.branding.name;

    // Language toggle switch
    const toggle = $('lang-toggle');
    if (toggle) {
        toggle.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    }

    // Update label active states
    const frLabel = document.querySelector('.lang-switch__label--fr');
    const enLabel = document.querySelector('.lang-switch__label--en');
    if (frLabel) frLabel.classList.toggle('active', lang === 'fr');
    if (enLabel) enLabel.classList.toggle('active', lang === 'en');
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════

function renderHero() {
    const h = C.hero;
    const lines = h.headline[lang] || h.headline.fr || [];

    // Eyebrow
    const eyebrow = $('hero-eyebrow');
    if (eyebrow) eyebrow.textContent = t(h.eyebrow);

    // Headline - using Pinyon Script for first line
    const headline = $('hero-headline');
    if (headline && lines.length >= 2) {
        headline.innerHTML = `
            <span class="font-script text-saffron block text-5xl md:text-7xl lg:text-8xl mb-2">${esc(lines[0])}</span>
            <span class="font-body font-light text-white text-2xl md:text-4xl tracking-wide">${esc(lines[1])}</span>
        `;
    }

    // Subheadline
    const sub = $('hero-subheadline');
    if (sub) sub.textContent = t(h.subheadline);

    // CTAs
    const ctas = $('hero-ctas');
    if (ctas) {
        ctas.innerHTML = `
            <a href="${esc(h.primary_cta.anchor)}" class="btn-primary">${esc(t(h.primary_cta.label))}</a>
            <a href="${esc(h.secondary_cta.anchor)}" class="btn-outline">${esc(t(h.secondary_cta.label))}</a>
        `;
    }

    // Background image
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && h.image) {
        heroBg.style.backgroundImage = `
            linear-gradient(135deg, rgba(91, 6, 23, 0.92) 0%, rgba(91, 6, 23, 0.85) 100%),
            url('${h.image}')
        `;
    }

    // Hero features (from features.items)
    const features = C.features?.items || [];
    const heroFeatures = $('hero-features');
    if (heroFeatures && features.length) {
        heroFeatures.innerHTML = features
            .map(
                (f) => `
            <div class="hero-feature">
                <span class="material-symbols-outlined">${esc(f.icon)}</span>
                <span>${esc(t(f.title))}</span>
            </div>
        `,
            )
            .join('');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════════════════

function renderFeatures() {
    const items = C.features?.items || [];
    const grid = $('features-grid');
    if (!grid) return;

    grid.innerHTML = items
        .map(
            (f) => `
        <div class="feature-card reveal">
            <div class="feature-icon">
                <span class="material-symbols-outlined">${esc(f.icon)}</span>
            </div>
            <h3>${esc(t(f.title))}</h3>
            <p>${esc(t(f.subtitle))}</p>
        </div>
    `,
        )
        .join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALTIES (6 Signature Dishes)
// ═══════════════════════════════════════════════════════════════════════════

function renderSpecialties() {
    const spec = C.specialties;
    const dishes = C.menu?.dishes || [];
    const u = C.ui_strings;

    // Update section header from content.json
    const section = $('specialties');
    if (section) {
        const eyebrow = section.querySelector('.section-eyebrow');
        if (eyebrow) eyebrow.textContent = t(spec.eyebrow);

        const title = section.querySelector('.section-title');
        if (title)
            title.innerHTML = `<span class="font-script text-primary">${esc(t(spec.title))}</span>`;

        const subtitle = section.querySelector('.section-subtitle');
        if (subtitle) subtitle.textContent = t(spec.subtitle);
    }

    // Get signature dishes, or first 6 if not enough signatures
    let specialties = dishes.filter((d) => d.is_signature && d.is_available !== false);
    if (specialties.length < 6) {
        const remaining = dishes
            .filter((d) => d.is_available !== false && !d.is_signature)
            .slice(0, 6 - specialties.length);
        specialties = [...specialties, ...remaining];
    }
    specialties = specialties.slice(0, 6);

    const grid = $('specialties-grid');
    if (!grid) return;

    grid.innerHTML = specialties
        .map((dish) => {
            const name = t(dish.name);
            const desc = t(dish.description);

            // Price with discount
            let priceHtml = '';
            if (C.settings.show_prices && dish.price_eur != null) {
                if (dish.discount_percent) {
                    const discounted = (dish.price_eur * (1 - dish.discount_percent / 100)).toFixed(
                        2,
                    );
                    priceHtml = `<span class="specialty-card__price"><s style="color:var(--muted);font-size:0.9rem;">${dish.price_eur.toFixed(2)}€</s> ${discounted} €</span>`;
                } else {
                    priceHtml = `<span class="specialty-card__price">${dish.price_eur.toFixed(2)} €</span>`;
                }
            }

            // Badges
            let badgeHtml = '';
            if (dish.is_signature)
                badgeHtml = `<span class="specialty-card__badge">${esc(t(u.badges.signature))}</span>`;
            else if (dish.is_new)
                badgeHtml = `<span class="specialty-card__badge specialty-card__badge--new">${esc(t(u.badges.new))}</span>`;

            // Spice indicator
            const spice = clamp(dish.spice_level ?? 0, 0, 5);
            const spiceHtml =
                dish.is_spicy || spice > 0
                    ? `<span class="specialty-card__spice">${'🌶'.repeat(spice > 0 ? Math.min(spice, 5) : 1)}</span>`
                    : '';

            const imageHtml = dish.image
                ? `<img src="${esc(dish.image)}" alt="${esc(t(dish.image_alt))}" loading="lazy">`
                : `<div class="specialty-card__placeholder">${esc(name[0] || '?')}</div>`;

            return `
            <div class="specialty-card reveal" data-dish="${esc(dish.id)}">
                <div class="specialty-card__image">
                    ${imageHtml}
                    ${badgeHtml}
                </div>
                <div class="specialty-card__content">
                    <h3 class="specialty-card__name">${esc(name)} ${spiceHtml}</h3>
                    <p class="specialty-card__desc">${esc(desc)}</p>
                    ${priceHtml}
                </div>
            </div>
        `;
        })
        .join('');

    // Setup image fallbacks
    grid.querySelectorAll('img').forEach((img) => {
        const card = img.closest('.specialty-card');
        const name = card?.querySelector('.specialty-card__name')?.textContent;
        imgFallback(img, name);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════════════════

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

    // Spice indicator: use is_spicy flag OR spice_level > 0
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

    // Meta line (calories + allergens)
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
                    ${priceHtml}
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

    // Update filter buttons
    $$('.menu-filter').forEach((btn) => {
        const active = btn.dataset.cat === catId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active);
    });

    // Show/hide groups
    $$('.menu-group').forEach((group) => {
        const match = catId === 'all' || group.dataset.catGroup === catId;
        group.classList.toggle('menu-group--hidden', !match);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// HERITAGE
// ═══════════════════════════════════════════════════════════════════════════

function renderHeritage() {
    const section = $('heritage');
    if (!section) return;

    if (!C.settings.show_heritage_section) {
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const h = C.heritage;

    // Title
    const title = section.querySelector('.heritage-title');
    if (title) title.textContent = t(h.title);

    // Eyebrow
    const eyebrow = section.querySelector('.section-eyebrow');
    if (eyebrow) eyebrow.textContent = t(h.eyebrow);

    // Paragraphs
    const paras = $('heritage-paragraphs');
    if (paras) {
        const paragraphs = h.paragraphs[lang] || h.paragraphs.fr || [];
        paras.innerHTML = paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
    }

    // Stat
    const stat = $('heritage-stat');
    if (stat) {
        stat.innerHTML = `
            <span class="stat-value">${esc(h.stat.value)}</span>
            <span class="stat-label">${esc(t(h.stat.label))}</span>
        `;
    }

    // Image
    const imageWrap = $('heritage-image');
    if (imageWrap && h.image) {
        const img = document.createElement('img');
        img.src = h.image;
        img.alt = t(h.image_alt);
        img.loading = 'lazy';
        imgFallback(img, C.branding.name);
        imageWrap.innerHTML = '';
        imageWrap.appendChild(img);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════

function renderEvents() {
    const section = $('evenements');
    if (!section) return;

    if (!C.settings.show_event_section) {
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const ev = C.events;

    // Title
    const title = $('events-title');
    if (title) {
        title.innerHTML = `<span class="font-script text-primary">${esc(t(ev.title))}</span>`;
    }

    // Subtitle
    const sub = $('events-subtitle');
    if (sub) sub.textContent = t(ev.subtitle);

    // Grid
    const grid = $('events-grid');
    if (!grid) return;

    grid.innerHTML = (ev.items || [])
        .map(
            (item) => `
        <div class="event-card reveal">
            ${
                item.image
                    ? `<img src="${esc(item.image)}" alt="${esc(t(item.label))}" class="event-card__image" loading="lazy">`
                    : `<div class="event-card__placeholder">${esc(t(item.label)[0] || '?')}</div>`
            }
            <div class="event-card__overlay">
                <span class="event-card__label">${esc(t(item.label))}</span>
            </div>
        </div>
    `,
        )
        .join('');

    // Image fallbacks
    grid.querySelectorAll('.event-card__image').forEach((img) => {
        imgFallback(img, '');
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════════════════

function renderContact() {
    const c = C.contact;

    // Title
    const title = $('contact-title');
    if (title) {
        title.innerHTML = `<span class="font-script text-primary">${esc(t(c.title))}</span>`;
    }

    // Subtitle
    const sub = $('contact-subtitle');
    if (sub) sub.textContent = t(c.subtitle);

    // Cards
    const wa = c.primary_action;
    const waHref = wa ? waUrl(wa.phone_e164, t(wa.prefilled_message)) : '#';

    const cards = $('contact-cards');
    if (cards) {
        cards.innerHTML = `
            <a href="tel:${esc(c.phone.tel)}" class="contact-card">
                <div class="contact-card__icon">
                    <span class="material-symbols-outlined">call</span>
                </div>
                <div class="contact-card__body">
                    <span class="contact-card__label">${esc(t(c.phone.label))}</span>
                    <span class="contact-card__value">${esc(c.phone.display)}</span>
                </div>
            </a>
            <a href="${esc(waHref)}" class="contact-card contact-card--whatsapp" target="_blank" rel="noopener">
                <div class="contact-card__icon contact-card__icon--whatsapp">
                    ${waSvg('white', 28)}
                </div>
                <div class="contact-card__body">
                    <span class="contact-card__label">${esc(t(wa.label))}</span>
                    <span class="contact-card__value">WhatsApp</span>
                </div>
            </a>
        `;
    }

    // Meta (socials, notes)
    const meta = $('contact-meta');
    if (meta) {
        const socials = (c.socials || [])
            .map(
                (s) => `
            <a href="${esc(s.url)}" target="_blank" rel="noopener" class="social-link">${esc(s.label)}</a>
        `,
            )
            .join('');

        meta.innerHTML = `
            ${socials ? `<div class="contact-socials">${socials}</div>` : ''}
            <p class="contact-note">${esc(t(c.ordering_note))}</p>
            <p class="contact-location">${esc(t(c.location_hint))}</p>
        `;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════

function renderFooter() {
    const f = C.footer;

    const brand = $('footer-brand');
    if (brand) brand.textContent = C.branding.name;

    const tagline = $('footer-tagline');
    if (tagline) tagline.textContent = t(f.tagline);

    const copyright = $('footer-copyright');
    if (copyright) copyright.textContent = t(f.copyright);

    const links = $('footer-links');
    if (links) {
        links.innerHTML = (f.links || [])
            .map(
                (l) => `
            <a href="${esc(l.url)}" class="footer-link" 
               target="${l.url.startsWith('http') ? '_blank' : '_self'}" rel="noopener">
                ${esc(t(l.label))}
            </a>
        `,
            )
            .join('');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING WHATSAPP
// ═══════════════════════════════════════════════════════════════════════════

function renderFloatingWA() {
    const wrap = $('floating-whatsapp');
    if (!wrap) return;

    if (!C.settings.show_floating_whatsapp) {
        wrap.innerHTML = '';
        return;
    }

    const wa = C.contact?.primary_action;
    if (!wa) return;

    wrap.innerHTML = `
        <a href="${esc(waUrl(wa.phone_e164, t(wa.prefilled_message)))}" 
           class="fab-whatsapp" target="_blank" rel="noopener" 
           aria-label="${esc(t(wa.label))}">
            ${waSvg('white', 32)}
        </a>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUCTION / ERROR
// ═══════════════════════════════════════════════════════════════════════════

function showConstruction() {
    const msg = t(C.settings.construction_message);
    const el = $('construction-message');
    if (el) el.textContent = msg;

    const screen = $('construction-screen');
    if (screen) screen.hidden = false;

    const main = $('main-content');
    if (main) {
        Array.from(main.children).forEach((ch) => {
            if (ch.id !== 'construction-screen') ch.hidden = true;
        });
    }

    const header = $('site-header');
    if (header) header.hidden = true;

    const footer = $('site-footer');
    if (footer) footer.hidden = true;

    const fab = $('floating-whatsapp');
    if (fab) fab.hidden = true;
}

function showError() {
    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;
                    font-family:'Jura',sans-serif;text-align:center;padding:2rem;color:#1a1a1a;background:#faf8f5;">
            <p style="font-family:'Pinyon Script',cursive;font-size:3rem;color:#5b0617;margin-bottom:1rem;">L'Histoire des Épices</p>
            <p style="color:#6b6b6b;margin-bottom:1.5rem;">Impossible de charger le contenu. Veuillez rafraîchir la page.</p>
            <a href="tel:+33123456789" style="background:#C9A55C;color:#1a1a1a;padding:1rem 2rem;border-radius:9999px;
               text-decoration:none;font-weight:600;">01 23 45 67 89</a>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY LABELS & SECTION EYEBROWS
// ═══════════════════════════════════════════════════════════════════════════

function updateAccessibilityLabels() {
    const u = C.ui_strings;

    // Skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t(u.skip_to_content);

    // Navigation aria-labels
    const nav = document.querySelector('nav[aria-label]');
    if (nav) nav.setAttribute('aria-label', t(u.main_navigation));

    // Brand link
    const brandLink = $('nav-brand');
    if (brandLink) brandLink.setAttribute('aria-label', t(u.home_link));

    // Language toggle
    const langToggle = $('lang-toggle');
    if (langToggle) langToggle.setAttribute('aria-label', t(u.change_language));

    // Hamburger
    const hamburger = $('hamburger');
    if (hamburger) hamburger.setAttribute('aria-label', t(u.open_menu));

    // Mobile menu
    const mobileMenu = $('mobile-menu');
    if (mobileMenu) mobileMenu.setAttribute('aria-label', t(u.mobile_menu));

    // Menu filters
    const menuFilters = $('menu-filters');
    if (menuFilters) menuFilters.setAttribute('aria-label', t(u.filter_by_category));

    // Floating WhatsApp
    const floatingWa = $('floating-whatsapp');
    if (floatingWa) floatingWa.setAttribute('aria-label', t(u.contact_whatsapp));

    // Section aria-labels
    const sections = u.section_labels || {};
    Object.keys(sections).forEach((id) => {
        const section = document.getElementById(id);
        if (section) section.setAttribute('aria-label', t(sections[id]));
    });

    // Section eyebrows
    const eyebrows = u.section_eyebrows || {};

    // Menu eyebrow
    const menuEyebrow = document.querySelector('#menu .section-eyebrow');
    if (menuEyebrow && eyebrows.menu) menuEyebrow.textContent = t(eyebrows.menu);

    // Events eyebrow
    const eventsEyebrow = document.querySelector('#evenements .section-eyebrow');
    if (eventsEyebrow && eyebrows.events) eventsEyebrow.textContent = t(eyebrows.events);

    // Contact eyebrow
    const contactEyebrow = document.querySelector('#contact .section-eyebrow');
    if (contactEyebrow && eyebrows.contact) contactEyebrow.textContent = t(eyebrows.contact);
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL RENDER
// ═══════════════════════════════════════════════════════════════════════════

function render() {
    if (!C) return;

    updateSEO();
    updateAccessibilityLabels();
    renderNav();
    renderHero();
    renderFeatures();
    renderSpecialties();
    renderMenu();
    renderHeritage();
    renderEvents();
    renderContact();
    renderFooter();
    renderFloatingWA();

    // Re-init scroll reveal for new elements
    initScrollReveal();
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

function initEventListeners() {
    // Language toggle
    const toggle = $('lang-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            lang = lang === 'fr' ? 'en' : 'fr';
            safeLang(lang);
            activeCategory = 'all';
            render();
        });
    }

    // Mobile hamburger
    const hamburger = $('hamburger');
    const mobileMenu = $('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = !mobileMenu.hidden;
            mobileMenu.hidden = isOpen;
            hamburger.classList.toggle('active', !isOpen);
            hamburger.setAttribute('aria-expanded', String(!isOpen));
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });

        // Close on link click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.hidden = true;
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.hidden) {
                mobileMenu.hidden = true;
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                hamburger.focus();
            }
        });
    }

    // Smooth scroll
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Header scroll effect
    const header = $('site-header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener(
            'scroll',
            () => {
                const currentScroll = window.pageYOffset;
                header.classList.toggle('scrolled', currentScroll > 50);
                lastScroll = currentScroll;
            },
            { passive: true },
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════════════════

function initScrollReveal() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
        $$('.reveal').forEach((el) => el.classList.add('visible'));
        return;
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
        );

        $$('.reveal').forEach((el) => observer.observe(el));
    } else {
        $$('.reveal').forEach((el) => el.classList.add('visible'));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════════════════

async function boot() {
    const stored = getLang();
    if (stored) lang = stored;

    try {
        const resp = await fetch('content.json');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        C = await resp.json();

        if (!stored) lang = C.settings?.default_language || 'fr';

        if (C.settings?.site_under_construction) {
            showConstruction();
            return;
        }

        render();
        initEventListeners();

        console.info("[L'Histoire des Épices] Site loaded successfully.");
    } catch (err) {
        console.error("[L'Histoire des Épices] Failed to load content.json:", err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', boot);
