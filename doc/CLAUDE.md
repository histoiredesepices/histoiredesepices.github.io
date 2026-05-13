# CLAUDE.md — L'Histoire des Épices

> **Mission:** Build a single-page, static, bilingual restaurant website for **L'Histoire des Épices** — an authentic Indian home-catering business in Valenciennes, France. Hosted on **GitHub Pages**. Designed so a non-technical owner can edit **100% of the content** (menu, prices, allergens, photos, translations, contact info, toggles) by editing **one JSON file**, without ever touching HTML, CSS, or JS.

---

## 1. Core Principles

1. **One file rules everything.** All content, copy, menu data, translations, contact info, and feature flags live in `content.json`. The HTML/CSS/JS never needs to be touched for content changes.
2. **Static & dependency-light.** Pure HTML + Tailwind (CDN) + vanilla JavaScript. No build step, no npm, no framework. GitHub Pages serves it as-is.
3. **Bilingual, French-first.** French is the default. English is a toggle. Every user-facing string in `content.json` has both `fr` and `en` keys.
4. **Design is locked.** The visual system (colors, typography, spacing, components) is defined in `DESIGN.md` and implemented in the HTML/CSS. Content edits must never break the design.
5. **Modern & Clean aesthetic.** Full-viewport hero with gradient overlay, glassmorphism effects, smooth animations, and elegant typography create a premium feel.
6. **Resilient to bad input.** If the owner deletes a field, removes a section, or uploads a broken image, the site degrades gracefully — it does not crash.
7. **Mobile-first.** Most diners will browse on a phone. Test every layout at 360px before 1440px.

---

## 2. Tech Stack

| Layer      | Choice                                 | Why                                                                  |
| ---------- | -------------------------------------- | -------------------------------------------------------------------- |
| Markup     | Semantic HTML5                         | Accessible, SEO-friendly, no framework lock-in.                      |
| Styling    | Tailwind CSS (via CDN) + Custom CSS    | Zero build step, custom properties for design tokens.                |
| Behaviour  | Vanilla JavaScript (single `app.js`)   | No bundler. Loads `content.json`, hydrates the DOM, handles toggles. |
| Data       | `content.json`                         | Single source of truth for all content.                              |
| Icons      | Material Symbols Outlined (Google CDN) | Consistent icon system.                                              |
| Fonts      | Felipa + Jura (Google Fonts CDN)       | Felipa for decorative script titles, Jura for modern body text.      |
| Hosting    | GitHub Pages (static)                  | Free, simple, version-controlled edits via GitHub web UI.            |
| Deployment | Push to `main` → auto-deploys          | No CI needed.                                                        |

**Do NOT add:** React, Vue, Astro, build tools, package.json, npm scripts, TypeScript. Keep it boring and editable.

---

## 3. Repository Structure

```
histoire-des-epices/
├── index.html              ← Page shell. Empty containers with data-* hooks.
├── content.json            ← ⭐ THE ONLY FILE THE OWNER EDITS.
├── assets/
│   ├── js/
│   │   └── app.js          ← Loads content.json, hydrates DOM, handles toggles.
│   ├── css/
│   │   └── styles.css      ← Custom CSS beyond Tailwind (mandala bg, animations).
│   ├── mandala.svg         ← Decorative watermark SVG.
│   ├── logo.png
│   ├── hero/
│   ├── menu/               ← Dish photos. Filename references in content.json.
│   ├── events/
│   ├── heritage/
│   └── og-image.jpg        ← Social share preview (1200x630).
├── EDITING.md              ← Plain-French guide for the owner. See section 9.
├── doc/
│   ├── DESIGN.md           ← Design system reference (do not edit casually).
│   └── CLAUDE.md           ← This file. The AI build brief.
└── README.md               ← Public-facing project description.
```

> **Path note:** `styles.css` uses `url('../mandala.svg')` (not `url('assets/mandala.svg')`) because it is resolved relative to `assets/css/`, not the project root.

---

