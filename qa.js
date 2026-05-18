const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // STEP 1: Go to homepage
    await page.goto('https://example.com');
    console.log('✅ Homepage loaded');

    // STEP 2: Check title
    const title = await page.title();
    console.log('Page title:', title);

    // STEP 3: Example form test (adjust selectors!)
    // await page.click('text=Contact');
    // await page.fill('#name', 'Test User');
    // await page.fill('#email', 'test@example.com');
    // await page.fill('#message', 'QA test');
    // await page.click('button[type=submit]');
    
    // STEP 4: Take screenshot (always useful)
    await page.screenshot({ path: 'screenshot.png' });

    console.log('✅ QA test finished');

  } catch (error) {
    console.error('❌ Error detected:', error);

    // Take screenshot on failure
    await page.screenshot({ path: 'error.png' });
  }

  await browser.close();
})();
