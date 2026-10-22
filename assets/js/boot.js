/**
 * boot.js — Application entry point: fetches content.json + menu.json and kicks off the app
 */

async function boot() {
    const stored = getLang();
    if (stored) lang = stored;

    try {
        C = await loadContent();

        if (!stored) lang = C.settings?.default_language || 'fr';

        if (C.settings?.site_under_construction) {
            showConstruction();
            return;
        }

        render();
        initEventListeners();
        initDishModal();
        initCart();
        initScheduleModal();

        console.info("[L'Histoire des Épices] Site loaded successfully.");
    } catch (err) {
        console.error("[L'Histoire des Épices] Failed to load content.json:", err);
        showError();
    }
}

document.addEventListener('DOMContentLoaded', boot);
