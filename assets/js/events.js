/**
 * events.js — Global event listeners: language toggle, hamburger nav, smooth scroll, header scroll effect
 */

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

        mobileMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) {
                mobileMenu.hidden = true;
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

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
    const hero = $('hero');
    if (header) {
        const updateHeader = () => {
            const scrollThreshold = hero ? hero.offsetHeight * 0.2 : 100;
            const currentScroll = window.pageYOffset;
            header.classList.toggle('scrolled', currentScroll > scrollThreshold);
        };
        window.addEventListener('scroll', updateHeader, { passive: true });
        updateHeader();
    }
}

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
