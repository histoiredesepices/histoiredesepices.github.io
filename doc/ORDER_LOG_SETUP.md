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
2. In row 1, add these column headers:

    | A       | B                 | C                  | D        | E           | F      | G      |
    | ------- | ----------------- | ------------------ | -------- | ----------- | ------ | ------ |
    | Reçu le | Date de livraison | Heure de livraison | Commande | Montant (€) | Langue | Source |

## 2. Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code and paste the script below.
3. Replace `REPLACE_WITH_A_RANDOM_STRING` with a random string of your choice
   (treat it like a lightweight password — it just filters out noise, it is
   **not** real security since it travels in the page's JavaScript).

```js
var SHARED_SECRET = 'REPLACE_WITH_A_RANDOM_STRING';
var MAX_REQUESTS_PER_MINUTE = 20; // generous for real traffic, blocks floods

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        if (data.secret !== SHARED_SECRET) {
            return jsonResponse({ status: 'forbidden' });
        }

        if (isRateLimited_()) {
            return jsonResponse({ status: 'rate_limited' });
        }

        var deliveryDate = sanitize_(data.deliveryDate, 10);
        var deliveryTime = sanitize_(data.deliveryTime, 5);
        var itemsSummary = sanitize_(data.itemsSummary, 500);
        var language = sanitize_(data.language, 5);
        var source = sanitize_(data.source, 20);
        var totalAmount =
            typeof data.totalAmount === 'number' && isFinite(data.totalAmount)
                ? Math.max(0, Math.min(data.totalAmount, 100000))
                : '';

        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        sheet.appendRow([
            new Date(),
            deliveryDate,
            deliveryTime,
            itemsSummary,
            totalAmount,
            language,
            source,
        ]);

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

// Coerces a field to a trimmed string capped at maxLen, discarding anything
// that isn't a plain string (defends against unexpected payload shapes).
function sanitize_(value, maxLen) {
    if (typeof value !== 'string') return '';
    return value.slice(0, maxLen);
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
