# Game Patterns Reference

Common architectures and patterns for building games.

## Game States (Scene-Based)

Use KAPLAY scenes for distinct game states:

```javascript
// menu -> game -> gameover flow
scene("menu", () => {
  add([
    text("MY GAME", { size: 48 }),
    pos(center().x, 150),
    anchor("center"),
  ])
  
  add([
    text("Press SPACE to play", { size: 24 }),
    pos(center().x, 300),
    anchor("center"),
  ])
  
  add([
    text("Arrow keys: Move | Space: Jump", { size: 16 }),
    pos(center().x, 400),
    anchor("center"),
    color(150, 150, 150),
  ])
  
  onKeyPress("space", () => go("game"))
})

scene("game", () => {
  let score = 0
  // ... game logic
})

scene("gameover", (finalScore) => {
  add([
    text(`GAME OVER`, { size: 48 }),
    pos(center().x, 150),
    anchor("center"),
  ])
  
  add([
    text(`Score: ${finalScore}`, { size: 32 }),
    pos(center().x, 250),
    anchor("center"),
  ])
  
  add([
    text("Press R to restart", { size: 20 }),
    pos(center().x, 350),
    anchor("center"),
  ])
  
  onKeyPress("r", () => go("game"))
})

go("menu")
```

## Pause System

```javascript
let paused = false

onKeyPress("escape", () => {
  paused = !paused
})

onKeyPress("p", () => {
  paused = !paused
})

onUpdate(() => {
  if (paused) return  // skip all updates
  
  // normal game logic here
})

// draw pause overlay
onDraw(() => {
  if (paused) {
    drawRect({
      width: width(),
      height: height(),
      color: rgb(0, 0, 0),
      opacity: 0.5,
    })
    drawText({
      text: "PAUSED",
      size: 48,
      pos: center(),
      anchor: "center",
      color: WHITE,
    })
  }
})
```

## Platformer Pattern

```javascript
scene("game", () => {
  setGravity(1600)
  
  const SPEED = 300
  const JUMP = 550
  
  // player
  const player = add([
    sprite("bean"),
    pos(50, 300),
    area(),
    body(),
    anchor("center"),
    "player",
  ])
  
  // ground
  add([
    rect(width(), 48),
    pos(0, height() - 48),
    area(),
    body({ isStatic: true }),
    color(100, 100, 100),
    "ground",
  ])
  
  // platforms
  function addPlatform(x, y, w) {
    add([
      rect(w, 24),
      pos(x, y),
      area(),
      body({ isStatic: true }),
      color(80, 80, 80),
      "platform",
    ])
  }
  
  addPlatform(200, 400, 150)
  addPlatform(400, 300, 150)
  addPlatform(150, 200, 150)
  
  // controls
  onUpdate(() => {
    if (isKeyDown("left")) player.move(-SPEED, 0)
    if (isKeyDown("right")) player.move(SPEED, 0)
  })
  
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(JUMP)
      play("jump")
    }
  })
  
  // death zone
  player.onUpdate(() => {
    if (player.pos.y > height() + 50) {
      go("gameover", 0)
    }
  })
})
```

## Endless Runner / Scroller

```javascript
scene("game", () => {
  setGravity(1600)
  
  let score = 0
  const SCROLL_SPEED = 300
  
  // player
  const player = add([
    sprite("bean"),
    pos(100, 300),
    area(),
    body(),
    anchor("center"),
    "player",
  ])
  
  // ground (scrolling)
  function spawnGround() {
    add([
      rect(64, 48),
      pos(width(), height() - 48),
      area(),
      body({ isStatic: true }),
      move(LEFT, SCROLL_SPEED),
      offscreen({ destroy: true }),
      "ground",
    ])
  }
  
  // initial ground
  for (let i = 0; i < 20; i++) {
    add([
      rect(64, 48),
      pos(i * 64, height() - 48),
      area(),
      body({ isStatic: true }),
      move(LEFT, SCROLL_SPEED),
      offscreen({ destroy: true }),
      "ground",
    ])
  }
  
  loop(0.2, spawnGround)
  
  // obstacles
  function spawnObstacle() {
    add([
      rect(32, 64),
      pos(width(), height() - 48 - 64),
      area(),
      move(LEFT, SCROLL_SPEED),
      offscreen({ destroy: true }),
      color(RED),
      "obstacle",
    ])
  }
  
  loop(rand(1.5, 3), spawnObstacle)
  
  // jump
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(500)
    }
  })
  
  // collision
  player.onCollide("obstacle", () => {
    go("gameover", score)
  })
  
  // score
  onUpdate(() => {
    score += dt() * 10
  })
})
```

