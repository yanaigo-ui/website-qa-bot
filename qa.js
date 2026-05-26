const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const TEST_EMAIL = "yanaig+testqa@checkpoint.com";

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
        }, 500);
      });
    });
  }

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

  async function submitContact() {
    try {
      console.log("Submitting Contact");

      await page.goto('https://sase.checkpoint.com/contact', { waitUntil: 'networkidle' });

      await page.waitForTimeout(5000);

      await page.fill('input[type="text"]', 'QA Bot');
      await page.fill('input[type="email"]', TEST_EMAIL);

      const textarea = await page.locator('textarea').first();
      if (await textarea.count()) {
        await textarea.fill('QA test submission');
      }

      await page.screenshot({ path: 'contact-before.png', fullPage: true });

      const btn = await page.locator('button, input[type=submit]').first();
      await btn.click();

      await page.waitForTimeout(5000);

      await page.screenshot({ path: 'contact-after.png', fullPage: true });

      console.log("Contact submitted ✅");

    } catch (e) {
      console.log("Contact failed ❌", e);
      await page.screenshot({ path: 'contact-error.png', fullPage: true });
    }
  }

  async function submitDemo() {
    try {
      console.log("Submitting Demo");

      await page.goto('https://sase.checkpoint.com/demo', { waitUntil: 'networkidle' });

      await page.waitForTimeout(5000);

      await page.fill('input[type="text"]', 'QA Bot');
      await page.fill('input[type="email"]', TEST_EMAIL);

      await page.screenshot({ path: 'demo-before.png', fullPage: true });

      const btn = await page.locator('button, input[type=submit]').first();
      await btn.click();

      await page.waitForTimeout(5000);

      await page.screenshot({ path: 'demo-after.png', fullPage: true });

      console.log("Demo submitted ✅");

    } catch (e) {
      console.log("Demo failed ❌", e);
      await page.screenshot({ path: 'demo-error.png', fullPage: true });
    }
  }

  // Run steps
  await safeLoad("homepage", "https://sase.checkpoint.com/");
  await safeLoad("contact", "https://sase.checkpoint.com/contact");
  await safeLoad("demo", "https://sase.checkpoint.com/demo");

  await submitContact();
  await submitDemo();

  await browser.close();
})();
