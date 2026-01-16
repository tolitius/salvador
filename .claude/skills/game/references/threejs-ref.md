# Three.js Quick Reference

Minimal API reference for 3D browser games. Use only when 3D is explicitly requested.

## Setup

```javascript
import * as THREE from 'three'

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)

// camera
const camera = new THREE.PerspectiveCamera(
  75,                           // FOV
  window.innerWidth / window.innerHeight,  // aspect
  0.1,                          // near
  1000                          // far
)
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// game loop
function animate() {
  requestAnimationFrame(animate)
  
  // update game logic here
  
  renderer.render(scene, camera)
}
animate()
```

## Geometry & Meshes

```javascript
// box
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// sphere
const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32)
const sphere = new THREE.Mesh(sphereGeo, material)
scene.add(sphere)

// plane (ground)
const planeGeo = new THREE.PlaneGeometry(20, 20)
const planeMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
const ground = new THREE.Mesh(planeGeo, planeMat)
ground.rotation.x = -Math.PI / 2  // lay flat
ground.position.y = 0
scene.add(ground)

// cylinder
const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 32)

// cone
const coneGeo = new THREE.ConeGeometry(0.5, 1, 32)
```

## Materials

```javascript
// basic (no lighting needed)
new THREE.MeshBasicMaterial({ color: 0xff0000 })

// standard (needs lights)
new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
  metalness: 0.3,
  roughness: 0.7,
})

// with texture
const texture = new THREE.TextureLoader().load('texture.png')
new THREE.MeshStandardMaterial({ map: texture })

// transparent
new THREE.MeshStandardMaterial({ 
  color: 0x00ff00,
  transparent: true,
  opacity: 0.5,
})

// wireframe
new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffffff })
```

## Lighting

```javascript
// ambient (everywhere)
const ambient = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambient)

// directional (sun-like)
const sun = new THREE.DirectionalLight(0xffffff, 1)
sun.position.set(5, 10, 5)
scene.add(sun)

// point light (bulb)
const point = new THREE.PointLight(0xff0000, 1, 10)
point.position.set(0, 2, 0)
scene.add(point)
```

## Transforms

```javascript
// position
mesh.position.set(x, y, z)
mesh.position.x = 5

// rotation (radians)
mesh.rotation.x = Math.PI / 4
mesh.rotation.set(0, Math.PI, 0)

// scale
mesh.scale.set(2, 2, 2)

// look at point
mesh.lookAt(target.position)
```

## Animation Loop

```javascript
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  
  const delta = clock.getDelta()  // time since last frame
  const elapsed = clock.getElapsedTime()  // total time
  
  // rotate cube
  cube.rotation.y += delta * 2
  
  // bob up and down
  sphere.position.y = Math.sin(elapsed * 2) * 0.5 + 1
  
  renderer.render(scene, camera)
}
```

## Input Handling

```javascript
// keyboard
const keys = {}
window.addEventListener('keydown', (e) => keys[e.code] = true)
window.addEventListener('keyup', (e) => keys[e.code] = false)

function animate() {
  requestAnimationFrame(animate)
  
  if (keys['ArrowLeft']) player.position.x -= 0.1
  if (keys['ArrowRight']) player.position.x += 0.1
  if (keys['ArrowUp']) player.position.z -= 0.1
  if (keys['ArrowDown']) player.position.z += 0.1
  if (keys['Space']) jump()
  
  renderer.render(scene, camera)
}

// mouse
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
})
```

## Raycasting (Click Detection)

```javascript
const raycaster = new THREE.Raycaster()

window.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  
  if (intersects.length > 0) {
    const clicked = intersects[0].object
    console.log('Clicked:', clicked)
  }
})
```

## Simple Collision (Bounding Box)

```javascript
function checkCollision(a, b) {
  const boxA = new THREE.Box3().setFromObject(a)
  const boxB = new THREE.Box3().setFromObject(b)
  return boxA.intersectsBox(boxB)
}

function animate() {
  requestAnimationFrame(animate)
  
  enemies.forEach(enemy => {
    if (checkCollision(player, enemy)) {
      // collision!
    }
  })
  
  renderer.render(scene, camera)
}
```

## Text (HTML Overlay)

Three.js doesn't have built-in text. Use HTML overlay:

```html
<div id="hud" style="position:absolute; top:20px; left:20px; color:white; font-family:monospace;">
  <div id="score">Score: 0</div>
  <div id="lives">Lives: 3</div>
</div>
```

```javascript
document.getElementById('score').textContent = `Score: ${score}`
```

## Groups (Parent-Child)

```javascript
const group = new THREE.Group()

const body = new THREE.Mesh(boxGeo, material)
const head = new THREE.Mesh(sphereGeo, material)
head.position.y = 1.5

group.add(body)
group.add(head)
scene.add(group)

// move entire group
group.position.x = 5
group.rotation.y = Math.PI / 2
```

## Camera Follow

```javascript
function animate() {
  requestAnimationFrame(animate)
  
  // follow player (third person)
  camera.position.x = player.position.x
  camera.position.z = player.position.z + 10
  camera.position.y = player.position.y + 5
  camera.lookAt(player.position)
  
  renderer.render(scene, camera)
}
```

## Window Resize

```javascript
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

## Minimal 3D Game Template

```javascript
import * as THREE from 'three'

// setup
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(0, 10, 15)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4))
const sun = new THREE.DirectionalLight(0xffffff, 0.8)
sun.position.set(5, 10, 5)
scene.add(sun)

// ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x2d5a27 })
)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

// player
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0x4a9eff })
)
player.position.y = 1
scene.add(player)

// input
const keys = {}
window.addEventListener('keydown', (e) => keys[e.code] = true)
window.addEventListener('keyup', (e) => keys[e.code] = false)

// game loop
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  
  // movement
  const speed = 5
  if (keys['ArrowLeft']) player.position.x -= speed * delta
  if (keys['ArrowRight']) player.position.x += speed * delta
  if (keys['ArrowUp']) player.position.z -= speed * delta
  if (keys['ArrowDown']) player.position.z += speed * delta
  
  renderer.render(scene, camera)
}
animate()

// resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```
