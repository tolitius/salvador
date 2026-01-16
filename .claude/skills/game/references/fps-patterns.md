# FPS Game Patterns Reference

Patterns for first-person shooter games using Three.js. Use when user requests FPS, first-person, or shooter-style games.

---

## Pointer Lock API (Mouse Capture)

Essential for FPS mouse look. **Critical**: must handle focus loss recovery.

```javascript
let isPointerLocked = false

// request pointer lock on click
renderer.domElement.addEventListener('click', () => {
  if (!isPointerLocked) {
    renderer.domElement.requestPointerLock()
  }
})

// track lock state
document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === renderer.domElement
})

// CRITICAL: re-request on window focus (handles alt-tab)
window.addEventListener('focus', () => {
  // small delay prevents browser blocking the request
  if (!isPointerLocked && gameStarted && !gameOver) {
    setTimeout(() => {
      renderer.domElement.requestPointerLock()
    }, 100)
  }
})

// also re-request on click when lost
document.addEventListener('click', () => {
  if (!isPointerLocked && gameStarted && !gameOver) {
    renderer.domElement.requestPointerLock()
  }
})
```

---

## First-Person Camera Controls

Classic DOOM-style: horizontal mouse look only (no vertical tilt).

```javascript
let playerYaw = 0  // horizontal rotation in radians
const MOUSE_SENSITIVITY = 0.002

document.addEventListener('mousemove', (e) => {
  if (!isPointerLocked) return

  // horizontal look only (classic FPS)
  playerYaw -= e.movementX * MOUSE_SENSITIVITY
})

// in game loop: update camera from yaw
function updateCamera() {
  // camera follows player position
  camera.position.x = player.x
  camera.position.y = player.eyeHeight  // e.g. 1.6 units
  camera.position.z = player.z

  // apply yaw rotation
  camera.rotation.y = playerYaw

  // calculate forward direction for movement
  const forward = new THREE.Vector3(
    -Math.sin(playerYaw),
    0,
    -Math.cos(playerYaw)
  )
  const right = new THREE.Vector3(
    Math.cos(playerYaw),
    0,
    -Math.sin(playerYaw)
  )

  return { forward, right }
}
```

### Movement with WASD

```javascript
const MOVE_SPEED = 5.0

function updateMovement(delta) {
  const { forward, right } = updateCamera()

  let moveX = 0, moveZ = 0

  if (keys['KeyW']) { moveX += forward.x; moveZ += forward.z }
  if (keys['KeyS']) { moveX -= forward.x; moveZ -= forward.z }
  if (keys['KeyA']) { moveX -= right.x; moveZ -= right.z }
  if (keys['KeyD']) { moveX += right.x; moveZ += right.z }

  // normalize diagonal movement
  const len = Math.sqrt(moveX * moveX + moveZ * moveZ)
  if (len > 0) {
    moveX = (moveX / len) * MOVE_SPEED * delta
    moveZ = (moveZ / len) * MOVE_SPEED * delta
  }

  // apply with collision check
  const newX = player.x + moveX
  const newZ = player.z + moveZ

  if (!checkWallCollision(newX, player.z, player.radius)) {
    player.x = newX
  }
  if (!checkWallCollision(player.x, newZ, player.radius)) {
    player.z = newZ
  }
}
```

---

## Billboard Sprites (DOOM-Style Enemies)

Sprites that always face the camera, staying upright.

```javascript
function createBillboardSprite(texture, width, height) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(width, height, 1)
  return sprite
}

// in game loop: make all sprites face camera
function updateBillboards() {
  enemies.forEach(enemy => {
    // only rotate on Y axis (stay upright)
    enemy.sprite.material.rotation = 0

    // alternative: manual lookAt with locked Y
    const lookPos = camera.position.clone()
    lookPos.y = enemy.sprite.position.y
    enemy.sprite.lookAt(lookPos)
  })
}
```

### Procedural Canvas Texture for Sprites

