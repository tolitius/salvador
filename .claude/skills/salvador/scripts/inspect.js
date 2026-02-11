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

    const captured = [];

    if (!stageCount || stageCount === 1) {
      // standalone / single-stage: capture 3 frames at different moments
      // so the agent can see animation at different phases
      await page.screenshot({ path: 'snapshots/frame_1.png' });
      captured.push('snapshots/frame_1.png');
      await page.waitForTimeout(3500); // t ≈ 5s
      await page.screenshot({ path: 'snapshots/frame_2.png' });
      captured.push('snapshots/frame_2.png');
      await page.waitForTimeout(5000); // t ≈ 10s
      await page.screenshot({ path: 'snapshots/frame_3.png' });
      captured.push('snapshots/frame_3.png');
    } else {
      // staged: capture each stage
      await page.screenshot({ path: 'snapshots/stage_1.png' });
      captured.push('snapshots/stage_1.png');
      for (let i = 2; i <= stageCount; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(800); // let transitions settle
        const path = `snapshots/stage_${i}.png`;
        await page.screenshot({ path });
        captured.push(path);
      }
    }

    // 7. report
    console.log(`\n>> [Inspector] Captured ${captured.length} snapshot(s) from ${url}`);
    console.log(`>> [Inspector] Stage count: ${stageCount ?? 'standalone (3 frames at t=1.5s, 5s, 10s)'}`);
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
