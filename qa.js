const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  async function safeStep(name, url) {
    console.log(`Running: ${name}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // ✅ Wait for page stabilization
      await page.waitForTimeout(5000);

      // ✅ Scroll to trigger lazy load
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      await page.waitForTimeout(3000);

      // ✅ Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));

      await page.waitForTimeout(2000);

      // ✅ Take screenshot AFTER everything
      await page.screenshot({ path: `${name}.png`, fullPage: true });

      console.log(`✅ ${name} success`);

    } catch (err) {
      console.error(`❌ ${name} failed`, err.message);
      await page.screenshot({ path: `${name}-error.png`, fullPage: true });
    }
  }

  // Core flows
  await safeStep("homepage", "https://sase.checkpoint.com/");
  await safeStep("contact", "https://sase.checkpoint.com/contact");
  await safeStep("demo", "https://sase.checkpoint.com/demo");

  await browser.close();
})();
