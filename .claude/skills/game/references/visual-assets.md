# Visual Assets Reference

Procedural sprite generation, color palettes, and visual effects for polished game graphics without external files.

## Philosophy

**Never use bare primitives** for game objects. A `rect()` is a placeholder, not a finished asset. Every visible game object should have:
- Visual interest (gradients, patterns, or texture)
- Clear silhouette (outline or contrast)
- Life (idle animation, glow, or particle trail)

---

## Color Palettes

Use these curated palettes instead of picking random colors. Each palette is designed for harmony.

```javascript
// === PALETTE: Pico-8 (retro, vibrant) ===
const PICO8 = {
  black:      "#000000",
  darkBlue:   "#1D2B53",
  darkPurple: "#7E2553",
  darkGreen:  "#008751",
  brown:      "#AB5236",
  darkGray:   "#5F574F",
  gray:       "#C2C3C7",
  white:      "#FFF1E8",
  red:        "#FF004D",
  orange:     "#FFA300",
  yellow:     "#FFEC27",
  green:      "#00E436",
  blue:       "#29ADFF",
  lavender:   "#83769C",
  pink:       "#FF77A8",
  peach:      "#FFCCAA",
}

// === PALETTE: Endesga-32 (modern pixel art) ===
const ENDESGA = {
  void:       "#0d2b45",
  night:      "#203c56",
  shadow:     "#544e68",
  ash:        "#8d697a",
  skin:       "#d08159",
  sunset:     "#ffaa5e",
  sunlight:   "#ffd4a3",
  white:      "#ffecd6",
  sky:        "#4b80ca",
  water:      "#68c2d3",
  mint:       "#a2dcc7",
  grass:      "#ede19e",
  moss:       "#6e9437",
  forest:     "#45612b",
  blood:      "#ba3e3b",
  rust:       "#8a503e",
}

// === PALETTE: Soft Pastel (friendly, casual) ===
const PASTEL = {
  bg:         "#2d2d44",
  bgLight:    "#3d3d5c",
  player:     "#7ec8e3",
  playerDark: "#5ba3c0",
  coin:       "#ffd93d",
  coinDark:   "#c9a227",
  danger:     "#ff6b6b",
  dangerDark: "#c94444",
  safe:       "#6bcb77",
  safeDark:   "#4a9e54",
  platform:   "#6c7a89",
  platformDark: "#4a5568",
  accent:     "#c9b1ff",
  text:       "#e8e8e8",
  textDim:    "#9090a0",
}

// === PALETTE: Neon Arcade (cyberpunk, high contrast) ===
const NEON = {
  bg:         "#0f0f23",
  bgGlow:     "#1a1a3e",
  cyan:       "#00fff5",
  cyanDark:   "#00b8b0",
  magenta:    "#ff00ff",
  magentaDark:"#b000b0",
  yellow:     "#ffff00",
  yellowDark: "#b0b000",
  pink:       "#ff71ce",
  blue:       "#01cdfe",
  green:      "#05ffa1",
  orange:     "#ff9f1c",
  white:      "#ffffff",
  gray:       "#464666",
}
```

### Usage Pattern
```javascript
// pick a palette at the start
const P = PASTEL  // or PICO8, ENDESGA, NEON

// use throughout
add([rect(100, 20), color(P.platform)])
add([circle(12), color(P.coin)])
```

---

## Procedural Sprite Generators

These functions create visually interesting sprites at runtime using KAPLAY's drawing system.

### Player Sprite (Rounded Character)
```javascript
function makePlayerSprite(size = 32, palette = PASTEL) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")

  const cx = size / 2, cy = size / 2, r = size * 0.4

  // body gradient
  const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 0, cx, cy, r)
  grad.addColorStop(0, palette.player)
  grad.addColorStop(1, palette.playerDark)

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.beginPath()
  ctx.ellipse(cx, cy + r*0.9, r*0.8, r*0.3, 0, 0, Math.PI*2)
  ctx.fill()

  // body
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // eyes
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.ellipse(cx - r*0.3, cy - r*0.1, r*0.2, r*0.25, 0, 0, Math.PI*2)
  ctx.ellipse(cx + r*0.3, cy - r*0.1, r*0.2, r*0.25, 0, 0, Math.PI*2)
  ctx.fill()

  // pupils
  ctx.fillStyle = palette.void || "#1a1a2e"
  ctx.beginPath()
  ctx.arc(cx - r*0.25, cy - r*0.05, r*0.1, 0, Math.PI*2)
  ctx.arc(cx + r*0.35, cy - r*0.05, r*0.1, 0, Math.PI*2)
  ctx.fill()

  // highlight
  ctx.fillStyle = "rgba(255,255,255,0.4)"
  ctx.beginPath()
  ctx.ellipse(cx - r*0.3, cy - r*0.4, r*0.15, r*0.1, -0.5, 0, Math.PI*2)
  ctx.fill()

  return c.toDataURL()
}

// load it
loadSprite("player", makePlayerSprite(48, PASTEL))
```