## 4. `content.json` — The Single Source of Truth

This is the **only file the owner ever edits**. Structure it so every piece of content is named clearly in plain language (mix of English and French keys is fine for clarity).

### 4.1 Top-level shape

```json
{
  "settings": { ... },
  "branding": { ... },
  "navigation": { ... },
  "hero": { ... },
  "features": { ... },
  "menu": { ... },
  "heritage": { ... },
  "events": { ... },
  "contact": { ... },
  "footer": { ... },
  "seo": { ... },
  "ui_strings": { ... }
}
```

### 4.2 Section-by-section

#### `settings` — Global behaviour flags

```json
"settings": {
  "default_language": "fr",
  "show_calories": false,
  "show_allergens": true,
  "show_prices": false,
  "show_event_section": true,
  "show_heritage_section": true,
  "show_floating_whatsapp": true,
  "site_under_construction": false,
  "construction_message": {
    "fr": "Nous revenons très bientôt !",
    "en": "We'll be back very soon!"
  }
}
```

Each flag is a simple boolean the owner can flip. The site re-renders accordingly. `show_calories` and `show_allergens` are **per-site toggles** — if `true`, the dish cards reveal that data; if `false`, the data is hidden even when present in dish entries.

#### `branding`

```json
"branding": {
  "name": "L'Histoire des Épices",
  "tagline": {
    "fr": "Cuisine Indienne Authentique",
    "en": "Authentic Indian Cuisine"
  },
  "logo_path": "assets/logo.png",
  "favicon_path": "assets/favicon.ico"
}
```

#### `navigation`

```json
"navigation": {
  "items": [
    { "id": "specialties", "label": { "fr": "Spécialités", "en": "Specialties" } },
    { "id": "menu", "label": { "fr": "La Carte", "en": "Menu" } },
    { "id": "heritage", "label": { "fr": "Héritage", "en": "Heritage" } },
    { "id": "evenements", "label": { "fr": "Événements", "en": "Events" } },
    { "id": "contact", "label": { "fr": "Contact", "en": "Contact" } }
  ]
}
```

Each `id` must match a section `id` in `index.html` so anchor scroll works.

#### `hero`

```json
"hero": {
  "eyebrow": {
    "fr": "TRAITEUR AUTHENTIQUE À VALENCIENNES",
    "en": "AUTHENTIC CATERING IN VALENCIENNES"
  },
  "headline": {
    "fr": ["Cuisine Indienne Authentique,", "Préparée avec Amour"],
    "en": ["Authentic Indian Cuisine,", "Made with Love"]
  },
  "headline_italic_part": 1,
  "subheadline": {
    "fr": "Découvrez l'héritage culinaire de l'Inde à travers nos plats faits maison...",
    "en": "Discover India's culinary heritage through our homemade dishes..."
  },
  "image": "assets/hero/butter-chicken.jpg",
  "image_alt": {
    "fr": "Butter Chicken authentique",
    "en": "Authentic Butter Chicken"
  },
  "primary_cta": {
    "label": { "fr": "Voir le Menu", "en": "View Menu" },
    "anchor": "#menu"
  },
  "secondary_cta": {
    "label": { "fr": "Commander", "en": "Order" },
    "anchor": "#contact"
  }
}
```

`headline` is an array of strings rendered as separate lines. `headline_italic_part` is the index (0-based) of which line is italicised — keeps the editorial feel.

#### `specialties` — The 6 signature dishes showcase section

```json
"specialties": {
  "eyebrow": { "fr": "Découvrez", "en": "Discover" },
  "title": { "fr": "Nos Spécialités", "en": "Our Specialties" },
  "subtitle": {
    "fr": "Six plats signatures qui racontent l'histoire de nos épices",
    "en": "Six signature dishes that tell the story of our spices"
  }
}
```

This section automatically displays 6 dishes marked with `is_signature: true` from the menu. If fewer than 6 signatures exist, it fills with other available dishes.

#### `features` — The 3 quick-info pills in the hero

