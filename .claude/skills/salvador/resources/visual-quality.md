# Visual Quality Checklist

> concrete, verifiable rules. check every item after each inspect cycle.

## Layout

- elements must not overlap — verify by eye in every snapshot
- nothing outside canvas bounds (check ALL snapshots, not just the first)
- primary elements should fill 60%+ of available space — don't waste screen real estate
- cards/panels: minimum 16px padding all sides, text must not touch edges
- leave 20px minimum gap between unrelated elements

## Typography

- font size is about **hierarchy**, not minimums. match size to importance:
  - primary content (text the viewer must read to understand the concept): prominent, easy to read
  - headings / titles: clearly larger than body text
  - secondary info (labels, annotations, axis marks, metadata): can be smaller — as small as needed for the design
  - the test: if the viewer has to squint to read something they need for understanding, it's too small. if it's supporting detail, small is fine.
- NEVER use forward-slash for fractions (e.g. `1/2`) — always render as stacked fraction:

```js
// visual fraction renderer — use this whenever math fractions appear
function drawFraction(p, numerator, denominator, x, y, size) {
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(size);
  const lineW = Math.max(p.textWidth(String(numerator)), p.textWidth(String(denominator))) + 10;
  p.text(String(numerator), x, y - size * 0.6);
  p.stroke(p.color(200));
  p.strokeWeight(1.5);
  p.line(x - lineW / 2, y, x + lineW / 2, y);
  p.noStroke();
  p.text(String(denominator), x, y + size * 0.6);
}
```

- consistent font sizes within the same view — don't mix 14px and 16px body text
- use Georgia or serif fonts for mathematical content
- ensure high contrast: light text on dark backgrounds, dark text on light backgrounds

## Transitions (staged visualizations only)

- **NO fade-cuts**: stages must NOT simply fade out old content and fade in new content. that's a PowerPoint slide transition, not a visualization.
- elements that exist in consecutive stages must lerp to their new positions/sizes — the viewer tracks them moving
- elements that are new in a stage can fade in. elements that are removed can fade out. but shared elements MUST move continuously.
- mathematically continuous: if stage A ends at position (x,y), stage B MUST start at (x,y)
- show the moment of change: don't skip from state A to state B
- minimum 500ms for meaningful transitions (fast enough to not bore, slow enough to observe)
- use the lerp transition pattern from `design-defaults.md`: set targets on stage change, interpolate in draw()

## Color

- color-code elements when they're first introduced
- maintain those colors throughout — never silently reassign colors
- when text references a visual element, use the matching color for that text
- never all black-and-white — use the modern palette (from SKILL.md constraints)
- ensure text-on-background has sufficient contrast

## Interactivity

- interactive elements must be visually discoverable: glow, distinct color, or cursor hint
- edit/input fields must work with mouse click, not just keyboard tab
- control hints (e.g. "← → to navigate") must be visible but subtle
- navigation: always call `e.preventDefault()` on arrow keys to disable default scroll

## Educational Content (for educational visualizations)

- explain the WHY at every step, not just the WHAT
- don't show answers before the learning moment — build understanding first
- if staged: progressive revelation, each stage builds on the previous
- keep info card content relevant to what's currently shown
- use color-coded annotations connecting cause to effect
