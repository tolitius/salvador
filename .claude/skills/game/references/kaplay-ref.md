# KAPLAY.js Quick Reference (v3001)

Minimal API reference for game development. KAPLAY uses an Entity-Component-System (ECS) pattern.

## Setup

```javascript
// initialize game
kaplay({
  width: 800,
  height: 600,
  background: [20, 20, 30],  // RGB array or hex string "#141420"
  scale: 1,                   // pixel scale
  debug: true,                // show debug info (F1 to toggle)
})
```

## Loading Assets

```javascript
// sprites
loadSprite("player", "sprites/player.png")
loadSprite("enemy", "sprites/enemy.png", {
  sliceX: 4,  // frames per row (for spritesheets)
  sliceY: 1,
  anims: {
    run: { from: 0, to: 3, loop: true, speed: 10 },
  },
})

// built-in sprites (no file needed)
loadBean()  // loads "bean" sprite

// sounds
loadSound("jump", "sounds/jump.wav")
loadSound("hit", "sounds/hit.mp3")

// fonts
loadFont("gameFont", "fonts/game.ttf")
```

## Creating Game Objects

```javascript
// add() creates a game object from components
const player = add([
  sprite("bean"),           // render as sprite
  pos(100, 200),            // position
  area(),                   // collision hitbox
  body(),                   // physics body (affected by gravity)
  health(3),                // HP system
  scale(2),                 // size multiplier
  anchor("center"),         // origin point
  rotate(0),                // rotation in degrees
  opacity(1),               // transparency 0-1
  z(10),                    // layer order (higher = front)
  "player",                 // tag (string = tag)
])

// destroy an object
destroy(player)

// get objects by tag
const enemies = get("enemy")  // returns array
```

## Core Components

### Rendering
```javascript
sprite("name")              // display sprite
sprite("name", { anim: "run" })  // start with animation
rect(width, height)         // rectangle
circle(radius)              // circle
text("Hello", { size: 24 }) // text display
color(255, 0, 0)            // RGB tint
color("#ff0000")            // hex tint
opacity(0.5)                // transparency
```

### Transform
```javascript
pos(x, y)                   // position
pos(vec2(x, y))             // using vector
scale(2)                    // uniform scale
scale(2, 1)                 // non-uniform
rotate(45)                  // degrees
anchor("center")            // "topleft", "center", "botright", etc.
z(100)                      // layer order
```

### Physics
```javascript
area()                      // enables collision
area({ shape: new Rect(vec2(0), 32, 32) })  // custom hitbox
body()                      // affected by gravity, can jump
body({ isStatic: true })    // immovable (platforms, walls)

// gravity (call once at setup)
setGravity(1600)            // pixels per second squared
```

### Physics Formulas (Validate Your Design!)

**Always verify physics allow required gameplay.** Calculate limits before building levels.

**Common formulas:**
```
jump_height = (force)² / (2 × gravity)
range = speed × time
projectile_distance = bullet_speed × lifetime
catch_up_time = distance / (chaser_speed - target_speed)
```

**Example: Vertical movement (jumping, launching)**
| Force | Gravity | Max Height | Notes |
|-------|---------|------------|-------|
| 500   | 1600    | 78px       | Short hop |
| 600   | 1400    | 128px      | Medium jump |
| 680   | 1400    | 165px      | High jump |
| 750   | 1600    | 175px      | Floaty feel |

**GOLDEN RULE**: If the game requires reaching X, verify the physics allow reaching X.

```javascript
// example: physics setup
const SPEED = 300           // movement (pixels/sec) - adjust for game feel
const FORCE = 650           // jump/launch force - calculate max height
const GRAVITY = 1400        // gravity - affects fall speed and jump arc

setGravity(GRAVITY)

// always verify:
// - Can player reach all required targets?
// - Can player dodge all avoidable hazards?
// - Is movement speed balanced vs enemy/obstacle speed?
```

