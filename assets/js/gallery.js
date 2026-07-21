/**
 * gallery.js — Event photo gallery page
 *
 * URL patterns:
 *   gallery.html?event=market           → album list for that event type
 *   gallery.html?event=market&album=id  → photo grid for that album
 */

/* ── Page state ──────────────────────────────────────────────────────────── */

let _galleryImages = [];
let _galleryIndex = 0;
const _folderCache = {};

/* ── GitHub API auto-discovery ───────────────────────────────────────────── */

async function fetchFolderImages(folderPath) {
    if (_folderCache[folderPath]) return _folderCache[folderPath];

    const repo = C.settings?.github_repo;
    if (!repo) {
        console.warn('Gallery: settings.github_repo not set — cannot auto-discover images.');
        return [];
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/contents/${folderPath}`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (!res.ok) {
            console.error(`Gallery: GitHub API ${res.status} for "${folderPath}"`);
            return [];
        }
        const files = await res.json();
        const images = Array.isArray(files)
            ? files
                  .filter((f) => f.type === 'file' && /\.(jpe?g|png|webp|gif|avif)$/i.test(f.name))
                  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                  .map((f) => f.download_url)
            : [];
        _folderCache[folderPath] = images;
        return images;
    } catch (err) {
        console.error('Gallery: failed to fetch folder images:', err);
        return [];
    }
}

/* ── URL helpers ─────────────────────────────────────────────────────────── */

function getGalleryParams() {
    const p = new URLSearchParams(window.location.search);
    return { eventId: p.get('event'), albumId: p.get('album') };
}

function setParam(key, value) {
    const p = new URLSearchParams(window.location.search);
    if (value === null) p.delete(key);
    else p.set(key, value);
    return '?' + p.toString();
}

/* ── Data helpers ────────────────────────────────────────────────────────── */

function getEventItem(eventId) {
    return (C.events?.items || []).find((e) => e.id === eventId) || null;
}

function getAlbum(eventItem, albumId) {
    return (eventItem?.albums || []).find((a) => a.id === albumId) || null;
}

function formatGalleryDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/* ── Document title ──────────────────────────────────────────────────────── */

function setPageTitle(parts) {
    document.title = [...parts, "L'Histoire des Épices"].join(' — ');
}

/* ── Breadcrumb ──────────────────────────────────────────────────────────── */

function renderGalleryBreadcrumb(eventItem, album) {
    const el = $('gallery-breadcrumb');
    if (!el) return;

    const homeLabel = lang === 'fr' ? 'Accueil' : 'Home';
    const sep = `<span class="gallery-breadcrumb__sep" aria-hidden="true">›</span>`;

    const crumbs = [
        `<a href="index.html#evenements" class="gallery-breadcrumb__link">${esc(homeLabel)}</a>${sep}`,
    ];

    if (album) {
        crumbs.push(
            `<a href="gallery.html${setParam('album', null)}" class="gallery-breadcrumb__link">${esc(t(eventItem.label))}</a>${sep}`,
            `<span class="gallery-breadcrumb__current" aria-current="page">${esc(t(album.title))}</span>`,
        );
    } else {
        crumbs.push(
            `<span class="gallery-breadcrumb__current" aria-current="page">${esc(t(eventItem.label))}</span>`,
        );
    }

    el.innerHTML = crumbs.join('');
}

/* ── Hero ────────────────────────────────────────────────────────────────── */

function setGalleryHero(title, countText) {
    const titleEl = $('gallery-hero-title');
    const countEl = $('gallery-hero-count');
    if (titleEl) titleEl.textContent = title;
    if (countEl) countEl.textContent = countText;
}

/* ── Albums view ─────────────────────────────────────────────────────────── */

function renderAlbumsView(eventItem) {
    $('gallery-albums-view').hidden = false;
    $('gallery-photos-view').hidden = true;
    $('gallery-empty').hidden = true;

    const albums = eventItem.albums || [];
    const eventLabel = t(eventItem.label);

    renderGalleryBreadcrumb(eventItem, null);
    setPageTitle([eventLabel]);

    const albumWord =
        lang === 'fr'
            ? `${albums.length} album${albums.length !== 1 ? 's' : ''}`
            : `${albums.length} album${albums.length !== 1 ? 's' : ''}`;
    setGalleryHero(eventLabel, albumWord);

    const grid = $('gallery-albums-grid');
    if (!grid) return;

    if (!albums.length) {
        $('gallery-albums-view').hidden = true;
        $('gallery-empty').hidden = false;
        const msg = $('gallery-empty-msg');
        const backLabel = $('gallery-back-label');
        if (msg)
            msg.textContent =
                lang === 'fr'
                    ? 'Aucun album disponible pour le moment.'
                    : 'No albums available yet.';
        if (backLabel)
            backLabel.textContent = lang === 'fr' ? 'Retour aux événements' : 'Back to events';
        return;
    }

    grid.innerHTML = albums
        .map((album) => {
            const photoCount = album.images?.length || 0;
            const dateStr = formatGalleryDate(album.date);
            const albumTitle = esc(t(album.title));
            const href = `gallery.html?event=${esc(eventItem.id)}&album=${esc(album.id)}`;

            return `
                <a href="${href}" class="gallery-album-card reveal">
                    <div class="gallery-album-card__img-wrap">
                        ${
                            album.cover
                                ? `<img src="${esc(album.cover)}" alt="${albumTitle}" loading="lazy">`
                                : `<div class="gallery-album-card__placeholder">
                                   <span class="material-symbols-outlined">photo_library</span>
                               </div>`
                        }
                        ${
                            album.images?.length
                                ? `<span class="gallery-album-card__count">
                                   <span class="material-symbols-outlined">photo_library</span>
                                   ${album.images.length}
                               </span>`
                                : ''
                        }
                    </div>
                    <div class="gallery-album-card__body">
                        <p class="gallery-album-card__title">${albumTitle}</p>
                        ${album.description ? `<p class="gallery-album-card__desc">${esc(t(album.description))}</p>` : ''}
                        ${
                            dateStr
                                ? `<p class="gallery-album-card__meta">
                            <span class="material-symbols-outlined">calendar_today</span>${esc(dateStr)}
                        </p>`
                                : ''
                        }
                        ${
                            album.location
                                ? `<p class="gallery-album-card__meta">
                            <span class="material-symbols-outlined">location_on</span>${esc(album.location)}
                        </p>`
                                : ''
                        }
                    </div>
                    <div class="gallery-album-card__cta">
                        <span class="material-symbols-outlined">photo_camera</span>
                        ${lang === 'fr' ? 'Voir les photos' : 'View photos'}
                    </div>
                </a>`;
        })
        .join('');
}

/* ── Photos view ─────────────────────────────────────────────────────────── */

async function renderPhotosView(eventItem, album) {
    $('gallery-albums-view').hidden = true;
    $('gallery-photos-view').hidden = false;
    $('gallery-empty').hidden = true;

    const albumTitle = t(album.title);

    renderGalleryBreadcrumb(eventItem, album);
    setPageTitle([albumTitle, t(eventItem.label)]);
    setGalleryHero(albumTitle, lang === 'fr' ? 'Chargement…' : 'Loading…');

    const grid = $('gallery-photos-grid');
    if (grid) {
        grid.innerHTML = `<div class="gallery-loading">
            <span class="material-symbols-outlined gallery-loading__icon">photo_library</span>
        </div>`;
    }

    /* Resolve images — static array takes priority, then GitHub API folder scan */
    let images = album.images?.length ? album.images : [];
    if (!images.length && album.folder) {
        images = await fetchFolderImages(album.folder);
    }

    const photoWord =
        lang === 'fr'
            ? `${images.length} photo${images.length !== 1 ? 's' : ''}`
            : `${images.length} photo${images.length !== 1 ? 's' : ''}`;
    setGalleryHero(albumTitle, photoWord);

    if (!grid) return;

    if (!images.length) {
        $('gallery-photos-view').hidden = true;
        $('gallery-empty').hidden = false;
        const msg = $('gallery-empty-msg');
        if (msg)
            msg.textContent =
                lang === 'fr' ? 'Aucune photo dans cet album.' : 'No photos in this album yet.';
        const backLabel = $('gallery-back-label');
        if (backLabel)
            backLabel.textContent = lang === 'fr' ? 'Retour aux albums' : 'Back to albums';
        const backLink = document.querySelector('.gallery-empty__back');
        if (backLink) backLink.href = `gallery.html?event=${esc(eventItem.id)}`;
        return;
    }

    grid.innerHTML = images
        .map(
            (src, i) => `
            <button class="gallery-photo-item reveal" data-index="${i}" aria-label="Photo ${i + 1}">
                <img src="${esc(src)}" alt="" loading="lazy">
                <div class="gallery-photo-item__overlay">
                    <span class="material-symbols-outlined">zoom_in</span>
                </div>
            </button>`,
        )
        .join('');

    _galleryImages = images;
    initScrollReveal();
}

/* ── Lightbox ────────────────────────────────────────────────────────────── */

function openGalleryLightbox(index) {
    if (!_galleryImages.length) return;
    _galleryIndex = Math.max(0, Math.min(index, _galleryImages.length - 1));
    _renderLightboxSlide();
    $('gallery-lightbox').hidden = false;
    $('gallery-lightbox-close')?.focus();
}

function closeGalleryLightbox() {
    $('gallery-lightbox').hidden = true;
}

function _renderLightboxSlide() {
    const img = $('gallery-lightbox-img');
    const counter = $('gallery-lightbox-counter');
    const prev = $('gallery-lightbox-prev');
    const next = $('gallery-lightbox-next');
    const total = _galleryImages.length;

    if (img) {
        img.src = _galleryImages[_galleryIndex];
        img.alt = `Photo ${_galleryIndex + 1}`;
    }
    if (counter) counter.textContent = `${_galleryIndex + 1} / ${total}`;
    if (prev) prev.disabled = _galleryIndex === 0;
    if (next) next.disabled = _galleryIndex === total - 1;
}

/* ── Main render ─────────────────────────────────────────────────────────── */

async function renderGallery() {
    window._navAnchorBase = 'index.html';
    renderTicker();
    renderNav();
    renderFooter();
    renderFloatingWA();

    const { eventId, albumId } = getGalleryParams();

    if (!eventId) {
        window.location.replace('index.html#evenements');
        return;
    }

    const eventItem = getEventItem(eventId);
    if (!eventItem) {
        window.location.replace('index.html#evenements');
        return;
    }

    if (albumId) {
        const album = getAlbum(eventItem, albumId);
        album ? await renderPhotosView(eventItem, album) : renderAlbumsView(eventItem);
    } else {
        renderAlbumsView(eventItem);
    }

    initScrollReveal();
}

/* ── Boot ────────────────────────────────────────────────────────────────── */

async function bootGallery() {
    try {
        C = await fetch('content.json').then((r) => r.json());

        const saved = localStorage.getItem('lang');
        if (saved === 'en') {
            lang = 'en';
            document.documentElement.lang = 'en';
            const toggle = $('lang-toggle');
            if (toggle) toggle.setAttribute('aria-pressed', 'true');
        }
    } catch (err) {
        console.error('Failed to load content:', err);
        return;
    }

    renderGallery();
    initEventListeners();

    /* Language toggle */
    $('lang-toggle')?.addEventListener('click', () => {
        lang = lang === 'fr' ? 'en' : 'fr';
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
        const toggle = $('lang-toggle');
        if (toggle) toggle.setAttribute('aria-pressed', String(lang === 'en'));
        renderGallery();
    });

    /* Photo thumbnail → lightbox */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.gallery-photo-item[data-index]');
        if (btn) openGalleryLightbox(parseInt(btn.dataset.index, 10));
    });

    /* Lightbox controls */
    $('gallery-lightbox-close')?.addEventListener('click', closeGalleryLightbox);
    $('gallery-lightbox-backdrop')?.addEventListener('click', closeGalleryLightbox);
    $('gallery-lightbox-prev')?.addEventListener('click', () => {
        if (_galleryIndex > 0) {
            _galleryIndex--;
            _renderLightboxSlide();
        }
    });
    $('gallery-lightbox-next')?.addEventListener('click', () => {
        if (_galleryIndex < _galleryImages.length - 1) {
            _galleryIndex++;
            _renderLightboxSlide();
        }
    });

    /* Keyboard */
    document.addEventListener('keydown', (e) => {
        const lb = $('gallery-lightbox');
        if (!lb || lb.hidden) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (_galleryIndex > 0) {
                _galleryIndex--;
                _renderLightboxSlide();
            }
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (_galleryIndex < _galleryImages.length - 1) {
                _galleryIndex++;
                _renderLightboxSlide();
            }
        }
        if (e.key === 'Escape') closeGalleryLightbox();
    });

    /* Browser back/forward */
    window.addEventListener('popstate', renderGallery);
}

document.addEventListener('DOMContentLoaded', bootGallery);
