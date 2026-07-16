/**
 * boot.js — Application entry point: fetches content.json and kicks off the app
 */

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
        initDishModal();
        initCart();

        console.info("[L'Histoire des Épices] Site loaded successfully.");
    } catch (err) {
        console.error("[L'Histoire des Épices] Failed to load content.json:", err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', boot);
