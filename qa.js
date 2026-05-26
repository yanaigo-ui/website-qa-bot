const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const TEST_EMAIL = "yanaig+testqa@checkpoint.com";

  // ✅ Smooth scroll (fix lazy-loaded sections)
  async function scrollFullPage(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;

        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 500);
      });
    });
  }

  // ✅ Close popups if they appear
  async function closePopupIfExists() {
    try {
      const closeBtn = page.locator('button:has-text("Close"), .close').first();
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click();
        console.log("✅ Popup closed");
        await page.waitForTimeout(1000);
      }
    } catch (e) {}
  }

  // ✅ Page load QA (no submission)
  async function safePageLoad(name, url) {
    console.log(`\n--- ${name} ---`);

    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      await page.waitForTimeout(4000);
      await closePopupIfExists();

      await scrollFullPage(page);
      await page.waitForTimeout(4000);

      await page.screenshot({ path: `${name}.png`, fullPage: true });

      console.log(`✅ ${name} loaded`);
    } catch (err) {
      console.error(`❌ ${name} failed`, err.message);
      await page.screenshot({ path: `${name}-error.png`, fullPage: true });
    }
  }

  // ✅ CONTACT FORM SUBMISSION
  async function submitContactForm() {
    console.log("\n--- CONTACT SUBMIT ---");

    try {
      await page.goto('https://sase.checkpoint.com/contact', { waitUntil: 'networkidle' });

      await page.waitForTimeout(5000);
      await closePopupIfExists();

      await scrollFullPage(page);
      await page.waitForTimeout(3000);

      // Fill fields
      await page.fill('input[name*="First"]', 'QA');
      await page.fill('input[name*="Last"]', 'Bot');
