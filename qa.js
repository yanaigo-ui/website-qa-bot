const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  async function safeStep(name, fn) {
    console.log(`Running: ${name}`);
    try {
      await fn();
      await page.screenshot({ path: `${name}.png`, fullPage: true });
      console.log(`✅ ${name} success`);
    } catch (err) {
      console.error(`❌ ${name} failed`, err.message);
      await page.screenshot({ path: `${name}-error.png`, fullPage: true });
    }
  }

  await safeStep("homepage", async () => {
    await page.goto('https://sase.checkpoint.com/');
  });

  await safeStep("contact", async () => {
    await page.goto('https://sase.checkpoint.com/contact');
  });

  await safeStep("demo", async () => {
    await page.goto('https://sase.checkpoint.com/demo');
  });

  await browser.close();
})();
``
