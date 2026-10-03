---
name: RetailSense OS
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#47d6ff'
  primary: '#a5e7ff'
  on-primary: '#003543'
  primary-container: '#00d2ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffd6a7'
  on-tertiary: '#472a00'
  tertiary-container: '#ffb148'
  on-tertiary-container: '#704500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b6ebff'
  primary-fixed-dim: '#47d6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for high-stakes enterprise environments where clarity and operational uptime are paramount. The brand personality is **authoritative, precise, and tech-forward**, evoking the feeling of a sophisticated mission-control center for retail operations.

The style is **Modern Corporate with a technical edge**, characterized by:
- **Dark-Mode First:** A deep, immersive canvas that reduces eye strain during long operational shifts.
- **Precision Engineering:** Sharp execution of borders and alignment, reflecting the accuracy of the underlying AI.
- **Information Density:** High data density balanced by generous micro-spacing to ensure telemetry remains readable at a glance.
- **Functional Accents:** Color is used sparingly and purposefully to draw attention to system statuses and critical alerts.

## Colors
The palette is rooted in a deep "Obsidian" base to provide maximum contrast for functional data.
- **Primary (Electric Cyan):** Used for primary actions, focus states, and active data streams.
- **Surfaces:** `0a0a0c` is the global background; `16161a` is used for elevated containers (cards, sidebars).
- **Functional Palette:** Success Green, Warning Amber, and Critical Red are reserved strictly for system status, stock levels, and hardware alerts.
- **Borders:** Subtle white translucency is preferred over solid greys to maintain a "glass-on-black" depth effect.

## Typography
This design system utilizes a dual-font strategy to separate UI controls from technical data.
- **UI & Navigation:** Use **Geist** for all standard interface elements. It provides a clean, geometric structure that feels modern and professional.
- **Telemetry & Logs:** Use **JetBrains Mono** for timestamps, sensor readings, SKU numbers, and currency. The monospaced nature ensures that columns of numbers align perfectly in tables and dashboards.
- **Scale:** Keep body text at 14px for optimal density. Use 12px Mono for "over-line" labels and metadata.

## Layout & Spacing
The layout follows a **4px baseline grid** to maintain rigorous alignment.
- **Grid:** A 12-column fluid grid for the main dashboard content. Gutters are fixed at 16px to maximize screen real estate for data tables.
- **Density:** Use a "Compact" spacing model. Vertical padding in lists and tables should be 8px or 12px to allow more rows to be visible above the fold.
- **Sidebars:** Primary navigation is docked to the left (240px wide). Right-side utility panels (for detailed AI insights) should be collapsible and use an overlay or push transition.

## Elevation & Depth
In this dark-mode environment, depth is communicated through **tonal layering and subtle borders** rather than heavy shadows.
- **Level 0 (Background):** `#0a0a0c` - The "void" or base canvas.
- **Level 1 (Cards/Panels):** `#16161a` - Used for the primary content blocks. These must have a `1px solid rgba(255, 255, 255, 0.08)` border.
- **Level 2 (Modals/Popovers):** `#1c1c21` - Used for elements that float above the UI. These receive a soft, 20% opacity black shadow with a 16px blur to separate them from Level 1.
- **Active State:** Elements being interacted with may use a primary color glow (0 0 8px rgba(0, 210, 255, 0.3)).

## Shapes
The shape language is **structured and refined**.
- **Standard Radius:** 8px for cards, input fields, and buttons. This provides a professional balance between "engineered" and "accessible."
- **Small Radius:** 4px for tags, chips, and nested inner elements.
- **Full Radius:** Reserved only for status indicators (dot indicators) and circular profile avatars.

## Components
- **Buttons:**
    - *Primary:* Solid Cyan background with black text for maximum contrast.
    - *Secondary:* Ghost style with 1px border (`#00d2ff`) and cyan text.
    - *Destructive:* Solid Critical Red with white text.
- **Data Tables:** High-density. Header cells should use `mono-label` in all-caps. Row hover state should use a subtle lightening of the background (`#1c1c21`).
- **Status Badges:** Use a "Pill" shape with a low-opacity background of the status color and a solid text/icon color (e.g., Success Green text on 10% opacity Green background).
- **Inputs:** Dark backgrounds (`#0a0a0c`) with a subtle border. On focus, the border transitions to Primary Cyan with a subtle outer glow.
- **Key Performance Indicators (KPIs):** Use `headline-md` for the value and `mono-label` for the description. Include a small sparkline trend icon (Success or Critical) next to the value.
- **AI Insight Cards:** Differentiated by a subtle gradient border or a left-edge accent in Primary Cyan to signify "System Intelligence."