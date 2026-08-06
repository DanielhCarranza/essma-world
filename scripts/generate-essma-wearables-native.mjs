import fs from "fs";
import path from "path";
import zlib from "zlib";

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk("IHDR", ihdrData);

  const rawRows = [];
  const rowSize = width * 4;
  const pixels = Buffer.alloc(width * height * 4);

  drawFn(pixels, width, height);

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + rowSize);
    row[0] = 0; // None filter
    pixels.copy(row, 1, y * rowSize, (y + 1) * rowSize);
    rawRows.push(row);
  }

  const idatData = zlib.deflateSync(Buffer.concat(rawRows));
  const idat = makeChunk("IDAT", idatData);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

function setPixel(buf, w, h, x, y, r, g, b, a = 255) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= w || y < 0 || y >= h) return;
  const idx = (w * y + x) << 2;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

function fillEllipse(buf, w, h, cx, cy, rx, ry, [r, g, b, a = 255]) {
  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(w - 1, Math.ceil(cx + rx));
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(h - 1, Math.ceil(cy + ry));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      if ((dx * dx) / rx2 + dy2 / ry2 <= 1) {
        setPixel(buf, w, h, x, y, r, g, b, a);
      }
    }
  }
}

function fillRect(buf, w, h, x1, y1, x2, y2, [r, g, b, a = 255]) {
  const minX = Math.max(0, Math.floor(x1));
  const maxX = Math.min(w - 1, Math.ceil(x2));
  const minY = Math.max(0, Math.floor(y1));
  const maxY = Math.min(h - 1, Math.ceil(y2));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      setPixel(buf, w, h, x, y, r, g, b, a);
    }
  }
}

const outDirV2 = "public/assets/wearables/v2";
const thumbDirV2 = "public/assets/wearables/v2/thumbnails";
if (!fs.existsSync(outDirV2)) fs.mkdirSync(outDirV2, { recursive: true });
if (!fs.existsSync(thumbDirV2)) fs.mkdirSync(thumbDirV2, { recursive: true });

