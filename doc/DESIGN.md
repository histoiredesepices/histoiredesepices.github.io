---
name: L'Histoire des Épices — Design System
colour_rule: 60/30/10
colors:
    # 60% — WHITE (dominant surface)
    surface: '#ffffff'
    surface-lo: '#f6f6f6'
    surface-mid: '#eeeeee'
    on-surface: '#1a1a1a'
    on-surface-variant: '#555555'
    # 30% — BURGUNDY (structural / brand colour)
    primary: '#5b0617'
    primary-hover: '#7a1f2b'
    inverse-surface: '#5b0617'
    # 10% — SAFFRON (accent / call-to-action)
    saffron: '#C9A55C'
    # Functional
    outline: '#cccccc'
    outline-variant: '#e5e5e5'
    whatsapp: '#004b3b'
    whatsapp-text: '#7cbaa5'
    error: '#ba1a1a'
    on-error: '#ffffff'
typography:
    display-lg:
        fontFamily: ebGaramond
        fontSize: 64px
        fontWeight: '500'
        lineHeight: 72px
        letterSpacing: -0.02em
    display-lg-mobile:
        fontFamily: ebGaramond
        fontSize: 40px
        fontWeight: '500'
        lineHeight: 48px
    headline-md:
        fontFamily: ebGaramond
        fontSize: 32px
        fontWeight: '500'
        lineHeight: 40px
    headline-sm:
        fontFamily: ebGaramond
        fontSize: 24px
        fontWeight: '600'
        lineHeight: 32px
    body-lg:
        fontFamily: inter
        fontSize: 18px
        fontWeight: '400'
        lineHeight: 28px
    body-md:
        fontFamily: inter
        fontSize: 16px
        fontWeight: '400'
        lineHeight: 24px
    label-md:
        fontFamily: inter
        fontSize: 14px
        fontWeight: '600'
        lineHeight: 20px
        letterSpacing: 0.05em
rounded:
    sm: 0.125rem
    DEFAULT: 0.25rem
    md: 0.375rem
    lg: 0.5rem
    xl: 0.75rem
    full: 9999px
spacing:
    base: 8px
    container-max: 1200px
    gutter: 24px
    margin-mobile: 16px
    margin-desktop: 48px
    section-gap: 80px
breakpoints:
    sm: 640px
    md: 768px
    lg: 1024px
    xl: 1280px
    '2xl': 1536px
---

> **Pair this file with `CLAUDE.md`.** `DESIGN.md` describes _how it looks_; `CLAUDE.md` describes _how it's built and edited_.

## Brand & Voice

The brand is a curator of heritage and culinary tradition. The aesthetic blends **Minimalism** with **Tactile** influences to evoke the sensory experience of Indian spices. High-quality photography of vibrant ingredients is balanced by generous whitespace, ensuring a premium, editorial feel that avoids the clutter often associated with catering services.

The emotional response should be one of **Warm Sophistication**. Organic textures and delicate decorative elements move the UI away from corporate coldness toward a hand-crafted, family-run atmosphere. The interface is a quiet vessel for the "History of Spices" — subtle transitions and refined details guide the user through a narrative-driven booking experience.

## Colour System — 60 / 30 / 10 Rule

The palette follows the interior-design **60/30/10 principle**, applied to every page view:

| Proportion       | Role               | Hex       | Where it appears                                                                                                         |
| ---------------- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| **60% White**    | Dominant surface   | `#ffffff` | Hero, Menu, Events, Contact — every main content area. Clean and airy.                                                   |
| **30% Burgundy** | Structural / brand | `#5b0617` | Sticky nav, Features strip, Heritage section, Footer. All major structural blocks.                                       |
| **10% Saffron**  | Accent / energy    | `#C9A55C` | Active chips, section dividers, nav hover underlines, hero image ring, focus rings, feature icons on dark bg, FAB pulse. |

### Full token reference