```javascript
function createEnemyTexture(animState = 'idle', walkPhase = 0) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  // clear
  ctx.clearRect(0, 0, 64, 64)

  // draw based on animation state
  if (animState === 'idle') {
    drawEnemyIdle(ctx)
  } else if (animState === 'walk') {
    drawEnemyWalk(ctx, walkPhase)
  } else if (animState === 'shoot') {
    drawEnemyShoot(ctx)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// update sprite texture when animation state changes
function updateEnemyAnimation(enemy, delta) {
  if (enemy.state === 'walk') {
    enemy.walkPhase += delta * 8
    enemy.sprite.material.map = createEnemyTexture('walk', enemy.walkPhase)
    enemy.sprite.material.needsUpdate = true
  }
}
```

---

## Hit Detection (2D XZ Plane)

For classic FPS, ignore Y-axis (vertical). Check if enemy is within cone-of-fire.

```javascript
function checkHit(shooterPos, shooterYaw, targetPos, coneAngle = 0.15) {
  // direction to target (ignore Y)
  const dx = targetPos.x - shooterPos.x
  const dz = targetPos.z - shooterPos.z
  const dist = Math.sqrt(dx * dx + dz * dz)

  if (dist < 0.1) return { hit: false }  // too close

  // angle to target
  const angleToTarget = Math.atan2(-dx, -dz)

  // normalize angle difference to [-PI, PI]
  let angleDiff = angleToTarget - shooterYaw
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

  // check if within cone
  const hit = Math.abs(angleDiff) < coneAngle

  return { hit, distance: dist, angleDiff }
}

// usage: find closest enemy in crosshairs
function findTarget(player, enemies, maxRange = 20) {
  let closest = null
  let closestDist = maxRange

  for (const enemy of enemies) {
    if (enemy.dead) continue

    const result = checkHit(
      { x: player.x, z: player.z },
      playerYaw,
      { x: enemy.x, z: enemy.z },
      0.12  // cone half-angle in radians
    )

    if (result.hit && result.distance < closestDist) {
      // verify line of sight
      if (hasLineOfSight(player, enemy)) {
        closest = enemy
        closestDist = result.distance
      }
    }
  }

  return closest
}
```

---

## Line of Sight Check

Prevents shooting/seeing through walls. Step along ray checking collisions.

```javascript
function hasLineOfSight(from, to) {
  const dx = to.x - from.x
  const dz = to.z - from.z
  const dist = Math.sqrt(dx * dx + dz * dz)

  if (dist < 0.1) return true  // same position

  // normalize direction
  const dirX = dx / dist
  const dirZ = dz / dist

  // step along ray
  const stepSize = 0.5  // smaller = more accurate, slower
  const steps = Math.floor(dist / stepSize)

  for (let i = 1; i < steps; i++) {
    const checkX = from.x + dirX * stepSize * i
    const checkZ = from.z + dirZ * stepSize * i

    if (checkWallCollision(checkX, checkZ, 0.1)) {
      return false  // wall blocks view
    }
  }

  return true
}

// use for AI shooting decisions
function enemyCanShoot(enemy, player) {
  // check range
  const dx = player.x - enemy.x
  const dz = player.z - enemy.z
  const dist = Math.sqrt(dx * dx + dz * dz)

  if (dist > enemy.attackRange) return false

  // check line of sight
  return hasLineOfSight(enemy, player)
}
```

---

## Wall Collision Detection

Grid-based map collision for FPS levels.

```javascript
// map: 2D array where 1 = wall, 0 = empty
const MAP = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1],
]
const TILE_SIZE = 4  // world units per tile

function checkWallCollision(x, z, radius = 0.5) {
  // check corners of bounding box
  const offsets = [
    [-radius, -radius],
    [radius, -radius],
    [-radius, radius],
    [radius, radius],
  ]

  for (const [ox, oz] of offsets) {
    const tileX = Math.floor((x + ox) / TILE_SIZE)
    const tileZ = Math.floor((z + oz) / TILE_SIZE)

    // out of bounds = wall
    if (tileZ < 0 || tileZ >= MAP.length) return true
    if (tileX < 0 || tileX >= MAP[0].length) return true

    if (MAP[tileZ][tileX] === 1) return true
  }

  return false
}
```

