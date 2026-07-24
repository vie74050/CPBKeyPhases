const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Login using the non-redirect admin portal
  await page.goto('https://learn.bcit.ca/d2l/login?noredirect=1');
  await page.fill('input#userName', process.env.D2L_USERNAME);
  await page.fill('input#password', process.env.D2L_PASSWORD);
  await page.click('text=Log In');
  await page.waitForNavigation();

  // 2. Navigate to Manage Files (BCIT correct URL)
  await page.goto('https://learn.bcit.ca/d2l/lp/manageFiles/main.d2l?ou=7541');
  await page.waitForSelector('text=enforced');

  // 3. Navigate folder tree
  await page.click('text=enforced');
  await page.click('text=7541-ViennaLySandbox');
  await page.click('text=CPB Key Processes');

  // 4. Upload all root-level HTML files
  const rootFiles = fs.readdirSync('.')
    .filter(f => f.endsWith('.html'))
    .map(f => path.resolve(f));

  if (rootFiles.length > 0) {
    await page.setInputFiles('input[type="file"]', rootFiles);
    const overwrite = await page.$('text=Overwrite');
    if (overwrite) await overwrite.click();
  }

  // 5. Upload all files inside .src/
  const srcFiles = fs.readdirSync('./.src')
    .map(f => path.resolve('./.src', f));

  if (srcFiles.length > 0) {
    await page.setInputFiles('input[type="file"]', srcFiles);
    const overwrite = await page.$('text=Overwrite');
    if (overwrite) await overwrite.click();
  }

  await browser.close();
})();