```json
"features": {
  "items": [
    {
      "icon": "restaurant",
      "title": { "fr": "Traiteur à Domicile", "en": "Home Catering" },
      "subtitle": { "fr": "Pour tous vos événements privés", "en": "For all your private events" }
    },
    {
      "icon": "eco",
      "title": { "fr": "Halal & Végétarien", "en": "Halal & Vegetarian" },
      "subtitle": { "fr": "Options végétariennes variées", "en": "Diverse vegetarian options" }
    },
    {
      "icon": "local_shipping",
      "title": { "fr": "À Emporter & Livraison", "en": "Takeaway & Delivery" },
      "subtitle": { "fr": "Valenciennes et ses environs", "en": "Valenciennes and surrounding area" }
    }
  ]
}
```

Features are displayed as glassmorphism pills at the bottom of the hero section. `icon` is a Material Symbols name — the EDITING.md should link to the picker: https://fonts.google.com/icons.

#### `menu` — The heart of the site

```json
"menu": {
  "section_title": { "fr": "Notre Carte Gourmande", "en": "Our Menu" },
  "footnote": {
    "fr": "Tous nos plats sont accompagnés de Riz Basmati nature.",
    "en": "All dishes are served with plain Basmati rice."
  },
  "allergen_button": {
    "label": { "fr": "Consulter la liste des allergènes", "en": "View allergen list" },
    "url": "assets/allergens.pdf"
  },
  "categories": [
    { "id": "all", "label": { "fr": "Tout", "en": "All" } },
    { "id": "entrees", "label": { "fr": "Entrées", "en": "Starters" } },
    { "id": "vegetarian", "label": { "fr": "Végétarien", "en": "Vegetarian" } },
    { "id": "non_vegetarian", "label": { "fr": "Non-Végétarien", "en": "Non-Vegetarian" } },
    { "id": "sides", "label": { "fr": "Accompagnements", "en": "Sides" } },
    { "id": "desserts", "label": { "fr": "Desserts", "en": "Desserts" } }
  ],
  "dishes": [
    {
      "id": "palak-paneer",
      "category": "vegetarian",
      "name": { "fr": "Palak Paneer", "en": "Palak Paneer" },
      "description": {
        "fr": "Cubes de fromage indien mijotés dans une crème d'épinards frais parfumée à l'ail.",
        "en": "Indian cheese cubes simmered in a fresh spinach cream sauce flavoured with garlic."
      },
      "image": "assets/menu/palak-paneer.jpg",
      "image_alt": { "fr": "Palak Paneer servi dans un karahi", "en": "Palak Paneer in a karahi bowl" },
      "tags": ["vegetarian"],
      "is_signature": false,
      "is_new": false,
      "is_spicy": false,
      "is_available": true,
      "price_eur": null,
      "calories_kcal": 320,
      "allergens": ["dairy"],
      "spice_level": 1
    }
    // ... more dishes
  ]
}
```

**Dish field reference:**

| Field           | Type                | Purpose                                                                                        |
| --------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| `id`            | string (kebab-case) | Stable internal ID. Used for anchors, must be unique.                                          |
| `category`      | string              | Must match a `categories[].id` exactly.                                                        |
| `name`          | `{fr, en}`          | Display name.                                                                                  |
| `description`   | `{fr, en}`          | One short sentence.                                                                            |
| `image`         | string (path)       | Path under `assets/menu/`. If missing/broken → graceful placeholder.                           |
| `image_alt`     | `{fr, en}`          | Accessibility text.                                                                            |
| `tags`          | string[]            | Free-form tags: `vegetarian`, `vegan`, `halal`, `dairy_free`, `gluten_free`.                   |
| `is_signature`  | boolean             | Shows a "Signature" badge.                                                                     |
| `is_new`        | boolean             | Shows a "Nouveau / New" badge.                                                                 |
| `is_spicy`      | boolean             | Shows a flame icon.                                                                            |
| `is_available`  | boolean             | If false, dish is hidden from the menu. (Owner can hide seasonal items without deleting them.) |
| `price_eur`     | number \| null      | Shown only if `settings.show_prices === true`. `null` = price hidden / quote-based.            |
| `calories_kcal` | number \| null      | Shown only if `settings.show_calories === true`.                                               |
| `allergens`     | string[]            | Allergen keys (see `ui_strings.allergens`). Shown only if `settings.show_allergens === true`.  |
| `spice_level`   | 0–3                 | 0 = mild, 3 = very spicy. Rendered as 0–3 flame icons.                                         |