### Coin Sprite (Shiny Circle with Star)
```javascript
function makeCoinSprite(size = 24, palette = PASTEL) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")

  const cx = size/2, cy = size/2, r = size * 0.4

  // outer glow
  const glow = ctx.createRadialGradient(cx, cy, r*0.5, cx, cy, r*1.2)
  glow.addColorStop(0, palette.coin + "60")
  glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // coin body gradient
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
  grad.addColorStop(0, palette.coin)
  grad.addColorStop(0.5, "#fff8dc")
  grad.addColorStop(1, palette.coinDark)

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // inner ring
  ctx.strokeStyle = palette.coinDark
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2)
  ctx.stroke()

  // star/sparkle in center
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  const sr = r * 0.25
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2) - Math.PI/4
    ctx.lineTo(cx + Math.cos(angle) * sr, cy + Math.sin(angle) * sr)
    const angle2 = angle + Math.PI/4
    ctx.lineTo(cx + Math.cos(angle2) * sr*0.4, cy + Math.sin(angle2) * sr*0.4)
  }
  ctx.closePath()
  ctx.fill()

  return c.toDataURL()
}

loadSprite("coin", makeCoinSprite(32, PASTEL))
```

### Spike Sprite (Dangerous Triangle)
```javascript
function makeSpikeSprite(size = 32, palette = PASTEL) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")

  const cx = size/2, h = size * 0.85, w = size * 0.8

  // glow underneath
  const glow = ctx.createRadialGradient(cx, size*0.7, 0, cx, size*0.7, w*0.6)
  glow.addColorStop(0, palette.danger + "40")
  glow.addColorStop(1, "transparent")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // spike gradient
  const grad = ctx.createLinearGradient(cx, size*0.1, cx, size*0.9)
  grad.addColorStop(0, "#fff")
  grad.addColorStop(0.2, palette.danger)
  grad.addColorStop(1, palette.dangerDark)

  // main spike
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.moveTo(cx, size * 0.1)
  ctx.lineTo(cx + w/2, size * 0.9)
  ctx.lineTo(cx - w/2, size * 0.9)
  ctx.closePath()
  ctx.fill()

  // highlight edge
  ctx.strokeStyle = "rgba(255,255,255,0.5)"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, size * 0.1)
  ctx.lineTo(cx - w/2 + 2, size * 0.85)
  ctx.stroke()

  return c.toDataURL()
}

loadSprite("spike", makeSpikeSprite(32, PASTEL))
```

### Platform Sprite (Textured Block)
```javascript
function makePlatformSprite(w = 128, h = 24, palette = PASTEL) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")

  // main gradient (top lighter)
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, palette.platform)
  grad.addColorStop(1, palette.platformDark)

  // rounded rect
  const r = Math.min(6, h/3)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, r)
  ctx.fill()

  // top highlight
  ctx.fillStyle = "rgba(255,255,255,0.15)"
  ctx.fillRect(r, 2, w - r*2, 3)

  // subtle texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.1)"
  ctx.lineWidth = 1
  for (let x = 16; x < w - 8; x += 24) {
    ctx.beginPath()
    ctx.moveTo(x, 6)
    ctx.lineTo(x, h - 4)
    ctx.stroke()
  }

  // bottom shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)"
  ctx.fillRect(r, h - 4, w - r*2, 2)

  return c.toDataURL()
}

// use for platforms of different sizes
loadSprite("platform-sm", makePlatformSprite(80, 20, PASTEL))
loadSprite("platform-md", makePlatformSprite(140, 24, PASTEL))
loadSprite("platform-lg", makePlatformSprite(200, 28, PASTEL))
```

