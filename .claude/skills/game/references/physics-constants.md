# Physics Constants Reference

Real-world constants for educational accuracy in games and simulations.

## Gravity (m/s²)

| Body | Gravity | Ratio to Earth |
|------|---------|----------------|
| Earth | 9.81 | 1.0 |
| Moon | 1.62 | 0.165 |
| Mars | 3.72 | 0.38 |
| Venus | 8.87 | 0.90 |
| Jupiter | 24.79 | 2.53 |
| Saturn | 10.44 | 1.06 |
| Sun | 274.0 | 27.9 |

### Pixel Conversion
For games, convert to pixels/second²:
- Typical: 1 meter = 50-100 pixels
- Earth gravity at 50px/m: `9.81 * 50 = 490 px/s²`
- KAPLAY default gravity: `1600 px/s²` (approximately 32 px/m scale)

```javascript
// realistic Earth gravity
const PIXELS_PER_METER = 50
setGravity(9.81 * PIXELS_PER_METER)  // 490.5

// Moon (for comparison)
setGravity(1.62 * PIXELS_PER_METER)  // 81
```

## Kinematics Equations

```
Position:     x = x₀ + v₀t + ½at²
Velocity:     v = v₀ + at
Velocity²:    v² = v₀² + 2a(x - x₀)
```

### Jump Physics
```javascript
// given desired jump height and gravity, calculate jump velocity
function jumpVelocity(height, gravity) {
  // v² = 2gh (solving v² = v₀² + 2a(x-x₀) for v₀ when v=0 at peak)
  return Math.sqrt(2 * gravity * height)
}

// example: jump 3 meters on Earth
const GRAVITY = 9.81 * 50  // 490.5 px/s²
const jumpHeight = 3 * 50  // 150 px
const jumpV = jumpVelocity(jumpHeight, GRAVITY)  // ~384 px/s
```

### Projectile Motion
```javascript
// horizontal distance for projectile
function projectileRange(velocity, angle, gravity) {
  const rad = angle * Math.PI / 180
  return (velocity * velocity * Math.sin(2 * rad)) / gravity
}

// time of flight
function flightTime(velocity, angle, gravity) {
  const rad = angle * Math.PI / 180
  return (2 * velocity * Math.sin(rad)) / gravity
}

// max height
function maxHeight(velocity, angle, gravity) {
  const rad = angle * Math.PI / 180
  const vy = velocity * Math.sin(rad)
  return (vy * vy) / (2 * gravity)
}
```

## Speed References

| Object | Speed (m/s) | Speed (km/h) |
|--------|-------------|--------------|
| Walking | 1.4 | 5 |
| Running | 5-8 | 18-29 |
| Sprinting (Bolt) | 12.4 | 44.7 |
| Cycling | 8-15 | 29-54 |
| Car (city) | 14 | 50 |
| Car (highway) | 31 | 110 |
| Cheetah | 31 | 112 |
| Sound (air) | 343 | 1235 |
| Bullet | 370-460 | 1330-1650 |

## Friction Coefficients (μ)

| Surface Pair | Static μ | Kinetic μ |
|--------------|----------|-----------|
| Rubber on concrete | 1.0 | 0.8 |
| Rubber on ice | 0.15 | 0.05 |
| Wood on wood | 0.5 | 0.3 |
| Steel on steel | 0.6 | 0.4 |
| Ice on ice | 0.1 | 0.03 |

```javascript
// apply friction
function applyFriction(velocity, friction, dt) {
  const frictionForce = friction * GRAVITY
  const reduction = frictionForce * dt
  
  if (Math.abs(velocity) < reduction) return 0
  return velocity - Math.sign(velocity) * reduction
}
```

## Elastic Collisions

```javascript
// 1D elastic collision (conservation of momentum + energy)
function elasticCollision(m1, v1, m2, v2) {
  const v1Final = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
  const v2Final = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
  return [v1Final, v2Final]
}

// bounce with restitution (0 = no bounce, 1 = perfect bounce)
function bounce(velocity, restitution) {
  return -velocity * restitution
}
```

## Pendulum

```javascript
// period of simple pendulum
function pendulumPeriod(length, gravity) {
  return 2 * Math.PI * Math.sqrt(length / gravity)
}

// angular acceleration
function pendulumAccel(angle, length, gravity) {
  return -(gravity / length) * Math.sin(angle)
}
```

## Orbital Mechanics

```javascript
// orbital velocity (circular orbit)
function orbitalVelocity(mass, radius) {
  const G = 6.674e-11  // gravitational constant
  return Math.sqrt(G * mass / radius)
}

// escape velocity
function escapeVelocity(mass, radius) {
  const G = 6.674e-11
  return Math.sqrt(2 * G * mass / radius)
}
```

| Body | Escape Velocity (km/s) |
|------|------------------------|
| Earth | 11.2 |
| Moon | 2.4 |
| Mars | 5.0 |
| Jupiter | 59.5 |
| Sun | 617.5 |

## Wave Physics

```javascript
// simple harmonic motion
function shm(amplitude, frequency, time, phase = 0) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time + phase)
}

// wave: y = A * sin(kx - ωt)
function wave(amplitude, wavelength, x, time, speed) {
  const k = 2 * Math.PI / wavelength  // wave number
  const omega = 2 * Math.PI * speed / wavelength  // angular frequency
  return amplitude * Math.sin(k * x - omega * time)
}
```

## Mathematical Constants

```javascript
const PI = Math.PI           // 3.14159...
const E = Math.E             // 2.71828...
const PHI = (1 + Math.sqrt(5)) / 2  // 1.618... (golden ratio)
const SQRT2 = Math.SQRT2     // 1.414...
const SQRT3 = Math.sqrt(3)   // 1.732...

// degrees <-> radians
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI
```

## Chemistry Constants (for molecular simulations)

| Constant | Value |
|----------|-------|
| Avogadro's number | 6.022 × 10²³ mol⁻¹ |
| Bond lengths (approximate) | |
| C-C single | 1.54 Å |
| C=C double | 1.34 Å |
| C-H | 1.09 Å |
| O-H | 0.96 Å |
| H-O-H angle (water) | 104.5° |
| C-C-C angle (tetrahedral) | 109.5° |

## Audio Frequencies (Hz)

| Note | Frequency |
|------|-----------|
| A4 (tuning) | 440 |
| Middle C (C4) | 261.63 |
| C5 | 523.25 |

## Color Wavelengths (nm)

| Color | Wavelength |
|-------|------------|
| Red | 620-750 |
| Orange | 590-620 |
| Yellow | 570-590 |
| Green | 495-570 |
| Blue | 450-495 |
| Violet | 380-450 |
