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
    | J | Code promo | BIENVENUE10 (or `CODE (REFUSÉ : expired)` if the code didn't pass the re-check) |
    | K | Remise (€) | 2.90 |
    | L | Total (€) | 29.10 |
    | M | Code postal | 59300 (delivery only) |
    | N | Ville | Valenciennes (delivery only) |
    | O | Langue | fr |
    | P | Source | cart / quick-order |

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
var MAX_FAILED_CODE_CHECKS = 15; // wrong promo codes per 10 minutes (all visitors) — stops guessing

var HEADERS = [
    'Reçu le', 'Référence', 'Date souhaitée', 'Heure', 'Mode', 'Commande',
    'Nb articles', 'Sous-total (€)', 'Livraison (€)', 'Code promo', 'Remise (€)', 'Total (€)',
    'Code postal', 'Ville', 'Langue', 'Source',
];
// Positions (0-based) of the promo columns in HEADERS / the row below.
var COL_PROMO_CODE = HEADERS.indexOf('Code promo');
var COL_DISCOUNT = HEADERS.indexOf('Remise (€)');

var CODES_SHEET = 'Codes';
var CODES_HEADERS = [
    'Code', 'Type (% ou €)', 'Valeur', 'Commande min (€)', 'Expire le',
    'Utilisations max', 'Utilisations', 'Actif', 'Note',
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

        // "Appliquer" in the order pop-up: check a promo code, change nothing.
        if (data.action === 'check_code') {
            return jsonResponse(checkCode_(data));
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
            '', // Code promo (filled below)
            '', // Remise (€)  (filled below)
            amount_(data.totalAmount, 100000),
            isDelivery ? postcode_(data.postcode) : '',
            isDelivery ? text_(data.city, 80) : '',
            text_(data.language, 5),
            text_(data.source, 20),
        ];

        // Serialise writes so two simultaneous orders can't collide (and a
        // limited code can't be used twice at the same moment).
        var lock = LockService.getScriptLock();
        lock.waitLock(10000);
        try {
            // Promo code: re-checked here (the browser can't be trusted), and
            // its use counted. A refused code is still noted, for your review.
            if (typeof data.discountCode === 'string' && data.discountCode) {
                var check = findCode_(data.discountCode, amount_(data.subtotal, 100000) || 0);
                if (check.valid) {
                    check.sheet.getRange(check.rowIndex, 7).setValue(check.uses + 1);
                    row[COL_PROMO_CODE] = text_(check.code, 30);
                    row[COL_DISCOUNT] = amount_(data.discountAmount, 100000);
                } else {
                    row[COL_PROMO_CODE] = text_(data.discountCode, 30) + ' (REFUSÉ : ' + check.reason + ')';
                    row[COL_DISCOUNT] = 0;
                }
            }

            var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
            if (sheet.getLastRow() === 0) {
                sheet.appendRow(HEADERS);
                sheet.setFrozenRows(1);
                sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
            } else if (
                sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join('|') !== HEADERS.join('|')
            ) {
                // Header row differs (older version / columns re-ordered): rewrite it.
                sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
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

// ── Promo codes ──────────────────────────────────────────────────────────────

// Answer for the pop-up's "Appliquer" button. Wrong codes are counted so
// nobody can try thousands of guesses.
function checkCode_(data) {
    var cache = CacheService.getScriptCache();
    var key = 'code_fail_' + Math.floor(Date.now() / 600000); // 10-minute window
    var failures = Number(cache.get(key) || '0');
    if (failures >= MAX_FAILED_CODE_CHECKS) {
        return { status: 'ok', valid: false, reason: 'rate_limited' };
    }
    var res = findCode_(data.code, amount_(data.subtotal, 100000) || 0);
    if (!res.valid) {
        cache.put(key, String(failures + 1), 660);
        return { status: 'ok', valid: false, reason: res.reason, minOrder: res.minOrder || 0 };
    }
    return {
        status: 'ok',
        valid: true,
        code: res.code,
        type: res.type,
        value: res.value,
        minOrder: res.minOrder,
    };
}

// Looks the code up in the "Codes" tab (created automatically if missing).
// Returns { valid: true, ... } or { valid: false, reason }.
function findCode_(rawCode, subtotal) {
    var code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase().slice(0, 30) : '';
    if (!code) return { valid: false, reason: 'invalid' };

    var sheet = getCodesSheet_();
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        var r = rows[i];
        if (String(r[0]).trim().toUpperCase() !== code) continue;

        var active = r[7] === true || /^(TRUE|VRAI|OUI|YES|1)$/i.test(String(r[7]).trim());
        if (!active) return { valid: false, reason: 'invalid' };

        var value = Number(r[2]);
        if (!(value > 0)) return { valid: false, reason: 'invalid' };
        var type = String(r[1]).indexOf('%') !== -1 ? 'percent' : 'fixed';
        if (type === 'percent' && value > 100) value = 100;

        if (r[4] instanceof Date) {
            var endOfDay = new Date(r[4]);
            endOfDay.setHours(23, 59, 59, 999);
            if (new Date() > endOfDay) return { valid: false, reason: 'expired' };
        }

        var maxUses = Number(r[5]) || 0; // empty = unlimited
        var uses = Number(r[6]) || 0;
        if (maxUses && uses >= maxUses) return { valid: false, reason: 'used_up' };

        var minOrder = Number(r[3]) || 0;
        if (subtotal < minOrder) return { valid: false, reason: 'min_order', minOrder: minOrder };

        return {
            valid: true,
            code: code,
            type: type,
            value: value,
            minOrder: minOrder,
            uses: uses,
            rowIndex: i + 1,
            sheet: sheet,
        };
    }
    return { valid: false, reason: 'invalid' };
}

function getCodesSheet_() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CODES_SHEET);
    if (sheet) return sheet;
    // Added as the LAST tab — orders keep going to the first tab.
    sheet = ss.insertSheet(CODES_SHEET, ss.getSheets().length);
    sheet.appendRow(CODES_HEADERS);
    sheet.appendRow(['BIENVENUE10', '%', 10, 0, '', '', 0, false, 'Exemple — cochez "Actif" pour l\'activer']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, CODES_HEADERS.length).setFontWeight('bold');
    sheet.getRange('H2:H200').insertCheckboxes();
    sheet.getRange('E2:E200').setNumberFormat('dd/mm/yyyy');
    return sheet;
}

// Run once from the editor (select "setupCodesSheet" ▸ Run) to create the tab now.
function setupCodesSheet() {
    getCodesSheet_();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

## 5. Promo codes (optional)

Promo codes live in a private **"Codes"** tab of this same spreadsheet — never
in the public GitHub repo. The site sends the code the customer types to the
script, which answers "valid / invalid"; when the order is sent, the script
checks the code **again** and counts the use.

1. Create the tab: in the Apps Script editor, choose **`setupCodesSheet`** in
   the function list at the top and click **Run** (or just wait — it is created
   automatically the first time someone tries a code). It is added as the
   **last** tab, so orders keep going to the first tab.
2. Fill one row per code:

    | Column | Meaning | Example |
    | --- | --- | --- |
    | A — Code | The code customers type (not case-sensitive) | `BIENVENUE10` |
    | B — Type | `%` for a percentage, `€` for a fixed amount | `%` |
    | C — Valeur | The discount | `10` (= 10 %) or `5` (= 5 €) |
    | D — Commande min (€) | Minimum order (food, before delivery). Empty/0 = none | `25` |
    | E — Expire le | Last valid day (included). Empty = never expires | `30/11/2026` |
    | F — Utilisations max | How many orders may use it. Empty = unlimited, `1` = single use | `50` |
    | G — Utilisations | Counted automatically — don't edit (reset to 0 to "refill" a code) | `12` |
    | H — Actif | Tick to switch the code on, untick to switch it off instantly | ☑ |
    | I — Note | Free text for you | `Instagram novembre` |

3. In `content.json`, `settings.ordering.enable_discount_codes` must be `true`
   (set it to `false` to hide the promo field completely).

**How the discount works:** it applies to the dishes (sub-total), never to the
delivery fee. The free-delivery threshold is checked on the amount **after**
the discount. The code and discount appear in the pop-up, in the WhatsApp
message, and in columns J–K of the order sheet.

**Security:** the code list is never public. Wrong guesses are limited
(`MAX_FAILED_CODE_CHECKS`, 15 per 10 minutes for all visitors combined), so
codes can't be found by trial and error — still, prefer codes that aren't
trivially guessable. Someone technical could edit the total shown in their own
browser, but the WhatsApp message carries the order reference, and the sheet
shows whether the code really passed the check (`REFUSÉ` otherwise) — check it
before confirming an order with a discount.

## 6. Test it

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
