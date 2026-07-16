/**
 * seo.js — SEO meta tags and JSON-LD structured data
 */

function updateSEO() {
    const s = C.seo;
    document.title = t(s.title);
    document.documentElement.lang = lang;

    const setMeta = (sel, val) => {
        const m = document.querySelector(sel);
        if (m) m.content = val;
    };

    const setOrCreateMeta = (name, content, isProperty = false) => {
        const attr = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    // Basic meta tags
    setMeta('meta[name="description"]', t(s.description));
    if (s.keywords) setOrCreateMeta('keywords', s.keywords);
    setOrCreateMeta(
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    setOrCreateMeta('googlebot', 'index, follow');

    // Open Graph
    setMeta('meta[property="og:title"]', t(s.title));
    setMeta('meta[property="og:description"]', t(s.description));
    if (s.og_image) setOrCreateMeta('og:image', s.og_image, true);
    setOrCreateMeta('og:type', 'website', true);
    setOrCreateMeta('og:locale', lang === 'en' ? 'en_US' : 'fr_FR', true);
    if (s.canonical_url) setOrCreateMeta('og:url', s.canonical_url, true);

    // Twitter Card
    setMeta('meta[name="twitter:title"]', t(s.title));
    setMeta('meta[name="twitter:description"]', t(s.description));
    if (s.og_image) setOrCreateMeta('twitter:image', s.og_image);

    // Canonical URL
    if (s.canonical_url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = s.canonical_url;
    }

    updateStructuredData();
}

function updateStructuredData() {
    const sd = C.settings.structured_data || {};

    const schema = {
        '@context': 'https://schema.org',
        '@type': sd.business_type || 'Restaurant',
        name: C.branding.name,
        description: t(C.seo.description),
        url: C.seo.canonical_url,
        logo: C.branding.logo_path,
        image: C.seo.og_image,
        servesCuisine: sd.cuisine || 'Indian',
        priceRange: sd.price_range || '€€',
        address: {
            '@type': 'PostalAddress',
            addressLocality: sd.location?.city || 'Valenciennes',
            addressCountry: sd.location?.country || 'FR',
        },
        telephone: C.settings.contact_info?.primary_phone?.tel || '+33123456789',
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: sd.opening_days || [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ],
        },
        acceptsReservations: sd.accepts_reservations !== false ? 'True' : 'False',
        hasMenu: C.seo.canonical_url + '#menu',
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
}