---

## Spawn Validation

Ensure entities spawn in valid locations, not inside walls.

```javascript
function findValidSpawnPosition(preferredX, preferredZ, radius = 0.8) {
  // try preferred position first
  if (!checkWallCollision(preferredX, preferredZ, radius)) {
    return { x: preferredX, z: preferredZ }
  }

  // spiral outward to find valid spot
  const offsets = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [2, 0], [-2, 0], [0, 2], [0, -2],
  ]

  for (const [ox, oz] of offsets) {
    const testX = preferredX + ox * TILE_SIZE
    const testZ = preferredZ + oz * TILE_SIZE

    if (!checkWallCollision(testX, testZ, radius)) {
      return { x: testX, z: testZ }
    }
  }

  // fallback: return center of a known empty tile
  return findEmptyTileCenter()
}

function isValidSpawnPosition(x, z, radius = 0.8) {
  return !checkWallCollision(x, z, radius)
}

// usage when spawning enemies
function spawnEnemy(x, z) {
  const pos = findValidSpawnPosition(x, z)
  const enemy = createEnemy()
  enemy.x = pos.x
  enemy.z = pos.z
  enemies.push(enemy)
}
```

---

## Weapon Rendering (Canvas Overlay)

Draw weapon at bottom center of screen with recoil animation.

```javascript
const weaponState = {
  recoil: 0,       // current recoil offset (0-1)
  recoilSpeed: 15, // how fast recoil recovers
}

function drawWeapon(ctx, canvasWidth, canvasHeight) {
  const centerX = canvasWidth / 2
  const baseY = canvasHeight - 100

  // apply recoil (moves weapon down when firing)
  const recoilOffset = weaponState.recoil * 30
  const weaponY = baseY + recoilOffset

  ctx.save()
  ctx.translate(centerX, weaponY)

  // draw weapon pointing forward (not sideways!)
  // barrel
  ctx.fillStyle = '#444'
  ctx.fillRect(-8, -80, 16, 60)

  // body
  ctx.fillStyle = '#333'
  ctx.fillRect(-20, -20, 40, 50)

  // grip
  ctx.fillStyle = '#5c3a21'
  ctx.fillRect(-12, 30, 24, 40)

  // highlights for 3D effect
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(-6, -75, 4, 50)

  ctx.restore()
}

// trigger recoil on fire
function fireWeapon() {
  weaponState.recoil = 1.0
  // ... hit detection, etc
}

// recover recoil in game loop
function updateWeapon(delta) {
  if (weaponState.recoil > 0) {
    weaponState.recoil -= weaponState.recoilSpeed * delta
    if (weaponState.recoil < 0) weaponState.recoil = 0
  }
}
```

### Muzzle Flash

```javascript
let muzzleFlashTimer = 0

function fireMuzzleFlash() {
  muzzleFlashTimer = 0.05  // 50ms flash
}

function drawMuzzleFlash(ctx, centerX, weaponY) {
  if (muzzleFlashTimer <= 0) return

  ctx.save()
  ctx.translate(centerX, weaponY - 90)

  // bright yellow/orange flash
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40)
  grad.addColorStop(0, 'rgba(255, 255, 200, 1)')
  grad.addColorStop(0.3, 'rgba(255, 200, 50, 0.8)')
  grad.addColorStop(1, 'rgba(255, 100, 0, 0)')

  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(0, 0, 40, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function updateMuzzleFlash(delta) {
  if (muzzleFlashTimer > 0) {
    muzzleFlashTimer -= delta
  }
}
```

---

## Enemy AI State Machine

Enemies with distinct idle/walk/shoot states and animations.

