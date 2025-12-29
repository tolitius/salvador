# p5.js 2.x Knowledge Reference

> This file contains p5.js changes from version 2.0+ that may not be in Claude's training data.
> Read this before writing any p5.js code to ensure compatibility with 2.1.2+.

## Critical Breaking Changes

### 1. preload() is REMOVED

**Old (1.x) - DO NOT USE:**
```js
let img;
function preload() {
  img = loadImage('cat.png');
}
function setup() {
  createCanvas(400, 400);
}
```

**New (2.x) - USE THIS:**
```js
let img;
async function setup() {
  img = await loadImage('cat.png');
  createCanvas(400, 400);
}
```

**When to use:** Any sketch that loads external assets (images, fonts, JSON, etc.)

**Note:** If no assets are loaded, `setup()` does not need to be async.

---

### 2. Curve Functions Renamed

| 1.x (deprecated)   | 2.x (use this)     |
|--------------------|--------------------|
| `curveVertex()`    | `splineVertex()`   |
| `curvePoint()`     | `splinePoint()`    |
| `curveTangent()`   | `splineTangent()`  |
| `curveTightness()` | `splineProperty('tightness', value)` |

**Old (1.x) - DO NOT USE:**
```js
beginShape();
curveVertex(x1, y1);  // had to double first point
curveVertex(x1, y1);
curveVertex(x2, y2);
curveVertex(x3, y3);
curveVertex(x3, y3);  // had to double last point
endShape();
```

**New (2.x) - USE THIS:**
```js
beginShape();
splineVertex(x1, y1);  // no doubling needed
splineVertex(x2, y2);
splineVertex(x3, y3);
endShape();  // automatically interpolates through all points
```

**Auto-closing splines:**
```js
beginShape();
splineVertex(x1, y1);
splineVertex(x2, y2);
splineVertex(x3, y3);
endShape(CLOSE);  // smoothly loops back to start
```

**Spline properties:**
```js
// set individual property
splineProperty('tightness', 0.5);

// set multiple properties at once
splineProperties({
  tightness: 0.5,
  ends: 'include'  // 'include' | 'exclude' | 'join'
});
```

**When to use:** Any smooth curve drawing - waves, organic shapes, paths.

---

### 3. Bezier Vertex Changes

**Old (1.x) - quadraticVertex was separate:**
```js
quadraticVertex(cx, cy, x, y);  // REMOVED
```

**New (2.x) - use bezierOrder():**
```js
// for quadratic beziers (1 control point)
bezierOrder(2);
bezierVertex(cx, cy);   // control point
bezierVertex(x, y);     // end point

// for cubic beziers (2 control points) - default
bezierOrder(3);
bezierVertex(cx1, cy1); // control point 1
bezierVertex(cx2, cy2); // control point 2
bezierVertex(x, y);     // end point
```

**Mixing curve types in one shape:**
```js
beginShape();
vertex(0, 0);           // start point

bezierOrder(3);         // cubic bezier
bezierVertex(20, -50);  // control 1
bezierVertex(80, -50);  // control 2
bezierVertex(100, 0);   // end

splineVertex(150, 20);  // switch to spline
splineVertex(200, 0);

vertex(250, 0);         // back to straight line
endShape();
```

**When to use:** Complex paths mixing straight lines, beziers, and splines.

---

## New Color System

### OKLCH Color Mode (Recommended for Animation)

OKLCH provides perceptually uniform colors - equal steps look equally different to humans.

```js
colorMode(OKLCH);

// oklch(lightness, chroma, hue, [alpha])
// lightness: 0-100 (black to white)
// chroma: 0-0.4+ (gray to saturated)
// hue: 0-360 (color wheel degrees)

let vibrantRed = color(65, 0.29, 25);
let calmBlue = color(65, 0.15, 250);

// animating hue is smooth and uniform
function draw() {
  let hue = (frameCount * 2) % 360;
  fill(70, 0.2, hue);
  circle(200, 200, 100);
}
```

**Color space options:**
```js
colorMode(RGB);      // default, 0-255
colorMode(HSB);      // hue 0-360, sat/bright 0-100
colorMode(HSL);      // hue 0-360, sat/light 0-100
colorMode(HWB);      // hue, whiteness, blackness (NEW)
colorMode(LAB);      // CIE Lab perceptual (NEW)
colorMode(LCH);      // CIE LCH cylindrical Lab (NEW)
colorMode(OKLAB);    // improved Lab uniformity (NEW)
colorMode(OKLCH);    // improved LCH uniformity (NEW, RECOMMENDED)
```

**When to use OKLCH:**
- Color animations (hue rotation, transitions)
- Generating harmonious palettes
- When you need perceptually equal color steps

**When to use RGB:**
- Simple sketches
- When matching specific hex colors
- Performance-critical code

---

### Color Contrast Checking (Accessibility)

p5.js 2.1+ includes WCAG contrast checking:

