import { PNG } from "pngjs";
import fs from "fs";
import path from "path";

const outDirV2 = "public/assets/wearables/v2";
const thumbDirV2 = "public/assets/wearables/v2/thumbnails";
if (!fs.existsSync(outDirV2)) fs.mkdirSync(outDirV2, { recursive: true });
if (!fs.existsSync(thumbDirV2)) fs.mkdirSync(thumbDirV2, { recursive: true });

// Load an existing wearable to use as clean template buffer base
const templateData = fs.readFileSync("public/assets/wearables/v2/essma.sombrero-viajero.png");
const templatePng = PNG.sync.read(templateData);

const items = [
  // HAIR / HEAD
  { slug: "essma.monno-azul", color: [29, 78, 216], cx: 627, cy: 190, rx: 75, ry: 35 },
  { slug: "essma.corona-flores", color: [21, 128, 61], cx: 627, cy: 215, rx: 135, ry: 20 },
  { slug: "essma.gorrito-campesino", color: [245, 158, 11], cx: 627, cy: 180, rx: 150, ry: 45 },

  // OUTFIT
  { slug: "essma.tunica-clasica", color: [254, 243, 199], cx: 627, cy: 710, rx: 160, ry: 150 },
  { slug: "essma.overol-mezclilla", color: [37, 99, 235], cx: 627, cy: 710, rx: 150, ry: 140 },
  { slug: "essma.vestido-festivo", color: [234, 88, 12], cx: 627, cy: 720, rx: 175, ry: 155 },

  // SHOES
  { slug: "essma.huaraches-piel", color: [154, 52, 18], cx: 627, cy: 1075, rx: 90, ry: 25 },
  { slug: "essma.tenis-sol", color: [245, 158, 11], cx: 627, cy: 1070, rx: 95, ry: 25 },
  { slug: "essma.zapatitos-rojos", color: [220, 38, 38], cx: 627, cy: 1068, rx: 90, ry: 25 },

  // ACCESSORY
  { slug: "essma.panuelo-cobalto", color: [29, 78, 216], cx: 627, cy: 565, rx: 65, ry: 25 },
  { slug: "essma.canastita-flores", color: [180, 83, 9], cx: 800, cy: 720, rx: 45, ry: 35 },
  { slug: "essma.pulserita-cuentas", color: [234, 179, 8], cx: 820, cy: 685, rx: 25, ry: 12 },
];

for (const item of items) {
  const png = new PNG({ width: 1254, height: 1254 });
  const [r, g, b] = item.color;
  const rx2 = item.rx * item.rx;
  const ry2 = item.ry * item.ry;

  const minX = Math.max(0, item.cx - item.rx);
  const maxX = Math.min(1253, item.cx + item.rx);
  const minY = Math.max(0, item.cy - item.ry);
  const maxY = Math.min(1253, item.cy + item.ry);

  for (let y = minY; y <= maxY; y++) {
    const dy2 = (y - item.cy) * (y - item.cy);
    for (let x = minX; x <= maxX; x++) {
      const dx = x - item.cx;
      if ((dx * dx) / rx2 + dy2 / ry2 <= 1) {
        const idx = (1254 * y + x) << 2;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }
    }
  }

  // Write 1254x1254 PNG
  fs.writeFileSync(path.join(outDirV2, `${item.slug}.png`), PNG.sync.write(png));

  // Write 256x256 Thumbnail PNG directly
  const thumb = new PNG({ width: 256, height: 256 });
  const scale = 256 / 1254;
  for (let ty = 0; ty < 256; ty++) {
    for (let tx = 0; tx < 256; tx++) {
      const sx = Math.floor(tx / scale);
      const sy = Math.floor(ty / scale);
      const sIdx = (1254 * sy + sx) << 2;
      if (png.data[sIdx + 3] > 0) {
        const tIdx = (256 * ty + tx) << 2;
        thumb.data[tIdx] = png.data[sIdx];
        thumb.data[tIdx + 1] = png.data[sIdx + 1];
        thumb.data[tIdx + 2] = png.data[sIdx + 2];
        thumb.data[tIdx + 3] = 255;
      }
    }
  }
  fs.writeFileSync(path.join(thumbDirV2, `${item.slug}.png`), PNG.sync.write(thumb));
  console.log(`✓ Fast generated ${item.slug}.png`);
}

console.log("ALL 12 ITEMS FAST GENERATED SUCCESSFULLY!");
