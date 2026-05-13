<div align="center">

# 🍛 L'Histoire des Épices

### _Authentic Indian Catering in Valenciennes, France_

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-C9A55C?style=for-the-badge)](histoiredesepices.github.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made_with-❤️-5b0617?style=for-the-badge)](https://github.com/histoiredesepices/)

---

**Built with vanilla HTML, CSS, and JavaScript**  
_No frameworks • No build step • Bilingual FR/EN • GitHub Pages ready_

</div>

## ✨ Features

- **Bilingual (FR/EN)** - Language toggle with localStorage persistence
- **PDF Menu Download** - Downloadable menu for customers
- **Menu Filtering** - Filter by category (Starters, Vegetarian, Non-Vegetarian, Sides, Desserts)
- **WhatsApp Integration** - Floating button with pre-filled message
- **Allergen Information** - Dedicated allergens page with dietary options
- **Smooth Scrolling** - GPU-accelerated animations and lazy loading
- **Responsive Design** - Mobile-first, 360px → 1440px
- **Accessible** - WCAG compliant with ARIA, focus states, skip links
- **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, JSON-LD Schema
- **Maintenance Mode** - Toggle via `content.json`

## 🛠️ Tech Stack

| Technology       | Purpose                                |
| ---------------- | -------------------------------------- |
| **HTML5**        | Semantic markup                        |
| **Tailwind CSS** | Styling via CDN (no build)             |
| **Vanilla JS**   | Single `app.js` for all functionality  |
| **content.json** | Single source of truth for all content |
| **GitHub Pages** | Free automatic deployment              |

## 📁 Project Structure

```
├── index.html           # Main HTML shell
├── content.json         # ⭐ ALL CONTENT LIVES HERE
├── assets/
│   ├── js/app.js        # Core functionality
│   ├── css/styles.css   # Design system
│   ├── allergens.html   # Allergen information page
│   ├── Menu.pdf         # Downloadable menu
│   ├── logo.png
│   ├── hero/            # Hero background images
│   ├── menu/            # Dish photos
│   ├── events/          # Event photos
│   └── heritage/        # Heritage section photos
├── scripts/
│   └── optimize_images.py  # Image optimization script
└── doc/
    ├── CLAUDE.md        # Technical brief
    └── DESIGN.md        # Design system documentation
```

## 🚀 Deploy

This site is designed for GitHub Pages:

1. Push your code to GitHub
2. Enable GitHub Pages in **Settings** → **Pages** → Set source to **GitHub Actions**
3. Your site will be live at `https://<username>.github.io/Histoire-Des-Epices/`

## 💻 Local Development

```bash
# Simple Python server
python3 -m http.server 8000
```

Then open `http://localhost:8000`

## ⚙️ Quick Customization

| What to change         | Where to modify                               |
| ---------------------- | --------------------------------------------- |
| Add a dish             | `menu.dishes` in `content.json`               |
| Change WhatsApp number | `contact.primary_action.phone_e164`           |
| Toggle prices          | `settings.show_prices: true/false`            |
| Change a photo         | Upload to `assets/menu/`, update `image` path |
| Enable maintenance     | `settings.site_under_construction: true`      |
| Update allergens       | Edit `assets/allergens.html`                  |

## 🖼️ Image Optimization

Run the included Python script to optimize images:

```bash
python3 scripts/optimize_images.py
```

This resizes and compresses images for better performance.

## 📄 License

**Code**: [MIT License](LICENSE) - Free to use, modify, and distribute

---

<div align="center">

### 🌿 _Authentic Indian cuisine, prepared with love_

**Cuisine Indienne Authentique • Traiteur à Valenciennes**

---

Made with ❤️ | [Report an Issue](https://github.com/histoiredesepices/histoiredesepices.github.io/issues)

</div>