| Token           | Hex       | Role                                                                 |
| --------------- | --------- | -------------------------------------------------------------------- |
| `surface`       | `#ffffff` | Pure white page canvas                                               |
| `surf-lo`       | `#f6f6f6` | Very light neutral — Events, Contact section bands                   |
| `surf-mid`      | `#eeeeee` | Slightly deeper neutral — subtle elevation                           |
| `on-surface`    | `#1a1a1a` | Body text — near-black, not pure black                               |
| `on-muted`      | `#555555` | Muted text — descriptions, subtitles                                 |
| `primary`       | `#5b0617` | Deep burgundy — nav bg, features strip, heritage bg, footer bg, CTAs |
| `primary-hover` | `#7a1f2b` | Button hover state                                                   |
| `saffron`       | `#C9A55C` | Saffron gold — all 10% accent uses                                   |
| `outline`       | `#cccccc` | Neutral borders                                                      |
| `outline-light` | `#e5e5e5` | Subtle dividers                                                      |
| `whatsapp`      | `#004b3b` | WhatsApp button only — never used as brand colour                    |
| `error`         | `#ba1a1a` | Errors only                                                          |

**Hard rules:**

- Never use saffron as a fill on any large surface. It is an accent — 10% maximum.
- Never use the warm parchment tones (`#fff8f7`, `#fff0f0`) — they are replaced by clean neutral whites and grays.
- Never combine burgundy and WhatsApp green on the same control.
- Never introduce a new colour without adding it to this file.
- Shadows are always tinted with `primary` at low opacity — never cold grey.

### Why the change from warm beige to white?

The original palette used warm-tinted surfaces (`#fff8f7`). The 60/30/10 rule replaces these with **clinical white** for the dominant 60%, which creates maximum contrast against the deep burgundy structural elements (30%) and makes the saffron accents (10%) pop more legibly. The warmth is now carried entirely by the burgundy and gold — not the backgrounds.

## Typography

A classic pairing balances tradition and utility.

- **EB Garamond** — all expressive headings. Display sizes use medium weight (500) and a slight negative letter-spacing (`-0.02em`) for elegance. Headlines may use italic for a single phrase to evoke editorial pull-quotes.
- **Inter** — all body copy, instructional text, and labels. Uppercase labels with `letter-spacing: 0.05em` give a rhythmic, refined hierarchy without shouting.

**Pairing examples:**

- Hero headline: EB Garamond 64px / 500 — second line italic in `primary`.
- Section title: EB Garamond 32px / 500.
- Eyebrow: Inter 14px / 600 / uppercase / wide tracking, in `primary`.
- Card title: EB Garamond 24px / 600, in `primary`.
- Body: Inter 16px / 400 in `on-surface-variant`.

## Elevation & Depth

Hierarchy is built through **ambient shadows** and **tonal layers**, not heavy borders. Surfaces should feel like stacked layers of paper or linen.

- Card elevation: `box-shadow: 0 8px 24px rgba(122, 31, 43, 0.08)`. Warm, not grey.
- Focus state: a 2px inner glow in saffron, `box-shadow: inset 0 0 0 2px #C9A55C`.
- Mandala watermarks: 10–15% opacity. They feel embossed, never decorative-for-its-own-sake.
- The heritage section is the only large dark surface and uses `primary` as its background — a deliberate change of register.

## Shape Language

Soft, structured, never sharp.

- Buttons & inputs: `border-radius: 0.5rem` (lg) — replaces the prototype's overly squared default for a friendlier feel.
- Image cards: `border-radius: 0.5rem`.
- Pill chips (nav, category filters): `border-radius: 9999px`.
- Hero image and stat badges: large rounded shapes; the hero image may be a soft circle for editorial flair.
- Mandalas: the only perfectly circular elements. They earn that role.

## Components

### Buttons

| Variant    | Background           | Text                    | Border          | Use                                          |
| ---------- | -------------------- | ----------------------- | --------------- | -------------------------------------------- |
| Primary    | `primary`            | `on-primary`            | none            | The main CTA on any view.                    |
| Secondary  | transparent          | `on-surface`            | 2px `outline`   | Inline alternates. Hover → border `primary`. |
| Ghost text | transparent          | `primary`               | none, underline | "Demander un devis" links on dish cards.     |
| WhatsApp   | `tertiary-container` | `on-tertiary-container` | none            | The header pill and the floating button.     |

All buttons have a 150–200ms transition on background and border. Active state: `scale(0.97)`.

### Cards (dish)

