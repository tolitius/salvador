# Design Defaults

> concrete starting values and code patterns. use these as baselines, not hard constraints.

## Size & Spacing

```
BASE_W = 850, BASE_H = 540
body text:    18px minimum
headings:     28px minimum
captions:     14px minimum
card padding: 16px all sides
element gap:  20px minimum between unrelated elements
primary area: fill 60%+ of canvas
```

## Visual Fraction Renderer

use this whenever math fractions appear — never render fractions with a forward slash.

```js
function drawFraction(p, numerator, denominator, x, y, size) {
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(size);
  const lineW = Math.max(
    p.textWidth(String(numerator)),
    p.textWidth(String(denominator))
  ) + 10;
  // numerator above
  p.text(String(numerator), x, y - size * 0.6);
  // fraction bar
  p.stroke(p.color(200));
  p.strokeWeight(1.5);
  p.line(x - lineW / 2, y, x + lineW / 2, y);
  p.noStroke();
  // denominator below
  p.text(String(denominator), x, y + size * 0.6);
}
```

## Smooth Transition Pattern

set target positions on stage change, interpolate in draw(). never teleport.

```js
// in state management
let current = { x: 100, y: 200, size: 50 };
let target  = { x: 100, y: 200, size: 50 };

function setStage(n) {
  stage = n;
  // set targets — current will lerp toward them
  if (n === 1) { target.x = 100; target.y = 200; target.size = 50; }
  if (n === 2) { target.x = 400; target.y = 270; target.size = 120; }
  // ...
}

// in draw()
function updateTransitions() {
  const speed = 0.08;
  current.x    = p.lerp(current.x,    target.x,    speed);
  current.y    = p.lerp(current.y,    target.y,    speed);
  current.size = p.lerp(current.size, target.size, speed);
}
```

## Card / Panel Pattern

rounded rect with proper padding, optional accent strip.

```js
function drawCard(p, x, y, w, h, accentColor) {
  const pad = 16;
  // shadow
  p.noStroke();
  p.fill(0, 40);
  p.rect(x + 3, y + 3, w, h, 10);
  // card body
  p.fill(30, 35, 50);
  p.rect(x, y, w, h, 10);
  // accent strip on left
  if (accentColor) {
    p.fill(accentColor);
    p.rect(x, y, 4, h, 10, 0, 0, 10);
  }
  // text area starts at (x + pad, y + pad)
  // available width: w - 2 * pad
  return { textX: x + pad, textY: y + pad, textW: w - 2 * pad };
}
```

## Stage Navigation Boilerplate

standard arrow key handler. includes `window.stageCount` for the inspector.

```js
let stage = 0;
const stages = [ /* ... stage definitions ... */ ];

// expose for inspector
window.stageCount = stages.length;

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    if (stage < stages.length - 1) {
      stage++;
      setStage(stage);
    }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (stage > 0) {
      stage--;
      setStage(stage);
    }
  }
  if (e.key === 'g' || e.key === 'G') {
    p.saveGif('viz', 4);
  }
});
```