#### `heritage` — The story block (dark burgundy section)

```json
"heritage": {
  "eyebrow": { "fr": "NOTRE HISTOIRE", "en": "OUR STORY" },
  "title": { "fr": "L'Héritage d'une Passion", "en": "A Legacy of Passion" },
  "paragraphs": {
    "fr": [
      "L'Histoire des Épices est née d'une volonté simple : partager la richesse de la cuisine indienne familiale...",
      "Chaque plat raconte une histoire..."
    ],
    "en": [
      "L'Histoire des Épices was born from a simple wish: to share the richness of family Indian cuisine...",
      "Every dish tells a story..."
    ]
  },
  "image": "assets/heritage/spices-flat-lay.jpg",
  "image_alt": { "fr": "Étalage d'épices indiennes", "en": "Indian spice flat lay" },
  "stat": {
    "value": "15+",
    "label": { "fr": "ANS D'EXPÉRIENCE", "en": "YEARS OF EXPERIENCE" }
  }
}
```

#### `events`

```json
"events": {
  "title": { "fr": "Événements Privés & Professionnels", "en": "Private & Professional Events" },
  "subtitle": {
    "fr": "Donnez une touche d'exotisme et d'élégance à vos moments les plus importants.",
    "en": "Add a touch of exotic elegance to your most important moments."
  },
  "items": [
    {
      "id": "mariage",
      "label": { "fr": "Mariage", "en": "Wedding" },
      "image": "assets/events/mariage.jpg"
    },
    { "id": "anniversaire", "label": { "fr": "Anniversaire", "en": "Birthday" }, "image": "..." },
    { "id": "entreprise", "label": { "fr": "Entreprise", "en": "Corporate" }, "image": "..." },
    { "id": "bapteme", "label": { "fr": "Baptême", "en": "Baptism" }, "image": "..." }
  ]
}
```

#### `contact` — No form. WhatsApp + phone + socials only.

```json
"contact": {
  "title": { "fr": "Prêt pour un voyage gustatif ?", "en": "Ready for a culinary journey?" },
  "subtitle": {
    "fr": "Contactez-nous directement via WhatsApp ou par téléphone pour votre commande ou devis.",
    "en": "Reach us directly via WhatsApp or phone for your order or quote."
  },
  "primary_action": {
    "type": "whatsapp",
    "phone_e164": "+33612345678",
    "prefilled_message": {
      "fr": "Bonjour ! Je souhaite passer une commande chez L'Histoire des Épices.",
      "en": "Hello! I'd like to place an order with L'Histoire des Épices."
    },
    "label": { "fr": "Discuter sur WhatsApp", "en": "Chat on WhatsApp" }
  },
  "phone": {
    "display": "01 23 45 67 89",
    "tel": "+33123456789",
    "label": { "fr": "APPELEZ-NOUS", "en": "CALL US" }
  },
  "alternative_phone": {
    "display": "06 12 34 56 78",
    "tel": "+33612345678",
    "label": { "fr": "OU", "en": "OR" }
  },
  "socials": [
    { "platform": "instagram", "url": "https://instagram.com/histoiredesepices", "icon": "instagram" },
    { "platform": "facebook", "url": "https://facebook.com/histoiredesepices", "icon": "facebook" }
  ],
  "ordering_note": {
    "fr": "Commande à passer la veille ou avant 9h. À emporter ou livrable avec forfait livraison.",
    "en": "Orders the day before or before 9 AM. Takeaway or delivery (fee applies)."
  },
  "location_hint": {
    "fr": "Présents sur les marchés de Valenciennes & Anzin.",
    "en": "Find us at the Valenciennes & Anzin markets."
  }
}
```