### Enemy Sprite (Angry Blob)
```javascript
function makeEnemySprite(size = 40, palette = PASTEL) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")

  const cx = size/2, cy = size/2, r = size * 0.38

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)"
  ctx.beginPath()
  ctx.ellipse(cx, cy + r*0.85, r*0.9, r*0.25, 0, 0, Math.PI*2)
  ctx.fill()

  // body gradient
  const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 0, cx, cy, r*1.2)
  grad.addColorStop(0, palette.danger)
  grad.addColorStop(1, palette.dangerDark)

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // angry eyes (white)
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.ellipse(cx - r*0.35, cy - r*0.15, r*0.22, r*0.18, -0.2, 0, Math.PI*2)
  ctx.ellipse(cx + r*0.35, cy - r*0.15, r*0.22, r*0.18, 0.2, 0, Math.PI*2)
  ctx.fill()

  // angry eyebrows
  ctx.strokeStyle = palette.dangerDark
  ctx.lineWidth = 2.5
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(cx - r*0.55, cy - r*0.4)
  ctx.lineTo(cx - r*0.15, cy - r*0.25)
  ctx.moveTo(cx + r*0.55, cy - r*0.4)
  ctx.lineTo(cx + r*0.15, cy - r*0.25)
  ctx.stroke()

  // pupils
  ctx.fillStyle = "#1a1a2e"
  ctx.beginPath()
  ctx.arc(cx - r*0.3, cy - r*0.1, r*0.1, 0, Math.PI*2)
  ctx.arc(cx + r*0.4, cy - r*0.1, r*0.1, 0, Math.PI*2)
  ctx.fill()

  return c.toDataURL()
}

loadSprite("enemy", makeEnemySprite(48, PASTEL))
```

---

## Gradient Backgrounds

Never use a flat color background. Even subtle gradients add depth.

```javascript
// create gradient background layer
function addGradientBg(colorTop, colorBottom) {
  // background quad using onDraw
  onDraw(() => {
    drawRect({
      width: width(),
      height: height(),
      pos: vec2(0, 0),
      color: rgb(...hexToRgb(colorTop)),
    })
    // draw bottom half with gradient simulation
    for (let y = 0; y < height(); y += 4) {
      const t = y / height()
      const r = lerp(hexToRgb(colorTop)[0], hexToRgb(colorBottom)[0], t)
      const g = lerp(hexToRgb(colorTop)[1], hexToRgb(colorBottom)[1], t)
      const b = lerp(hexToRgb(colorTop)[2], hexToRgb(colorBottom)[2], t)
      drawRect({
        width: width(),
        height: 4,
        pos: vec2(0, y),
        color: rgb(r, g, b),
      })
    }
  })
}

// helper to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0]
}

// simpler: use canvas gradient as background image
function makeGradientBg(colorTop, colorBottom, w = 800, h = 600) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, colorTop)
  grad.addColorStop(1, colorBottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // optional: add subtle stars/dots
  ctx.fillStyle = "rgba(255,255,255,0.1)"
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * w
    const y = Math.random() * h * 0.7
    const r = Math.random() * 2 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return c.toDataURL()
}

// usage
loadSprite("bg", makeGradientBg("#1a1a3e", "#0d0d1a"))
add([sprite("bg"), pos(0, 0), z(-100)])
```

---

## Idle Animations (Game Feel)

Every game object should feel alive. Add these micro-animations.

### Floating/Bobbing (Coins, Pickups)
```javascript
// add to any object
function addFloat(obj, amplitude = 3, speed = 2) {
  const startY = obj.pos.y
  obj.onUpdate(() => {
    obj.pos.y = startY + Math.sin(time() * speed) * amplitude
  })
}

// usage
const coin = add([sprite("coin"), pos(200, 300), "coin"])
addFloat(coin, 4, 3)
```

### Breathing/Pulsing (Player, Enemies)
```javascript
function addBreathing(obj, scaleRange = 0.05, speed = 1.5) {
  obj.onUpdate(() => {
    const pulse = 1 + Math.sin(time() * speed) * scaleRange
    obj.scale = vec2(obj.scale.x > 0 ? pulse : -pulse, pulse)
  })
}
```

