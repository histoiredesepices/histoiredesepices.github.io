/**
 * theme.js — Light / dark mode
 *
 *   - Default theme: content.json → settings.default_theme ("dark" | "light").
 *   - The visitor's own choice (toggle button) is remembered in localStorage
 *     and always wins over the default.
 *   - Each page's <head> has a tiny inline script that sets <html data-theme>
 *     before first paint (using the remembered choice, or the last-known
 *     default), so there is no flash of the wrong theme.
 */

const THEME_KEY = 'theme'; // visitor's explicit choice
const THEME_DEFAULT_KEY = 'theme_default'; // cached content.json default (for the inline script)
const THEMES = ['dark', 'light'];

const storeGet = (k) => {
    try {
        return localStorage.getItem(k);
    } catch (_) {
        return null;
    }
};
const storeSet = (k, v) => {
    try {
        localStorage.setItem(k, v);
    } catch (_) {}
};

function currentTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = THEMES.includes(theme) ? theme : 'dark';
    updateThemeToggle();
}

// Called on every render (via renderNav) once content.json is loaded:
// remembers the configured default and applies it unless the visitor chose.
function syncThemeWithContent() {
    const configured = C?.settings?.default_theme;
    const fallback = THEMES.includes(configured) ? configured : 'dark';
    storeSet(THEME_DEFAULT_KEY, fallback);
    const chosen = storeGet(THEME_KEY);
    applyTheme(THEMES.includes(chosen) ? chosen : fallback);
}

// Icon + accessible label: shows the mode you will switch *to*.
function updateThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const toLight = currentTheme() === 'dark';
    const labels = (typeof C !== 'undefined' && C?.ui_strings?.theme_toggle) || {};
    const label =
        (typeof t === 'function' && t(toLight ? labels.to_light : labels.to_dark)) ||
        (toLight ? 'Light mode' : 'Dark mode');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
    btn.setAttribute('aria-pressed', String(!toLight));
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = toLight ? 'light_mode' : 'dark_mode';
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('#theme-toggle')) return;
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    storeSet(THEME_KEY, next);
    applyTheme(next);
});