#### `footer`

```json
"footer": {
  "tagline": {
    "fr": "Une invitation au voyage à travers les saveurs authentiques de l'Inde.",
    "en": "An invitation to journey through the authentic flavours of India."
  },
  "links": [
    { "label": { "fr": "Mentions Légales", "en": "Legal Notice" }, "url": "mentions-legales.html" },
    { "label": { "fr": "Politique de Confidentialité", "en": "Privacy Policy" }, "url": "privacy.html" },
    { "label": { "fr": "Allergènes", "en": "Allergens" }, "url": "assets/allergens.pdf" }
  ],
  "copyright": {
    "fr": "© 2026 L'Histoire des Épices. Curateurs de Traditions Culinaires.",
    "en": "© 2026 L'Histoire des Épices. Curators of Culinary Tradition."
  }
}
```

#### `seo` — Per-language SEO metadata

```json
"seo": {
  "title": {
    "fr": "L'Histoire des Épices | Traiteur Indien à Valenciennes",
    "en": "L'Histoire des Épices | Indian Caterer in Valenciennes"
  },
  "description": {
    "fr": "Traiteur indien authentique à Valenciennes. Plats halal et végétariens, livraison à domicile.",
    "en": "Authentic Indian caterer in Valenciennes. Halal and vegetarian dishes, home delivery."
  },
  "keywords": "traiteur indien, valenciennes, cuisine indienne, halal, végétarien, mariage",
  "og_image": "assets/og-image.jpg",
  "canonical_url": "https://histoire-des-epices.fr"
}
```

#### `ui_strings` — Translatable micro-copy

This is for labels the owner shouldn't have to know about: badge names, allergen names, accessibility labels.

```json
"ui_strings": {
  "lang_toggle": { "fr": "FR | EN", "en": "FR | EN" },
  "view_menu_pdf": { "fr": "Télécharger le menu (PDF)", "en": "Download menu (PDF)" },
  "request_quote": { "fr": "Demander un devis", "en": "Request a quote" },
  "badges": {
    "signature": { "fr": "Signature", "en": "Signature" },
    "new": { "fr": "Nouveau", "en": "New" },
    "spicy": { "fr": "Épicé", "en": "Spicy" },
    "vegetarian": { "fr": "Végétarien", "en": "Vegetarian" },
    "vegan": { "fr": "Végan", "en": "Vegan" },
    "halal": { "fr": "Halal", "en": "Halal" },
    "gluten_free": { "fr": "Sans gluten", "en": "Gluten-free" },
    "dairy_free": { "fr": "Sans lactose", "en": "Dairy-free" }
  },
  "allergens": {
    "dairy":     { "fr": "Lait", "en": "Dairy" },
    "gluten":    { "fr": "Gluten", "en": "Gluten" },
    "nuts":      { "fr": "Fruits à coque", "en": "Nuts" },
    "peanuts":   { "fr": "Arachides", "en": "Peanuts" },
    "eggs":      { "fr": "Œufs", "en": "Eggs" },
    "soy":       { "fr": "Soja", "en": "Soy" },
    "sesame":    { "fr": "Sésame", "en": "Sesame" },
    "mustard":   { "fr": "Moutarde", "en": "Mustard" },
    "shellfish": { "fr": "Crustacés", "en": "Shellfish" },
    "fish":      { "fr": "Poisson", "en": "Fish" },
    "sulphites": { "fr": "Sulfites", "en": "Sulphites" }
  },
  "labels": {
    "calories": { "fr": "kcal", "en": "kcal" },
    "contains_allergens": { "fr": "Contient", "en": "Contains" },
    "spice_level": { "fr": "Niveau d'épice", "en": "Spice level" },
    "image_unavailable": { "fr": "Image indisponible", "en": "Image unavailable" },
    "unavailable": { "fr": "Indisponible", "en": "Unavailable" }
  },
  "errors": {
    "content_load_failed": {
      "fr": "Impossible de charger le contenu. Veuillez rafraîchir la page.",
      "en": "Unable to load content. Please refresh the page."
    }
  }
}
```

