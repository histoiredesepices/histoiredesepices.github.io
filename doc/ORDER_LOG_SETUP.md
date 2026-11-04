# Order Log Setup — Google Sheets Webhook

The site is hosted on GitHub Pages (static files only — no backend, no database).
To still get a simple **report of every order placed** (items, amount, delivery
date/time), the site can optionally send a copy of each order to a Google Sheet
you own, using a free Google Apps Script "Web App" as the receiving endpoint.

This is **best-effort and non-blocking**: if the webhook is unreachable or not
configured, the WhatsApp ordering flow still works exactly as before — nothing
is ever lost or delayed because of this feature.

> This is optional. If you leave `settings.order_log.m4Rx` (the webhook URL) empty in
> `content.json`, this feature does nothing.

---

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank
   spreadsheet, e.g. named **"L'Histoire des Épices — Commandes"**.
2. Leave it empty — the script writes the header row itself on the first
   order. The columns are:

    | Column | Header | Example |
    | --- | --- | --- |
    | A | Reçu le | 23/10/2026 16:27 |
    | B | Référence | HDE-261023-K7Q2 (also shown in the customer's WhatsApp message) |
    | C | Date souhaitée | 2026-10-24 |
    | D | Heure | 12:00 |
    | E | Mode | À emporter / Livraison |
    | F | Commande | 2x Butter Chicken, 1x Naan Maison |
    | G | Nb articles | 3 |
    | H | Sous-total (€) | 29.00 |
    | I | Livraison (€) | 3.00 (0 if free or collection) |
    | J | Total (€) | 32.00 |
    | K | Code postal | 59300 (delivery only) |
    | L | Ville | Valenciennes (delivery only) |
    | M | Langue | fr |
    | N | Source | cart / quick-order |

   **No name, phone number or street address is ever sent to the sheet** —
   those only travel in the customer's own WhatsApp message (this is what
   the privacy policy promises). Match a row to its conversation with the
   reference in column B.

