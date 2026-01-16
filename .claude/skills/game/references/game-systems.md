# Game Systems Reference

Reusable patterns for difficulty scaling, scoring, persistence, and UI across all game types.

---

## Difficulty System (10 Levels)

Scalable difficulty that players can select. Use linear interpolation across parameters.

### Difficulty Configuration

```javascript
const DIFFICULTY_NAMES = [
  '',           // index 0 unused
  'ROOKIE',     // 1 - easiest
  'EASY',       // 2
  'CASUAL',     // 3
  'NORMAL',     // 4
  'MODERATE',   // 5
  'CHALLENGING',// 6
  'HARD',       // 7
  'VETERAN',    // 8
  'NIGHTMARE',  // 9
  'IMPOSSIBLE', // 10 - hardest
]

let currentDifficulty = 5  // default to MODERATE

function getDifficultyConfig(level) {
  // t ranges from 0 (level 1) to 1 (level 10)
  const t = (level - 1) / 9

  return {
    // enemy parameters (scale up with difficulty)
    enemyCount: Math.floor(lerp(5, 20, t)),
    enemyHealth: Math.floor(lerp(30, 100, t)),
    enemySpeed: lerp(1.5, 4.0, t),
    enemyDamage: Math.floor(lerp(5, 20, t)),
    enemyAttackRange: lerp(10, 25, t),
    enemyAttackRate: lerp(2.5, 1.0, t),  // lower = faster (inverse)
    enemyAccuracy: lerp(0.4, 0.9, t),

    // player parameters (scale down with difficulty)
    playerHealth: Math.floor(lerp(150, 80, t)),
    playerDamage: Math.floor(lerp(40, 25, t)),

    // scoring multiplier (reward harder difficulties)
    scoreMultiplier: lerp(0.5, 2.5, t),

    // spawn timing
    spawnInterval: lerp(5.0, 2.0, t),  // seconds between spawns
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}
```

### Difficulty Selector UI (HTML/CSS)

```html
<div id="difficulty-selector">
  <div class="difficulty-label">
    <span id="diff-name">MODERATE</span>
    <span id="diff-level">5</span>
  </div>
  <input type="range" id="diff-slider" class="difficulty-slider"
         min="1" max="10" value="5">
</div>
```

```css
#difficulty-selector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 100;
}

.difficulty-label {
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

#diff-level {
  font-size: 48px;
  font-weight: bold;
  display: block;
  color: #f44;
}

/* styled range slider */
.difficulty-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 280px;
  height: 12px;
  background: linear-gradient(to right,
    #004400 0%, #114411 10%,
    #333300 40%, #554400 50%,
    #663300 70%, #880000 90%, #aa0000 100%
  );
  border-radius: 6px;
  border: 2px solid #333;
  outline: none;
  cursor: pointer;
}

.difficulty-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000 50%, #880000);
  border: 3px solid #ff4444;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
  transition: transform 0.1s ease;
}

.difficulty-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
}

.difficulty-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  background: radial-gradient(circle at 30% 30%, #ff6666, #cc0000 50%, #880000);
  border: 3px solid #ff4444;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
}
```

```javascript
const slider = document.getElementById('diff-slider')
const diffName = document.getElementById('diff-name')
const diffLevel = document.getElementById('diff-level')

slider.addEventListener('input', (e) => {
  const level = parseInt(e.target.value)
  currentDifficulty = level
  diffName.textContent = DIFFICULTY_NAMES[level]
  diffLevel.textContent = level
})
```

---

## Scoring System

**Key principle**: Live score during gameplay should only increase. Time bonuses and penalties are calculated at the end.

### Live Score (During Gameplay)

```javascript
const scoreState = {
  kills: 0,
  shotsHit: 0,
  shotsFired: 0,
  pickups: 0,
}

function calculateLiveScore() {
  const cfg = getDifficultyConfig(currentDifficulty)

  // only additive factors during gameplay
  const killPoints = scoreState.kills * 500
  const hitPoints = scoreState.shotsHit * 50
  const pickupPoints = scoreState.pickups * 100

  const rawScore = killPoints + hitPoints + pickupPoints
  return Math.floor(rawScore * cfg.scoreMultiplier)
}

// update HUD with live score
function updateScoreDisplay() {
  const score = calculateLiveScore()
  document.getElementById('score').textContent = `SCORE: ${score}`
}

// call these when events happen
function onEnemyKilled() {
  scoreState.kills++
  updateScoreDisplay()
}

function onShotHit() {
  scoreState.shotsHit++
  updateScoreDisplay()
}

function onShotFired() {
  scoreState.shotsFired++
  // don't update display - firing doesn't change live score
}
```

### Final Score (At Game End)

