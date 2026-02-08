# Visual Quality Checklist

> concrete, verifiable rules. check every item after each inspect cycle.

## Layout

- elements must not overlap — verify by eye in every stage screenshot
- nothing outside canvas bounds (check ALL stages, not just the first)
- primary elements should fill 60%+ of available space — don't waste screen real estate
- cards/panels: minimum 16px padding all sides, text must not touch edges
- leave 20px minimum gap between unrelated elements

## Typography

- minimum font sizes at 850×540 base:
  - body text ≥ 18px
  - headings ≥ 28px
  - labels/captions ≥ 14px
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

## Transitions

- mathematically continuous: if stage A ends at position (x,y), stage B MUST start at (x,y)
- use lerp for smooth interpolation — never teleport elements
- show the moment of change: don't skip from state A to state B
- minimum 500ms for meaningful transitions (fast enough to not bore, slow enough to observe)
- target positions set on stage change, current positions interpolate toward them in draw()

## Color

- color-code elements when they're first introduced
- maintain those colors through ALL stages — never silently reassign colors
- when text references a visual element, use the matching color for that text
- never all black-and-white — use the modern palette (from SKILL.md constraints)
- ensure text-on-background has sufficient contrast

## Interactivity

- interactive elements must be visually discoverable: glow, distinct color, or cursor hint
- edit/input fields must work with mouse click, not just keyboard tab
- control hints (e.g. "← → to navigate") must be visible but subtle
- navigation: always call `e.preventDefault()` on arrow keys to disable default scroll

## Educational Content

- explain the WHY at every step, not just the WHAT
- don't show answers before the learning moment — build understanding first
- progressive revelation: each stage builds on the previous
- keep info card content relevant to the current stage — don't reuse text across stages
- use color-coded annotations connecting cause to effect
