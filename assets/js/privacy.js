/**
 * privacy.js — GDPR information banner (all pages) + privacy page (privacy.html)
 *
 * The site sets no cookies and uses no analytics/ads, so no consent is legally
 * required: the banner is purely informational ("here is what we do"), with a
 * single acknowledgement button. Dismissal is remembered in localStorage per
 * content.json → privacy.version, so bumping the version re-shows the banner
 * after the policy changes.
 */

const PRIVACY_ACK_KEY = 'hde_privacy_ack';

function getPrivacyAck() {
    try {
        return localStorage.getItem(PRIVACY_ACK_KEY);
    } catch (_) {
        return null;
    }
}

function setPrivacyAck(version) {
    try {
        localStorage.setItem(PRIVACY_ACK_KEY, version);
    } catch (_) {}
}

const privacyList = (items, icon, modifier) =>
    (items || [])
        .map(
            (item) => `<li class="privacy-list__item privacy-list__item--${modifier}">
                <span class="material-symbols-outlined" aria-hidden="true">${icon}</span>
                <span>${esc(item)}</span>
            </li>`,
        )
        .join('');

/* ── Banner ──────────────────────────────────────────────────────────────── */

// Called from renderFooter(), so it re-renders on every language switch.
function renderPrivacyBanner() {
    const p = C?.privacy;
    const b = p?.banner;
    const version = p?.version || '1';
    let el = $('privacy-banner');

    if (!b || getPrivacyAck() === version) {
        el?.remove();
        return;
    }

    if (!el) {
        el = document.createElement('section');
        el.id = 'privacy-banner';
        el.className = 'privacy-banner';
        el.setAttribute('role', 'region');
        document.body.appendChild(el);
    }
    el.setAttribute('aria-label', t(b.title));

    const listsOpen = window.matchMedia('(min-width: 768px)').matches;
    el.innerHTML = `
        <div class="privacy-banner__head">
            <span class="privacy-banner__icon material-symbols-outlined" aria-hidden="true">shield_lock</span>
            <div>
                <h2 class="privacy-banner__title">${esc(t(b.title))}</h2>
                <p class="privacy-banner__text">${esc(t(b.text))}</p>
            </div>
        </div>
        <details class="privacy-banner__details"${listsOpen ? ' open' : ''}>
            <summary class="privacy-banner__summary">${esc(t(b.details_label))}</summary>
            <div class="privacy-banner__lists">
                <div>
                    <h3 class="privacy-banner__list-title">${esc(t(b.collect_title))}</h3>
                    <ul class="privacy-list">${privacyList(t(b.collect), 'info', 'info')}</ul>
                </div>
                <div>
                    <h3 class="privacy-banner__list-title">${esc(t(b.not_collect_title))}</h3>
                    <ul class="privacy-list">${privacyList(t(b.not_collect), 'block', 'no')}</ul>
                </div>
            </div>
        </details>
        <div class="privacy-banner__actions">
            <button type="button" class="privacy-banner__accept" data-privacy-accept>${esc(t(b.accept))}</button>
            <a class="privacy-banner__more" href="privacy.html">${esc(t(b.learn_more))}</a>
        </div>`;

    el.querySelector('[data-privacy-accept]').addEventListener('click', () => {
        setPrivacyAck(version);
        el.classList.add('is-leaving');
        setTimeout(() => el.remove(), 250);
    });
}

/* ── Privacy page ────────────────────────────────────────────────────────── */

function renderPrivacyPage() {
    const p = C?.privacy?.page;
    if (!p) return;
    const phone = C.settings?.contact_info?.primary_phone?.display || '';
    const fill = (s) => (s || '').replaceAll('{phone}', phone);

    document.title = t(p.seo_title) || document.title;
    const set = (id, text) => {
        const el = $(id);
        if (el) el.textContent = text || '';
    };
    set('privacy-eyebrow', t(p.eyebrow));
    set('privacy-title', t(p.title));
    set('privacy-subtitle', t(p.subtitle));
    set('privacy-back-label', t(p.back_label));

    const version = C.privacy.version;
    const date = version ? new Date(`${version}T00:00:00`) : null;
    set(
        'privacy-updated',
        date && !isNaN(date)
            ? t(p.updated_label).replace(
                  '{date}',
                  date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                  }),
              )
            : '',
    );

    const crumb = $('privacy-breadcrumb');
    if (crumb) {
        const sep = `<span class="gallery-breadcrumb__sep" aria-hidden="true">›</span>`;
        crumb.innerHTML = `
            <a href="index.html" class="gallery-breadcrumb__link">${esc(lang === 'fr' ? 'Accueil' : 'Home')}</a>${sep}
            <span class="gallery-breadcrumb__current" aria-current="page">${esc(t(p.title))}</span>`;
    }

    const sections = $('privacy-sections');
    if (sections) {
        sections.innerHTML = (p.sections || [])
            .map((s) => {
                const items = t(s.items);
                return `
                <section class="privacy-card reveal">
                    <div class="privacy-card__icon" aria-hidden="true">
                        <span class="material-symbols-outlined">${esc(s.icon || 'info')}</span>
                    </div>
                    <div class="privacy-card__body">
                        <h2 class="privacy-card__title">${esc(t(s.title))}</h2>
                        ${s.text ? `<p class="privacy-card__text">${esc(fill(t(s.text)))}</p>` : ''}
                        ${
                            Array.isArray(items) && items.length
                                ? `<ul class="privacy-list">${privacyList(items.map(fill), 'check', 'check')}</ul>`
                                : ''
                        }
                    </div>
                </section>`;
            })
            .join('');
    }
}

/* ── Shared sub-page chrome (allergens.html, privacy.html) ───────────────── */

// Language toggle, mobile menu and header scroll effect for standalone pages.
// `rerender` is called after the language changes.
function initSubpageChrome(rerender) {
    const applyLang = () => {
        document.documentElement.lang = lang;
        $('lang-toggle')?.setAttribute('aria-pressed', String(lang === 'en'));
    };
    applyLang();

    $('lang-toggle')?.addEventListener('click', () => {
        lang = lang === 'fr' ? 'en' : 'fr';
        safeLang(lang);
        applyLang();
        rerender();
    });

    const hamburger = $('hamburger');
    const mobileMenu = $('mobile-menu');
    if (hamburger && mobileMenu) {
        const close = () => {
            mobileMenu.hidden = true;
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };
        hamburger.addEventListener('click', () => {
            const isOpen = !mobileMenu.hidden;
            mobileMenu.hidden = isOpen;
            hamburger.classList.toggle('active', !isOpen);
            hamburger.setAttribute('aria-expanded', String(!isOpen));
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.hidden) {
                close();
                hamburger.focus();
            }
        });
    }

    const header = $('site-header');
    if (header) {
        const update = () => header.classList.toggle('scrolled', window.pageYOffset > 80);
        window.addEventListener('scroll', update, { passive: true });
        update();
    }
}

/* ── privacy.html boot ───────────────────────────────────────────────────── */

async function bootPrivacyPage() {
    try {
        C = await loadContent();
    } catch (err) {
        console.error('Failed to load content:', err);
        return;
    }
    lang = getLang() || C.settings?.default_language || 'fr';

    const renderAll = () => {
        window._navAnchorBase = 'index.html';
        renderTicker();
        renderNav();
        renderFooter();
        renderFloatingWA();
        renderPrivacyPage();
        initScrollReveal();
    };
    initSubpageChrome(renderAll);
    renderAll();
}

if (document.body?.dataset.page === 'privacy') {
    document.addEventListener('DOMContentLoaded', bootPrivacyPage);
}