- Background: `surface-container-lowest` (#ffffff) on the beige page; thin 1px `outline-variant` border.
- Layout: image left (128×128 desktop, 96×96 mobile, 8px radius), content right.
- Hover: lift via the warm burgundy shadow above; no transform.
- Badges sit top-right of the title row. Allergens and calories sit at the bottom as a small line of metadata, only when their respective `settings` flags are on.

### Navigation

The nav is a **30% burgundy structural element** — it signals the brand immediately on every scroll position.

| Property      | Value                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Background    | `rgba(91, 6, 23, 0.98)` + `backdrop-filter: blur(24px)` — forced via CSS ID selector, not Tailwind class |
| Height        | 72px                                                                                                     |
| Bottom accent | 1px gradient line fading from transparent → `saffron` → transparent (10% accent detail)                  |
| Border        | `1px solid rgba(201, 165, 92, 0.22)` — hairline saffron                                                  |
| Shadow        | `0 2px 40px rgba(0,0,0,0.22)` — depth against white hero                                                 |

**Brand (left):**

- A saffron `★` mark that rotates 30° on hover (micro-animation, 300ms ease)
- Brand name in _EB Garamond italic_ 1.18rem white — `<span id="nav-brand-text">` populated by `app.js`
- The mark and text are separate DOM elements so `app.js` can update text without wiping the mark

**Nav links (centre-right):**

- Font: Inter 0.66rem / 700 / UPPERCASE / `letter-spacing: 0.15em`
- Colour at rest: `rgba(255,255,255,0.52)` — clearly subordinate to the brand
- Hover: colour → `rgba(255,255,255,0.95)` + saffron `1.5px` underline **slides in from left** via `::after` pseudo-element (`width: 0 → 100%`, 280ms ease)
- No border-bottom hack — the `::after` animation is the only active indicator

**Controls (right):**

- Language toggle: ghost pill `border: 1px solid rgba(255,255,255,0.28)` / white text → saffron border + saffron text on hover
- WhatsApp pill: dark green, sits visually separate from the burgundy field
- Hamburger: `rgba(255,255,255,0.7)` icon

**Mobile sheet:**

- Background: `primary` burgundy (extends the 30% band)
- Links: UPPERCASE 0.8rem, `padding-left` slides on hover for tactile feedback
- Dividers: `rgba(255,255,255,0.08)` — barely-there separators

### Decorative dividers

- Below section titles: a **96px wide × 2px** bar in `saffron` at 70% opacity, with `border-radius: 1px`. This is a 10% saffron accent touch.
- Dish card hover: `1px solid saffron` border replaces the old shadow-only lift — reinforces the 10% accent system.
- Hero portrait ring: `3px solid saffron` — the only large saffron ring permitted.
- Nav bottom: gradient saffron hairline (see Navigation above).

### Imagery & watermarks

- Warm lighting, shallow depth of field, beige backgrounds preferred.
- Each dish photo should be roughly square. Object-fit `cover`, never `contain`.
- The hero photo may use a circular crop with a `8px` solid `surface` border ring.
- Mandalas appear behind the hero and the heritage section, anchored to the right edge, sized at 30–40% of the section width, opacity 10%.

### Forms

The site has **no contact form**. The only inputs that may exist in the future are a single search field for the menu (out of scope for v1).

## Motion

- All transitions: 150–250ms, easing `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- Page-scroll reveals: 12px upward fade-in, only on first viewport entry.
- The floating WhatsApp button has a gentle 2-second pulse (saffron-tinted ring), suppressed if `prefers-reduced-motion`.
- Hover transforms are scoped to shadows and colours — no layout shift.
- Disable all non-essential animation when `prefers-reduced-motion: reduce`.

## Responsive Behaviour

- **Mobile (≤768px):** single column. Hero stacks (text then image). Menu cards single column. Events scroll horizontally. Floating WhatsApp button remains.
- **Tablet (768–1024px):** two-column hero, two-column menu, four-up events.
- **Desktop (≥1024px):** full layout per the reference screenshot.

Test viewports: 360px, 768px, 1024px, 1440px.

## Accessibility

- Body text contrast on `background`: 13.6:1 (passes AAA).
- Primary button (`on-primary` on `primary`): 14.6:1 (passes AAA).
- Muted text (`on-surface-variant` on `background`): 9.4:1 (passes AAA).
- All interactive surfaces ≥ 44×44px touch target.
- Focus visible at all times, never `outline: none` without a replacement.

## What Not to Do

- No drop shadows in cold grey. Always tint shadows with `primary` at low opacity.
- No stock-corporate gradients. The only gradient permitted is the hero's `background → surface-container` warm wash.
- No icon families other than Material Symbols Outlined.
- No emoji as decorative elements in headlines (small inline emoji like 🌱 inside dish badges is fine).
- No purple, no neon, no electric blue. The palette is the palette.