### Rotation (Coins, Stars)
```javascript
function addSpin(obj, speed = 90) {
  obj.onUpdate(() => {
    obj.angle += speed * dt()
  })
}
```

### Glow Pulse
```javascript
function addGlowPulse(obj, minOpacity = 0.3, maxOpacity = 0.7, speed = 2) {
  obj.use(opacity(minOpacity))
  obj.onUpdate(() => {
    const t = (Math.sin(time() * speed) + 1) / 2
    obj.opacity = lerp(minOpacity, maxOpacity, t)
  })
}
```

---

## Particle Patterns

### Coin Collect Burst
```javascript
function burstParticles(position, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const speed = rand(100, 200)
    add([
      circle(rand(3, 6)),
      pos(position),
      color(color),
      opacity(1),
      move(angle * (180/Math.PI), speed),
      lifespan(0.4, { fade: 0.3 }),
      scale(1),
      z(50),
    ])
  }
}

// usage
player.onCollide("coin", (c) => {
  burstParticles(c.pos, PASTEL.coin, 10)
  destroy(c)
})
```

### Death Explosion
```javascript
function deathExplosion(position, color, count = 15) {
  shake(12)
  flash(rgb(...hexToRgb(color)), 0.15)

  for (let i = 0; i < count; i++) {
    add([
      circle(rand(4, 10)),
      pos(position),
      color(color),
      opacity(1),
      move(rand(0, 360), rand(80, 250)),
      lifespan(rand(0.3, 0.6), { fade: 0.2 }),
      scale(rand(0.8, 1.2)),
      z(50),
    ])
  }
}
```

### Ambient Dust/Sparkles
```javascript
function spawnAmbientParticle() {
  add([
    circle(rand(1, 3)),
    pos(rand(0, width()), height() + 10),
    color(255, 255, 255),
    opacity(rand(0.1, 0.3)),
    move(rand(80, 100), rand(20, 50)),
    lifespan(rand(4, 8), { fade: 2 }),
    scale(1),
    z(-50),
  ])
}

// spawn periodically
loop(0.3, spawnAmbientParticle)
```

### Trail Effect
```javascript
function addTrail(obj, trailColor, interval = 0.05) {
  let lastPos = obj.pos.clone()

  loop(interval, () => {
    if (obj.pos.dist(lastPos) > 5) {
      add([
        circle(4),
        pos(obj.pos),
        color(trailColor),
        opacity(0.5),
        lifespan(0.3, { fade: 0.2 }),
        scale(1),
        z(obj.z - 1),
      ])
      lastPos = obj.pos.clone()
    }
  })
}
```

---

## Visual Hierarchy

Layer your game properly for depth:

```javascript
// z-index guide
const Z = {
  BG:          -100,   // background gradient
  BG_DECOR:    -50,    // background particles, distant objects
  PLATFORMS:   0,      // ground, platforms
  PICKUPS:     10,     // coins, powerups
  ENEMIES:     20,     // enemies
  PLAYER:      30,     // player
  PARTICLES:   50,     // effects, particles
  HUD:         100,    // score, lives, UI
}

// usage
add([sprite("bg"), z(Z.BG)])
add([sprite("platform-md"), pos(100, 400), z(Z.PLATFORMS)])
add([sprite("coin"), pos(200, 350), z(Z.PICKUPS)])
add([sprite("player"), pos(100, 350), z(Z.PLAYER)])
add([text("Score: 0"), pos(20, 20), fixed(), z(Z.HUD)])
```

---

## Premium Game Juice (Advanced Effects)

These effects elevate a game from "functional" to "would pay for it."

### Squash & Stretch (Movement Feel)
Use on any sudden velocity change: jumping, landing, bouncing, dashing, impacts.