## Top-Down Shooter

```javascript
scene("game", () => {
  // no gravity for top-down
  setGravity(0)
  
  let score = 0
  const SPEED = 200
  
  const player = add([
    circle(16),
    pos(center()),
    area(),
    color(CYAN),
    "player",
  ])
  
  // movement (8-direction)
  onUpdate(() => {
    let dir = vec2(0, 0)
    if (isKeyDown("left")) dir.x -= 1
    if (isKeyDown("right")) dir.x += 1
    if (isKeyDown("up")) dir.y -= 1
    if (isKeyDown("down")) dir.y += 1
    
    if (dir.len() > 0) {
      player.move(dir.unit().scale(SPEED))
    }
  })
  
  // shooting
  function shoot(dir) {
    add([
      circle(6),
      pos(player.pos),
      area(),
      move(dir, 500),
      offscreen({ destroy: true }),
      lifespan(2),
      color(YELLOW),
      "bullet",
    ])
    play("shoot")
  }
  
  onKeyPress("space", () => shoot(vec2(1, 0)))  // right
  onMousePress(() => {
    const dir = mousePos().sub(player.pos).unit()
    shoot(dir)
  })
  
  // enemies
  function spawnEnemy() {
    const edge = choose(["left", "right", "top", "bottom"])
    let p
    switch(edge) {
      case "left": p = vec2(0, rand(0, height())); break
      case "right": p = vec2(width(), rand(0, height())); break
      case "top": p = vec2(rand(0, width()), 0); break
      case "bottom": p = vec2(rand(0, width()), height()); break
    }
    
    add([
      circle(20),
      pos(p),
      area(),
      color(RED),
      "enemy",
      { speed: rand(50, 150) },
    ])
  }
  
  loop(2, spawnEnemy)
  
  // enemy AI - chase player
  onUpdate("enemy", (e) => {
    const dir = player.pos.sub(e.pos).unit()
    e.move(dir.scale(e.speed))
  })
  
  // collisions
  onCollide("bullet", "enemy", (b, e) => {
    destroy(b)
    destroy(e)
    score += 10
    shake(3)
  })
  
  player.onCollide("enemy", () => {
    go("gameover", score)
  })
})
```

## Puzzle / Match Game

```javascript
scene("game", () => {
  const GRID_SIZE = 8
  const CELL_SIZE = 50
  const COLORS = [RED, BLUE, GREEN, YELLOW, MAGENTA]
  
  let grid = []
  let selected = null
  let score = 0
  
  // create grid
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = []
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = add([
        rect(CELL_SIZE - 4, CELL_SIZE - 4),
        pos(100 + x * CELL_SIZE, 100 + y * CELL_SIZE),
        area(),
        color(choose(COLORS)),
        "cell",
        { gridX: x, gridY: y },
      ])
      grid[y][x] = cell
    }
  }
  
  // click to select
  onClick("cell", (cell) => {
    if (!selected) {
      selected = cell
      cell.use(outline(3, WHITE))
    } else {
      // check if adjacent
      const dx = Math.abs(cell.gridX - selected.gridX)
      const dy = Math.abs(cell.gridY - selected.gridY)
      
      if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        // swap
        const tempColor = cell.color
        cell.color = selected.color
        selected.color = tempColor
        
        // check matches
        checkMatches()
      }
      
      selected.unuse("outline")
      selected = null
    }
  })
  
  function checkMatches() {
    // simplified - check horizontal matches of 3
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 2; x++) {
        const c1 = grid[y][x].color
        const c2 = grid[y][x+1].color
        const c3 = grid[y][x+2].color
        
        if (c1.eq(c2) && c2.eq(c3)) {
          score += 30
          // mark for removal, spawn new, etc.
        }
      }
    }
  }
})
```

