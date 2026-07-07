# UX & Accessibility Learnings

## Contrast & Colors
- **Amazon Orange (#FF9900)**: Contrast with white text is too low (~2.3:1). Must use dark text (e.g., `text-gray-900`) to meet WCAG AA standards.

## External Links
- All external links (especially Amazon buttons) must include:
  - Visual external link icon (e.g., Lucide `ExternalLink`).
  - ARIA label: `aria-label="${text} (opens in a new tab)"`.
  - Visible focus states: `focus-visible:ring-2`.

## Product Features
- **Top Picks**: Highlight the first recommendation in a guide using the `TopPickBadge` component (orange-100/900 theme).
