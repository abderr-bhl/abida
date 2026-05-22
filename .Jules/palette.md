# UX and Accessibility Standards

## Amazon Affiliate Integration
- **Button Colors**: Amazon orange (#FF9900) must be paired with **dark text** (e.g., `text-gray-900`) to meet WCAG AA contrast requirements. White text on this background has insufficient contrast.
- **External Links**: All buttons leading to external sites (like Amazon) must:
  - Include an `aria-label` indicating it opens in a new tab.
  - Show a visual external link icon.
  - Have visible focus states (`focus-visible:ring-2`).

## Product Highlighting
- Use the `TopPickBadge` component for the primary recommendation in any list.
- Top picks should have a distinct visual border or background to differentiate them from secondary options.

## Content Automation
- Competitor benchmarking is automated via RSS feeds from Wirecutter and RTINGS.
- Tasks are generated in `src/lib/tasks.json` and managed through the `/admin/tasks` dashboard.
