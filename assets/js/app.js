/**
 * app.js — L'Histoire des Épices
 * Loads content.json, hydrates the DOM, handles language toggle & menu filter.
 * All user-facing content lives in content.json — this file never needs editing.
 */

// State
let C = null,
    lang = 'fr',
    activeCategory = 'all';

// Utilities
const $ = (id) => document.getElementById(id);
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
        const isMenuItem = this.classList.contains('menu-item__img');
        const div = Object.assign(document.createElement('div'), {
            className: isMenuItem
                ? 'menu-item__img menu-item__img--placeholder'
                : 'img-placeholder',
            textContent: (initial || '?')[0].toUpperCase(),
        });
        div.setAttribute('aria-hidden', 'true');
        this.replaceWith(div);
    };
}

// WhatsApp SVG path (reused in contact + floating button)
const WA_PATH =
    'M16 2C8.27 2 2 8.27 2 16c0 2.44.65 4.74 1.79 6.73L2 30l7.51-1.97A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.46 11.46 0 01-5.84-1.6l-.42-.25-4.46 1.17 1.19-4.33-.28-.44A11.5 11.5 0 1116 27.5zm6.3-8.6c-.34-.17-2.02-1-2.34-1.11-.32-.12-.55-.17-.78.17s-.9 1.11-1.1 1.34c-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.6.09-.91.43s-1.2 1.17-1.2 2.85c0 1.68 1.23 3.3 1.4 3.53.17.23 2.43 3.71 5.88 5.2.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.83 2.3-1.63.29-.8.29-1.49.2-1.63-.08-.15-.31-.23-.65-.4z';
