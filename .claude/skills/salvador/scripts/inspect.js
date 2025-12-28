import { chromium } from 'playwright';
import { createServer } from 'vite';

(async () => {
  let server, browser;
  try {
    // 1. Start Dev Server
    server = await createServer({
      configFile: false,
      root: process.cwd(),
      server: { port: 0 }
    });
    await server.listen();
    const url = server.resolvedUrls.local[0];

    // 2. Launch Browser
    browser = await chromium.launch();
    const page = await browser.newPage();

    // 3. Listen for Errors (The "Ears")
    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[Browser ERROR] ${msg.text()}`);
    });
    page.on('pageerror', err => console.log(`[Browser EXCEPTION] ${err.message}`));

    // 4. Capture (The "Eyes")
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500); // Allow animation to settle
    await page.screenshot({ path: 'snapshot.png' });

    console.log(`>> [Inspector] Snapshot captured from ${url}`);

  } catch (e) {
    console.error(">> [Inspector] FAILED:", e);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    process.exit(0);
  }
})();
