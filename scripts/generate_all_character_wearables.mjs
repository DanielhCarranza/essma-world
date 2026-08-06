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
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
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
    row[0] = 0;
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
const SKY_BLUE = [125, 211, 252];
const MARIGOLD = [245, 158, 11];
const ORANGE = [234, 88, 12];
const CREAM = [254, 243, 199];
const RED = [220, 38, 38];
const PINK = [244, 114, 182];
const GREEN = [21, 128, 61];
const LEATHER = [154, 52, 18];
const WICKER = [180, 83, 9];
const DENIM = [37, 99, 235];
const DARK_DENIM = [30, 64, 175];
const GOLD = [234, 179, 8];

const items = [
  // JUANCITO (Head: 627, 388; Neck: 627, 575; Body: 627, 720)
  {
    slug: "juancito.sombrerito-palma",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 355, 110, 35, MARIGOLD);
      fillEllipse(buf, w, h, 627, 350, 80, 10, COBALT);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 125, 90, 30, MARIGOLD);
      fillEllipse(buf, w, h, 128, 120, 65, 8, COBALT);
    }
  },
  {
    slug: "juancito.casquito-explorador",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 360, 90, 40, WICKER);
      fillRect(buf, w, h, 527, 380, 727, 395, LEATHER);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 120, 75, 35, WICKER);
      fillRect(buf, w, h, 45, 135, 211, 148, LEATHER);
    }
  },
  {
    slug: "juancito.corona-cactus",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 375, 100, 15, GREEN);
      fillEllipse(buf, w, h, 627, 365, 20, 20, RED);
      fillEllipse(buf, w, h, 627, 365, 7, 7, GOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 135, 85, 12, GREEN);
      fillEllipse(buf, w, h, 128, 125, 16, 16, RED);
      fillEllipse(buf, w, h, 128, 125, 6, 6, GOLD);
    }
  },
  {
    slug: "juancito.gorrito-noche",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 557, 340, 697, 388, COBALT);
      fillEllipse(buf, w, h, 627, 280, 15, 15, CREAM);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 70, 90, 186, 170, COBALT);
      fillEllipse(buf, w, h, 128, 75, 12, 12, CREAM);
    }
  },
  {
    slug: "juancito.panuelo-rojo",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 575, 80, 25, RED);
      fillEllipse(buf, w, h, 627, 565, 10, 10, GOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 125, 90, 30, RED);
      fillEllipse(buf, w, h, 128, 115, 12, 12, GOLD);
    }
  },
  {
    slug: "juancito.collar-semillas",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 575, 80, 25, LEATHER);
      fillEllipse(buf, w, h, 627, 595, 10, 10, MARIGOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 125, 90, 30, LEATHER);
      fillEllipse(buf, w, h, 128, 145, 12, 12, MARIGOLD);
    }
  },
  {
    slug: "juancito.mono-mariposa",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 597, 575, 30, 15, MARIGOLD);
      fillEllipse(buf, w, h, 657, 575, 30, 15, MARIGOLD);
      fillEllipse(buf, w, h, 627, 575, 10, 10, ORANGE);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 98, 128, 30, 15, MARIGOLD);
      fillEllipse(buf, w, h, 158, 128, 30, 15, MARIGOLD);
      fillEllipse(buf, w, h, 128, 128, 10, 10, ORANGE);
    }
  },
  {
    slug: "juancito.bufandita-tejida",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 557, 560, 697, 590, DENIM);
      fillRect(buf, w, h, 657, 585, 687, 635, DARK_DENIM);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 55, 110, 201, 140, DENIM);
      fillRect(buf, w, h, 158, 135, 188, 185, DARK_DENIM);
    }
  },
  {
    slug: "juancito.sarape-sonora",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 517, 660, 737, 780, MARIGOLD);
      fillRect(buf, w, h, 517, 690, 737, 715, COBALT);
      fillRect(buf, w, h, 517, 735, 737, 750, RED);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 45, 70, 211, 185, MARIGOLD);
      fillRect(buf, w, h, 45, 100, 211, 125, COBALT);
      fillRect(buf, w, h, 45, 145, 211, 160, RED);
    }
  },
  {
    slug: "juancito.chaleco-cuero",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 537, 655, 717, 775, LEATHER);
      fillRect(buf, w, h, 607, 655, 647, 775, [0, 0, 0, 0]);
      fillEllipse(buf, w, h, 567, 680, 5, 5, GOLD);
      fillEllipse(buf, w, h, 687, 680, 5, 5, GOLD);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 55, 70, 201, 185, LEATHER);
      fillRect(buf, w, h, 113, 70, 143, 185, [0, 0, 0, 0]);
      fillEllipse(buf, w, h, 85, 95, 6, 6, GOLD);
      fillEllipse(buf, w, h, 171, 95, 6, 6, GOLD);
    }
  },
  {
    slug: "juancito.overolcito-trabajo",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 537, 670, 717, 780, DENIM);
      fillRect(buf, w, h, 567, 625, 587, 675, DARK_DENIM);
      fillRect(buf, w, h, 667, 625, 687, 675, DARK_DENIM);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 55, 80, 201, 185, DENIM);
      fillRect(buf, w, h, 85, 35, 105, 85, DARK_DENIM);
      fillRect(buf, w, h, 151, 35, 171, 85, DARK_DENIM);
    }
  },

  // TORI (Head: 627, 360; Neck: 627, 560; Body: 627, 735)
  {
    slug: "tori.sombrero-pluma",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 340, 110, 30, LEATHER);
      fillEllipse(buf, w, h, 677, 300, 25, 40, RED);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 135, 90, 25, LEATHER);
      fillEllipse(buf, w, h, 178, 95, 20, 35, RED);
    }
  },
  {
    slug: "tori.diadema-estrellita",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 350, 100, 15, COBALT);
      fillEllipse(buf, w, h, 627, 335, 15, 15, GOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 135, 85, 12, COBALT);
      fillEllipse(buf, w, h, 128, 120, 15, 15, GOLD);
    }
  },
  {
    slug: "tori.gorrito-tejido",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 330, 90, 40, ORANGE);
      fillEllipse(buf, w, h, 627, 290, 15, 15, CREAM);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 130, 75, 35, ORANGE);
      fillEllipse(buf, w, h, 128, 90, 12, 12, CREAM);
    }
  },
  {
    slug: "tori.viserita-sol",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 355, 120, 20, MARIGOLD);
      fillRect(buf, w, h, 537, 340, 717, 355, RED);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 135, 95, 18, MARIGOLD);
      fillRect(buf, w, h, 55, 120, 201, 135, RED);
    }
  },
  {
    slug: "tori.collar-flores",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 560, 90, 22, GREEN);
      fillEllipse(buf, w, h, 577, 560, 10, 10, RED);
      fillEllipse(buf, w, h, 627, 565, 12, 12, MARIGOLD);
      fillEllipse(buf, w, h, 677, 560, 10, 10, COBALT);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 128, 85, 20, GREEN);
      fillEllipse(buf, w, h, 78, 128, 10, 10, RED);
      fillEllipse(buf, w, h, 128, 133, 12, 12, MARIGOLD);
      fillEllipse(buf, w, h, 178, 128, 10, 10, COBALT);
    }
  },
  {
    slug: "tori.panuelo-amarillo",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 547, 545, 707, 580, MARIGOLD);
      fillEllipse(buf, w, h, 627, 580, 10, 10, RED);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 55, 105, 201, 145, MARIGOLD);
      fillEllipse(buf, w, h, 128, 145, 10, 10, RED);
    }
  },
  {
    slug: "tori.gargantilla-cuentas",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 560, 80, 15, SKY_BLUE);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 128, 80, 15, SKY_BLUE);
    }
  },
  {
    slug: "tori.ponchito-rayas",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 507, 670, 747, 790, MARIGOLD);
      fillRect(buf, w, h, 507, 710, 747, 740, COBALT);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 45, 70, 211, 185, MARIGOLD);
      fillRect(buf, w, h, 45, 110, 211, 140, COBALT);
    }
  },
  {
    slug: "tori.chaleco-denim",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 527, 670, 727, 790, DENIM);
      fillRect(buf, w, h, 607, 670, 647, 790, [0, 0, 0, 0]);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 55, 70, 201, 185, DENIM);
      fillRect(buf, w, h, 113, 70, 143, 185, [0, 0, 0, 0]);
    }
  },
  {
    slug: "tori.capita-bosque",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 730, 130, 70, GREEN);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 128, 105, 60, GREEN);
    }
  },
  {
    slug: "tori.tunicas-flores",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 517, 660, 737, 800, CREAM);
      fillEllipse(buf, w, h, 627, 730, 15, 15, RED);
      fillEllipse(buf, w, h, 577, 750, 12, 12, MARIGOLD);
      fillEllipse(buf, w, h, 677, 750, 12, 12, MARIGOLD);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 45, 70, 211, 195, CREAM);
      fillEllipse(buf, w, h, 128, 130, 15, 15, RED);
      fillEllipse(buf, w, h, 78, 150, 12, 12, MARIGOLD);
      fillEllipse(buf, w, h, 178, 150, 12, 12, MARIGOLD);
    }
  },

  // ANITA (Head: 627, 390; Neck: 627, 560; Body: 627, 760)
  {
    slug: "anita.sombrero-vaquero",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 370, 140, 45, LEATHER);
      fillEllipse(buf, w, h, 627, 330, 80, 30, WICKER);
      fillRect(buf, w, h, 547, 350, 707, 360, RED);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 135, 110, 35, LEATHER);
      fillEllipse(buf, w, h, 128, 100, 65, 25, WICKER);
      fillRect(buf, w, h, 63, 118, 193, 128, RED);
    }
  },
  {
    slug: "anita.mono-rosa",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 592, 370, 35, 20, PINK);
      fillEllipse(buf, w, h, 662, 370, 35, 20, PINK);
      fillEllipse(buf, w, h, 627, 370, 12, 12, RED);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 95, 128, 35, 20, PINK);
      fillEllipse(buf, w, h, 161, 128, 35, 20, PINK);
      fillEllipse(buf, w, h, 128, 128, 12, 12, RED);
    }
  },
  {
    slug: "anita.gorrito-campana",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 350, 100, 45, CREAM);
      fillRect(buf, w, h, 527, 370, 727, 385, LIGHT_BLUE);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 115, 80, 35, CREAM);
      fillRect(buf, w, h, 48, 130, 208, 145, LIGHT_BLUE);
    }
  },
  {
    slug: "anita.diadema-girasol",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 380, 110, 15, GREEN);
      fillEllipse(buf, w, h, 627, 355, 20, 20, MARIGOLD);
      fillEllipse(buf, w, h, 627, 355, 10, 10, LEATHER);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 140, 90, 12, GREEN);
      fillEllipse(buf, w, h, 128, 115, 18, 18, MARIGOLD);
      fillEllipse(buf, w, h, 128, 115, 8, 8, LEATHER);
    }
  },
  {
    slug: "anita.campanilla-dorada",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 565, 100, 25, LEATHER);
      fillRect(buf, w, h, 607, 580, 647, 620, GOLD);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 110, 85, 20, LEATHER);
      fillRect(buf, w, h, 110, 125, 146, 160, GOLD);
    }
  },
  {
    slug: "anita.panuelo-marigold",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 537, 545, 717, 595, MARIGOLD);
      fillEllipse(buf, w, h, 627, 595, 10, 10, RED);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 50, 100, 206, 145, MARIGOLD);
      fillEllipse(buf, w, h, 128, 145, 10, 10, RED);
    }
  },
  {
    slug: "anita.collar-corazon",
    renderLayer(buf, w, h) {
      fillEllipse(buf, w, h, 627, 560, 95, 22, RED);
      fillEllipse(buf, w, h, 627, 585, 15, 15, PINK);
    },
    renderThumb(buf, w, h) {
      fillEllipse(buf, w, h, 128, 120, 80, 18, RED);
      fillEllipse(buf, w, h, 128, 142, 13, 13, PINK);
    }
  },
  {
    slug: "anita.panuelo-verde",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 537, 545, 717, 595, GREEN);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 50, 100, 206, 145, GREEN);
    }
  },
  {
    slug: "anita.mantita-tejida",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 487, 700, 767, 820, RED);
      fillRect(buf, w, h, 487, 730, 767, 760, MARIGOLD);
      fillRect(buf, w, h, 487, 775, 767, 795, COBALT);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 30, 70, 226, 185, RED);
      fillRect(buf, w, h, 30, 100, 226, 130, MARIGOLD);
      fillRect(buf, w, h, 30, 145, 226, 165, COBALT);
    }
  },
  {
    slug: "anita.overol-granja",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 517, 690, 737, 830, DENIM);
      fillRect(buf, w, h, 547, 640, 567, 695, DARK_DENIM);
      fillRect(buf, w, h, 687, 640, 707, 695, DARK_DENIM);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 45, 80, 211, 200, DENIM);
      fillRect(buf, w, h, 70, 35, 90, 85, DARK_DENIM);
      fillRect(buf, w, h, 166, 35, 186, 85, DARK_DENIM);
    }
  },
  {
    slug: "anita.falda-floreada",
    renderLayer(buf, w, h) {
      fillRect(buf, w, h, 467, 690, 787, 830, PINK);
      fillEllipse(buf, w, h, 547, 740, 15, 15, MARIGOLD);
      fillEllipse(buf, w, h, 677, 740, 15, 15, MARIGOLD);
    },
    renderThumb(buf, w, h) {
      fillRect(buf, w, h, 25, 70, 231, 200, PINK);
      fillEllipse(buf, w, h, 75, 130, 15, 15, MARIGOLD);
      fillEllipse(buf, w, h, 181, 130, 15, 15, MARIGOLD);
    }
  }
];

console.log("Generating remaining character wearables (Juancito, Tori, Anita)...");

for (const item of items) {
  const layerPng = createPng(1254, 1254, item.renderLayer);
  fs.writeFileSync(path.join(outDirV2, `${item.slug}.png`), layerPng);

  const thumbPng = createPng(256, 256, item.renderThumb);
  fs.writeFileSync(path.join(thumbDirV2, `${item.slug}.png`), thumbPng);

  console.log(`✓ Generated ${item.slug}.png`);
}

console.log("All character wearables generated cleanly!");