```javascript
// add to any moving object
function addSquashStretch(obj) {
  obj.squashStretch = { active: false, time: 0, type: 'squash' }
  obj.onUpdate(() => {
    if (obj.squashStretch.active) {
      obj.squashStretch.time += dt() * 8
      const t = obj.squashStretch.time
      if (t < 1) {
        const dir = obj.scale.x > 0 ? 1 : -1
        if (obj.squashStretch.type === 'squash') {
          // squash: wider, shorter (for impacts, landings)
          obj.scale.x = dir * (1 + 0.2 * Math.sin(t * Math.PI))
          obj.scale.y = 1 - 0.15 * Math.sin(t * Math.PI)
        } else {
          // stretch: taller, thinner (for launches, jumps)
          obj.scale.x = dir * (1 - 0.1 * Math.sin(t * Math.PI))
          obj.scale.y = 1 + 0.15 * Math.sin(t * Math.PI)
        }
      } else {
        obj.squashStretch.active = false
        obj.scale = vec2(obj.scale.x > 0 ? 1 : -1, 1)
      }
    }
  })
}

function triggerSquash(obj, type = 'squash') {
  if (obj.squashStretch) {
    obj.squashStretch.active = true
    obj.squashStretch.time = 0
    obj.squashStretch.type = type
  }
}

// usage examples:
// - on landing/impact: triggerSquash(obj, 'squash')
// - on jump/launch: triggerSquash(obj, 'stretch')
// - on bounce: triggerSquash(obj, 'squash')
// - on dash start: triggerSquash(obj, 'stretch')
```

### Impact Particles (Surface/Collision Feedback)
Use on any collision, landing, bounce, or surface interaction.

```javascript
function impactParticles(position, direction = 90, col = [200, 200, 210]) {
  for (let i = 0; i < 6; i++) {
    const angle = direction + rand(-40, 40)
    add([
      circle(rand(2, 4)),
      pos(position.x + rand(-8, 8), position.y + rand(-4, 4)),
      color(col[0], col[1], col[2]),
      opacity(rand(0.4, 0.7)),
      move(angle, rand(30, 80)),
      lifespan(rand(0.2, 0.4), { fade: 0.15 }),
      scale(1),
      z(25),
    ])
  }
}

// usage examples:
// - landing: impactParticles(pos, 90)  // spread sideways
// - wall hit: impactParticles(pos, 180)  // spread away from wall
// - explosion: impactParticles(pos, rand(0,360))  // random directions
// - footsteps: impactParticles(pos, 270, [150,130,100])  // dirt colored
```

### Floating Score Text (+1 Effect)
```javascript
function floatingText(position, txt, col) {
  const ft = add([
    text(txt, { size: 18 }),
    pos(position.x, position.y - 10),
    anchor("center"),
    color(col[0], col[1], col[2]),
    opacity(1),
    z(60),
  ])
  ft.onUpdate(() => {
    ft.pos.y -= 60 * dt()
    ft.opacity -= 1.5 * dt()
    if (ft.opacity <= 0) destroy(ft)
  })
}

// usage on coin collect
floatingText(coin.pos, "+1", hexToRgb(P.coinLight))
```

### HUD Bounce Reaction
```javascript
// store reference to HUD element
const hudCoin = add([sprite("coin"), pos(28, 28), scale(0.9), fixed(), z(100)])

// on coin collect, bounce the HUD coin
function hudBounce(element, targetScale = 0.9) {
  element.scale = vec2(1.3)
  wait(0.1, () => element.scale = vec2(targetScale))
}

// usage
player.onCollide("coin", (c) => {
  hudBounce(hudCoin)
  // ... rest of collect logic
})
```

### Premium Positive Event (Collect/Score/Win)
Stack these effects for any rewarding moment.

```javascript
function positiveEventEffect(position, value = 1, col = [255, 220, 100]) {
  // 1. particle burst (color matches the reward)
  burstParticles(position, col, 14)

  // 2. floating text showing value gained
  floatingText(position, `+${value}`, col)

  // 3. screen flash (brief, warm color)
  flash(Color.fromArray(col), 0.08)

  // 4. tiny screen shake (satisfaction, not jarring)
  shake(2)

  // 5. HUD element reaction (if applicable)
  // hudBounce(relevantHudElement)
}

// usage examples:
// - coin collect: positiveEventEffect(coin.pos, 1, [255, 215, 0])
// - enemy kill: positiveEventEffect(enemy.pos, 100, [100, 255, 100])
// - power-up: positiveEventEffect(item.pos, 0, [150, 150, 255])  // no number
// - combo: positiveEventEffect(pos, combo, [255, 100, 255])

// IMPORTANT: never use `const rgb = ...` as variable name
// it conflicts with KAPLAY's rgb() function
// use `const c = hexToRgb(...)` instead
```

