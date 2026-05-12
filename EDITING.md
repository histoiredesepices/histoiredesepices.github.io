# Guide d'édition du site — L'Histoire des Épices
# Site Editing Guide — L'Histoire des Épices

---

## 🇫🇷 GUIDE EN FRANÇAIS

### C'est quoi `content.json` ?

C'est **le cerveau de votre site**. Tout le contenu visible — les plats, les descriptions, les coordonnées, les prix — se trouve dans ce fichier. Le site se met à jour automatiquement quand vous le modifiez. **Vous ne devez jamais toucher aux autres fichiers** (`index.html`, `app.js`, `styles.css`).

---

### Comment modifier `content.json` sur GitHub

1. Allez sur votre dépôt GitHub dans un navigateur.
2. Cliquez sur le fichier `content.json`.
3. Cliquez sur l'icône **crayon** ✏️ en haut à droite.
4. Faites vos modifications.
5. En bas de la page, cliquez sur **"Commit changes"**.
6. Le site se met à jour en **1 à 2 minutes**.

> ✅ Si vous n'êtes pas sûr de vos modifications, vérifiez le JSON sur **https://jsonlint.com** avant d'enregistrer.

---

### ⚠️ Les règles d'or

1. **Gardez toujours les guillemets** `"` autour des mots.
2. **Gardez toujours les virgules** `,` à la fin des lignes (sauf la dernière ligne d'un bloc).
3. **Ne supprimez jamais** les accolades `{` `}` ni les crochets `[` `]`.
4. Chaque plat a un champ `fr` (français) et un champ `en` (anglais) — modifiez les deux.

---

### Tâches courantes

#### Ajouter un nouveau plat

Trouvez la liste `"dishes": [...]` dans la section `"menu"`. Copiez un plat existant et ajoutez-le à la fin de la liste (avant le `]` final). Changez l'`"id"` pour quelque chose d'unique (en minuscules, sans espaces, ex : `"mon-nouveau-plat"`).

```json
{
  "id": "mon-nouveau-plat",
  "category": "vegetarian",
  "name": { "fr": "Mon Nouveau Plat", "en": "My New Dish" },
  "description": {
    "fr": "Description en français.",
    "en": "Description in English."
  },
  "image": "assets/menu/mon-nouveau-plat.jpg",
  "image_alt": { "fr": "Photo du plat", "en": "Dish photo" },
  "tags": ["vegetarian"],
  "is_signature": false,
  "is_new": true,
  "is_spicy": false,
  "is_available": true,
  "price_eur": null,
  "calories_kcal": null,
  "allergens": [],
  "spice_level": 1
}
```

#### Cacher un plat (sans le supprimer)

Trouvez le plat et changez `"is_available": true` en `"is_available": false`. Le plat disparaît du site mais reste dans le fichier, prêt à être réactivé.

#### Mettre en avant un plat signature

Sur le plat de votre choix, changez `"is_signature": false` en `"is_signature": true`. Un badge doré "Signature" apparaîtra sur la carte.

#### Changer le numéro WhatsApp

Dans la section `"contact"`, trouvez `"phone_e164"` et remplacez le numéro. Utilisez le format international (ex : `"+33612345678"`).

#### Activer/désactiver les prix

Dans la section `"settings"`, changez `"show_prices": false` en `"show_prices": true`. Les prix s'affichent si le champ `"price_eur"` du plat contient un nombre.

#### Activer/désactiver les allergènes

Dans `"settings"`, changez `"show_allergens": false` en `"show_allergens": true`.

#### Remplacer une photo de plat

1. Uploadez votre photo dans le dossier `assets/menu/` sur GitHub.
2. Nommez-la exactement comme indiqué dans le champ `"image"` du plat.
   - Exemple : si le champ est `"assets/menu/butter-chicken.jpg"`, uploadez le fichier avec le nom `butter-chicken.jpg`.

#### Mettre le site en maintenance

Dans `"settings"`, changez `"site_under_construction": false` en `"site_under_construction": true`. Le site affichera uniquement votre message de maintenance et le numéro de téléphone.

---

### Catégories valides

| Valeur (`category`)  | Affiché en français | Affiché en anglais |
|----------------------|---------------------|--------------------|
| `entrees`            | Entrées             | Starters           |
| `vegetarian`         | Végétarien          | Vegetarian         |
| `non_vegetarian`     | Non-Végétarien      | Non-Vegetarian     |
| `sides`              | Accompagnements     | Sides              |
| `desserts`           | Desserts            | Desserts           |

---

### Tags valides (champ `tags`)

| Tag            | Signification                       |
|----------------|-------------------------------------|
| `vegetarian`   | Affiche l'icône 🌱                  |
| `vegan`        | Affiche l'icône 🌱                  |
| `halal`        | Affiche un badge "H"                |
| `dairy_free`   | Sans produits laitiers              |
| `gluten_free`  | Sans gluten                         |

---

### Allergènes valides (champ `allergens`)

| Clé        | Français         | English     |
|------------|------------------|-------------|
| `dairy`    | Lait             | Dairy       |
| `gluten`   | Gluten           | Gluten      |
| `nuts`     | Fruits à coque   | Nuts        |
| `peanuts`  | Arachides        | Peanuts     |
| `eggs`     | Œufs             | Eggs        |
| `soy`      | Soja             | Soy         |
| `sesame`   | Sésame           | Sesame      |
| `mustard`  | Moutarde         | Mustard     |
| `shellfish`| Crustacés        | Shellfish   |
| `fish`     | Poisson          | Fish        |
| `sulphites`| Sulfites         | Sulphites   |

---

### Que faire si quelque chose se casse ?

1. Sur GitHub, allez dans l'**historique des commits** (onglet "Commits").
2. Trouvez le dernier commit qui fonctionnait.
3. Cliquez sur **"Revert"** (ou contactez votre développeur).

### Quand appeler le développeur ?

- Si la mise en page est cassée (problème dans `index.html`, `app.js`, ou `styles.css`)
- Si vous voulez ajouter une nouvelle section ou fonctionnalité
- Si quelque chose que vous ne reconnaissez pas est apparu

---
---

## 🇬🇧 GUIDE IN ENGLISH

### What is `content.json`?

It is the **brain of your website**. All visible content — dishes, descriptions, contact details, prices — lives in this one file. The site updates automatically when you edit it. **Never touch the other files** (`index.html`, `app.js`, `styles.css`).

---

### How to edit `content.json` on GitHub

1. Open your GitHub repository in a browser.
2. Click on the `content.json` file.
3. Click the **pencil icon** ✏️ in the top-right corner.
4. Make your changes.
5. At the bottom, click **"Commit changes"**.
6. The site updates in **1–2 minutes**.

> ✅ If you are unsure about your changes, validate the JSON at **https://jsonlint.com** before saving.

---

### ⚠️ The golden rules

1. **Always keep the quotes** `"` around text.
2. **Always keep the commas** `,` at the end of lines (except the last item in a block).
3. **Never delete** curly braces `{` `}` or square brackets `[` `]`.
4. Every dish has a `fr` (French) and `en` (English) field — update both.

---

### Common tasks

#### Add a new dish

Find the `"dishes": [...]` list inside the `"menu"` section. Copy an existing dish and paste it at the end (before the closing `]`). Change the `"id"` to something unique (lowercase, no spaces, e.g. `"my-new-dish"`).

#### Hide a dish without deleting it

Find the dish and change `"is_available": true` to `"is_available": false`. The dish disappears from the site but stays in the file.

#### Feature a signature dish

On the dish of your choice, change `"is_signature": false` to `"is_signature": true`. A gold "Signature" badge appears on the card.

#### Change the WhatsApp number

In the `"contact"` section, find `"phone_e164"` and replace the number. Use international format (e.g. `"+33612345678"`).

#### Enable/disable prices

In `"settings"`, change `"show_prices": false` to `"show_prices": true`. Prices display if the dish has a number in `"price_eur"`.

#### Enable/disable allergens

In `"settings"`, change `"show_allergens": false` to `"show_allergens": true`.

#### Replace a dish photo

1. Upload your photo to the `assets/menu/` folder on GitHub.
2. Name it exactly as shown in the dish `"image"` field.

#### Put the site in maintenance mode

In `"settings"`, change `"site_under_construction": false` to `"site_under_construction": true`.

---

### What to do if something breaks?

1. On GitHub, go to the **Commits** history.
2. Find the last working commit.
3. Click **"Revert"**, or contact your developer.

### When to call the developer?

- If the layout is broken (issue in `index.html`, `app.js`, or `styles.css`)
- If you want to add a new section or feature
- If you see something you don't recognise
