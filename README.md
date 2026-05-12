# L'Histoire des Épices — Site Web

Site vitrine bilingue (FR/EN) pour **L'Histoire des Épices**, traiteur indien authentique à Valenciennes, France.

## Stack

- **HTML5** sémantique — aucun framework
- **Tailwind CSS** (CDN Play) — zéro build
- **Vanilla JavaScript** — `app.js` unique
- **`content.json`** — source unique de vérité pour tout le contenu
- **GitHub Pages** — hébergement gratuit et automatique

## Structure

```
├── index.html        ← Coque HTML (ne pas modifier pour le contenu)
├── app.js            ← Comportement : chargement, hydratation, toggles
├── styles.css        ← Système de design : couleurs, composants, animations
├── content.json      ← ⭐ L'UNIQUE FICHIER À MODIFIER POUR LE CONTENU
├── assets/
│   ├── logo.png
│   ├── favicon.ico
│   ├── og-image.jpg
│   ├── mandala.svg
│   ├── hero/         ← Photo de fond du héros
│   ├── menu/         ← Photos des plats (nommées selon content.json)
│   ├── events/       ← Photos des événements
│   └── heritage/     ← Photo pour la section histoire
├── EDITING.md        ← Guide complet pour le propriétaire (FR + EN)
└── doc/
    ├── CLAUDE.md     ← Brief de construction technique
    └── DESIGN.md     ← Système de design (couleurs, typo, composants)
```

## Pour le propriétaire

Tout le contenu (menu, tarifs, coordonnées, photos, textes) se modifie **uniquement dans `content.json`**.  
Consultez le fichier **`EDITING.md`** pour un guide pas à pas en français et en anglais.

## Déploiement

Poussez sur la branche `main` → GitHub Pages déploie automatiquement.

## Fonctionnalités

- Bilingue FR/EN avec mémorisation du choix (localStorage)
- Filtre de menu par catégorie (Entrées, Végétarien, Non-Végétarien, Accompagnements, Desserts)
- Bouton WhatsApp flottant avec message pré-rempli
- Navigation sticky avec scroll fluide
- Images manquantes remplacées par un placeholder élégant
- Mode maintenance via `site_under_construction: true` dans content.json
- Affichage conditionnel des prix, allergènes et calories via des flags
- Responsive : 360px → 1440px
- Accessibilité : ARIA, focus visible, skip link, prefers-reduced-motion
- SEO : meta tags, Open Graph, Twitter Card, JSON-LD Schema

## Personnalisation rapide

| Ce que vous voulez changer | Où modifier                         |
|---------------------------|--------------------------------------|
| Ajouter un plat           | `menu.dishes` dans `content.json`    |
| Changer le numéro WhatsApp| `contact.primary_action.phone_e164`  |
| Activer les prix          | `settings.show_prices: true`         |
| Changer une photo         | Upload dans `assets/menu/`, puis mettre à jour `image` dans le plat |
| Passer en maintenance     | `settings.site_under_construction: true` |