---

## 5. JavaScript Behaviour (`app.js`)

### 5.1 Boot sequence

1. On `DOMContentLoaded`, `fetch('content.json')`.
2. Read `localStorage.getItem('lang')`. If null, use `settings.default_language`. Store result.
3. Apply `<html lang="fr|en">`.
4. If `settings.site_under_construction === true`, render only the construction message and stop.
5. Hydrate all sections by querying `[data-bind="<path>"]` elements and setting their content / src / href.
6. Build menu cards from `menu.dishes` filtered by `is_available !== false`.
7. Wire up: language toggle, menu category filter, smooth scroll, mobile hamburger, floating WhatsApp.
8. Set `document.title` and meta tags from `seo` block.

### 5.2 Rendering rules

- **Translation function `t(key, lang)`:** accepts a `{fr, en}` object and returns the correct string. If the requested language is missing, fall back to French. If both are missing, return empty string and log a console warning (never crash).
- **Image fallback:** every `<img>` must have an `onerror` handler that swaps to a styled placeholder div with the label `ui_strings.labels.image_unavailable`.
- **Conditional fields:** allergens, calories, and prices render only when both (a) the `settings` flag is true AND (b) the dish has the data.
- **Category filter:** clicking a chip filters `[data-category]` cards via a CSS class toggle (no DOM destruction — animates smoothly).
- **Language toggle:** clicking it flips `lang`, re-runs the hydration, and stores the choice in `localStorage`.
- **Anchor scroll:** smooth scroll, offset by sticky-header height.

### 5.3 Edge cases (mandatory handling)

| Edge case                                                      | Handling                                                                                                         |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `content.json` fails to load                                   | Show fallback hero with `ui_strings.errors.content_load_failed` and a phone number from a safe in-page fallback. |
| Dish has no image path                                         | Render a textured beige placeholder with the dish initial.                                                       |
| Dish image 404s                                                | Same placeholder via `onerror`.                                                                                  |
| Translation key missing in one language                        | Fall back to French. Log a `console.warn`.                                                                       |
| `dishes[]` is empty                                            | Show empty-state message: "Le menu est en cours de mise à jour. Contactez-nous directement."                     |
| `categories` array changed but dish points to removed category | Treat the dish as `all` only.                                                                                    |
| `allergens` references an unknown key                          | Render the raw key in monospace as a hint to the owner; do not crash.                                            |
| `spice_level` out of range                                     | Clamp to 0–3.                                                                                                    |
| Hero image fails                                               | Use a CSS gradient fallback only — never break the layout.                                                       |
| Phone number missing `+`                                       | Strip non-digits, prefix `+`, build `tel:` and `wa.me/` links from the cleaned E.164.                            |
| User has reduced-motion preference                             | Disable scroll animations and the WhatsApp button pulse.                                                         |
| User on slow connection                                        | Lazy-load all `<img>` below the fold (`loading="lazy"`).                                                         |
| User scrolls before JS loads                                   | HTML must include critical above-the-fold text inline as a no-JS fallback (see 5.4).                             |
| `localStorage` blocked (private mode)                          | Fall back to in-memory state silently.                                                                           |

### 5.4 No-JavaScript fallback

The HTML shell should include the French hero headline, the brand name, the phone number, and a WhatsApp link as static markup so the page is usable even before JS hydrates (or if it fails entirely). The hydration script replaces these.

---

## 6. HTML Shell (`index.html`)

Implements a modern, clean single-page layout. Sections in order:

