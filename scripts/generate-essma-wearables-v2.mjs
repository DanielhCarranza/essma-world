import { PNG } from "pngjs";
import fs from "fs";
import path from "path";

const CANVAS_SIZE = 1254;
const THUMB_SIZE = 256;

const outDirV2 = "public/assets/wearables/v2";
const thumbDirV2 = "public/assets/wearables/v2/thumbnails";

if (!fs.existsSync(outDirV2)) fs.mkdirSync(outDirV2, { recursive: true });
if (!fs.existsSync(thumbDirV2)) fs.mkdirSync(thumbDirV2, { recursive: true });

function createPng(width = CANVAS_SIZE, height = CANVAS_SIZE) {
  return new PNG({ width, height });
}

function setPixel(png, x, y, r, g, b, a = 255) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function fillEllipse(png, cx, cy, rx, ry, [r, g, b, a = 255]) {
  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(png.width - 1, Math.ceil(cx + rx));
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(png.height - 1, Math.ceil(cy + ry));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      if ((dx * dx) / rx2 + dy2 / ry2 <= 1) {
        setPixel(png, x, y, r, g, b, a);
      }
    }
  }
}

function fillRect(png, x1, y1, x2, y2, [r, g, b, a = 255]) {
  const minX = Math.max(0, Math.floor(x1));
  const maxX = Math.min(png.width - 1, Math.ceil(x2));
  const minY = Math.max(0, Math.floor(y1));
  const maxY = Math.min(png.height - 1, Math.ceil(y2));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      setPixel(png, x, y, r, g, b, a);
    }
  }
}

