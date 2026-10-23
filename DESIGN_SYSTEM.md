# Design System (reusable across all projects)

Claude uses this for every mockup. Gemini uses the same tokens when it builds. Edit the values once here to restyle everything.

## 1. Principles
1. One clear primary action per screen.
2. Mobile first (360px wide), then scale up to desktop.
3. Big tap targets (min 44px), readable text (min 16px body).
4. High contrast. Never use colour alone to show meaning.
5. Few screens, few colours, few fonts.

## 2. Colour tokens (light theme default)
| Token | Value | Use |
|---|---|---|
| --bg | #F7F8FA | page background |
| --surface | #FFFFFF | cards, sheets |
| --text | #1A1D23 | main text |
| --text-muted | #5B6472 | secondary text |
| --primary | #2563EB | main buttons, links |
| --primary-text | #FFFFFF | text on primary |
| --success | #16A34A | correct, saved |
| --warning | #D97706 | caution |
| --danger | #DC2626 | errors, delete |
| --border | #E3E6EB | dividers, outlines |

Dark theme: only when the project asks for it. Swap --bg to #0F1115, --surface to #181B21, --text to #F2F4F7, --text-muted to #9AA3B2, --border to #2A2F39. Keep other colours.

Per-project accent: a project may replace --primary with one accent colour. Nothing else changes.

## 3. Typography
- Font: system font stack (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`). No paid or downloaded fonts. Optional free: Google Fonts "Inter".
- Sizes: 12 caption, 14 small, 16 body, 20 subtitle, 24 title, 32 hero.
- Weights: 400 body, 600 headings and buttons.
- Line height: 1.5 body, 1.2 headings.

## 4. Spacing and shape
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48.
- Screen side padding: 16px.
- Corner radius: 8 small, 12 cards, 999 pills.
- Shadow: one soft shadow only, `0 1px 3px rgba(0,0,0,0.12)`.

## 5. Components
- **Button primary:** primary fill, primary-text, 12px radius, 48px tall, full width on mobile.
- **Button secondary:** transparent, primary text, 1px border.
- **Button danger:** danger fill, white text. Always confirm before a destructive action.
- **Card:** surface, 12px radius, 16px padding, shadow.
- **Input:** 48px tall, 1px border, 8px radius, label above, error text below in danger colour.
- **Top bar:** 56px, title left, one action right.
- **Bottom nav (mobile apps with 3 to 5 sections):** icons with labels, active uses primary.
- **List item:** 56px min height, title plus muted subtitle, divider below.
- **Toast:** bottom, 3 seconds, dark background.
- **Empty state:** icon, one sentence, one button.
- **Loading:** simple spinner or skeleton, never a blank screen.
- **Game elements:** big score at top, clear feedback colours (success/danger), short animations under 300ms, restart button always visible.

## 6. States every screen must handle
Loading, empty, error (with retry), success, offline (when relevant).

## 7. Accessibility checklist
- Contrast at least 4.5:1 for text.
- Every image has alt text. Every button has a text label or aria-label.
- Works with keyboard (web). Visible focus outline.
- Respect "reduce motion".

## 8. Copy tone
Friendly, plain English, short. Buttons start with a verb ("Start game", "Save invoice"). Errors say what went wrong and what to do next.

## 9. Icons and assets
Free only: Lucide or Material Symbols for icons. No copyrighted images. Generate simple SVG logos if needed.

## 10. Mockup rules for Claude
- Build mockups as one self-contained HTML file per screen group, using the tokens above as CSS variables on `:root`.
- Mobile width first. Label each screen.
- Save to `/design` in the repo so Gemini can open and match them.
