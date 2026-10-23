/**
 * menu-pdf.js — "Download menu (PDF)" generated on the fly from menu.json
 *
 * Instead of linking to a static PDF that drifts out of date, clicking the
 * download button builds an A4 menu from the live data (C.menu) in the
 * current language and downloads it. The libraries — html2pdf.js (~950 KB) and
 * qrcode-generator (~55 KB, for the website / social QR codes) — are only
 * fetched on the first click, so they never slow down normal page loads.
 * Both are pinned to an exact version with a Subresource Integrity hash.
 */

const MENU_PDF_LIBS = {
    html2pdf: {
        src: 'https://cdn.jsdelivr.net/npm/html2pdf.js@0.14.0/dist/html2pdf.bundle.min.js',
        sri: 'sha384-EaWTV/aVUkLz3tfwg3+5ycX7Q/d9ET9ruOKUgUuFIRUCfzHO1eo2J62a844iWPmY',
    },
    qrcode: {
        src: 'https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.js',
        sri: 'sha384-e9EFD6BGC90bkW9aDV5xbbBfzwN7G8YImHao2lfLVKV/hPB0E0go+H3I64h7oHtA',
    },
};

// Content width of an A4 page (210 mm) minus 12 mm side margins, at 96 dpi.
const MENU_PDF_WIDTH_PX = 703;

const _libPromises = {};
let _menuPdfBusy = false;

// Loads a pinned CDN library once; `globalName` is the global it defines.
function loadMenuPdfLib(globalName) {
    if (window[globalName]) return Promise.resolve();
    if (!_libPromises[globalName]) {
        const { src, sri } = MENU_PDF_LIBS[globalName];
        _libPromises[globalName] = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.integrity = sri;
            s.crossOrigin = 'anonymous';
            s.onload = resolve;
            s.onerror = () => {
                delete _libPromises[globalName]; // allow a retry on the next click
                reject(new Error(`Failed to load ${src}`));
            };
            document.head.appendChild(s);
        });
    }
    return _libPromises[globalName];
}

const loadHtml2Pdf = () => loadMenuPdfLib('html2pdf');

// QR code as a GIF data URL (an <img> html2canvas can always rasterise).
function menuPdfQr(url) {
    if (!url || !window.qrcode) return '';
    try {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        return qr.createDataURL(6, 2);
    } catch (err) {
        console.error('[menu-pdf] QR code failed for', url, err);
        return '';
    }
}

/* ── Template ────────────────────────────────────────────────────────────── */

function menuPdfPrice(dish) {
    if (!C.settings?.show_prices || dish.price_eur == null) return '';
    const price = dish.discount_percent
        ? dish.price_eur * (1 - dish.discount_percent / 100)
        : dish.price_eur;
    return `${price.toFixed(2).replace('.', lang === 'fr' ? ',' : '.')} €`;
}

function menuPdfDish(dish, pdfStrings) {
    const u = C.ui_strings || {};
    const tags = dish.tags || [];
    const badges = [
        tags.includes('vegan')
            ? t(u.badges?.vegan)
            : tags.includes('vegetarian')
              ? t(u.badges?.vegetarian)
              : '',
        tags.includes('halal') ? t(u.badges?.halal) : '',
    ].filter(Boolean);

    const spice = clamp(dish.spice_level ?? 0, 0, 5);
    const allergens =
        C.settings?.show_allergens && Array.isArray(dish.allergens) && dish.allergens.length
            ? dish.allergens.map((a) => t(u.allergens?.[a]) || a).join(', ')
            : '';

    const meta = [
        ...badges.map((b) => `<span class="menu-pdf__badge">${esc(b)}</span>`),
        spice > 0 ? `<span class="menu-pdf__spice">${'🌶'.repeat(spice)}</span>` : '',
        allergens
            ? `<span class="menu-pdf__allergens">${esc(t(pdfStrings.contains_label))}${lang === 'fr' ? ' : ' : ': '}${esc(allergens)}</span>`
            : '',
    ].join('');

    return `
        <div class="menu-pdf__dish">
            <div class="menu-pdf__dish-head">
                <span class="menu-pdf__dish-name">${esc(t(dish.name))}</span>
                <span class="menu-pdf__dots"></span>
                <span class="menu-pdf__price">${esc(menuPdfPrice(dish))}</span>
            </div>
            ${dish.description ? `<p class="menu-pdf__desc">${esc(t(dish.description))}</p>` : ''}
            ${meta.trim() ? `<div class="menu-pdf__meta">${meta}</div>` : ''}
        </div>`;
}