```javascript
function calculateFinalScore(missionCompleted, gameTime, playerHealth, playerArmor) {
  const cfg = getDifficultyConfig(currentDifficulty)

  // base score from gameplay
  const killPoints = scoreState.kills * 500
  const hitPoints = scoreState.shotsHit * 50
  const pickupPoints = scoreState.pickups * 100

  // survival bonuses (always awarded)
  const healthBonus = Math.floor(playerHealth) * 30
  const armorBonus = Math.floor(playerArmor) * 15

  // accuracy bonus
  const accuracy = scoreState.shotsFired > 0
    ? scoreState.shotsHit / scoreState.shotsFired
    : 0
  const accuracyBonus = Math.floor(accuracy * 1500)

  // TIME BONUS: only if mission completed successfully
  // rewards faster completion
  let timeBonus = 0
  if (missionCompleted) {
    const parTime = 300  // 5 minutes par time
    const secondsUnderPar = Math.max(0, parTime - gameTime)
    timeBonus = Math.floor(secondsUnderPar * 15)
  }

  // completion bonus
  const completionBonus = missionCompleted ? 2000 : 0

  const rawScore = killPoints + hitPoints + pickupPoints +
                   healthBonus + armorBonus + accuracyBonus +
                   timeBonus + completionBonus

  return {
    total: Math.floor(rawScore * cfg.scoreMultiplier),
    breakdown: {
      kills: killPoints,
      hits: hitPoints,
      pickups: pickupPoints,
      health: healthBonus,
      armor: armorBonus,
      accuracy: accuracyBonus,
      time: timeBonus,
      completion: completionBonus,
      multiplier: cfg.scoreMultiplier,
    }
  }
}
```

### Score Breakdown Display

```javascript
function showFinalScore(scoreData, missionCompleted) {
  const { total, breakdown } = scoreData

  let html = `
    <div class="score-line">Kills: +${breakdown.kills}</div>
    <div class="score-line">Accuracy: +${breakdown.accuracy}</div>
    <div class="score-line">Health Bonus: +${breakdown.health}</div>
  `

  if (missionCompleted) {
    html += `<div class="score-line highlight">Time Bonus: +${breakdown.time}</div>`
    html += `<div class="score-line highlight">Mission Complete: +${breakdown.completion}</div>`
  }

  html += `
    <div class="score-line multiplier">Difficulty ×${breakdown.multiplier.toFixed(1)}</div>
    <div class="score-total">TOTAL: ${total}</div>
  `

  document.getElementById('score-breakdown').innerHTML = html
}
```

---

## High Score Persistence (localStorage)

Store high scores per difficulty level.

```javascript
const STORAGE_KEY = 'game_highscores'

function loadHighScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

function saveHighScore(difficulty, score) {
  const scores = loadHighScores()
  const key = `difficulty_${difficulty}`

  if (!scores[key] || score > scores[key]) {
    scores[key] = score
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
    return true  // new high score
  }
  return false
}

function getHighScore(difficulty) {
  const scores = loadHighScores()
  return scores[`difficulty_${difficulty}`] || 0
}

// usage at game end
function onGameEnd(finalScore) {
  const isNewHighScore = saveHighScore(currentDifficulty, finalScore)

  if (isNewHighScore) {
    document.getElementById('highscore-notice').textContent = '★ NEW HIGH SCORE! ★'
    document.getElementById('highscore-notice').style.display = 'block'
  }

  // show current high score
  const highScore = getHighScore(currentDifficulty)
  document.getElementById('highscore').textContent = `High Score: ${highScore}`
}

// show high score for selected difficulty
function updateHighScoreDisplay() {
  const highScore = getHighScore(currentDifficulty)
  document.getElementById('highscore').textContent =
    highScore > 0 ? `Best: ${highScore}` : 'No high score yet'
}
```

---

## Modal Dialog Pattern

Proper modal that works with pointer lock and doesn't interfere with game.

### HTML Structure

```html
<!-- game over modal -->
<div id="modal-overlay" class="modal-overlay hidden">
  <div class="modal-card">
    <h2 id="modal-title">MISSION COMPLETE</h2>
    <div id="modal-content">
      <!-- score breakdown goes here -->
    </div>
    <div class="modal-controls">
      <input type="range" id="modal-diff-slider" class="difficulty-slider"
             min="1" max="10" value="5">
      <div id="modal-diff-label">MODERATE (5)</div>
      <button id="restart-btn" class="modal-button">RESTART [R]</button>
    </div>
  </div>
</div>
```

### CSS

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay.hidden {
  display: none;
}