## Procedural Generation

### Random Level Layout
```javascript
function generateLevel() {
  const platforms = []
  let y = height() - 100
  let x = 50
  
  while (y > 100) {
    platforms.push({ x, y, width: rand(80, 200) })
    x += rand(100, 250)
    if (x > width() - 100) {
      x = rand(50, 200)
    }
    y -= rand(60, 120)
  }
  
  return platforms
}

scene("game", () => {
  const level = generateLevel()
  
  level.forEach(p => {
    add([
      rect(p.width, 20),
      pos(p.x, p.y),
      area(),
      body({ isStatic: true }),
      color(100, 100, 100),
    ])
  })
})
```

### Roguelike Room Grid
```javascript
const ROOM_SIZE = 10
const TILE_SIZE = 32

function generateDungeon(gridW, gridH) {
  const tiles = []
  
  for (let y = 0; y < gridH; y++) {
    tiles[y] = []
    for (let x = 0; x < gridW; x++) {
      // walls on edges
      if (x === 0 || x === gridW-1 || y === 0 || y === gridH-1) {
        tiles[y][x] = "wall"
      } else {
        tiles[y][x] = "floor"
      }
    }
  }
  
  // random obstacles
  for (let i = 0; i < 10; i++) {
    const x = randi(2, gridW - 2)
    const y = randi(2, gridH - 2)
    tiles[y][x] = "wall"
  }
  
  return tiles
}

scene("game", () => {
  const dungeon = generateDungeon(20, 15)
  
  dungeon.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === "wall") {
        add([
          rect(TILE_SIZE, TILE_SIZE),
          pos(x * TILE_SIZE, y * TILE_SIZE),
          area(),
          body({ isStatic: true }),
          color(60, 60, 60),
          "wall",
        ])
      }
    })
  })
  
  // player
  add([
    rect(TILE_SIZE - 8, TILE_SIZE - 8),
    pos(TILE_SIZE * 2, TILE_SIZE * 2),
    area(),
    body(),
    color(CYAN),
    "player",
  ])
})
```

## HUD Pattern

```javascript
scene("game", () => {
  let score = 0
  let lives = 3
  
  // HUD container (fixed to camera)
  const hud = add([
    fixed(),
    z(100),
  ])
  
  const scoreText = hud.add([
    text("Score: 0", { size: 20 }),
    pos(20, 20),
    color(WHITE),
  ])
  
  const livesText = hud.add([
    text("♥♥♥", { size: 24 }),
    pos(width() - 20, 20),
    anchor("topright"),
    color(RED),
  ])
  
  function updateHUD() {
    scoreText.text = `Score: ${score}`
    livesText.text = "♥".repeat(lives) + "♡".repeat(3 - lives)
  }
  
  function addScore(pts) {
    score += pts
    updateHUD()
  }
  
  function loseLife() {
    lives--
    updateHUD()
    shake(10)
    flash(RED, 0.2)
    
    if (lives <= 0) {
      go("gameover", score)
    }
  }
})
```

## Screen Wrap

```javascript
onUpdate("player", (p) => {
  // wrap horizontally
  if (p.pos.x < 0) p.pos.x = width()
  if (p.pos.x > width()) p.pos.x = 0
  
  // wrap vertically
  if (p.pos.y < 0) p.pos.y = height()
  if (p.pos.y > height()) p.pos.y = 0
})
```

## Object Pooling (Performance)

```javascript
const bulletPool = []

function getBullet() {
  // reuse from pool if available
  const inactive = bulletPool.find(b => !b.active)
  if (inactive) {
    inactive.active = true
    inactive.hidden = false
    return inactive
  }
  
  // create new
  const b = add([
    circle(4),
    pos(0, 0),
    area(),
    color(YELLOW),
    "bullet",
    { active: true },
  ])
  bulletPool.push(b)
  return b
}

function returnBullet(b) {
  b.active = false
  b.hidden = true
  b.pos = vec2(-100, -100)
}
```