### Gameplay
```javascript
health(maxHp)               // adds hp, hurt(), heal(), onDeath()
lifespan(seconds)           // auto-destroy after time (REQUIRES opacity() component)
offscreen({ destroy: true }) // destroy when off screen
```

## Object Methods

```javascript
// movement
player.pos = vec2(100, 200)
player.move(speed, 0)       // move by velocity (pixels/sec)
player.moveTo(x, y, speed)  // move toward point

// physics body methods
player.jump(600)            // jump force
player.isGrounded()         // on ground?

// sprite animation
player.play("run")          // play animation
player.stop()               // stop animation

// health
player.hurt(1)              // take damage
player.heal(1)              // restore health
player.hp                   // current HP

// collision area
player.isColliding(other)   // boolean check
player.isHovering()         // mouse over?

// destruction
player.destroy()
```

## Input Handling

```javascript
// keyboard - event based
onKeyPress("space", () => { player.jump(600) })
onKeyDown("right", () => { player.move(200, 0) })
onKeyRelease("shift", () => { /* ... */ })

// keyboard - polling
if (isKeyDown("left")) { player.move(-200, 0) }
if (isKeyPressed("space")) { /* just pressed this frame */ }

// mouse
onMousePress(() => { /* click */ })
onMouseMove((pos) => { /* pos is vec2 */ })
onClick("enemy", (e) => { destroy(e) })  // click on tagged object
mousePos()  // returns vec2

// common key names:
// "left", "right", "up", "down" (arrow keys)
// "space", "enter", "escape", "shift", "control"
// "a"-"z", "0"-"9"
```

## Collision

```javascript
// between specific objects
player.onCollide("enemy", (enemy) => {
  player.hurt(1)
  destroy(enemy)
})

// between tags (global)
onCollide("bullet", "enemy", (bullet, enemy) => {
  destroy(bullet)
  destroy(enemy)
  addScore(10)
})

// continuous collision (while overlapping)
player.onCollideUpdate("lava", () => {
  player.hurt(0.1)
})

// collision end
player.onCollideEnd("platform", () => { /* left platform */ })
```

## Scenes

```javascript
// define scenes
scene("menu", () => {
  add([
    text("Press SPACE to start", { size: 32 }),
    pos(center()),
    anchor("center"),
  ])
  onKeyPress("space", () => go("game"))
})

scene("game", () => {
  // game logic here
})

scene("gameover", (score) => {
  add([
    text(`Game Over! Score: ${score}`, { size: 32 }),
    pos(center()),
    anchor("center"),
  ])
  onKeyPress("r", () => go("game"))
})

// start first scene
go("menu")

// switch scenes (can pass data)
go("gameover", score)
```

## Game Loop

```javascript
// runs every frame (~60fps)
onUpdate(() => {
  // game logic
  score += dt()  // dt() = delta time in seconds
})

// update for tagged objects
onUpdate("enemy", (e) => {
  e.move(-100, 0)  // move all enemies left
})

// timer
wait(2, () => { /* runs after 2 seconds */ })

// repeating timer
loop(1, () => { spawnEnemy() })  // every 1 second
```

## Common Utilities

```javascript
// vectors
vec2(x, y)                  // create vector
center()                    // center of screen (vec2)
width()                     // canvas width
height()                    // canvas height
mousePos()                  // mouse position (vec2)

// random
rand(10, 20)                // random float 10-20
randi(0, 10)                // random int 0-9
choose([a, b, c])           // random element
chance(0.5)                 // 50% true

// math
lerp(a, b, t)               // linear interpolation
map(v, a, b, c, d)          // remap value range
clamp(v, min, max)          // constrain value
wave(lo, hi, t)             // sine wave between lo-hi

// time
time()                      // seconds since start
dt()                        // delta time (use for movement)

// debug
debug.log("message")        // on-screen log
debug.inspect = true        // show object info
```

## Screen Effects