const waSvg = (fill, size) =>
    `<svg viewBox="0 0 32 32" fill="${fill}" width="${size}" height="${size}" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;

// ─── SEO
function updateSEO() {
    const s = C.seo;
    document.title = t(s.title);
    document.documentElement.lang = lang;
    const sm = (sel, val) => {
        const m = document.querySelector(sel);
        if (m) m.content = val;
    };
    sm('meta[name="description"]', t(s.description));
    sm('meta[property="og:title"]', t(s.title));
    sm('meta[property="og:description"]', t(s.description));
    sm('meta[name="twitter:title"]', t(s.title));
    sm('meta[name="twitter:description"]', t(s.description));
}

// ─── Nav
function renderNav() {
    const wa = C.contact?.primary_action;
    const waHref = wa ? waUrl(wa.phone_e164, t(wa.prefilled_message)) : '#contact';
    const waLabel = wa ? t(wa.label) : 'WhatsApp';

    const linkHtml = (C.navigation?.items || [])
        .map(
            (item) =>
                `<a href="#${esc(item.id)}" class="nav-link" role="listitem">${esc(t(item.label))}</a>`,
        )
        .join('');

    const waPill = `<a href="${esc(waHref)}" class="btn-whatsapp" target="_blank" rel="noopener noreferrer">
    <span class="material-symbols-outlined" aria-hidden="true">chat</span>${esc(waLabel)}</a>`;

    const el = $('nav-links');
    if (el) el.innerHTML = linkHtml;
    const elM = $('mobile-nav-links');
    if (elM) elM.innerHTML = linkHtml.replace(/nav-link/g, 'nav-link-mobile');
    const elW = $('nav-whatsapp');
    if (elW) elW.innerHTML = waPill;
    const elWm = $('mobile-nav-whatsapp');
    if (elWm) elWm.innerHTML = waPill;
    const brand = $('nav-brand-text') || $('nav-brand');
    if (brand) brand.textContent = C.branding.name;
    const toggle = $('lang-toggle');
    if (toggle) toggle.textContent = lang === 'fr' ? 'EN' : 'FR';
}

// ─── Hero
function renderHero() {
    const h = C.hero;
    const lines = h.headline[lang] || h.headline.fr || [];
    const italic = h.headline_italic_part ?? 1;
    const headlineHtml = lines
        .map((line, i) =>
            i === italic
                ? `<em class="hero-italic">${esc(line)}</em>`
                : `<span>${esc(line)}</span>`,
        )
        .join('<br>');

    const el = $('hero-content');
    if (el) {
        el.innerHTML = `
      <p class="eyebrow">${esc(t(h.eyebrow))}</p>
      <h1 class="font-garamond text-4xl md:text-6xl font-medium leading-tight mt-3 mb-5 text-on-surf">
        ${headlineHtml}
      </h1>
      <p class="text-on-muted text-lg leading-relaxed mb-8">${esc(t(h.subheadline))}</p>
      <div class="flex flex-wrap gap-3">
        <a href="${esc(h.primary_cta.anchor)}" class="btn-primary">${esc(t(h.primary_cta.label))}</a>
        <a href="${esc(h.secondary_cta.anchor)}" class="btn-secondary">${esc(t(h.secondary_cta.label))}</a>
      </div>`;
    }

    const imgWrap = $('hero-image');
    if (imgWrap && h.image) {
        const img = document.createElement('img');
        img.src = h.image;
        img.alt = t(h.image_alt);
        img.className = 'hero-img';
        imgFallback(img, C.branding.name);
        imgWrap.innerHTML = '';
        imgWrap.appendChild(img);
    }
}

// ─── Features
function renderFeatures() {
    const items = C.features?.items || [];
    const el = $('features-grid');
    if (!el) return;
    el.innerHTML = items
        .map(
            (f) => `
    <div class="feature-card">
      <span class="material-symbols-outlined feature-icon" aria-hidden="true">${esc(f.icon)}</span>
      <h3 class="font-garamond text-xl font-medium text-primary mt-3 mb-1">${esc(t(f.title))}</h3>
      <p class="text-on-muted text-sm">${esc(t(f.subtitle))}</p>
    </div>`,
        )
        .join('');
}

// ─── Menu
function buildMenuItem(dish) {
    const name = t(dish.name);
    const desc = t(dish.description);
    const isVeg = dish.tags?.includes('vegetarian') || dish.tags?.includes('vegan');
    const isHalal = dish.tags?.includes('halal');
    const u = C.ui_strings;

    // Badges row
    let badges = '';
    if (dish.is_signature)
        badges += `<span class="badge badge--sig">${esc(t(u.badges.signature))}</span>`;
    if (dish.is_new) badges += `<span class="badge badge--new">${esc(t(u.badges.new))}</span>`;
    if (isVeg)
        badges += `<span class="badge badge--veg" title="${esc(t(u.badges.vegetarian))}">🌱</span>`;
    if (isHalal && !isVeg) badges += `<span class="badge badge--hal" title="Halal">H</span>`;
    const spice = clamp(dish.spice_level ?? 0, 0, 3);
    if (spice > 0) badges += `<span class="menu-item__spice">${'🌶'.repeat(spice)}</span>`;

    // Price block
    let priceHtml = '';
    if (C.settings.show_prices && dish.price_eur != null) {
        const disc = dish.discount_percent;
        if (disc) {
            const discounted = (dish.price_eur * (1 - disc / 100)).toFixed(2);
            priceHtml = `
            <div class="menu-item__price">
              <span class="price-original">${dish.price_eur.toFixed(2)}&thinsp;€</span>
              <span class="price-current">${discounted}&thinsp;€</span>
              <span class="price-badge">-${disc}%</span>
            </div>`;
        } else {
            priceHtml = `<div class="menu-item__price"><span class="price-current">${dish.price_eur.toFixed(2)}&thinsp;€</span></div>`;
        }
    }

    const imgHtml = dish.image
        ? `<img data-src="${esc(dish.image)}" alt="${esc(t(dish.image_alt))}" class="menu-item__img" loading="lazy">`
        : `<div class="menu-item__img menu-item__img--placeholder" aria-hidden="true">${esc(name[0] || '?')}</div>`;

    return `
    <div class="menu-item" id="dish-${esc(dish.id)}">
      ${imgHtml}
      <div class="menu-item__body">
        <div class="menu-item__top">
          <div class="menu-item__name-row">
            <h3 class="menu-item__name">${esc(name)}</h3>
            ${badges ? `<div class="menu-item__badges">${badges}</div>` : ''}
          </div>
          ${priceHtml}
        </div>
        <p class="menu-item__desc">${esc(desc)}</p>
      </div>
    </div>`;
}

function renderMenu() {
    const m = C.menu;
    const u = C.ui_strings;

    const title = $('menu-title');
    if (title) title.textContent = t(m.section_title);

    const footnote = $('menu-footnote');
    if (footnote) footnote.textContent = t(m.footnote);

    const allergenLink = $('allergen-link');
    if (allergenLink) {
        allergenLink.href = m.allergen_button.url || '#';
        allergenLink.lastChild.textContent = ' ' + t(m.allergen_button.label);
    }

    const cats = m.categories || [];
    const available = (m.dishes || []).filter((d) => d.is_available !== false);

    // ── Category tabs (icon + label)
    const filters = $('menu-filters');
    if (filters) {
        filters.innerHTML = cats
            .map(
                (cat) => `
      <button class="menu-tab${cat.id === activeCategory ? ' menu-tab--active' : ''}"
              data-cat="${esc(cat.id)}" aria-pressed="${cat.id === activeCategory}">
        <span class="material-symbols-outlined menu-tab__icon">${esc(cat.icon || 'restaurant_menu')}</span>
        <span class="menu-tab__label">${esc(t(cat.label))}</span>
      </button>`,
            )
            .join('');
        filters.querySelectorAll('.menu-tab').forEach((btn) => {
            btn.addEventListener('click', () => filterMenu(btn.dataset.cat));
        });
    }

    // ── Grouped dish sections
    const grid = $('menu-grid');
    if (!grid) return;

    if (!available.length) {
        grid.innerHTML = `<p class="text-center text-on-muted py-8">${esc(t(u.labels.menu_empty))}</p>`;
        return;
    }

    // Build one section per non-"all" category
    const dataCats = cats.filter((c) => c.id !== 'all');
    grid.innerHTML = dataCats
        .map((cat) => {
            const dishes = available.filter((d) => d.category === cat.id);
            if (!dishes.length) return '';
            return `
      <div class="menu-group" data-cat-group="${esc(cat.id)}">
        <div class="menu-section-header" aria-hidden="true">
          <span class="menu-section-line"></span>
          <div class="menu-section-title">
            <span class="material-symbols-outlined">${esc(cat.icon || 'restaurant_menu')}</span>
            <span>${esc(t(cat.label))}</span>
          </div>
          <span class="menu-section-line"></span>
        </div>
        <div class="menu-items-grid">
          ${dishes.map(buildMenuItem).join('')}
        </div>
      </div>`;
        })
        .join('');

    // Lazy-load images
    grid.querySelectorAll('img[data-src]').forEach((img) => {
        img.src = img.dataset.src;
        const nameEl = img.closest('.menu-item')?.querySelector('.menu-item__name');
        imgFallback(img, nameEl?.textContent);
    });

    filterMenu(activeCategory, false);
}

function filterMenu(catId, animate = true) {
    activeCategory = catId;

    // Update tab states
    document.querySelectorAll('.menu-tab').forEach((btn) => {
        const active = btn.dataset.cat === catId;
        btn.classList.toggle('menu-tab--active', active);
        btn.setAttribute('aria-pressed', active);
    });

    // Show/hide category groups
    document.querySelectorAll('.menu-group').forEach((group) => {
        const match = catId === 'all' || group.dataset.catGroup === catId;
        if (animate) group.style.transition = 'opacity 0.25s';
        group.classList.toggle('menu-group--hidden', !match);
    });
}

// ─── Heritage
function renderHeritage() {
    const section = $('heritage');
    if (!section) return;

    if (!C.settings.show_heritage_section) {
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const h = C.heritage;
    const paras = (h.paragraphs[lang] || h.paragraphs.fr || [])
        .map((p) => `<p class="text-white/80 leading-relaxed mb-4">${esc(p)}</p>`)
        .join('');

    const el = $('heritage-content');
    if (!el) return;
    el.innerHTML = `
    <div class="heritage-image-col">
      <div class="heritage-img-wrap">
        <img src="${esc(h.image)}" alt="${esc(t(h.image_alt))}" class="heritage-img" loading="lazy">
        <div class="heritage-stat">
          <span class="heritage-stat__value">${esc(h.stat.value)}</span>
          <span class="heritage-stat__label">${esc(t(h.stat.label))}</span>
        </div>
      </div>
    </div>
    <div class="text-white">
      <p class="eyebrow text-saffron mb-3">${esc(t(h.eyebrow))}</p>
      <h2 class="font-garamond text-3xl md:text-4xl font-medium mb-6">${esc(t(h.title))}</h2>
      ${paras}
    </div>`;

    // Heritage image fallback
    const img = el.querySelector('.heritage-img');
    if (img) imgFallback(img, C.branding.name);
}

// ─── Events
function renderEvents() {
    const section = $('evenements');
    if (!section) return;

    if (!C.settings.show_event_section) {
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const ev = C.events;
    const title = $('events-title');
    if (title) title.textContent = t(ev.title);
    const sub = $('events-subtitle');
    if (sub) sub.textContent = t(ev.subtitle);

    const grid = $('events-grid');
    if (!grid) return;

    grid.innerHTML = (ev.items || [])
        .map(
            (item) => `
    <div class="event-card">
      <img src="${esc(item.image)}" alt="${esc(t(item.label))}" class="event-card__img" loading="lazy">
      <div class="event-card__overlay">
        <span class="event-card__label font-garamond">${esc(t(item.label))}</span>
      </div>
    </div>`,
        )
        .join('');

    // Image fallbacks
    grid.querySelectorAll('.event-card__img').forEach((img) => imgFallback(img, ''));
}

// ─── Contact
function renderContact() {
    const c = C.contact;
    const title = $('contact-title');
    if (title) title.textContent = t(c.title);
    const sub = $('contact-subtitle');
    if (sub) sub.textContent = t(c.subtitle);

    const wa = c.primary_action;
    const waHref = wa ? waUrl(wa.phone_e164, t(wa.prefilled_message)) : '#';

    const alt = c.alternative_phone
        ? `<p class="contact-card__alt">${esc(t(c.alternative_phone.label))} ${esc(c.alternative_phone.display)}</p>`
        : '';
    const cards = $('contact-cards');
    if (cards)
        cards.innerHTML = `
    <a href="tel:${esc(c.phone.tel)}" class="contact-card" aria-label="${esc(t(c.phone.label))}">
      <span class="material-symbols-outlined contact-card__icon" aria-hidden="true">call</span>
      <div class="contact-card__body">
        <p class="contact-card__label">${esc(t(c.phone.label))}</p>
        <p class="contact-card__number">${esc(c.phone.display)}</p>${alt}
      </div></a>
    <a href="${esc(waHref)}" class="contact-card contact-card--wa" target="_blank" rel="noopener noreferrer" aria-label="${esc(t(wa.label))}">
      <span class="contact-card__icon contact-card__icon--wa" aria-hidden="true">${waSvg('currentColor', 28)}</span>
      <div class="contact-card__body">
        <p class="contact-card__label">${esc(t(wa.label))}</p>
        <p class="contact-card__number">${esc(c.phone.display)}</p>
      </div></a>`;

    const meta = $('contact-meta');
    if (meta) {
        const socials = (c.socials || [])
            .map(
                (s) => `
      <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"
         class="social-link" aria-label="${esc(s.label)}">${esc(s.label)}</a>`,
            )
            .join('');

        meta.innerHTML = `
      ${socials ? `<div class="flex justify-center gap-4">${socials}</div>` : ''}
      <p class="text-on-muted text-sm">${esc(t(c.ordering_note))}</p>
      <p class="text-on-muted text-sm font-medium">${esc(t(c.location_hint))}</p>`;
    }
}

// ─── Footer
function renderFooter() {
    const f = C.footer;
    const brand = $('footer-brand');
    if (brand) brand.textContent = C.branding.name;
    const tl = $('footer-tagline');
    if (tl) tl.textContent = t(f.tagline);
    const cr = $('footer-copyright');
    if (cr) cr.textContent = t(f.copyright);

    const links = $('footer-links');
    if (links) {
        links.innerHTML = (f.links || [])
            .map(
                (l) =>
                    `<a href="${esc(l.url)}" class="footer-link" target="${l.url.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${esc(t(l.label))}</a>`,
            )
            .join('');
    }
}

