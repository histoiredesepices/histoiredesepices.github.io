/**
 * utils.js — Pure utility functions and DOM helpers
 */

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
    img.decoding = 'async';
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

function initLazyImages() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            },
            { rootMargin: '100px 0px', threshold: 0.01 },
        );
        images.forEach((img) => imageObserver.observe(img));
    } else {
        images.forEach((img) => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

const WA_PATH =
    'M16 2C8.27 2 2 8.27 2 16c0 2.44.65 4.74 1.79 6.73L2 30l7.51-1.97A13.93 13.93 0 0016 30c7.73 0 14-6.27 14-14S23.73 2 16 2zm0 25.5a11.46 11.46 0 01-5.84-1.6l-.42-.25-4.46 1.17 1.19-4.33-.28-.44A11.5 11.5 0 1116 27.5zm6.3-8.6c-.34-.17-2.02-1-2.34-1.11-.32-.12-.55-.17-.78.17s-.9 1.11-1.1 1.34c-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.6.09-.91.43s-1.2 1.17-1.2 2.85c0 1.68 1.23 3.3 1.4 3.53.17.23 2.43 3.71 5.88 5.2.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.02-.83 2.3-1.63.29-.8.29-1.49.2-1.63-.08-.15-.31-.23-.65-.4z';

const waSvg = (fill = 'white', size = 28) =>
    `<svg viewBox="0 0 32 32" fill="${fill}" width="${size}" height="${size}" aria-hidden="true"><path d="${WA_PATH}"/></svg>`;