// Colors
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
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 580, 190, 45, 25, COBALT);
      fillEllipse(buf, w, h, 674, 190, 45, 25, COBALT);
      fillEllipse(buf, w, h, 627, 190, 18, 18, LIGHT_BLUE);
      fillEllipse(buf, w, h, 605, 220, 14, 30, COBALT);
      fillEllipse(buf, w, h, 649, 220, 14, 30, COBALT);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 95, 110, 50, 30, COBALT);
      fillEllipse(buf, w, h, 161, 110, 50, 30, COBALT);
      fillEllipse(buf, w, h, 128, 110, 22, 22, LIGHT_BLUE);
      fillEllipse(buf, w, h, 105, 145, 16, 35, COBALT);
      fillEllipse(buf, w, h, 151, 145, 16, 35, COBALT);
    }
  },
  {
    slug: "essma.corona-flores",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 215, 135, 12, GREEN);
      fillEllipse(buf, w, h, 525, 212, 14, 14, MARIGOLD);
      fillEllipse(buf, w, h, 575, 215, 16, 16, RED);
      fillEllipse(buf, w, h, 627, 210, 18, 18, COBALT);
      fillEllipse(buf, w, h, 679, 215, 16, 16, MARIGOLD);
      fillEllipse(buf, w, h, 729, 212, 14, 14, ORANGE);
      fillEllipse(buf, w, h, 627, 210, 6, 6, CREAM);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 128, 95, 15, GREEN);
      fillEllipse(buf, w, h, 60, 125, 16, 16, MARIGOLD);
      fillEllipse(buf, w, h, 95, 128, 18, 18, RED);
      fillEllipse(buf, w, h, 128, 120, 22, 22, COBALT);
      fillEllipse(buf, w, h, 161, 128, 18, 18, MARIGOLD);
      fillEllipse(buf, w, h, 196, 125, 16, 16, ORANGE);
      fillEllipse(buf, w, h, 128, 120, 8, 8, CREAM);
    }
  },
  {
    slug: "essma.gorrito-campesino",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 180, 150, 45, MARIGOLD);
      fillEllipse(buf, w, h, 627, 185, 160, 20, WICKER);
      fillEllipse(buf, w, h, 627, 195, 140, 8, COBALT);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 120, 100, 45, MARIGOLD);
      fillEllipse(buf, w, h, 128, 125, 110, 20, WICKER);
      fillEllipse(buf, w, h, 128, 135, 95, 8, COBALT);
    }
  },

  // OUTFIT
  {
    slug: "essma.tunica-clasica",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 630, 120, 60, CREAM);
      fillRect(buf, w, h, 515, 610, 739, 690, CREAM);
      fillEllipse(buf, w, h, 627, 630, 12, 12, RED);
      fillEllipse(buf, w, h, 627, 630, 5, 5, GOLD);
      fillEllipse(buf, w, h, 580, 635, 9, 9, MARIGOLD);
      fillEllipse(buf, w, h, 674, 635, 9, 9, MARIGOLD);
      for (let y = 690; y <= 860; y += 2) {
        const progress = (y - 690) / 170;
        const halfW = 115 + progress * 75;
        fillRect(buf, w, h, 627 - halfW, y, 627 + halfW, y + 1, COBALT);
      }
      fillEllipse(buf, w, h, 627, 860, 190, 15, LIGHT_BLUE);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 70, 75, 35, CREAM);
      fillRect(buf, w, h, 55, 60, 201, 105, CREAM);
      fillEllipse(buf, w, h, 128, 70, 10, 10, RED);
      fillEllipse(buf, w, h, 128, 70, 4, 4, GOLD);
      for (let y = 105; y <= 210; y += 2) {
        const progress = (y - 105) / 105;
        const halfW = 75 + progress * 40;
        fillRect(buf, w, h, 128 - halfW, y, 128 + halfW, y + 1, COBALT);
      }
      fillEllipse(buf, w, h, 128, 210, 115, 10, LIGHT_BLUE);
    }
  },
  {
    slug: "essma.overol-mezclilla",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 610, 115, 35, MARIGOLD);
      fillRect(buf, w, h, 560, 615, 694, 700, DENIM);
      fillRect(buf, w, h, 550, 580, 570, 625, DARK_DENIM);
      fillRect(buf, w, h, 684, 580, 704, 625, DARK_DENIM);
      fillEllipse(buf, w, h, 560, 620, 5, 5, GOLD);
      fillEllipse(buf, w, h, 694, 620, 5, 5, GOLD);
      for (let y = 700; y <= 860; y += 2) {
        const progress = (y - 700) / 160;
        const halfW = 134 + progress * 30;
        fillRect(buf, w, h, 627 - halfW, y, 627 + halfW, y + 1, DENIM);
      }
      fillRect(buf, w, h, 625, 700, 629, 860, DARK_DENIM);
      fillRect(buf, w, h, 595, 640, 659, 685, DARK_DENIM);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 65, 70, 25, MARIGOLD);
      fillRect(buf, w, h, 85, 70, 171, 115, DENIM);
      fillRect(buf, w, h, 78, 45, 92, 75, DARK_DENIM);
      fillRect(buf, w, h, 164, 45, 178, 75, DARK_DENIM);
      for (let y = 115; y <= 215; y += 2) {
        const progress = (y - 115) / 100;
        const halfW = 86 + progress * 20;
        fillRect(buf, w, h, 128 - halfW, y, 128 + halfW, y + 1, DENIM);
      }
      fillRect(buf, w, h, 126, 115, 130, 215, DARK_DENIM);
    }
  },
  {
    slug: "essma.vestido-festivo",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 512, 600, 742, 660, MARIGOLD);
      for (let y = 660; y <= 870; y += 2) {
        const progress = (y - 660) / 210;
        const halfW = 120 + progress * 85;
        const color = Math.floor(y / 35) % 2 === 0 ? MARIGOLD : ORANGE;
        fillRect(buf, w, h, 627 - halfW, y, 627 + halfW, y + 1, color);
      }
      fillRect(buf, w, h, 512, 655, 742, 672, RED);
      fillEllipse(buf, w, h, 627, 865, 185, 20, ORANGE);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 60, 50, 196, 90, MARIGOLD);
      for (let y = 90; y <= 215; y += 2) {
        const progress = (y - 90) / 125;
        const halfW = 68 + progress * 50;
        const color = Math.floor(y / 25) % 2 === 0 ? MARIGOLD : ORANGE;
        fillRect(buf, w, h, 128 - halfW, y, 128 + halfW, y + 1, color);
      }
      fillRect(buf, w, h, 60, 85, 196, 97, RED);
      fillEllipse(buf, w, h, 128, 212, 118, 15, ORANGE);
    }
  },

  // SHOES
  {
    slug: "essma.huaraches-piel",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 565, 1075, 30, 20, LEATHER);
      fillRect(buf, w, h, 545, 1065, 585, 1073, WICKER);
      fillEllipse(buf, w, h, 685, 1075, 30, 20, LEATHER);
      fillRect(buf, w, h, 665, 1065, 705, 1073, WICKER);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 75, 130, 45, 30, LEATHER);
      fillRect(buf, w, h, 45, 115, 105, 127, WICKER);
      fillEllipse(buf, w, h, 181, 130, 45, 30, LEATHER);
      fillRect(buf, w, h, 151, 115, 211, 127, WICKER);
    }
  },
  {
    slug: "essma.tenis-sol",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 565, 1070, 32, 22, MARIGOLD);
      fillEllipse(buf, w, h, 565, 1085, 34, 8, CREAM);
      fillEllipse(buf, w, h, 548, 1070, 10, 10, CREAM);
      fillEllipse(buf, w, h, 685, 1070, 32, 22, MARIGOLD);
      fillEllipse(buf, w, h, 685, 1085, 34, 8, CREAM);
      fillEllipse(buf, w, h, 702, 1070, 10, 10, CREAM);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 75, 130, 48, 33, MARIGOLD);
      fillEllipse(buf, w, h, 75, 150, 50, 12, CREAM);
      fillEllipse(buf, w, h, 50, 130, 15, 15, CREAM);
      fillEllipse(buf, w, h, 181, 130, 48, 33, MARIGOLD);
      fillEllipse(buf, w, h, 181, 150, 50, 12, CREAM);
      fillEllipse(buf, w, h, 206, 130, 15, 15, CREAM);
    }
  },
  {
    slug: "essma.zapatitos-rojos",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 565, 1068, 30, 20, RED);
      fillEllipse(buf, w, h, 565, 1060, 5, 5, GOLD);
      fillEllipse(buf, w, h, 685, 1068, 30, 20, RED);
      fillEllipse(buf, w, h, 685, 1060, 5, 5, GOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 75, 130, 45, 30, RED);
      fillEllipse(buf, w, h, 75, 118, 8, 8, GOLD);
      fillEllipse(buf, w, h, 181, 130, 45, 30, RED);
      fillEllipse(buf, w, h, 181, 118, 8, 8, GOLD);
    }
  },

  // ACCESSORY
  {
    slug: "essma.panuelo-cobalto",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 565, 65, 25, COBALT);
      fillEllipse(buf, w, h, 627, 580, 12, 12, LIGHT_BLUE);
      fillEllipse(buf, w, h, 600, 565, 3, 3, CREAM);
      fillEllipse(buf, w, h, 654, 565, 3, 3, CREAM);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 125, 95, 38, COBALT);
      fillEllipse(buf, w, h, 128, 148, 18, 18, LIGHT_BLUE);
      fillEllipse(buf, w, h, 88, 125, 5, 5, CREAM);
      fillEllipse(buf, w, h, 168, 125, 5, 5, CREAM);
    }
  },
  {
    slug: "essma.canastita-flores",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 800, 730, 45, 35, WICKER);
      fillRect(buf, w, h, 755, 710, 845, 735, WICKER);
      fillEllipse(buf, w, h, 775, 700, 12, 12, MARIGOLD);
      fillEllipse(buf, w, h, 800, 695, 14, 14, RED);
      fillEllipse(buf, w, h, 825, 700, 12, 12, COBALT);
      fillEllipse(buf, w, h, 800, 685, 25, 30, WICKER);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 150, 75, 55, WICKER);
      fillRect(buf, w, h, 53, 115, 203, 155, WICKER);
      fillEllipse(buf, w, h, 88, 100, 20, 20, MARIGOLD);
      fillEllipse(buf, w, h, 128, 92, 24, 24, RED);
      fillEllipse(buf, w, h, 168, 100, 20, 20, COBALT);
      fillEllipse(buf, w, h, 128, 75, 40, 48, WICKER);
    }
  },
  {
    slug: "essma.pulserita-cuentas",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 805, 685, 6, 6, RED);
      fillEllipse(buf, w, h, 815, 685, 6, 6, GOLD);
      fillEllipse(buf, w, h, 825, 685, 6, 6, COBALT);
      fillEllipse(buf, w, h, 835, 685, 6, 6, MARIGOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 65, 128, 18, 18, RED);
      fillEllipse(buf, w, h, 107, 128, 18, 18, GOLD);
      fillEllipse(buf, w, h, 149, 128, 18, 18, COBALT);
      fillEllipse(buf, w, h, 191, 128, 18, 18, MARIGOLD);
    }
  }
];

console.log("Generating 12 native PNG wearable layers and thumbnails...");

for (const item of items) {
  const layerPng = createPng(1254, 1254, item.renderLayer);
  fs.writeFileSync(path.join(outDirV2, `${item.slug}.png`), layerPng);

  const thumbPng = createPng(256, 256, item.renderThumb);
  fs.writeFileSync(path.join(thumbDirV2, `${item.slug}.png`), thumbPng);

  console.log(`✓ Fast generated ${item.slug}.png`);
}

console.log("Native PNG generation finished cleanly!");