// "Order & follow us" panel: phone numbers + ordering note on the left, QR
// codes for the website (contact.website_url) and each social in
// contact.socials on the right. Any missing link simply drops its QR code.
function buildMenuPdfContactPanel(pdfStrings) {
    const ci = C.settings?.contact_info || {};
    const phones = [ci.primary_phone?.display, ci.alternative_phone?.display].filter(Boolean);
    const qrTile = (url, label, modifier = '') => {
        const src = menuPdfQr(url);
        return src
            ? `<div class="menu-pdf__qr${modifier}">
                   <img src="${src}" alt="">
                   <span>${esc(label)}</span>
               </div>`
            : '';
    };

    const websiteQr = qrTile(
        C.contact?.website_url,
        t(pdfStrings.scan_to_order),
        ' menu-pdf__qr--main',
    );
    const socialQrs = (C.contact?.socials || [])
        .map((s) => qrTile(s.url, s.label || s.platform))
        .join('');

    return `
        <div class="menu-pdf__contact">
            <div class="menu-pdf__contact-info">
                <span class="menu-pdf__contact-label">${esc(t(pdfStrings.order_label))}</span>
                ${phones.map((p) => `<span class="menu-pdf__phone">${esc(p)}</span>`).join('')}
                ${
                    t(pdfStrings.delivery_highlight)
                        ? `<span class="menu-pdf__delivery">${esc(t(pdfStrings.delivery_highlight))}</span>`
                        : ''
                }
                <span class="menu-pdf__contact-note">${esc(['WhatsApp', t(C.contact?.ordering_note)].filter(Boolean).join(' · '))}</span>
            </div>
            <div class="menu-pdf__qrs">
                ${websiteQr}
                ${
                    socialQrs
                        ? `<div class="menu-pdf__qr-group">
                               <span class="menu-pdf__qr-group-label">${esc(t(pdfStrings.follow_us))}</span>
                               <div class="menu-pdf__qr-row">${socialQrs}</div>
                           </div>`
                        : ''
                }
            </div>
        </div>`;
}

// "Good to know" (menu footnote) + allergen disclaimer, as two matching cards.
function buildMenuPdfNotes(m, pdfStrings) {
    const notes = [
        m.footnote && { label: t(pdfStrings.service_label), text: t(m.footnote), mod: 'service' },
        C.settings?.show_allergens &&
            pdfStrings.allergen_note && {
                label: t(pdfStrings.contains_label),
                text: t(pdfStrings.allergen_note),
                mod: 'allergen',
            },
    ].filter((n) => n && n.text);
    if (!notes.length) return '';
    return `
        <div class="menu-pdf__notes">
            ${notes
                .map(
                    (n) => `
                <div class="menu-pdf__note menu-pdf__note--${n.mod}">
                    ${n.label ? `<span class="menu-pdf__note-label">${esc(n.label)}</span>` : ''}
                    <p class="menu-pdf__note-text">${esc(n.text)}</p>
                </div>`,
                )
                .join('')}
        </div>`;
}

function buildMenuPdfElement() {
    const m = C.menu || {};
    const pdfStrings = m.download_button?.pdf || {};
    const dishes = (m.dishes || []).filter((d) => d.is_available !== false);
    const date = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const categories = (m.categories || [])
        .filter((cat) => cat.id !== 'all')
        .map((cat) => {
            const items = dishes.filter((d) => d.category === cat.id);
            if (!items.length) return '';
            const [first, ...rest] = items.map((d) => menuPdfDish(d, pdfStrings));
            // Title + first dish are grouped so a category title is never
            // left alone at the bottom of a page.
            return `
            <section class="menu-pdf__cat">
                <div class="menu-pdf__keep">
                    <h2 class="menu-pdf__cat-title">${esc(t(cat.label))}<span class="menu-pdf__cat-rule"></span></h2>
                    ${first}
                </div>
                ${rest.join('')}
            </section>`;
        })
        .join('');

    const el = document.createElement('div');
    el.className = 'menu-pdf';
    el.style.width = `${MENU_PDF_WIDTH_PX}px`;
    el.innerHTML = `
        <header class="menu-pdf__header">
            ${C.branding?.logo_path ? `<img class="menu-pdf__logo" src="${esc(C.branding.logo_path)}" alt="">` : ''}
            <h1 class="menu-pdf__brand">${esc(C.branding?.name || '')}</h1>
            <p class="menu-pdf__tagline">${esc(t(C.branding?.tagline))}</p>
            <p class="menu-pdf__title">${esc(t(m.section_title))}</p>
            <p class="menu-pdf__updated">${esc((t(pdfStrings.updated_label) || '{date}').replace('{date}', date))}</p>
        </header>
        ${buildMenuPdfContactPanel(pdfStrings)}
        ${buildMenuPdfNotes(m, pdfStrings)}
        ${categories}`;
    return el;
}

