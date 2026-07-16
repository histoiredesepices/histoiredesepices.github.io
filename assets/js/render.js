/**
 * render.js — Section renderers and full-page render orchestrator
 */

// ── Navigation ───────────────────────────────────────────────────────────────

function renderNav() {
    const items = C.navigation?.items || [];
    const wa = C.contact?.primary_action;
    const waHref = wa ? waUrl(wa.phone_e164, t(wa.prefilled_message)) : '#contact';

    const navLinks = $('nav-links');
    if (navLinks) {
        navLinks.innerHTML = items
            .map((item) => `<a href="#${esc(item.id)}" class="nav-link">${esc(t(item.label))}</a>`)
            .join('');
    }

    const mobileLinks = $('mobile-nav-links');
    if (mobileLinks) {
        mobileLinks.innerHTML = items
            .map(
                (item) =>
                    `<a href="#${esc(item.id)}" class="nav-link-mobile">${esc(t(item.label))}</a>`,
            )
            .join('');
    }

    const mobileWa = $('mobile-nav-whatsapp');
    if (mobileWa && wa) {
        mobileWa.innerHTML = `
            <a href="${esc(waHref)}" class="btn-primary" target="_blank" rel="noopener" style="width:100%;justify-content:center;">
                ${waSvg('currentColor', 20)} ${esc(t(wa.label))}
            </a>`;
    }

    const brand = $('nav-brand-text');
    if (brand) brand.textContent = C.branding.name;

    const toggle = $('lang-toggle');
    if (toggle) {
        toggle.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
    }

    const frLabel = document.querySelector('.lang-switch__label--fr');
    const enLabel = document.querySelector('.lang-switch__label--en');
    if (frLabel) frLabel.classList.toggle('active', lang === 'fr');
    if (enLabel) enLabel.classList.toggle('active', lang === 'en');
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function renderHero() {
    const h = C.hero;
    const lines = h.headline[lang] || h.headline.fr || [];

    const eyebrow = $('hero-eyebrow');
    if (eyebrow) eyebrow.textContent = t(h.eyebrow);

    const headline = $('hero-headline');
    if (headline && lines.length >= 2) {
        headline.innerHTML = `
            <span class="font-script text-saffron block text-5xl md:text-7xl lg:text-8xl mb-2">${esc(lines[0])}</span>
            <span class="font-body font-light text-white text-2xl md:text-4xl tracking-wide">${esc(lines[1])}</span>
        `;
    }

    const sub = $('hero-subheadline');
    if (sub) sub.textContent = t(h.subheadline);

    const ctas = $('hero-ctas');
    if (ctas) {
        ctas.innerHTML = `
            <a href="${esc(h.primary_cta.anchor)}" class="btn-primary">${esc(t(h.primary_cta.label))}</a>
            <a href="${esc(h.secondary_cta.anchor)}" class="btn-outline">${esc(t(h.secondary_cta.label))}</a>
        `;
    }

    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && h.image) {
        heroBg.style.backgroundImage = `
            linear-gradient(135deg, rgba(91, 6, 23, 0.92) 0%, rgba(91, 6, 23, 0.85) 100%),
            url('${h.image}')
        `;
    }

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

// ── Features ─────────────────────────────────────────────────────────────────

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

// ── Specialties ───────────────────────────────────────────────────────────────

function renderSpecialties() {
    const spec = C.specialties;
    const dishes = C.menu?.dishes || [];
    const u = C.ui_strings;

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

            let priceHtml = '';
            if (C.settings.show_prices && dish.price_eur != null) {
                if (dish.discount_percent) {
                    const discounted = (dish.price_eur * (1 - dish.discount_percent / 100)).toFixed(2);
                    priceHtml = `<span class="specialty-card__price"><s style="color:var(--muted);font-size:0.9rem;">${dish.price_eur.toFixed(2)}€</s> ${discounted} €</span>`;
                } else {
                    priceHtml = `<span class="specialty-card__price">${dish.price_eur.toFixed(2)} €</span>`;
                }
            }

            let badgeHtml = '';
            if (dish.is_signature)
                badgeHtml = `<span class="specialty-card__badge">${esc(t(u.badges.signature))}</span>`;
            else if (dish.is_new)
                badgeHtml = `<span class="specialty-card__badge specialty-card__badge--new">${esc(t(u.badges.new))}</span>`;

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
                    <div class="specialty-card__footer">
                        ${priceHtml}
                        <div class="specialty-card__cart" data-cart-control="${esc(dish.id)}"></div>
                    </div>
                </div>
            </div>
        `;
        })
        .join('');

    grid.querySelectorAll('img').forEach((img) => {
        const card = img.closest('.specialty-card');
        const name = card?.querySelector('.specialty-card__name')?.textContent;
        imgFallback(img, name);
    });
}

// ── Heritage ─────────────────────────────────────────────────────────────────

function renderHeritage() {
    const section = $('heritage');
    if (!section) return;

    if (!C.settings.show_heritage_section) {
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const h = C.heritage;

    const title = section.querySelector('.heritage-title');
    if (title) title.textContent = t(h.title);

    const eyebrow = section.querySelector('.section-eyebrow');
    if (eyebrow) eyebrow.textContent = t(h.eyebrow);

    const paras = $('heritage-paragraphs');
    if (paras) {
        const paragraphs = h.paragraphs[lang] || h.paragraphs.fr || [];
        paras.innerHTML = paragraphs.map((p) => `<p>${esc(p)}</p>`).join('');
    }

    const statsContainer = $('heritage-stats');
    const stats = h.stats || (h.stat ? [h.stat] : []);
    if (statsContainer && stats.length) {
        statsContainer.innerHTML = stats
            .map(
                (s) => `
            <div class="heritage-stat">
                <span class="stat-value">${esc(s.value)}</span>
                <span class="stat-label">${esc(t(s.label))}</span>
            </div>
        `,
            )
            .join('');
    }

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

// ── Events ───────────────────────────────────────────────────────────────────

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
    if (title) {
        title.innerHTML = `<span class="font-script text-primary">${esc(t(ev.title))}</span>`;
    }

    const sub = $('events-subtitle');
    if (sub) sub.textContent = t(ev.subtitle);

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

    grid.querySelectorAll('.event-card__image').forEach((img) => {
        imgFallback(img, '');
    });
}

// ── Contact ───────────────────────────────────────────────────────────────────

function renderContact() {
    const c = C.contact;
    const phones = C.settings.contact_info;

    const title = $('contact-title');
    if (title) {
        title.innerHTML = `<span class="font-script text-primary">${esc(t(c.title))}</span>`;
    }

    const sub = $('contact-subtitle');
    if (sub) sub.textContent = t(c.subtitle);

    const wa = c.primary_action;
    const waPhone = phones?.whatsapp?.tel || phones?.primary_phone?.tel;
    const waHref = wa && waPhone ? waUrl(waPhone, t(wa.prefilled_message)) : '#';

    const cards = $('contact-cards');
    if (cards && phones) {
        const phoneCards = phones.primary_phone
            ? `
            <a href="tel:${esc(phones.primary_phone.tel)}" class="contact-card">
                <div class="contact-card__icon">
                    <span class="material-symbols-outlined">call</span>
                </div>
                <div class="contact-card__body">
                    <span class="contact-card__label">${esc(t(c.phone_label))}</span>
                    <span class="contact-card__value">${esc(phones.primary_phone.display)}</span>
                </div>
            </a>
        `
            : '';

        const altPhoneCard = phones.alternative_phone
            ? `
            <a href="tel:${esc(phones.alternative_phone.tel)}" class="contact-card contact-card--alt">
                <div class="contact-card__icon">
                    <span class="material-symbols-outlined">phone_in_talk</span>
                </div>
                <div class="contact-card__body">
                    <span class="contact-card__label">${esc(t(c.alternative_phone_label))}</span>
                    <span class="contact-card__value">${esc(phones.alternative_phone.display)}</span>
                </div>
            </a>
        `
            : '';

        const whatsappCard = `
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

        cards.innerHTML = phoneCards + altPhoneCard + whatsappCard;
    }

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

// ── Footer ────────────────────────────────────────────────────────────────────

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

// ── Floating WhatsApp ─────────────────────────────────────────────────────────

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

// ── Construction / Error screens ──────────────────────────────────────────────

function showConstruction() {
    const cs = C.settings.construction_screen;
    const phone = C.settings.contact_info?.primary_phone;

    const logo = $('construction-logo');
    if (logo && cs?.logo) {
        logo.src = cs.logo;
        logo.alt = cs.brand_name || C.branding.name;
    }

    const brand = $('construction-brand');
    if (brand) brand.textContent = cs?.brand_name || C.branding.name;

    const msgFr = cs?.message?.fr || C.settings.construction_message?.fr;
    const msgEn = cs?.message?.en || C.settings.construction_message?.en;

    const elFr = $('construction-message-fr');
    if (elFr && msgFr) elFr.textContent = msgFr;

    const elEn = $('construction-message-en');
    if (elEn && msgEn) elEn.textContent = msgEn;

    const phoneBtn = $('construction-phone');
    if (phoneBtn && phone) {
        phoneBtn.href = `tel:${phone.tel}`;
        phoneBtn.textContent = phone.display;
    }

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
    const es = C?.settings?.error_screen || {
        logo: 'assets/logo.png',
        brand_name: "L'Histoire des Épices",
        message: {
            fr: 'Impossible de charger le contenu. Veuillez rafraîchir la page.',
            en: 'Unable to load content. Please refresh the page.',
        },
    };

    const phone = C?.settings?.contact_info?.primary_phone || {
        display: '01 23 45 67 89',
        tel: '+33123456789',
    };

    document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;
                    font-family:'Jura',sans-serif;text-align:center;padding:2rem;color:#1a1a1a;background:#faf8f5;">
            <img src="${es.logo}" alt="${es.brand_name}" style="width:120px;margin-bottom:1.5rem;" />
            <p style="font-family:'Felipa',cursive;font-size:3rem;color:#5b0617;margin-bottom:1.5rem;">${es.brand_name}</p>
            <p style="color:#6b6b6b;margin-bottom:0.25rem;font-size:1.1rem;">${es.message.fr}</p>
            <p style="color:#6b6b6b;margin-bottom:1.5rem;font-style:italic;opacity:0.8;">${es.message.en}</p>
            <a href="tel:${phone.tel}" style="background:#C9A55C;color:#1a1a1a;padding:1rem 2rem;border-radius:9999px;
               text-decoration:none;font-weight:600;">${phone.display}</a>
        </div>
    `;
}

// ── Accessibility labels + section eyebrows ────────────────────────────────────

function updateAccessibilityLabels() {
    const u = C.ui_strings;

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t(u.skip_to_content);

    const nav = document.querySelector('nav[aria-label]');
    if (nav) nav.setAttribute('aria-label', t(u.main_navigation));

    const brandLink = $('nav-brand');
    if (brandLink) brandLink.setAttribute('aria-label', t(u.home_link));

    const langToggle = $('lang-toggle');
    if (langToggle) langToggle.setAttribute('aria-label', t(u.change_language));

    const hamburger = $('hamburger');
    if (hamburger) hamburger.setAttribute('aria-label', t(u.open_menu));

    const mobileMenu = $('mobile-menu');
    if (mobileMenu) mobileMenu.setAttribute('aria-label', t(u.mobile_menu));

    const menuFilters = $('menu-filters');
    if (menuFilters) menuFilters.setAttribute('aria-label', t(u.filter_by_category));

    const floatingWa = $('floating-whatsapp');
    if (floatingWa) floatingWa.setAttribute('aria-label', t(u.contact_whatsapp));

    const sections = u.section_labels || {};
    Object.keys(sections).forEach((id) => {
        const section = document.getElementById(id);
        if (section) section.setAttribute('aria-label', t(sections[id]));
    });

    const eyebrows = u.section_eyebrows || {};

    const menuEyebrow = document.querySelector('#menu .section-eyebrow');
    if (menuEyebrow && eyebrows.menu) menuEyebrow.textContent = t(eyebrows.menu);

    const eventsEyebrow = document.querySelector('#evenements .section-eyebrow');
    if (eventsEyebrow && eyebrows.events) eventsEyebrow.textContent = t(eyebrows.events);

    const contactEyebrow = document.querySelector('#contact .section-eyebrow');
    if (contactEyebrow && eyebrows.contact) contactEyebrow.textContent = t(eyebrows.contact);
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

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

    initScrollReveal();
    initLazyImages();
    updateMenuCartButtons();
}