```js
let textColor = color(255);      // white
let bgColor = color(30, 30, 40); // dark gray

// check contrast ratio
let ratio = textColor.contrast(bgColor);
// returns number like 12.5

// check against WCAG standards
let wcag2 = textColor.contrast(bgColor, 'WCAG2');
// returns: 'AAA' | 'AA' | 'AA Large' | 'Fail'

let apca = textColor.contrast(bgColor, 'APCA');
// returns APCA contrast value (-108 to 106)
```

**WCAG 2.1 thresholds:**
- AAA: ratio >= 7:1 (normal text)
- AA: ratio >= 4.5:1 (normal text)
- AA Large: ratio >= 3:1 (18pt+ or 14pt bold)

**When to use:**
- Validating text readability
- Ensuring UI elements meet accessibility standards
- Generating accessible color palettes

---

## Accessibility Functions

### describe() - Screen Reader Descriptions

```js
function setup() {
  createCanvas(400, 400);

  // basic description
  describe('A bouncing red ball on a blue background');
}

function draw() {
  background(30, 30, 100);
  circle(ballX, ballY, 50);

  // update description dynamically
  describe(`Ball at position ${int(ballX)}, ${int(ballY)}`);
}
```

**With label for complex sketches:**
```js
describe('Schrödinger cat experiment visualization', LABEL);
// LABEL makes it visible on screen too (for debugging)
```

**Detailed fallback:**
```js
describeElement('atom', 'Radioactive atom pulsing with cyan glow');
describeElement('cat', 'Orange cat breathing slowly');
```

**When to use:** ALWAYS. Every sketch should have describe() for accessibility.

---

### gridOutput() and textOutput()

For data visualizations and complex layouts:

```js
function setup() {
  createCanvas(400, 400);
  gridOutput();  // creates screen reader grid description
  // or
  textOutput();  // creates text list description
}
```

**When to use:** Sketches with multiple distinct elements, charts, or spatial layouts.

---

## Typography Enhancements

### Variable Font Weight

```js
async function setup() {
  // load a variable font
  let font = await loadFont('Inter-Variable.ttf');
  textFont(font);
  createCanvas(400, 400);
}

function draw() {
  // animate weight
  let weight = map(sin(frameCount * 0.05), -1, 1, 100, 900);
  textWeight(weight);  // 100 (thin) to 900 (black)

  text('Quantum', 50, 200);
}
```

**When to use:** Animated typography, emphasis effects.

---

### textToContours() - Editable Text Paths

```js
let font;

async function setup() {
  font = await loadFont('Arial.ttf');
  createCanvas(400, 400);
}

function draw() {
  let contours = font.textToContours('ψ', 0, 0, 72);

  // contours is array of arrays of {x, y} points
  beginShape();
  for (let contour of contours) {
    beginContour();
    for (let pt of contour) {
      // manipulate points
      let wave = sin(pt.x * 0.1 + frameCount * 0.1) * 5;
      vertex(pt.x + 100, pt.y + 200 + wave);
    }
    endContour();
  }
  endShape(CLOSE);
}
```

**When to use:** Animated text, text effects, custom text rendering.

---

### textToModel() - 3D Extruded Text (WebGL)

```js
let font, textModel;

async function setup() {
  createCanvas(400, 400, WEBGL);
  font = await loadFont('Arial.ttf');
  textModel = font.textToModel('3D', { depth: 20 });
}

function draw() {
  background(0);
  rotateY(frameCount * 0.01);
  model(textModel);
}
```

**When to use:** 3D typography in WebGL sketches.

---

## Instance Mode Syntax (Unchanged but Documented)

The visualization uses instance mode. This is still the same in 2.x:

```js
import p5 from 'p5';

new p5((p) => {
  p.setup = () => {
    p.createCanvas(850, 540);
  };

  // for async loading in instance mode:
  p.setup = async () => {
    let img = await p.loadImage('cat.png');
    p.createCanvas(850, 540);
  };

  p.draw = () => {
    p.background(20);
    p.ellipse(100, 100, 50);
  };
});
```

---

## Quick Migration Checklist

When writing new p5.js code, verify:

- [ ] No `preload()` - use `async setup()` with `await` if loading assets
- [ ] No `curveVertex()` - use `splineVertex()`
- [ ] No `quadraticVertex()` - use `bezierOrder(2)` + `bezierVertex()`
- [ ] No `curveTightness()` - use `splineProperty('tightness', val)`
- [ ] Added `describe()` for accessibility
- [ ] Consider `colorMode(OKLCH)` for animations

---

## Version History

| Version | Key Additions |
|---------|--------------|
| 2.0.0   | async/await, splineVertex, OKLCH, textToContours, describe() |
| 2.1.0   | color.contrast(), TypeScript types, p5.strands |
| 2.1.2   | WCAG/APCA contrast algorithms, bug fixes |

---

*Last updated: December 29th, 2025 (p5.js 2.1.2)*
*Reference: https://beta.p5js.org/reference/*
