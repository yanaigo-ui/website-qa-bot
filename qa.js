const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const TEST_EMAIL = "yanaig+testqa@checkpoint.com";

  // ✅ Smooth scroll to trigger lazy loading
  async function scrollFullPage() {
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
        }, 300);
      });
    });
  }

  // ✅ Remove accessibility widget (prevents wrong clicks)
  async function removeAccessibilityWidget() {
    try {
      await page.evaluate(() => {
        const el = document.querySelector('[aria-label="Accessibility"]');
        if (el) el.style.display = 'none';
      });
    } catch (e) {}
  }

  // ✅ Basic page load test
  async function safeLoad(name, url) {
    try {
      console.log(`Running ${name}`);
      await page.goto(url, { waitUntil: 'networkidle' });

      await page.waitForTimeout(4000);
      await scrollFullPage();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: `${name}.png`, fullPage: true });

      console.log(`${name} loaded ✅`);
    } catch (e) {
      console.log(`${name} failed ❌`);
      await page.screenshot({ path: `${name}-error.png`, fullPage: true });
    }
  }

  // ✅ CONTACT FORM SUBMISSION
  async function submitContact() {
    try {
      console.log("Submitting Contact");

      await page.goto('https://sase.checkpoint.com/contact', { waitUntil: 'networkidle' });

      await page.waitForTimeout(5000);
      await removeAccessibilityWidget();
      await scrollFullPage();
      await page.waitForTimeout(2000);

      // Fill required fields (generic safe approach)
      await page.fill('input[name*="First"]', 'QA');
      await page.fill('input[name*="Last"]', 'Bot');
      await page.fill('input[type="email"]', TEST_EMAIL);

      const textarea = page.locator('textarea').first();
      if (await textarea.count()) {
        await textarea.fill('QA automated test submission');
      }

      await page.screenshot({ path: 'contact-before.png', fullPage: true });

      // ✅ Target correct submit button
      const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Send")');

      await submitBtn.first().click();

      await page.waitForTimeout(6000);

      await page.screenshot({ path: 'contact-after.png', fullPage: true });

      console.log("Contact submitted ✅");

    } catch (e) {
      console.log("Contact failed ❌", e);
      await page.screenshot({ path: 'contact-error.png', fullPage: true });
    }
  }

  // ✅ DEMO FORM SUBMISSION (FULL FIX)
  async function submitDemo() {
  try {
    console.log("Submitting Demo");

    await page.goto('https://sase.checkpoint.com/demo', { waitUntil: 'networkidle' });

    await page.waitForTimeout(5000);

    // Fill required fields
    await page.fill('input[name*="First"]', 'QA');
    await page.fill('input[name*="Last"]', 'Bot');
    await page.fill('input[type="email"]', TEST_EMAIL);

    await page.fill('input[name*="Company"]', 'QA Company');

    // Handle dropdowns
    // Company Size
    const sizeDropdown = page.locator('select').nth(0);
    if (await sizeDropdown.count()) {
      await sizeDropdown.selectOption({ index: 1 });
    }

    // Country
    const countryDropdown = page.locator('select').nth(1);
    if (await countryDropdown.count()) {
      await countryDropdown.selectOption({ index: 1 });
    }

    await page.screenshot({ path: 'demo-before.png', fullPage: true });

    // ✅ Target ONLY the real CTA
    const submitBtn = page.locator('button:has-text("Book a Demo")');

    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

    await submitBtn.click();

    await page.waitForTimeout(6000);

    await page.screenshot({ path: 'demo-after.png', fullPage: true });

    console.log("Demo submitted ✅");

  } catch (e) {
    console.log("Demo failed ❌", e);
    await page.screenshot({ path: 'demo-error.png', fullPage: true });
  }
}
  // ✅ Run flow
  await safeLoad("homepage", "https://sase.checkpoint.com/");
  await safeLoad("contact", "https://sase.checkpoint.com/contact");
  await safeLoad("demo", "https://sase.checkpoint.com/demo");

  await submitContact();
  await submitDemo();

  await browser.close();
})();
