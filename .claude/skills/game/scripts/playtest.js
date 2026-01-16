/**
 * Game Playtest Script
 *
 * Runs the game in a headless browser, simulates gameplay, captures screenshots,
 * and reports any errors or issues.
 *
 * Usage: node playtest.js [url]
 * Default URL: http://localhost:5173
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  width: 800,
  height: 600,
  screenshotDir: './playtest-screenshots',
  timeouts: {
    pageLoad: 30000,      // increased for slower systems
    betweenActions: 300,
    afterInput: 500,
    gameplayDuration: 6000, // how long to simulate gameplay
  },
};

// errors to ignore (not real game bugs)
const IGNORED_ERRORS = [
  'favicon.ico',
  'Failed to load resource: the server responded with a status of 404',
];

function isIgnoredError(error) {
  return IGNORED_ERRORS.some(ignored => error.includes(ignored));
}

// ============================================
// HELPERS
// ============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// MAIN PLAYTEST
// ============================================
async function playtest(url = 'http://localhost:5173') {
  console.log('🎮 Starting playtest...\n');

  // ensure screenshot directory exists
  if (!existsSync(CONFIG.screenshotDir)) {
    mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${CONFIG.width},${CONFIG.height}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: CONFIG.width, height: CONFIG.height });

  // collect console logs and errors
  const logs = [];
  const errors = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    if (msg.type() === 'error' && !isIgnoredError(text)) {
      errors.push(text);
    }
  });

  page.on('pageerror', err => {
    if (!isIgnoredError(err.message)) {
      errors.push(err.message);
    }
  });

  try {
    // navigate to game
    console.log(`📍 Loading ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: CONFIG.timeouts.pageLoad });
    console.log('✅ Page loaded\n');

    // initial screenshot (t=0)
    const shot0 = `${CONFIG.screenshotDir}/t0_initial.png`;
    await page.screenshot({ path: shot0 });
    console.log(`📸 Screenshot: ${shot0}`);

    // simulate pressing SPACE to start (common pattern)
    console.log('\n⌨️  Simulating: SPACE (start game)...');
    await page.keyboard.press('Space');
    await sleep(CONFIG.timeouts.afterInput);

    // screenshot after start
    const shot1 = `${CONFIG.screenshotDir}/t1_after_start.png`;
    await page.screenshot({ path: shot1 });
    console.log(`📸 Screenshot: ${shot1}`);

    // ============================================
    // GAMEPLAY SIMULATION
    // Simulate real gameplay: hold movement keys and jump
    // to trigger collisions and gameplay events
    // ============================================
    console.log('\n🎮 Simulating gameplay (moving + jumping)...');

    const startTime = Date.now();
    const endTime = startTime + CONFIG.timeouts.gameplayDuration;
    let direction = 'ArrowRight';
    let jumpCount = 0;

    // hold initial direction
    await page.keyboard.down(direction);

    while (Date.now() < endTime) {
      // jump periodically
      await page.keyboard.press('Space');
      jumpCount++;
      await sleep(400);

      // change direction occasionally to explore more of the level
      if (jumpCount % 4 === 0) {
        await page.keyboard.up(direction);
        direction = direction === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
        await page.keyboard.down(direction);
      }

      // check for errors during gameplay
      if (errors.length > 0) {
        console.log('⚠️  Error detected during gameplay, stopping early');
        break;
      }
    }

    // release held key
    await page.keyboard.up(direction);
    console.log(`   Performed ${jumpCount} jumps while moving`);

    // screenshot after gameplay
    const shot2 = `${CONFIG.screenshotDir}/t2_after_gameplay.png`;
    await page.screenshot({ path: shot2 });
    console.log(`📸 Screenshot: ${shot2}`);

    // wait a bit more and capture final state
    await sleep(1000);

    const shot3 = `${CONFIG.screenshotDir}/t3_final.png`;
    await page.screenshot({ path: shot3 });
    console.log(`📸 Screenshot: ${shot3}`);

    // try to extract game state (if exposed globally)
    const gameState = await page.evaluate(() => {
      // common patterns for exposed state
      if (typeof window.score !== 'undefined') return { score: window.score };
      if (typeof window.gameState !== 'undefined') return window.gameState;
      return null;
    });

    // ============================================
    // REPORT
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('📋 PLAYTEST REPORT');
    console.log('='.repeat(50));

    // errors
    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach(e => console.log(`   • ${e}`));
    } else {
      console.log('\n✅ No JavaScript errors');
    }

    // warnings from console
    const warnings = logs.filter(l => l.type === 'warning');
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.slice(0, 5).forEach(w => console.log(`   • ${w.text}`));
      if (warnings.length > 5) {
        console.log(`   ... and ${warnings.length - 5} more`);
      }
    }

    // game state
    if (gameState) {
      console.log('\n🎯 Game State Detected:');
      console.log(`   ${JSON.stringify(gameState)}`);
    } else {
      console.log('\n📊 No exposed game state found (this is OK)');
    }

    // screenshots summary
    console.log('\n📸 Screenshots captured:');
    console.log(`   • ${shot0} (initial/menu)`);
    console.log(`   • ${shot1} (after start)`);
    console.log(`   • ${shot2} (after gameplay)`);
    console.log(`   • ${shot3} (final state)`);

    console.log('\n' + '='.repeat(50));

    if (errors.length > 0) {
      console.log('❌ PLAYTEST FAILED - Fix errors above');
      process.exitCode = 1;
    } else {
      console.log('✅ PLAYTEST PASSED - Review screenshots for visual issues');
    }
    console.log('='.repeat(50) + '\n');

  } catch (err) {
    console.error('\n❌ Playtest error:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

// ============================================
// DEV SERVER MANAGEMENT
// ============================================
async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting dev server...');

    const server = spawn('npx', ['vite', '--port', '5173'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let started = false;

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !started) {
        started = true;
        console.log('✅ Dev server ready\n');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('error')) {
        console.error('Server error:', output);
      }
    });

    server.on('error', reject);

    // timeout
    setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error('Dev server timeout'));
      }
    }, 15000);
  });
}

// ============================================
// RUN
// ============================================
async function main() {
  const url = process.argv[2];

  if (url) {
    // URL provided, run directly
    await playtest(url);
  } else {
    // start dev server and run
    let server;
    try {
      server = await startDevServer();
      await playtest('http://localhost:5173');
    } finally {
      if (server) {
        server.kill();
        console.log('🛑 Dev server stopped');
      }
    }
  }
}

main().catch(console.error);