> **Upgrading from the first version?** The old sheet had 7 columns. Either
> start a new tab (rename the old one, e.g. "Anciennes commandes", then add
> an empty tab — the script writes to the **first** tab), or clear row 1 of
> your current tab and let the script write the new headers.

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code and paste the script below.
3. Replace `REPLACE_WITH_A_RANDOM_STRING` with a random string of your choice
   (treat it like a lightweight password — it just filters out noise, it is
   **not** real security since it travels in the page's JavaScript). It must
   match `settings.order_log.k7Qz` in `content.json`.

```js
var SHARED_SECRET = 'REPLACE_WITH_A_RANDOM_STRING';
var MAX_REQUESTS_PER_MINUTE = 20; // generous for real traffic, blocks floods

var HEADERS = [
    'Reçu le', 'Référence', 'Date souhaitée', 'Heure', 'Mode', 'Commande',
    'Nb articles', 'Sous-total (€)', 'Livraison (€)', 'Total (€)',
    'Code postal', 'Ville', 'Langue', 'Source',
];

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        if (data.secret !== SHARED_SECRET) {
            return jsonResponse({ status: 'forbidden' });
        }

        if (isRateLimited_()) {
            return jsonResponse({ status: 'rate_limited' });
        }

        var isDelivery = data.fulfillment === 'delivery';
        var row = [
            new Date(),
            text_(data.orderRef, 20),
            text_(data.deliveryDate, 10),
            text_(data.deliveryTime, 5),
            isDelivery ? 'Livraison' : 'À emporter',
            text_(data.itemsSummary, 500),
            amount_(data.itemCount, 1000),
            amount_(data.subtotal, 100000),
            amount_(data.deliveryFee, 1000),
            amount_(data.totalAmount, 100000),
            isDelivery ? postcode_(data.postcode) : '',
            isDelivery ? text_(data.city, 80) : '',
            text_(data.language, 5),
            text_(data.source, 20),
        ];

        // Serialise writes so two simultaneous orders can't collide.
        var lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
            var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(HEADERS);
                sheet.setFrozenRows(1);
                sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
            }
            sheet.appendRow(row);
        } finally {
            lock.releaseLock();
        }

        return jsonResponse({ status: 'ok' });
    } catch (err) {
        return jsonResponse({ status: 'error', message: String(err) });
    }
}

// Basic flood protection: counts requests in the current minute using the
// script's shared cache. This won't stop a determined attacker, but it
// blunts simple scripted spam even if the URL/secret ever leak.
function isRateLimited_() {
    var cache = CacheService.getScriptCache();
    var key = 'order_log_count_' + Math.floor(Date.now() / 60000);
    var count = Number(cache.get(key) || '0') + 1;
    cache.put(key, String(count), 70); // expire a little after the minute window
    return count > MAX_REQUESTS_PER_MINUTE;
}

// Plain string capped at maxLen. Anything that isn't a string becomes ''.
// A leading = + - @ is neutralised so a crafted value can never be run as a
// spreadsheet formula ("formula injection").
function text_(value, maxLen) {
    if (typeof value !== 'string') return '';
    var s = value.slice(0, maxLen);
    return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// Finite number between 0 and max (rounded to cents), or '' if missing/invalid.
function amount_(value, max) {
    if (typeof value !== 'number' || !isFinite(value)) return '';
    return Math.round(Math.max(0, Math.min(value, max)) * 100) / 100;
}

// French postcode: exactly 5 digits, kept as text so leading zeros survive.
function postcode_(value) {
    return typeof value === 'string' && /^\d{5}$/.test(value) ? "'" + value : '';
}

function jsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
        ContentService.MimeType.JSON,
    );
}
```

4. Save the project (e.g. name it "Order Log").

## 3. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Configure:
    - **Execute as:** Me (your Google account)
    - **Who has access:** Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions
   (this is your own script accessing your own sheet).
5. Copy the **Web app URL** shown (looks like
   `https://script.google.com/macros/s/XXXXXXXX/exec`).

## 4. Wire it up in `content.json`

In `settings.order_log`, paste the values from steps above:

```json
"order_log": {
    "m4Rx": "https://script.google.com/macros/s/XXXXXXXX/exec",
    "k7Qz": "REPLACE_WITH_A_RANDOM_STRING"
}
```

## 5. Test it

1. Open the live site, add a dish to the cart, and send an order on WhatsApp
   (pick any delivery date/time).
2. Check the Google Sheet — a new row should appear within a few seconds.
3. If nothing appears, open the browser console for errors, and double-check
   the webhook URL and secret match exactly what's in the Apps Script.

## Security model — what is and isn't protected

`content.json` is fetched by every visitor's browser, so **the webhook URL and
shared secret (`k7Qz`) are public** — anyone can view them via browser dev tools or
by browsing the GitHub repo directly. This is unavoidable for any purely
static site (no backend = nowhere to hide a credential). Given that:

- **What an attacker _could_ do:** send fake POST requests straight to the
  webhook URL (skipping the website entirely), adding junk rows to your
  Google Sheet — fake order text, fake amounts, spam content.
- **What an attacker _cannot_ do:** access your Gmail, Drive, or anything
  else in your Google account; read, delete, or modify any other data;
  access other spreadsheets; or affect the GitHub repo or site itself. The
  Apps Script's `doPost` function can only do exactly what's written in it
  (append a sanitized row to this one sheet) — nothing more.
- **The shared secret (`k7Qz`) is a noise filter, not authentication.** It stops
  bots/scanners that hit the URL blindly without knowing the expected
  payload shape. It will not stop someone who deliberately reads
  `content.json` and copies the value.
- **The rate limit (`MAX_REQUESTS_PER_MINUTE`) and field sanitization** in
  the script above are real, server-side defenses: even with the URL and
  secret in hand, an attacker is capped at a small number of rows per
  minute, and every field is length-capped and type-checked before being
  written — so the worst case is a handful of short, harmless junk rows,
  not an unbounded flood.
- **Best-effort only.** If a customer has no internet momentarily, or blocks
  the request, the order still goes through on WhatsApp as normal; it just
  won't appear as a row in the sheet.
- **If the sheet still gets spammed**, generate a new random
  secret, update both the Apps Script constant and `content.json` (`k7Qz`),
  and redeploy (**Deploy → Manage deployments → Edit → New version**) — this
  immediately invalidates the leaked one.
- You can re-order or rename the sheet's columns freely — just make sure the
  `sheet.appendRow([...])` order in the script matches your header row.

**Bottom line:** treat this sheet as a convenience report, not a secure
system of record. If you ever need to store something genuinely sensitive,
it would require a real authenticated backend, which is out of scope for a
GitHub Pages–only site.
