import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";

async function main() {
  const outputDir = "/Users/abhigaelcarranza/.gemini/antigravity/brain/eb2d1b27-eb5a-4027-8fa4-33e4b78d1ed2/scratch/verified_screenshots";
  await mkdir(outputDir, { recursive: true });

  console.log("Capturing fresh screenshots using node script...");

  const script = `
    const puppeteer = require('puppeteer');
    (async () => {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Desktop World Map
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle2' });
      await page.screenshot({ path: '${outputDir}/desktop_world_map_v2.png' });
      console.log('Saved desktop_world_map_v2.png');

      // Desktop Rancho
      const ranchBtn = await page.$('button[aria-label="Entrar al Rancho de Essma"]');
      if (ranchBtn) {
        await ranchBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: '${outputDir}/desktop_rancho_v2.png' });
        console.log('Saved desktop_rancho_v2.png');
      }

      // Desktop Dress Up
      const dressBtn = await page.$('button[aria-label="Vestir personaje"]');
      if (dressBtn) {
        await dressBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '${outputDir}/desktop_dressup_v2.png' });
        console.log('Saved desktop_dressup_v2.png');
      }

      // Mobile Dress Up (390x844)
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: '${outputDir}/mobile_dressup_v2.png' });
      console.log('Saved mobile_dressup_v2.png');

      await browser.close();
    })();
  `;

  try {
    execSync(`node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      cwd: "/Users/abhigaelcarranza/repos/essma-world",
      stdio: "inherit",
    });
  } catch (err) {
    console.error("Puppeteer script execution error:", err);
  }
}

main().catch(console.error);