```javascript
function createEnemy(x, z) {
  return {
    x, z,
    health: 100,
    state: 'idle',      // 'idle', 'walk', 'shoot', 'dead'
    stateTimer: 0,
    walkPhase: 0,       // for leg animation
    attackCooldown: 0,
    sprite: null,       // Three.js sprite reference

    // config
    speed: 2.5,
    attackRange: 15,
    attackRate: 1.5,    // seconds between shots
    damage: 10,
    detectionRange: 20,
  }
}

function updateEnemy(enemy, player, delta) {
  if (enemy.state === 'dead') return

  enemy.attackCooldown -= delta

  const dx = player.x - enemy.x
  const dz = player.z - enemy.z
  const distToPlayer = Math.sqrt(dx * dx + dz * dz)

  const canSeePlayer = distToPlayer < enemy.detectionRange &&
                       hasLineOfSight(enemy, player)

  switch (enemy.state) {
    case 'idle':
      if (canSeePlayer) {
        enemy.state = 'walk'
      }
      break

    case 'walk':
      if (!canSeePlayer) {
        enemy.state = 'idle'
        break
      }

      // move toward player
      if (distToPlayer > enemy.attackRange * 0.5) {
        const moveX = (dx / distToPlayer) * enemy.speed * delta
        const moveZ = (dz / distToPlayer) * enemy.speed * delta

        const newX = enemy.x + moveX
        const newZ = enemy.z + moveZ

        if (!checkWallCollision(newX, newZ, 0.4)) {
          enemy.x = newX
          enemy.z = newZ
        }

        // animate legs
        enemy.walkPhase += delta * 8
      }

      // attack if in range and can see player
      if (distToPlayer < enemy.attackRange &&
          enemy.attackCooldown <= 0 &&
          hasLineOfSight(enemy, player)) {
        enemy.state = 'shoot'
        enemy.stateTimer = 0.3  // shoot animation duration
      }
      break

    case 'shoot':
      enemy.stateTimer -= delta

      // fire at start of animation
      if (enemy.stateTimer > 0.25 && enemy.attackCooldown <= 0) {
        enemyFireAtPlayer(enemy, player)
        enemy.attackCooldown = enemy.attackRate
      }

      // return to walk after animation
      if (enemy.stateTimer <= 0) {
        enemy.state = 'walk'
      }
      break
  }

  // update sprite position and animation
  enemy.sprite.position.set(enemy.x, 1.0, enemy.z)
  updateEnemySprite(enemy)
}
```

### Animated Enemy Drawing

```javascript
function drawEnemyCanvas(ctx, state, walkPhase) {
  const cx = 32, cy = 40

  // body
  ctx.fillStyle = '#4a6'
  ctx.beginPath()
  ctx.ellipse(cx, cy - 10, 12, 16, 0, 0, Math.PI * 2)
  ctx.fill()

  // head
  ctx.fillStyle = '#d9a'
  ctx.beginPath()
  ctx.arc(cx, cy - 30, 8, 0, Math.PI * 2)
  ctx.fill()

  if (state === 'walk') {
    // legs with walking animation
    const legSwing = Math.sin(walkPhase) * 6

    ctx.fillStyle = '#345'
    ctx.fillRect(cx - 8, cy + 4, 6, 18)  // left leg
    ctx.fillRect(cx + 2, cy + 4, 6, 18)  // right leg

    // offset legs based on walk phase
    ctx.fillStyle = '#234'
    ctx.fillRect(cx - 7 + legSwing, cy + 20, 5, 4)
    ctx.fillRect(cx + 3 - legSwing, cy + 20, 5, 4)

  } else if (state === 'shoot') {
    // arms raised with weapon
    ctx.fillStyle = '#4a6'
    ctx.fillRect(cx - 20, cy - 15, 10, 5)  // left arm extended
    ctx.fillRect(cx + 10, cy - 15, 10, 5)  // right arm extended

    // weapon
    ctx.fillStyle = '#333'
    ctx.fillRect(cx - 3, cy - 25, 6, 15)

    // muzzle flash hint
    ctx.fillStyle = '#ff0'
    ctx.beginPath()
    ctx.arc(cx, cy - 28, 4, 0, Math.PI * 2)
    ctx.fill()

  } else {
    // idle: arms at sides
    ctx.fillStyle = '#4a6'
    ctx.fillRect(cx - 16, cy - 8, 5, 12)
    ctx.fillRect(cx + 11, cy - 8, 5, 12)

    // legs static
    ctx.fillStyle = '#345'
    ctx.fillRect(cx - 8, cy + 4, 6, 20)
    ctx.fillRect(cx + 2, cy + 4, 6, 20)
  }
}
```