```javascript
shake(5)                    // camera shake (intensity)
flash(WHITE, 0.1)           // screen flash (color, duration)

// camera
camPos(x, y)                // move camera
camScale(2)                 // zoom
camRot(10)                  // rotate camera
```

## Audio

```javascript
play("jump")                // play sound
play("music", { loop: true, volume: 0.5 })

const music = play("bgm", { loop: true })
music.pause()
music.play()
music.stop()
```

## Text

```javascript
add([
  text("Score: 0", {
    size: 24,
    font: "gameFont",       // or "monospace" (default)
    width: 300,             // wrap width
    align: "center",        // "left", "center", "right"
  }),
  pos(10, 10),
  color(WHITE),
  fixed(),                  // ignores camera (for HUD)
  z(100),                   // always on top
])

// update text
const scoreText = add([text("0"), pos(10,10), { value: 0 }])
scoreText.text = `Score: ${score}`
```

## Common Patterns

### Player Controller
```javascript
const SPEED = 300
const JUMP = 600

const player = add([
  sprite("bean"),
  pos(100, 100),
  area(),
  body(),
  anchor("center"),
  "player",
])

onUpdate(() => {
  if (isKeyDown("left")) player.move(-SPEED, 0)
  if (isKeyDown("right")) player.move(SPEED, 0)
})

onKeyPress("space", () => {
  if (player.isGrounded()) player.jump(JUMP)
})
```

### Spawning Enemies
```javascript
function spawnEnemy() {
  add([
    rect(32, 32),
    pos(width(), rand(0, height())),
    area(),
    color(RED),
    move(LEFT, 200),        // move component
    offscreen({ destroy: true }),
    "enemy",
  ])
}

loop(1.5, spawnEnemy)
```

### Score System
```javascript
let score = 0

const scoreLabel = add([
  text("0"),
  pos(24, 24),
  fixed(),
  z(100),
])

function addScore(pts) {
  score += pts
  scoreLabel.text = score.toString()
}

onCollide("player", "coin", (p, c) => {
  destroy(c)
  addScore(10)
  play("coin")
})
```

### Game Over
```javascript
player.onDeath(() => {
  destroy(player)
  shake(20)
  flash(RED, 0.3)
  wait(1, () => go("gameover", score))
})
```

## Colors (Built-in Constants)

```javascript
WHITE    // rgb(255, 255, 255)
BLACK    // rgb(0, 0, 0)
RED      // rgb(255, 0, 0)
GREEN    // rgb(0, 255, 0)
BLUE     // rgb(0, 0, 255)
YELLOW   // rgb(255, 255, 0)
MAGENTA  // rgb(255, 0, 255)
CYAN     // rgb(0, 255, 255)

// custom colors
color(100, 150, 200)        // RGB
color("#64c896")            // hex
rgb(100, 150, 200)          // same as color()
```

## Visual Polish (CRITICAL)

**NEVER use bare `rect()`, `circle()`, `polygon()` for game objects.** See `visual-assets.md` for procedural sprite generators.

### Procedural Sprites
Generate sprites at runtime using Canvas API:
```javascript
// see visual-assets.md for full implementations
loadSprite("player", makePlayerSprite(48, PALETTE))
loadSprite("coin", makeCoinSprite(32, PALETTE))
loadSprite("spike", makeSpikeSprite(32, PALETTE))
loadSprite("platform", makePlatformSprite(140, 24, PALETTE))
loadSprite("enemy", makeEnemySprite(48, PALETTE))
loadSprite("bg", makeGradientBg(topColor, bottomColor))
```

### Color Palettes
Use predefined palettes (see `visual-assets.md`):
- `PASTEL` - friendly, casual games
- `PICO8` - retro pixel art
- `ENDESGA` - modern indie
- `NEON` - cyberpunk arcade

