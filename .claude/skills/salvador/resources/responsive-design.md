# Responsive Design for p5.js Visualizations

## Overview

All Salvador visualizations must use the **p5.js scale factor** approach for responsive design. This ensures:
- Sharp rendering at any screen size (no blurry pixels)
- Preserved composition and layout
- Automatic adaptation to different devices (desktop, tablet, phone)

## Why Not CSS Scaling?

CSS scaling stretches a fixed-size canvas bitmap, resulting in blurry visuals:
```css
/* DON'T do this - causes blur */
canvas { width: 100vw; height: 100vh; }
```

## The p5.js Scale Factor Approach

Create the canvas at full screen resolution, then use `scale()` transform to map your designed coordinates onto the available space. p5.js renders all shapes/text at native resolution - sharp at any size.

### Design Size

Pick a comfortable base size to design at:
```javascript
const BASE_W = 850;
const BASE_H = 540;
```

These are your "design pixels" - all coordinates in your code use these values.

### Implementation

```javascript
new p5((p) => {
  const BASE_W = 850;
  const BASE_H = 540;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(2);  // retina support
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(20);

    // calculate scale to fit BASE_W x BASE_H into current window
    const scaleX = p.width / BASE_W;
    const scaleY = p.height / BASE_H;
    const scale = Math.min(scaleX, scaleY);  // uniform scale, preserve aspect ratio

    // center the design in the window
    const offsetX = (p.width - BASE_W * scale) / 2;
    const offsetY = (p.height - BASE_H * scale) / 2;

    p.push();
    p.translate(offsetX, offsetY);
    p.scale(scale);

    // === draw everything using BASE coordinates ===
    // e.g., center is at (425, 270), not (width/2, height/2)

    drawVisualization();

    p.pop();
  };

  function drawVisualization() {
    // all coordinates are in BASE_W x BASE_H space
    p.fill(255);
    p.ellipse(BASE_W / 2, BASE_H / 2, 100, 100);  // centered circle

    p.textSize(24);  // consistent text size
    p.text("Hello", 425, 270);
  }
});
```

### Key Points

1. **Canvas size**: Always `windowWidth × windowHeight` (full screen)
2. **Scale calculation**: `Math.min(scaleX, scaleY)` for uniform scaling
3. **Centering**: Calculate offset to center the design area
4. **All drawing inside transformed context**: Use `push()/pop()` to isolate the transform
5. **Use BASE coordinates everywhere**: Don't reference `p.width` or `p.height` inside the drawing code

### Mouse/Touch Input

When handling mouse input, convert screen coordinates back to design coordinates:

```javascript
p.mousePressed = () => {
  const scaleX = p.width / BASE_W;
  const scaleY = p.height / BASE_H;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (p.width - BASE_W * scale) / 2;
  const offsetY = (p.height - BASE_H * scale) / 2;

  // convert mouse position to design coordinates
  const designX = (p.mouseX - offsetX) / scale;
  const designY = (p.mouseY - offsetY) / scale;

  // now use designX, designY for hit detection
  if (designX > 100 && designX < 200 && designY > 100 && designY < 200) {
    // clicked on something at design coordinates (100-200, 100-200)
  }
};
```

### Helper Functions (Optional)

For cleaner code, extract coordinate conversion:

```javascript
let currentScale = 1;
let currentOffsetX = 0;
let currentOffsetY = 0;

function updateScaleFactors() {
  const scaleX = p.width / BASE_W;
  const scaleY = p.height / BASE_H;
  currentScale = Math.min(scaleX, scaleY);
  currentOffsetX = (p.width - BASE_W * currentScale) / 2;
  currentOffsetY = (p.height - BASE_H * currentScale) / 2;
}

function toDesignX(screenX) {
  return (screenX - currentOffsetX) / currentScale;
}

function toDesignY(screenY) {
  return (screenY - currentOffsetY) / currentScale;
}

p.draw = () => {
  updateScaleFactors();
  // ... rest of draw
};
```

### Letterboxing

When the screen aspect ratio doesn't match 850:540, you'll get letterboxing (empty bars). This is intentional - it preserves your designed composition. The letterbox areas show the background color.

To make letterboxing less noticeable:
- Use a dark background (`p.background(20)`)
- Or fill letterbox areas with a gradient/pattern before the main transform

## Checklist

Before finalizing a visualization:
- [ ] Canvas created at `windowWidth × windowHeight`
- [ ] `windowResized()` handler resizes canvas
- [ ] Scale factor calculated with `Math.min()` for uniform scaling
- [ ] Design area centered with offset calculation
- [ ] All drawing uses BASE coordinates (not `p.width`/`p.height`)
- [ ] Mouse/touch input converted to design coordinates
- [ ] `pixelDensity(2)` set for retina displays