### Premium Negative Event (Damage/Death/Fail)
Stack these effects for any punishing moment.

```javascript
function negativeEventEffect(position, col = [255, 100, 100]) {
  // 1. big shake (impact/pain)
  shake(20)

  // 2. color flash (warning color)
  flash(Color.fromArray(col), 0.2)

  // 3. particle explosion
  const c = col  // NOT: const rgb = ...
  for (let i = 0; i < 20; i++) {
    add([
      circle(rand(5, 12)),
      pos(position),
      color(c[0], c[1], c[2]),
      opacity(1),
      move(rand(0, 360), rand(150, 350)),
      lifespan(rand(0.4, 0.7), { fade: 0.25 }),
      scale(rand(0.8, 1.3)),
      z(55),
    ])
  }

  // 4. white core flash (impact point)
  add([
    circle(30),
    pos(position),
    color(255, 255, 255),
    opacity(0.9),
    lifespan(0.2, { fade: 0.15 }),
    z(56),
  ])
}

// usage examples:
// - player death: negativeEventEffect(player.pos, [255, 80, 80])
// - take damage: negativeEventEffect(player.pos, [255, 150, 50])  // smaller shake
// - enemy explosion: negativeEventEffect(enemy.pos, [255, 100, 50])
// - obstacle hit: negativeEventEffect(pos, [200, 200, 200])
```

---

## Universal Sprite Layer Checklist

Every game object sprite needs **5+ visual layers**. Here's the universal formula:

| Layer | Purpose | Examples |
|-------|---------|----------|
| 1. **Glow/Aura** | Makes object pop from background | Radial gradient extending beyond shape |
| 2. **Shadow** | Grounds object in space | Drop shadow or ambient occlusion underneath |
| 3. **Body Gradient** | Adds dimension (not flat) | 3-5 color stops, light source from top-left |
| 4. **Edge Treatment** | Defines silhouette | Highlight on light side, shadow on dark side |
| 5. **Surface Detail** | Adds character/texture | Patterns, symbols, texture lines, facial features |
| 6. **Highlights/Shine** | Sells material (metal, glass, organic) | Specular spots, shine streaks |
| 7. **Accents** | Extra polish | Sparkles, secondary colors, small details |

### Apply By Object Role

| Role | Key Layers to Emphasize |
|------|------------------------|
| **Player/Hero** | Strong glow (visibility), expressive details (connection), clear silhouette |
| **Collectibles** | Bright glow (attraction), shine/sparkle (value), animated shimmer |
| **Enemies/Hazards** | Warning glow (danger), aggressive details, high contrast |
| **Environment** | Texture detail (believability), subtle gradient, structural lines |
| **Projectiles** | Core glow (tracking), motion blur suggestion, bright center |
| **UI Elements** | Clean edges, readable contrast, subtle depth |

**Quality test**: If you can recreate the sprite with just `rect()` + one `color()`, it's not premium enough.

---

## Quick Start Pattern

Combine everything for a polished game setup:

```javascript
// 1. pick palette
const P = PASTEL

// 2. generate sprites
loadSprite("player", makePlayerSprite(48, P))
loadSprite("coin", makeCoinSprite(32, P))
loadSprite("spike", makeSpikeSprite(32, P))
loadSprite("platform", makePlatformSprite(140, 24, P))
loadSprite("enemy", makeEnemySprite(48, P))
loadSprite("bg", makeGradientBg(P.bgLight, P.bg))

// 3. in scene setup
scene("game", () => {
  // background
  add([sprite("bg"), pos(0,0), z(-100)])

  // ambient particles
  loop(0.4, spawnAmbientParticle)

  // player with breathing
  const player = add([sprite("player"), pos(100, 400), area(), body(), z(30)])
  addBreathing(player)

  // coins with float
  const coin = add([sprite("coin"), pos(300, 350), area(), z(10), "coin"])
  addFloat(coin)

  // collect with particles
  player.onCollide("coin", (c) => {
    burstParticles(c.pos, P.coin)
    destroy(c)
  })
})
```
