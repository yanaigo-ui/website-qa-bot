const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://sase.checkpoint.com/');

  const title = await page.title();
  console.log('Page title:', title);

  await browser.close();
})();