---

## HUD Elements for FPS

### Health Bar with Gradient

```javascript
function drawHealthBar(ctx, current, max, x, y, width, height) {
  const pct = current / max

  // background
  ctx.fillStyle = '#300'
  ctx.fillRect(x, y, width, height)

  // health gradient (green -> yellow -> red)
  const grad = ctx.createLinearGradient(x, 0, x + width * pct, 0)
  if (pct > 0.5) {
    grad.addColorStop(0, '#0a0')
    grad.addColorStop(1, '#4f4')
  } else if (pct > 0.25) {
    grad.addColorStop(0, '#aa0')
    grad.addColorStop(1, '#ff0')
  } else {
    grad.addColorStop(0, '#a00')
    grad.addColorStop(1, '#f44')
  }

  ctx.fillStyle = grad
  ctx.fillRect(x, y, width * pct, height)

  // border
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, width, height)

  // text
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(`${Math.floor(current)}`, x + width / 2, y + height - 4)
}
```

### Minimap

```javascript
function drawMinimap(ctx, player, enemies, mapData, x, y, size) {
  const scale = size / (mapData.length * TILE_SIZE)

  ctx.save()
  ctx.translate(x, y)

  // background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, size, size)

  // walls
  ctx.fillStyle = '#666'
  for (let row = 0; row < mapData.length; row++) {
    for (let col = 0; col < mapData[0].length; col++) {
      if (mapData[row][col] === 1) {
        ctx.fillRect(
          col * TILE_SIZE * scale,
          row * TILE_SIZE * scale,
          TILE_SIZE * scale,
          TILE_SIZE * scale
        )
      }
    }
  }

  // enemies (red dots)
  ctx.fillStyle = '#f00'
  enemies.forEach(e => {
    if (e.state !== 'dead') {
      ctx.beginPath()
      ctx.arc(e.x * scale, e.z * scale, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  // player (green triangle showing direction)
  ctx.save()
  ctx.translate(player.x * scale, player.z * scale)
  ctx.rotate(-playerYaw)
  ctx.fillStyle = '#0f0'
  ctx.beginPath()
  ctx.moveTo(0, -6)
  ctx.lineTo(-4, 4)
  ctx.lineTo(4, 4)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // border
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, size, size)

  ctx.restore()
}
```

---

## Multiple Input Methods

Support both mouse click and keyboard for shooting.

```javascript
// shooting can be triggered by click or space
document.addEventListener('click', () => {
  if (isPointerLocked && !gameOver) {
    shoot()
  }
})

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !gameOver) {
    shoot()
  }
})

// prevent space from scrolling page
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
  }
})
```

---

## Common FPS Pitfalls

1. **Pointer lock not recovering**: Always re-request on focus/click after losing lock
2. **Enemies shoot through walls**: Must check line of sight before allowing attack
3. **Enemies spawn in walls**: Validate spawn positions against collision map
4. **Hit detection uses 3D distance**: Use 2D XZ-plane distance for classic FPS feel
5. **Weapon drawn sideways**: FPS weapons should point forward (vertical barrel), not left-to-right
6. **No weapon feedback**: Always add recoil animation and muzzle flash
7. **Static enemy sprites**: Animate walk (legs) and shoot (arms) states
8. **AI too aggressive**: Balance detection range, attack rate, and damage for playability
