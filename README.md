<div align="center">

# 🍛 L'Histoire des Épices

### _Authentic Indian Catering in Valenciennes, France_

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-Visit-C9A55C?style=for-the-badge)](https://histoiredesepices.github.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made_with-❤️-5b0617?style=for-the-badge)](https://github.com/histoiredesepices/)

---

**Built with vanilla HTML, CSS, and JavaScript**  
_No frameworks • No build step • Bilingual FR/EN • GitHub Pages ready_

</div>

## ✨ Features

### Ordering

- **Cart & WhatsApp orders**: customers add dishes to a cart, then send one neatly formatted WhatsApp message (dishes, order cost, date/time, delivery address, order reference).
- **Date & time scheduling**: a pop-up asks for the desired date and a 15-minute time slot. It enforces a same-day cutoff hour, a minimum preparation lead time and an opening window (e.g. 12:00–21:00), all configurable.
- **Collection or delivery**: defaults to collection. Delivery opens a French-format address form (name, phone, street, complement, 5-digit postcode, town) with validation, and can remember the details on the customer's device.
- **Delivery fee**: a configurable fee (e.g. 3 €) applies below a free-delivery threshold (e.g. 35 €). It's shown live in the pop-up and in the WhatsApp message.
- **Order log (optional)**: every order is also appended as a row to a private Google Sheet via a free Apps Script webhook. The row holds no name, phone or street. See [`doc/ORDER_LOG_SETUP.md`](doc/ORDER_LOG_SETUP.md).

### Menu & content

- **Live PDF menu**: "Download menu" builds an A4 PDF from `menu.json` on the fly, in the visitor's language, so it never goes out of date. It includes QR codes for the website, Facebook and Instagram.
- **Menu filtering**: by category (Starters, Vegetarian, Non-Vegetarian, Biryani, Sides, Desserts, Meal combos).
- **Allergen page**: generated from each dish's `allergens` field, with an "I'm allergic to…" filter.
- **Events & free quote**: event cards with photo galleries, plus a "Request a quote" WhatsApp banner with a detailed pre-filled message.
- **Bilingual (FR/EN)**: language toggle, remembered on the device.
- **Dark / light mode**: a sun/moon toggle in the header. The default is set in `content.json`, and the visitor's choice is remembered.

### Privacy, quality & SEO

- **GDPR**: an information banner and a full privacy policy page. No cookies, no analytics, no trackers.
- **Responsive**: mobile-first, from 360px to 1440px.
- **Accessible**: ARIA labels, focus states, skip links, reduced-motion support.
- **SEO**: meta tags, Open Graph, Twitter Cards, JSON-LD, sitemap.
- **Maintenance mode**: switched on and off in `content.json`.

## 🛠️ Tech Stack

| Technology                        | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| **HTML5**                         | Semantic markup                                               |
| **Tailwind CSS**                  | Styling via CDN (no build) + `assets/css/styles.css`          |
| **Vanilla JS**                    | Plain `<script>` modules, no bundler                          |
| **content.json + menu.json**      | All content: copy, settings, translations, dishes             |
| **html2pdf.js, qrcode-generator** | PDF menu & QR codes. Pinned + SRI, lazy-loaded on first click |
| **Google Apps Script**            | Optional order-log webhook into Google Sheets                 |
| **GitHub Pages**                  | Free hosting, auto-deployed by GitHub Actions                 |

## 📁 Project Structure

```
├── index.html             # Main page shell
├── allergens.html         # Allergen page (generated from menu.json)
├── privacy.html           # Privacy policy (generated from content.json)
├── gallery.html           # Event photo galleries
├── content.json           # ⭐ All copy, settings & translations
├── menu.json              # ⭐ Menu dishes & categories
├── sitemap.xml, robots.txt
├── assets/
│   ├── js/
│   │   ├── state.js       # Shared mutable state
│   │   ├── utils.js       # Helpers, loadContent() (merges menu.json)
│   │   ├── seo.js         # Meta tags & JSON-LD
│   │   ├── menu.js        # Menu cards & category filter
│   │   ├── menu-pdf.js    # Live A4 PDF menu with QR codes
│   │   ├── render.js      # Section renderers & orchestrator
│   │   ├── modal.js       # Dish detail pop-up
│   │   ├── cart.js        # Cart, scheduling, delivery, WhatsApp order, order log
│   │   ├── events.js      # Nav, scroll & language listeners
│   │   ├── privacy.js     # GDPR banner + privacy page
│   │   ├── theme.js       # Light / dark mode toggle
│   │   ├── allergens.js   # Allergen page
│   │   ├── gallery.js     # Gallery page
│   │   └── boot.js        # Home page entry point
│   ├── css/styles.css     # Design system
│   ├── logo.png, favicon.ico, mandala.svg
│   ├── hero/ menu/ events/ heritage/ gallery/ news/   # Images
├── scripts/
│   └── optimize_images.py # Image optimisation
├── .github/workflows/deploy.yml   # GitHub Pages deployment
└── doc/
    ├── EDITING.md         # Owner's guide (FR/EN): how to edit content
    ├── ORDER_LOG_SETUP.md # Google Sheets order log + Apps Script
    ├── CLAUDE.md          # Technical brief
    └── DESIGN.md          # Design system
```

## 🚀 Deploy

The site deploys automatically with GitHub Actions (`.github/workflows/deploy.yml`):

1. Push to the `main` branch.
2. In the repo, go to **Settings → Pages** and set **Source = GitHub Actions** (one-time setup).
3. The site is live at **https://histoiredesepices.github.io/** within a minute or two.

## 💻 Local Development

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. You need a local server, because the pages load `content.json` and `menu.json` with `fetch()`, which doesn't work from `file://`. After editing JS or CSS, hard-refresh with **Cmd/Ctrl + Shift + R**.

## ⚙️ Quick Customization

Full owner guide in French and English: **[`doc/EDITING.md`](doc/EDITING.md)**.

| What to change                         | Where                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Add / edit / hide a dish               | `menu.json` → `dishes` (`"is_available": false` hides it)                                                                |
| Dish allergens                         | `menu.json` → each dish's `"allergens": ["dairy", "gluten"]`                                                             |
| Prices / allergens on or off           | `content.json` → `settings.show_prices`, `settings.show_allergens`                                                       |
| WhatsApp & phone numbers               | `content.json` → `settings.contact_info`, `contact.primary_action`                                                       |
| Same-day cutoff, lead time, hours      | `content.json` → `settings.ordering` (`same_day_cutoff_hour`, `same_day_cutoff_window`, `earliest/latest_delivery_time`) |
| Delivery fee & free-delivery threshold | `content.json` → `settings.ordering.delivery_fee_eur`, `free_delivery_threshold_eur`                                     |
| WhatsApp message wording               | `content.json` → `ui_strings.ordering.whatsapp_message`                                                                  |
| PDF menu text                          | `content.json` → `menu.download_button.pdf`                                                                              |
| Website & social links (PDF QR codes)  | `content.json` → `contact.website_url`, `contact.socials`                                                                |
| Privacy policy & banner                | `content.json` → `privacy` (bump `version` to re-show the banner)                                                        |
| Order log webhook                      | `content.json` → `settings.order_log` (see `doc/ORDER_LOG_SETUP.md`)                                                     |
| Change a photo                         | Upload to `assets/menu/`, update the dish's `image` path                                                                 |
| Default theme (dark / light)           | `content.json` → `settings.default_theme: "dark"` or `"light"`                                                           |
| Maintenance mode                       | `content.json` → `settings.site_under_construction: true`                                                                |

## 🔒 Privacy

- **Nothing tracked:** the site sets **no cookies** and uses no analytics or advertising.
- **Device storage:** the language, cart and (if the customer opts in) delivery details are kept only in the browser's `localStorage`.
- **Customer details:** name, phone and address reach the business only inside the WhatsApp message the customer chooses to send.
- **The order sheet:** it receives order details and postcode/town only.
- **Full policy:** [`privacy.html`](https://histoiredesepices.github.io/privacy.html).

## 🖼️ Image Optimization

```bash
python3 scripts/optimize_images.py
```

This resizes and compresses images in `assets/` for faster loading. It installs Pillow if needed.

## 📄 License

**Code**: [MIT License](LICENSE). Free to use, modify, and distribute.

---

<div align="center">

### 🌿 _Authentic Indian cuisine, prepared with love_

**Cuisine Indienne Authentique • Traiteur à Valenciennes**

---

Made with ❤️ | [Report an Issue](https://github.com/histoiredesepices/histoiredesepices.github.io/issues)

</div>
