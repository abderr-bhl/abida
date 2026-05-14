## 2025-05-15 - Amazon Button Accessibility and UX
**Learning:** The default Amazon brand orange (#FF9900) provides insufficient contrast with white text (~2.3:1), failing WCAG AA standards. Using a dark text color (e.g., text-gray-900) achieves a much better contrast ratio. Additionally, external links should always provide visual and audible cues (icon + ARIA label) when opening in a new tab to avoid disorienting users.
**Action:** Always use dark text on #FF9900 backgrounds and include "opens in a new tab" ARIA labels for external links.
