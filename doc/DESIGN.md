---
name: L'Histoire des Épices — Design System (Modern Redesign)
style: Clean Modern with Elegant Typography
colors:
    # Primary palette
    primary: '#5b0617'
    primary-hover: '#7a1f2b'
    primary-light: '#8a2a3d'
    saffron: '#c9a55c'
    saffron-light: '#e0c88a'
    saffron-dark: '#a88940'
    # Surfaces
    cream: '#faf8f5'
    surface: '#ffffff'
    light-gray: '#f0ede8'
    # Text
    dark: '#1a1a1a'
    muted: '#6b6b6b'
    # Functional
    border: 'rgba(91, 6, 23, 0.1)'
    whatsapp: '#25d366'
    whatsapp-dark: '#128c7e'
typography:
    script:
        fontFamily: Felipa
        usage: Decorative titles, brand name, section headers, hero headline
    body:
        fontFamily: Jura
        weights: 300-700
        usage: All body text, navigation, buttons, labels
    display-lg:
        fontFamily: Felipa
        fontSize: 5rem (mobile) / 8rem (desktop)
        usage: Hero headline first line
    section-title:
        fontFamily: Felipa
        fontSize: 2.5rem (mobile) / 3.5rem (desktop)
        usage: Section headers
    body-md:
        fontFamily: Jura
        fontSize: 1rem
        fontWeight: 400
        lineHeight: 1.6
    label:
        fontFamily: Jura
        fontSize: 0.75rem
        fontWeight: 600
        letterSpacing: 0.2em
        textTransform: uppercase
rounded:
    sm: 0.5rem
    md: 1rem
    lg: 1.5rem
    full: 9999px
spacing:
    container-max: 1200px
    section-py: 6rem (desktop) / 4rem (mobile)
    gutter: 1.5rem (mobile) / 2rem (desktop)
shadows:
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)'
    md: '0 4px 20px rgba(0, 0, 0, 0.08)'
    lg: '0 8px 40px rgba(0, 0, 0, 0.12)'
    glow: '0 0 40px rgba(201, 165, 92, 0.3)'
transitions:
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)'
    ease-bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
breakpoints:
    sm: 640px
    md: 768px
    lg: 1024px
    xl: 1280px
---

> **Pair this file with `CLAUDE.md`.** `DESIGN.md` describes _how it looks_; `CLAUDE.md` describes _how it's built and edited_.

## Brand & Voice

The brand is a curator of heritage and culinary tradition. The aesthetic is **Clean Modern** with elegant script typography that evokes sophistication and warmth. High-quality photography with dark overlays creates an immersive, premium feel.

The emotional response should be one of **Modern Elegance**. The Felipa script font adds a personal, handcrafted touch while Jura provides clean, readable body text. Generous whitespace, subtle animations, and glassmorphism effects create a contemporary experience that feels both luxurious and approachable.

## Colour System

The palette uses a warm cream base with burgundy and saffron accents for a sophisticated, inviting feel.

### Full token reference

| Token           | Hex                    | Role                                              |
| --------------- | ---------------------- | ------------------------------------------------- |
| `cream`         | `#faf8f5`              | Warm off-white background — main page canvas      |
| `surface`       | `#ffffff`              | Pure white — cards, elevated surfaces             |
| `light-gray`    | `#f0ede8`              | Subtle backgrounds, placeholders                  |
| `dark`          | `#1a1a1a`              | Primary text color                                |
| `muted`         | `#6b6b6b`              | Secondary text, descriptions                      |
| `primary`       | `#5b0617`              | Deep burgundy — heritage section, text accents    |
| `primary-hover` | `#7a1f2b`              | Button hover state                                |
| `primary-light` | `#8a2a3d`              | Lighter burgundy for gradients                    |
| `saffron`       | `#c9a55c`              | Gold accent — CTAs, badges, highlights, hero text |
| `saffron-light` | `#e0c88a`              | Lighter gold for hover states                     |
| `saffron-dark`  | `#a88940`              | Darker gold for active states                     |
| `border`        | `rgba(91, 6, 23, 0.1)` | Subtle borders with burgundy tint                 |
| `whatsapp`      | `#25d366`              | WhatsApp brand green                              |

**Design principles:**

- **Cream background** (`#faf8f5`) provides warmth without being distracting
- **Saffron** is the primary CTA color — used for buttons, badges, and highlights
- **Burgundy** is reserved for the Heritage section background and text accents
- **Glassmorphism** effects use `rgba(255,255,255,0.1)` with `backdrop-filter: blur()`
- Shadows use neutral black at low opacity, not tinted

## Typography

A modern pairing of elegant script and clean sans-serif.

- **Felipa** — Decorative script font for expressive titles. Used sparingly for brand name, section headers, and hero headline to create visual hierarchy and elegance.
- **Jura** — Clean, geometric sans-serif for all body text, navigation, buttons, and UI elements. Variable weight (300-700) provides flexibility.

**Usage examples:**

