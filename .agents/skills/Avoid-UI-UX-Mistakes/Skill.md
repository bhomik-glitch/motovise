---
name: Avoid UI UX Beginner Mistakes
description: Identifies and fixes beginner UI/UX mistakes regarding user flows, spacing, overused effects, inconsistent components, and interactive feedback.
---

# Avoid UI/UX Beginner Mistakes

When building a website UI, review the design against these common beginner mistakes and apply the following fixes:

*   **Missing User Flow Considerations:** Ensure no "dead ends" exist by including search bars, skip buttons, and essential filter icons to prevent major gaps in the user experience [13, 14].
*   **Overusing Visual Effects:** Avoid harsh default drop shadows and chaotic gradients [14]. For shadows, change the shadow color to a light gray, increase the blur significantly, and lower the opacity, or remove the shadow entirely [14]. If using gradients, stick to variations of the same color [14].
*   **Tight Spacing:** Give elements room to breathe by utilizing grids and auto layout tools [15]. Increase vertical spacing for stacked content so elements group naturally, especially on mobile [15].
*   **Inconsistent Components:** Standardize elements like corner radiuses (e.g., set all smaller components to a 10-pixel radius) [16]. Ensure buttons with similar functions match perfectly in size, style, and behavior [16].
*   **Redundant Elements:** Remove visual clutter like unnecessary arrows or thick strokes on containers [17]. If contrast is a concern, dim the borders down rather than making them visually heavy [17].
*   **Lack of Interactive Feedback:** Users must know the system is registering their actions. Add grayed-out click states, loading wheels, or micro-interactions (such as a red dot appearing on a save tab) to provide immediate feedback [17, 18].

### Example Usage:
**User Prompt:** "Review my popup modal. It uses a default Figma drop shadow, a blue-to-green gradient background, and the elements feel a bit cramped."
**Skill Output:** "To fix these beginner mistakes, first address the overused effects: stick to variations of a single color for the gradient, or remove it entirely for a cleaner look [14]. Change the default drop shadow to a light gray, significantly increase the blur, and lower the opacity [14]. For the cramped elements, utilize grids and auto layout to increase vertical spacing, allowing the content to breathe and group naturally [15]."
