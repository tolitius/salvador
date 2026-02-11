# Design Defaults

> concrete starting values and code patterns. use these as baselines, not hard constraints.

## Size & Spacing

```
BASE_W = 850, BASE_H = 540
font hierarchy: size reflects importance
  primary text:  prominent, easy to read (the content needed to understand the concept)
  headings:      clearly larger than body
  secondary:     smaller is fine for labels, annotations, metadata
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

## Smooth Transition Pattern (staged visualizations only)

**no fade-cuts.** stages must NOT simply fade out old content and fade in new content.
elements that appear in consecutive stages must lerp to their new positions.
new elements can fade in, removed elements can fade out, but shared elements move continuously.

```js
// each element that persists across stages has current + target state
let card = { x: 50, y: 100, w: 300, h: 200, alpha: 1 };
let cardTarget = { x: 50, y: 100, w: 300, h: 200, alpha: 1 };

let sphere = { x: 500, y: 270, r: 80, alpha: 0 };
let sphereTarget = { x: 500, y: 270, r: 80, alpha: 0 };

function setStage(n) {
  stage = n;
  if (n === 0) {
    // card is prominent, sphere not yet visible
    cardTarget = { x: 50, y: 100, w: 300, h: 200, alpha: 1 };
    sphereTarget = { x: 500, y: 270, r: 80, alpha: 0 };
  }
  if (n === 1) {
    // card shrinks and moves aside, sphere fades in
    cardTarget = { x: 20, y: 350, w: 250, h: 150, alpha: 1 };
    sphereTarget = { x: 450, y: 250, r: 120, alpha: 1 };
  }
}

// call this every frame in draw()
function updateTransitions() {
  const speed = 0.08;
  for (const [cur, tgt] of [[card, cardTarget], [sphere, sphereTarget]]) {
    for (const key of Object.keys(tgt)) {
      cur[key] = p.lerp(cur[key], tgt[key], speed);
    }
  }
}
```

## Scene Switch Pattern (when stages use different scenes)

when consecutive stages show genuinely different content, use a timed entry so the switch isn't jarring.

```js
// track time since last stage change
let stageT = 0;

function setStage(n) {
  stage = n;
  stageT = 0;
}

// in draw(), advance stageT
stageT += p.deltaTime / 1000;

// each stage's draw function uses stageT for entry animation:
// elements appear during the first ~0.5s
const entry = Math.min(1, stageT / 0.5);
// fade in
p.fill(r, g, b, entry * 255);
// or slide up
const y = p.lerp(startY + 20, startY, entry);
```

shared chrome (info card, nav dots, title) should still use the lerp transition pattern above — these persist across all stages and should never jump positions.

## Card / Panel (for annotations, not explanations)

use sparingly — for small data callouts, key facts, or detail annotations. NOT for paragraphs of explanation (that's the "text-first" anti-pattern).

```js
function drawCard(p, x, y, w, h, accentColor) {
  p.noStroke();
  p.fill(0, 40);
  p.rect(x + 3, y + 3, w, h, 10);
  p.fill(30, 35, 50);
  p.rect(x, y, w, h, 10);
  if (accentColor) {
    p.fill(accentColor);
    p.rect(x, y, 4, h, 10, 0, 0, 10);
  }
}
```

## Stage Navigation Boilerplate (staged visualizations only)

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
