import puppeteer from 'puppeteer-core';

async function snap() {
  const outputDir = "/Users/abhigaelcarranza/.gemini/antigravity/brain/eb2d1b27-eb5a-4027-8fa4-33e4b78d1ed2";
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // 1. World Map
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outputDir}/verified_world_map.png` });
  console.log('Saved verified_world_map.png');

  // 2. Click Rancho button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ranch = btns.find(b => b.textContent && b.textContent.includes('Rancho'));
    if (ranch) ranch.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outputDir}/verified_ranch.png` });
  console.log('Saved verified_ranch.png');

  // 3. Click Vestir or tap Essma figure
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const vestir = btns.find(b => b.textContent && (b.textContent.includes('Vestir') || b.textContent.includes('Essma')));
    if (vestir) {
      vestir.click();
    } else {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.dispatchEvent(new MouseEvent('click', { clientX: 640, clientY: 500, bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: `${outputDir}/verified_dressup.png` });
  console.log('Saved verified_dressup.png');

  await browser.close();
}

snap().catch(console.error);