function createThumbnail(sourcePng) {
  const thumb = new PNG({ width: THUMB_SIZE, height: THUMB_SIZE });
  let minX = sourcePng.width, maxX = 0, minY = sourcePng.height, maxY = 0;
  for (let y = 0; y < sourcePng.height; y += 2) {
    for (let x = 0; x < sourcePng.width; x += 2) {
      const idx = (sourcePng.width * y + x) << 2;
      if (sourcePng.data[idx + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX >= maxX || minY >= maxY) { minX = 0; maxX = sourcePng.width - 1; minY = 0; maxY = sourcePng.height - 1; }
  
  const bboxW = maxX - minX + 1;
  const bboxH = maxY - minY + 1;
  const scale = Math.min((THUMB_SIZE - 32) / bboxW, (THUMB_SIZE - 32) / bboxH);
  const offsetX = Math.round((THUMB_SIZE - bboxW * scale) / 2);
  const offsetY = Math.round((THUMB_SIZE - bboxH * scale) / 2);

  for (let ty = 0; ty < THUMB_SIZE; ty++) {
    for (let tx = 0; tx < THUMB_SIZE; tx++) {
      const sx = Math.floor(minX + (tx - offsetX) / scale);
      const sy = Math.floor(minY + (ty - offsetY) / scale);
      if (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY) {
        const sIdx = (sourcePng.width * sy + sx) << 2;
        const tIdx = (THUMB_SIZE * ty + tx) << 2;
        thumb.data[tIdx] = sourcePng.data[sIdx];
        thumb.data[tIdx + 1] = sourcePng.data[sIdx + 1];
        thumb.data[tIdx + 2] = sourcePng.data[sIdx + 2];
        thumb.data[tIdx + 3] = sourcePng.data[sIdx + 3];
      }
    }
  }
  return thumb;
}

// Colors:
const COBALT = [29, 78, 216];
const LIGHT_BLUE = [59, 130, 246];
const MARIGOLD = [245, 158, 11];
const ORANGE = [234, 88, 12];
const CREAM = [254, 243, 199];
const RED = [220, 38, 38];
const GREEN = [21, 128, 61];
const LEATHER = [154, 52, 18];
const WICKER = [180, 83, 9];
const DENIM = [37, 99, 235];
const DARK_DENIM = [30, 64, 175];
const GOLD = [234, 179, 8];

const items = [
  // HAIR / HEAD
  {
    slug: "essma.monno-azul",
    render(png) {
      fillEllipse(png, 580, 190, 45, 25, COBALT);
      fillEllipse(png, 674, 190, 45, 25, COBALT);
      fillEllipse(png, 627, 190, 18, 18, LIGHT_BLUE);
      fillEllipse(png, 605, 220, 14, 30, COBALT);
      fillEllipse(png, 649, 220, 14, 30, COBALT);
    }
  },
  {
    slug: "essma.corona-flores",
    render(png) {
      fillEllipse(png, 627, 215, 135, 12, GREEN);
      fillEllipse(png, 525, 212, 14, 14, MARIGOLD);
      fillEllipse(png, 575, 215, 16, 16, RED);
      fillEllipse(png, 627, 210, 18, 18, COBALT);
      fillEllipse(png, 679, 215, 16, 16, MARIGOLD);
      fillEllipse(png, 729, 212, 14, 14, ORANGE);
      fillEllipse(png, 627, 210, 6, 6, CREAM);
    }
  },
  {
    slug: "essma.gorrito-campesino",
    render(png) {
      fillEllipse(png, 627, 180, 150, 45, MARIGOLD);
      fillEllipse(png, 627, 185, 160, 20, WICKER);
      fillEllipse(png, 627, 195, 140, 8, COBALT);
    }
  },

  // OUTFIT
  {
    slug: "essma.tunica-clasica",
    render(png) {
      fillEllipse(png, 627, 630, 120, 60, CREAM);
      fillRect(png, 515, 610, 739, 690, CREAM);
      fillEllipse(png, 627, 630, 12, 12, RED);
      fillEllipse(png, 627, 630, 5, 5, GOLD);
      fillEllipse(png, 580, 635, 9, 9, MARIGOLD);
      fillEllipse(png, 674, 635, 9, 9, MARIGOLD);
      for (let y = 690; y <= 860; y += 2) {
        const progress = (y - 690) / 170;
        const halfW = 115 + progress * 75;
        fillRect(png, 627 - halfW, y, 627 + halfW, y + 1, COBALT);
      }
      fillEllipse(png, 627, 860, 190, 15, LIGHT_BLUE);
    }
  },
  {
    slug: "essma.overol-mezclilla",
    render(png) {
      fillEllipse(png, 627, 610, 115, 35, MARIGOLD);
      fillRect(png, 560, 615, 694, 700, DENIM);
      fillRect(png, 550, 580, 570, 625, DARK_DENIM);
      fillRect(png, 684, 580, 704, 625, DARK_DENIM);
      fillEllipse(png, 560, 620, 5, 5, GOLD);
      fillEllipse(png, 694, 620, 5, 5, GOLD);
      for (let y = 700; y <= 860; y += 2) {
        const progress = (y - 700) / 160;
        const halfW = 134 + progress * 30;
        fillRect(png, 627 - halfW, y, 627 + halfW, y + 1, DENIM);
      }
      fillRect(png, 625, 700, 629, 860, DARK_DENIM);
      fillRect(png, 595, 640, 659, 685, DARK_DENIM);
    }
  },
  {
    slug: "essma.vestido-festivo",
    render(png) {
      fillRect(png, 512, 600, 742, 660, MARIGOLD);
      for (let y = 660; y <= 870; y += 2) {
        const progress = (y - 660) / 210;
        const halfW = 120 + progress * 85;
        const color = Math.floor(y / 35) % 2 === 0 ? MARIGOLD : ORANGE;
        fillRect(png, 627 - halfW, y, 627 + halfW, y + 1, color);
      }
      fillRect(png, 512, 655, 742, 672, RED);
      fillEllipse(png, 627, 865, 185, 20, ORANGE);
    }
  },

  // SHOES
  {
    slug: "essma.huaraches-piel",
    render(png) {
      fillEllipse(png, 565, 1075, 30, 20, LEATHER);
      fillRect(png, 545, 1065, 585, 1073, WICKER);
      fillEllipse(png, 685, 1075, 30, 20, LEATHER);
      fillRect(png, 665, 1065, 705, 1073, WICKER);
    }
  },
  {
    slug: "essma.tenis-sol",
    render(png) {
      fillEllipse(png, 565, 1070, 32, 22, MARIGOLD);
      fillEllipse(png, 565, 1085, 34, 8, CREAM);
      fillEllipse(png, 548, 1070, 10, 10, CREAM);
      fillEllipse(png, 685, 1070, 32, 22, MARIGOLD);
      fillEllipse(png, 685, 1085, 34, 8, CREAM);
      fillEllipse(png, 702, 1070, 10, 10, CREAM);
    }
  },
  {
    slug: "essma.zapatitos-rojos",
    render(png) {
      fillEllipse(png, 565, 1068, 30, 20, RED);
      fillEllipse(png, 565, 1060, 5, 5, GOLD);
      fillEllipse(png, 685, 1068, 30, 20, RED);
      fillEllipse(png, 685, 1060, 5, 5, GOLD);
    }
  },

  // ACCESSORY
  {
    slug: "essma.panuelo-cobalto",
    render(png) {
      fillEllipse(png, 627, 565, 65, 25, COBALT);
      fillEllipse(png, 627, 580, 12, 12, LIGHT_BLUE);
      fillEllipse(png, 600, 565, 3, 3, CREAM);
      fillEllipse(png, 654, 565, 3, 3, CREAM);
    }
  },
  {
    slug: "essma.canastita-flores",
    render(png) {
      fillEllipse(png, 800, 730, 45, 35, WICKER);
      fillRect(png, 755, 710, 845, 735, WICKER);
      fillEllipse(png, 775, 700, 12, 12, MARIGOLD);
      fillEllipse(png, 800, 695, 14, 14, RED);
      fillEllipse(png, 825, 700, 12, 12, COBALT);
      fillEllipse(png, 800, 685, 25, 30, WICKER);
    }
  },
  {
    slug: "essma.pulserita-cuentas",
    render(png) {
      fillEllipse(png, 805, 685, 6, 6, RED);
      fillEllipse(png, 815, 685, 6, 6, GOLD);
      fillEllipse(png, 825, 685, 6, 6, COBALT);
      fillEllipse(png, 835, 685, 6, 6, MARIGOLD);
    }
  }
];

console.log("Generating 12 new Essma wearables and thumbnails...");

for (const item of items) {
  const png = createPng();
  item.render(png);
  
  const runtimeFile = path.join(outDirV2, `${item.slug}.png`);
  fs.writeFileSync(runtimeFile, PNG.sync.write(png));
  
  const thumb = createThumbnail(png);
  const thumbFile = path.join(thumbDirV2, `${item.slug}.png`);
  fs.writeFileSync(thumbFile, PNG.sync.write(thumb));
  
  console.log(`✓ Generated ${item.slug}.png`);
}

console.log("All 12 items successfully generated!");