/* ── Generation ──────────────────────────────────────────────────────────── */

async function generateMenuPdf(btn) {
    if (_menuPdfBusy) return;
    _menuPdfBusy = true;
    let failed = false;

    const db = C.menu?.download_button || {};
    const label = btn.querySelector('[data-i18n="download_menu"]');
    const icon = btn.querySelector('.material-symbols-outlined');
    btn.setAttribute('aria-busy', 'true');
    btn.classList.add('is-loading');
    if (icon) icon.textContent = 'progress_activity';
    if (label) label.textContent = t(db.generating_label) || t(db.label);

    // Off-screen (not display:none) so html2canvas can still lay it out.
    const host = document.createElement('div');
    host.className = 'menu-pdf-host';

    try {
        // QR codes are drawn while building the template, so load that first;
        // without it the PDF is still generated, just without QR codes.
        await loadMenuPdfLib('qrcode').catch((err) => console.error('[menu-pdf]', err));
        const el = buildMenuPdfElement();
        host.appendChild(el);
        document.body.appendChild(host);

        await Promise.all([
            loadHtml2Pdf(),
            document.fonts?.load?.('400 32px Felipa'),
            document.fonts?.load?.('400 14px Jura'),
            document.fonts?.load?.('700 14px Jura'),
            document.fonts?.ready,
        ]);

        const stamp = new Date().toISOString().slice(0, 10);
        const fileBase = db.pdf?.file_name || 'Menu';
        const site = (C.seo?.canonical_url || '').replace(/^https?:\/\//, '');
        const footerText = [C.branding?.name, site].filter(Boolean).join('  ·  ');

        await window
            .html2pdf()
            .set({
                margin: [12, 12, 16, 12], // mm: top, right, bottom, left
                filename: `${fileBase}-${stamp}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    avoid: [
                        '.menu-pdf__dish',
                        '.menu-pdf__keep',
                        '.menu-pdf__header',
                        '.menu-pdf__contact',
                    ],
                },
            })
            .from(el)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                // Page footer: "L'Histoire des Épices · site — 1 / 3"
                const pages = pdf.internal.getNumberOfPages();
                const w = pdf.internal.pageSize.getWidth();
                const h = pdf.internal.pageSize.getHeight();
                for (let i = 1; i <= pages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.setTextColor(140);
                    pdf.text(`${footerText} — ${i} / ${pages}`, w / 2, h - 7, { align: 'center' });
                }
            })
            .save();
    } catch (err) {
        failed = true;
        console.error("[L'Histoire des Épices] Menu PDF generation failed:", err);
    } finally {
        host.remove();
        btn.removeAttribute('aria-busy');
        btn.classList.remove('is-loading');
        if (icon) icon.textContent = failed ? 'error' : 'download';
        if (label) label.textContent = t(failed ? db.error_label : db.label) || t(db.label);
        _menuPdfBusy = false;
        if (failed) {
            setTimeout(() => {
                if (icon) icon.textContent = 'download';
                if (label) label.textContent = t(db.label);
            }, 4000);
        }
    }
}

// Delegated so it survives menu re-renders (e.g. language switch). Always
// prevent the link's default: there is no static PDF to fall back to.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#download-menu-btn');
    if (!btn) return;
    e.preventDefault();
    if (C?.menu?.dishes) generateMenuPdf(btn);
});