### Idle Animations
Keep objects alive with micro-animations:
```javascript
// bobbing (coins, pickups)
function addFloat(obj, amplitude = 3, speed = 2) {
  const startY = obj.pos.y
  obj.onUpdate(() => {
    obj.pos.y = startY + Math.sin(time() * speed) * amplitude
  })
}

// breathing (player, enemies)
function addBreathing(obj, range = 0.04, speed = 1.5) {
  obj.onUpdate(() => {
    const pulse = 1 + Math.sin(time() * speed) * range
    obj.scale = vec2(pulse, pulse)
  })
}

// spinning (stars, pickups)
function addSpin(obj, speed = 60) {
  obj.onUpdate(() => { obj.angle += speed * dt() })
}
```

### Particle Effects
Add visual feedback to interactions:
```javascript
// burst on pickup
function burstParticles(position, col, count = 8) {
  for (let i = 0; i < count; i++) {
    add([
      circle(rand(3, 6)),
      pos(position),
      color(col),
      opacity(1),
      move(rand(0, 360), rand(80, 180)),
      lifespan(0.4, { fade: 0.25 }),
      scale(1),
    ])
  }
}

// explosion on death
function deathExplosion(position, col) {
  shake(15)
  flash(col, 0.15)
  // spawn 12+ particles spreading outward
}
```

### Z-Index Hierarchy
Layer objects for visual depth:
```javascript
const Z = {
  BG:         -100,  // gradient background
  BG_DECOR:   -50,   // ambient particles
  PLATFORMS:  0,     // ground, walls
  PICKUPS:    10,    // coins, powerups
  ENEMIES:    20,    // enemies
  PLAYER:     30,    // player character
  PARTICLES:  50,    // effects
  HUD:        100,   // UI (also use fixed())
}
```

---

## Common KAPLAY Pitfalls

### Variable Naming Conflicts
KAPLAY exposes global functions like `rgb()`, `vec2()`, `color()`. **Never shadow them:**

```javascript
// ❌ BAD - shadows KAPLAY's rgb() function
const rgb = hexToRgb(palette.danger)
flash(rgb(255, 0, 0), 0.2)  // ERROR: rgb is now an array, not a function

// ✅ GOOD - use different variable name
const c = hexToRgb(palette.danger)
flash(Color.fromArray([255, 0, 0]), 0.2)  // works
```

**Safe variable names for colors**: `c`, `col`, `clr`, `rgbArr`, `colorArr`

### Other Reserved Names to Avoid
- `pos` - use `position` or `p`
- `color` - use `col` or `clr`
- `scale` - use `s` or `scl`
- `text` - use `txt` or `label`
- `time` - use `t` or `elapsed`
- `add` - use `spawn` or `create`

### Component Requirements
```javascript
// lifespan requires opacity
add([circle(5), lifespan(0.5)])  // ❌ won't fade
add([circle(5), opacity(1), lifespan(0.5, {fade: 0.3})])  // ✅ fades out

// body requires area for collision
add([sprite("enemy"), body()])  // ❌ no collision
add([sprite("enemy"), area(), body()])  // ✅ has collision
```

### Styled Text Brackets
Brackets in text() trigger styled text parser and crash:
```javascript
// ❌ BAD - crashes with styled text parser error
text("[1] Select option")

// ✅ GOOD
text("Press 1 to select")
```

### Negative String Repeat
String.repeat() crashes with negative values:
```javascript
// ❌ BAD - crashes if health goes below 0
"♥".repeat(health)

// ✅ GOOD
"♥".repeat(Math.max(0, health))
```

### onUpdate Overwrites Tweens
Animations in onUpdate() overwrite tween values:
```javascript
// ❌ BAD - shimmer overwrites fade tween, fade never completes
onUpdate(() => {
  if (waveActive) {
    point.opacity = 0.5 + Math.sin(time()) * 0.3
  }
})
tween(point.opacity, 0, 0.5, (v) => point.opacity = v)

// ✅ GOOD - stop animation before fading
waveActive = false
tween(point.opacity, 0, 0.5, (v) => point.opacity = v)
```
