const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Login using the non-redirect admin portal
  await page.goto('https://learn.bcit.ca/d2l/login?noredirect=1');
  await page.fill('#userName', process.env.D2L_USERNAME);
  await page.fill('#password', process.env.D2L_PASSWORD);
  await page.click('text=Log In');

  // 2. Navigate to Manage Files (BCIT correct URL)
  await page.goto('https://learn.bcit.ca/d2l/lp/manageFiles/main.d2l?ou=7541');

  // 3. Wait for folder tree to load
  await page.waitForSelector('text=CPB Key Processes');

  // Click folder directly
  await page.click('text=CPB Key Processes');

  // Upload helper
  async function uploadFiles(page, files) {
    await page.click('text=Upload');
    await page.click('text=Upload Files');
    await page.waitForSelector('input[type="file"]');
    await page.setInputFiles('input[type="file"]', files);
    await page.click('text=Add');

    const overwrite = await page.$('text=Overwrite');
    if (overwrite) await overwrite.click();
  }

  // 4. Upload all root-level HTML files
  const rootFiles = fs.readdirSync('.')
    .filter(f => f.endsWith('.html'))
    .map(f => path.resolve(f));

  if (rootFiles.length > 0) {
    await uploadFiles(page, rootFiles);
  }

  // 5. Upload all files inside .src/
  const srcFiles = fs.readdirSync('./.src')
    .map(f => path.resolve('./.src', f));

  if (srcFiles.length > 0) {
    await uploadFiles(page, srcFiles);
  }

  await browser.close();
})();
