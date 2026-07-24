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
  // Wait for basic navigation to complete before going to the next page
  await page.waitForNavigation({ waitUntil: 'load' });
  await page.goto('https://learn.bcit.ca/d2l/lp/manageFiles/main.d2l?ou=7541');

  // 3. Wait for folder tree to load
  await page.waitForSelector('text=CPB Key Processes');

  // Click folder directly
  await page.click('text=CPB Key Processes');

  // Upload helper
  async function uploadFiles(page, files) {
    // Step 1: Click the Upload link in the toolbar
    await page.click('#ctl_6');  // <a> Upload

    // Step 2: Wait for the modal container to appear
    await page.waitForSelector('#FU_newfiles', { timeout: 10000 });

    // Step 3: Click the modal Upload button to reveal the file input
    await page.click('#d2l_1_3_857');  // <button> Upload

    // Step 4: Wait for the file input to appear
    await page.waitForSelector('input[type="file"]', { timeout: 10000 });

    // Step 5: Upload the files
    await page.setInputFiles('input[type="file"]', files);

    // Step 6: Click Add
    await page.click('text=Add');

    // Step 7: Handle overwrite
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
