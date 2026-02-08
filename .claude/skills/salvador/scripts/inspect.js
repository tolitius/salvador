import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdirSync } from 'fs';

(async () => {
  let server, browser;
  try {
    // 1. start dev server
    server = await createServer({
      configFile: false,
      root: process.cwd(),
      server: { port: 0 }
    });
    await server.listen();
    const url = server.resolvedUrls.local[0];

    // 2. launch browser at design viewport
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 850, height: 540 } });

    // 3. collect errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = `[Browser ERROR] ${msg.text()}`;
        console.log(text);
        errors.push(text);
      }
    });
    page.on('pageerror', err => {
      const text = `[Browser EXCEPTION] ${err.message}`;
      console.log(text);
      errors.push(text);
    });

    // 4. navigate and wait for initial render
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 5. ensure snapshots directory exists
    mkdirSync('snapshots', { recursive: true });

    // 6. detect stage count
    const stageCount = await page.evaluate(() => {
      if (typeof window.stageCount === 'number') return window.stageCount;
      if (Array.isArray(window.stages)) return window.stages.length;
      return null;
    });

    const totalStages = stageCount || 8; // fallback: capture up to 8

    // 7. capture stage 1 (initial state)
    await page.screenshot({ path: 'snapshots/stage_1.png' });
    const captured = ['snapshots/stage_1.png'];

    // 8. navigate remaining stages via ArrowRight
    for (let i = 2; i <= totalStages; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(800); // let transitions settle
      const path = `snapshots/stage_${i}.png`;
      await page.screenshot({ path });
      captured.push(path);
    }

    // 9. report
    console.log(`\n>> [Inspector] Captured ${captured.length} stage(s) from ${url}`);
    console.log(`>> [Inspector] Stage count detected: ${stageCount ?? 'none (used fallback)'}`);
    captured.forEach(p => console.log(`   - ${p}`));
    if (errors.length > 0) {
      console.log(`>> [Inspector] ${errors.length} error(s) found`);
    } else {
      console.log(`>> [Inspector] No errors`);
    }

  } catch (e) {
    console.error(">> [Inspector] FAILED:", e);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    process.exit(0);
  }
})();