1. **Fixed nav** — Glass-effect header with cream background + blur. Fixed at top, gains shadow on scroll.
    - **Brand (left):** Brand name in Felipa script font, primary burgundy color.
    - **Nav links (centre-right):** Jura 0.85rem / 500 / UPPERCASE / `letter-spacing: 0.05em`. Muted gray at rest, primary on hover with saffron underline animation.
    - **Controls (right):** Pill-style language toggle; animated hamburger for mobile.
    - **Mobile sheet:** Full-screen slide-in menu with large touch-friendly links.

2. **Hero** — Full-viewport immersive section with dark gradient overlay on background image.
    - **Content:** Centered eyebrow, two-line headline (first line in Felipa script + saffron, second in Jura), subheadline, two CTAs (primary saffron pill + outline ghost button).
    - **Features:** Three glassmorphism pills at bottom showing key selling points (icon + title).
    - **Scroll indicator:** Bouncing chevron at very bottom.

3. **Specialties** — Showcase of 6 signature dishes in a responsive grid (1/2/3 columns).
    - Cards with image, signature badge, name, description, and price.
    - Hover: lift effect with shadow.

4. **Menu** — Full menu with category filtering.
    - Section header with Felipa title.
    - Pill-style category filter tabs.
    - Two-column grid of menu items grouped by category.
    - Each item: thumbnail, name, badges, description, price, allergens.
    - Footer with rice footnote + allergen PDF link.

5. **Heritage** — Dark burgundy background section with radial gradient accents.
    - Two-column layout: text left (eyebrow, Felipa title, paragraphs, stat badge), image right with saffron border.

6. **Events** — Grid of 4 event type cards (2x2 mobile, 4x1 desktop).
    - Each card: full-bleed image with dark gradient overlay, Felipa label at bottom.

7. **Contact** — Clean section with two action cards (Phone + WhatsApp).
    - Cards with icon circles, labels, and values.
    - WhatsApp card has green-tinted background.
    - Social links, ordering note, and location hint below.

8. **Floating WhatsApp FAB** — Fixed bottom-right, pulsing animation, hidden if `settings.show_floating_whatsapp === false`.

Every dynamic node has an `id` attribute so `app.js` can hydrate content from `content.json`.

---

## 7. Accessibility (must-haves)

- All images have alt text from `content.json`.
- Colour contrast: body text on background ≥ 4.5:1; large text ≥ 3:1. The defined palette already satisfies this when used correctly (charcoal on beige, white on burgundy).
- Keyboard: nav, category filters, language toggle, and CTAs all reachable by Tab and activatable by Enter / Space.
- Focus rings: saffron gold inner glow per `DESIGN.md`.
- Skip-to-content link at the top, visually hidden until focused.
- `<html lang="fr">` updated to `en` on toggle.
- Reduced-motion: respect `prefers-reduced-motion`.
- Semantic landmarks: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`.
- All buttons that aren't navigation use `<button>`, not `<div>`.

---

## 8. SEO & Performance

- Title and meta description from `seo` block, swapped on language toggle.
- Open Graph + Twitter Card tags using `seo.og_image`.
- JSON-LD `Restaurant` schema injected from `content.json` (name, address, phone, sameAs).
- `loading="lazy"` on all below-the-fold images.
- Preconnect to Google Fonts and Material Symbols.
- A single `app.js` and a single `styles.css` — no chunk splitting.
- Aim for Lighthouse Performance ≥ 90 on mobile.

---

## 9. `EDITING.md` — Plain-French guide for the owner

Write this file as **plain, friendly French** (with an English version below). Cover, with screenshots-worth of clarity:

1. **What is `content.json`?** It's the brain of your website. Every word, photo, and price is in here.
2. **How to edit it.** Open it directly on GitHub.com → click the pencil icon → make your change → click "Commit changes". The website updates in 1–2 minutes.
3. **The golden rules.**
    - Always keep the quotes `"` around words.
    - Always keep the commas `,` at the end of lines (except the last item in a list).
    - Never delete a `{`, `}`, `[`, or `]`.
    - Use https://jsonlint.com to check before saving if unsure.
