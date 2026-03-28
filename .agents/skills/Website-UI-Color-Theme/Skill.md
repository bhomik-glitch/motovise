---
name: Website UI Color Theme Guide
description: Guidelines for color palettes, the 60-30-10 rule, neutral balance, dark mode, and element states in website UI design.
---

# Website UI Color Theme Guide

When designing or auditing a website UI, follow these guidelines to pick and apply color themes effectively:

*   **The 60-30-10 Rule:** Structure your palette so that 60% of the UI is your dominant neutral color, 30% is your secondary color, and 10% is your accent color to avoid competing visual elements [3].
*   **Neutral Balance:** Use neutral grays for backgrounds to let elements breathe, rather than bright colors [4]. You can add a subtle hint of your brand color to a neutral gray background to add a splash of color without overpowering the UI [5].
*   **Avoid Pure Black and White:** Rely on dark grays for less important text (like file sizes or labels) and light grays for borders to establish a better hierarchy [6, 7].
*   **Semantic Colors:** Use specific colors for their distinct meanings, such as red for destructive actions, errors, or notifications, and green for success [8-10].
*   **Element States:** Color should indicate interaction. For hover states, use a slightly lighter or brighter version of your base color [10]. For an active or pressed state, use a slightly darker version [10]. Disabled states should be desaturated or light gray [10].

### Example Usage:
**User Prompt:** "Audit this card component. The background is pure white, the text is pure black, and the destructive 'Delete' button uses our brand's bright purple."
**Skill Output:** "To improve this card, avoid pure black for the text; use a dark gray instead to establish better hierarchy [6, 7]. For the 'Delete' button, while purple is your brand color, destructive actions should use red to clearly illustrate their nature and avoid usability issues [9]. Finally, ensure you define a slightly darker press state and a desaturated disabled state for the button [10]."