.modal-card {
  background: linear-gradient(to bottom, #2a1a1a 0%, #1a0a0a 100%);
  border: 3px solid #440000;
  border-radius: 10px;
  padding: 40px 60px;
  text-align: center;
  box-shadow: 0 0 50px rgba(255, 0, 0, 0.3);
  min-width: 400px;
  /* CRITICAL: ensure modal is interactive */
  pointer-events: auto;
}

.modal-card h2 {
  color: #ff4444;
  font-family: 'Courier New', monospace;
  font-size: 32px;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.modal-controls {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.modal-button {
  background: linear-gradient(to bottom, #660000, #440000);
  border: 2px solid #880000;
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  padding: 12px 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-button:hover {
  background: linear-gradient(to bottom, #880000, #660000);
  border-color: #aa0000;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

/* score display styling */
.score-line {
  color: #ccc;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 5px 0;
}

.score-line.highlight {
  color: #4f4;
}

.score-line.multiplier {
  color: #ff0;
  margin-top: 10px;
}

.score-total {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin-top: 15px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
```

### JavaScript

```javascript
function showModal(title, content) {
  document.getElementById('modal-title').textContent = title
  document.getElementById('modal-content').innerHTML = content
  document.getElementById('modal-overlay').classList.remove('hidden')

  // exit pointer lock so player can interact with UI
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden')
}

// restart button
document.getElementById('restart-btn').addEventListener('click', restart)

// R key also restarts
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyR' && gameOver) {
    restart()
  }
})

// prevent game from capturing clicks on modal
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  e.stopPropagation()
})
```

---

## Health Bar Gradient

Health display that changes color based on value.

```javascript
function getHealthColor(current, max) {
  const pct = current / max

  if (pct > 0.6) {
    // green range
    return { r: 0, g: 200, b: 0 }
  } else if (pct > 0.3) {
    // yellow range - interpolate from green to yellow
    const t = (pct - 0.3) / 0.3
    return {
      r: Math.floor(lerp(200, 0, t)),
      g: Math.floor(lerp(200, 200, t)),
      b: 0
    }
  } else {
    // red range - interpolate from yellow to red
    const t = pct / 0.3
    return {
      r: 200,
      g: Math.floor(lerp(0, 200, t)),
      b: 0
    }
  }
}

// CSS gradient version
function getHealthGradient(pct) {
  if (pct > 0.6) {
    return 'linear-gradient(to right, #0a0, #4f4)'
  } else if (pct > 0.3) {
    return 'linear-gradient(to right, #aa0, #ff0)'
  } else {
    return 'linear-gradient(to right, #a00, #f44)'
  }
}
```

### HTML Health Bar

```html
<div class="health-container">
  <div class="health-label">HEALTH</div>
  <div class="health-bar-bg">
    <div id="health-bar" class="health-bar-fill"></div>
  </div>
  <div id="health-value" class="health-value">100</div>
</div>
```

```css
.health-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.health-label {
  color: #888;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  width: 50px;
}

.health-bar-bg {
  width: 150px;
  height: 16px;
  background: #300;
  border: 2px solid #500;
  border-radius: 3px;
  overflow: hidden;
}

.health-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #0a0, #4f4);
  transition: width 0.2s, background 0.3s;
}

.health-value {
  color: #fff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  width: 30px;
  text-align: right;
}
```

```javascript
function updateHealthBar(current, max) {
  const pct = current / max
  const bar = document.getElementById('health-bar')
  const value = document.getElementById('health-value')

  bar.style.width = `${pct * 100}%`
  bar.style.background = getHealthGradient(pct)
  value.textContent = Math.floor(current)
}
```

---

## Timer Display

For time-based scoring and countdowns.

```javascript
let gameTime = 0  // seconds elapsed

function updateGameTime(delta) {
  if (!gameOver) {
    gameTime += delta
    updateTimerDisplay()
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(gameTime / 60)
  const seconds = Math.floor(gameTime % 60)
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`
  document.getElementById('timer').textContent = display
}

function resetTimer() {
  gameTime = 0
  updateTimerDisplay()
}
```

---

## Number Formatting

Prevent floating point display issues.

```javascript
// always display integers for health, armor, score
function formatStat(value) {
  return Math.floor(value)
}

// format large numbers with commas
function formatScore(value) {
  return Math.floor(value).toLocaleString()
}

// format percentage
function formatPercent(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`
}

// usage
document.getElementById('health').textContent = formatStat(state.health)
document.getElementById('score').textContent = formatScore(calculateLiveScore())
document.getElementById('accuracy').textContent = formatPercent(shotsHit / shotsFired, 1)
```

---

## Game State Reset

Clean reset for restart functionality.

```javascript
function resetGameState() {
  // player state
  player.x = spawnPoint.x
  player.z = spawnPoint.z
  player.health = getDifficultyConfig(currentDifficulty).playerHealth
  player.armor = 0

  // score state
  scoreState.kills = 0
  scoreState.shotsHit = 0
  scoreState.shotsFired = 0
  scoreState.pickups = 0

  // game state
  gameTime = 0
  gameOver = false
  missionComplete = false

  // clear entities
  enemies.forEach(e => scene.remove(e.mesh))
  enemies.length = 0

  projectiles.forEach(p => scene.remove(p.mesh))
  projectiles.length = 0

  // respawn enemies
  spawnInitialEnemies()

  // reset UI
  updateHealthBar(player.health, player.maxHealth)
  updateScoreDisplay()
  updateTimerDisplay()
  hideModal()
}
```