4. **Common tasks — step-by-step.**
    - Add a new dish.
    - Hide a dish without deleting it (`"is_available": false`).
    - Change the WhatsApp number.
    - Switch a feature on/off (calories, prices, allergens).
    - Update the daily special (set `"is_signature": true` on the dish you want featured).
    - Replace a photo: upload to `assets/menu/`, then change the `image` path.
    - Translate a new dish into English.
5. **Allergen and tag glossary** — table of every valid allergen and tag key with its French + English meaning.
6. **What to do if something breaks.** Revert the last commit via the GitHub UI. Show the exact 3 clicks.
7. **When to call the developer.** Anything outside `content.json`, broken layout, anything you don't recognise.

---

## 10. Build Acceptance Checklist

Before shipping, every item must pass:

- [ ] Editing `content.json` and refreshing the browser updates every section without code changes.
- [ ] Toggling `settings.show_calories`, `show_allergens`, `show_prices` from `false` → `true` → `false` works live.
- [ ] Setting `is_available: false` on a dish removes it from the menu.
- [ ] Setting `site_under_construction: true` swaps the whole page for the construction message.
- [ ] Language toggle swaps every visible string and updates `<html lang>`.
- [ ] Language choice persists across reloads (`localStorage`).
- [ ] All WhatsApp links open `wa.me/<number>` with the prefilled message URL-encoded correctly.
- [ ] All `tel:` links work on mobile.
- [ ] Floating WhatsApp button hides when `show_floating_whatsapp === false`.
- [ ] Broken image paths render a graceful placeholder, not a broken-image icon.
- [ ] Site is fully responsive at 360px, 768px, 1024px, 1440px.
- [ ] No console errors on first load.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 (mobile).
- [ ] Page loads usefully even with JavaScript disabled (no-JS hero + phone visible).
- [ ] `prefers-reduced-motion` disables non-essential animations.
- [ ] Tested in latest Chrome, Safari, Firefox, and on iOS Safari + Android Chrome.

---

## 11. Out of Scope (do NOT build)

- Online ordering / checkout
- Payment integration
- User accounts or login
- Admin dashboard or CMS (the JSON file is the CMS)
- Contact form / form submissions (WhatsApp replaces this)
- Reviews or testimonials engine
- Blog
- Multi-page routing
- Cookie banner unless analytics are added later (currently no analytics)

---

## 12. Future Considerations (note for the owner, do not build now)

- If the menu grows past ~60 items, add a search bar above the category chips.
- If the owner wants daily-changing specials, add a `"daily_special_dish_id"` field to `settings` and render a small ribbon on that card.
- If analytics are added later, use Plausible or a similar privacy-first tool — only then add a cookie notice.
- If a third language is added, the `{fr, en}` object pattern extends to `{fr, en, ar}` without breaking existing code, provided `t()` falls back gracefully.

---

## 13. Working Style for the AI Implementing This

- Refer to `DESIGN.md` for every visual decision. Do not invent colours or fonts.
- Refer to this `CLAUDE.md` for every behavioural and content-structure decision.
- **Typography:** Use Felipa for decorative script titles (section headers, brand name, hero headline first line). Use Jura for all body text, navigation, and UI elements.
- **Modern aesthetic:** Prioritize clean whitespace, subtle animations, glassmorphism effects, and smooth transitions.
- **CSS custom properties:** All design tokens (colors, fonts, spacing, shadows) are defined in `:root` in `styles.css`. Use these variables consistently.
- Write code that the owner could open and roughly read. Comments in French in `content.json` are welcome; comments in English in `app.js` are fine.
- `app.js` will realistically be 500–700 lines for a fully bilingual site with all sections and edge-case handling. This is acceptable. Focus on legibility, not line count.
- Validate `content.json` on load and log human-readable errors to the console (in English — for the developer, not the owner).
- Ship the smallest thing that satisfies the acceptance checklist. Resist scope creep.