// ─── Floating WhatsApp
function renderFloatingWA() {
    const wrap = $('floating-whatsapp');
    if (!wrap) return;
    if (!C.settings.show_floating_whatsapp) {
        wrap.innerHTML = '';
        return;
    }
    const wa = C.contact?.primary_action;
    if (!wa) return;
    wrap.innerHTML = `<a href="${esc(waUrl(wa.phone_e164, t(wa.prefilled_message)))}" class="fab-wa" target="_blank" rel="noopener noreferrer" aria-label="${esc(t(wa.label))}">${waSvg('white', 28)}</a>`;
}

// ─── Construction / Error
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
                font-family:sans-serif;text-align:center;padding:2rem;color:#1a1a1a;background:#ffffff;">
      <p style="font-size:1.5rem;font-weight:600;margin-bottom:1rem;">L'Histoire des Épices</p>
      <p style="color:#555555;margin-bottom:1.5rem;">Impossible de charger le contenu. Veuillez rafraîchir la page.</p>
      <a href="tel:+33123456789" style="background:#5b0617;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;
         text-decoration:none;font-weight:600;">01 23 45 67 89</a>
    </div>`;
}

// ─── Full render
function render() {
    if (!C) return;
    updateSEO();
    renderNav();
    renderHero();
    renderFeatures();
    renderMenu();
    renderHeritage();
    renderEvents();
    renderContact();
    renderFooter();
    renderFloatingWA();
}

// ─── Event listeners
function initEventListeners() {
    const toggle = $('lang-toggle');
    if (toggle)
        toggle.addEventListener('click', () => {
            lang = lang === 'fr' ? 'en' : 'fr';
            safeLang(lang);
            activeCategory = 'all';
            render();
        });

    // Mobile hamburger
    const hamburger = $('hamburger');
    const mobileMenu = $('mobile-menu');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const open = mobileMenu.hidden === false;
            mobileMenu.hidden = open;
            hamburger.setAttribute('aria-expanded', String(!open));
            const icon = hamburger.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = open ? 'menu' : 'close';
        });

        // Close on nav link click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.hidden = true;
                hamburger.setAttribute('aria-expanded', 'false');
                const icon = hamburger.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'menu';
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.hidden) {
                mobileMenu.hidden = true;
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.focus();
            }
        });
    }

    // Smooth scroll with header offset (uses scroll-margin-top set in CSS)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Scroll reveal (IntersectionObserver)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        en.target.classList.add('revealed');
                        io.unobserve(en.target);
                    }
                });
            },
            { threshold: 0.1 },
        );
        document.querySelectorAll('.section-reveal').forEach((s) => io.observe(s));
    } else {
        document.querySelectorAll('.section-reveal').forEach((s) => s.classList.add('revealed'));
    }
}

// ─── Boot
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
        console.info('[Épices] Site loaded. Edit content.json to update all content.');
    } catch (err) {
        console.error('[Épices] Failed to load content.json:', err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', boot);