- **Hero headline (line 1):** Felipa, 5rem mobile / 8rem desktop, saffron color
- **Hero headline (line 2):** Jura 300, 2rem mobile / 4rem desktop, white
- **Section titles:** Felipa, 2.5rem mobile / 3.5rem desktop, primary color
- **Eyebrow labels:** Jura 600, 0.75rem, uppercase, letter-spacing 0.2em, saffron-dark
- **Navigation:** Jura 500, 0.85rem, uppercase, letter-spacing 0.05em
- **Body text:** Jura 400, 1rem, line-height 1.6
- **Card titles:** Jura 600, 1.1rem
- **Buttons:** Jura 600, 0.875rem, uppercase, letter-spacing 0.05em

## Elevation & Depth

Hierarchy is built through **subtle shadows** and **hover transforms**. Cards lift on hover to indicate interactivity.

- **Card rest:** `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06)` — barely visible
- **Card hover:** `box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12)` + `transform: translateY(-8px)`
- **Focus state:** 2px saffron outline with 3px offset
- **Glassmorphism:** `background: rgba(255, 255, 255, 0.1)` + `backdrop-filter: blur(10px)` for hero features
- The heritage section uses `primary` burgundy as background with radial gradient accents

## Shape Language

Rounded, modern, approachable.

- **Buttons:** `border-radius: 9999px` (full pill shape)
- **Cards:** `border-radius: 1rem` to `1.5rem`
- **Menu items:** `border-radius: 0.5rem` to `1rem`
- **Images:** `border-radius: 0.5rem` to `1.5rem` depending on context
- **Badges:** `border-radius: 9999px` (pill shape)

## Components

### Buttons

| Variant   | Background  | Text      | Border                      | Use                                    |
| --------- | ----------- | --------- | --------------------------- | -------------------------------------- |
| Primary   | `saffron`   | `dark`    | none                        | Main CTAs — "Voir la Carte", "Order"   |
| Outline   | transparent | white     | 2px `rgba(255,255,255,0.4)` | Secondary CTAs on dark backgrounds     |
| Secondary | transparent | `primary` | 2px `border`                | Inline alternates on light backgrounds |
| WhatsApp  | `#25d366`   | white     | none                        | Floating FAB and contact card          |

All buttons: `border-radius: 9999px`, 300ms transitions, hover lift effect.

### Cards

**Specialty Cards:**

- White background, `border-radius: 1.5rem`
- Image with 4:3 aspect ratio, signature badge overlay
- Hover: `translateY(-8px)` + larger shadow

**Menu Items:**

- Cream background (`#faf8f5`), `border-radius: 0.5rem` to `1rem`
- Thumbnail 80×80px left, content right
- Hover: saffron border appears

**Event Cards:**

- Full-bleed image with dark gradient overlay
- Felipa label at bottom
- Hover: image scales 1.08×

### Navigation

Fixed header with glass effect.

| Property   | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| Background | `rgba(250, 248, 245, 0.95)` + `backdrop-filter: blur(20px)` |
| Height     | 72px                                                        |
| Border     | `1px solid rgba(91, 6, 23, 0.1)` — subtle bottom border     |
| On scroll  | Gains `box-shadow` for depth                                |

**Brand:** Felipa script, primary burgundy color

**Nav links:** Jura uppercase, muted gray → primary on hover, saffron underline animation via `::after`

**Language toggle:** Pill with subtle border, hover shows saffron border

**Hamburger:** Three-line animated icon, transforms to X when active

**Mobile menu:** Full-screen slide-in from right, large touch-friendly links

### Hero Section

Full-viewport immersive hero with:

- Dark gradient overlay on background image
- Centered content with staggered fade-up animations
- Glassmorphism feature pills at bottom
- Bouncing scroll indicator

### Contact Cards

Two-column grid with:

- Phone card: burgundy icon circle, cream background
- WhatsApp card: green icon circle, green-tinted background
- Hover: lift effect + saffron border

## Motion

- **Transitions:** 200-400ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`
- **Hero animations:** Staggered fade-up with 0.2s delays between elements
- **Scroll reveal:** 30px upward fade-in using IntersectionObserver, triggered once
- **Hover effects:** Cards lift with `translateY(-8px)`, buttons lift with `translateY(-2px)`
- **WhatsApp FAB:** Pulsing green glow animation (2s infinite)
- **Hamburger:** Smooth transform to X icon (300ms)
- **Reduced motion:** All animations disabled when `prefers-reduced-motion: reduce`

## Responsive Behaviour

- **Mobile (≤640px):** Single column layouts, full-width cards, 2×2 events grid
- **Tablet (640–1024px):** Two-column specialty grid, two-column menu items
- **Desktop (≥1024px):** Three-column specialty grid, full navigation, 4-column events

Test viewports: 360px, 768px, 1024px, 1440px.

## Accessibility

- Body text contrast on cream: passes WCAG AA
- All interactive elements ≥ 44×44px touch target
- Focus visible with saffron outline, 3px offset
- Skip-to-content link for keyboard users
- Semantic HTML landmarks (`header`, `main`, `section`, `footer`)
- `aria-label` on all icon-only buttons
- `prefers-reduced-motion` respected

## What Not to Do

- No cold grey shadows — use neutral black at low opacity
- No icon families other than Material Symbols Outlined
- No fonts other than Felipa and Jura
- No colors outside the defined palette
- No layout-shifting hover animations
- No auto-playing videos or audio
