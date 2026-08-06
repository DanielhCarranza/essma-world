import { PNG } from 'pngjs';
import fs from 'fs';

const baseData = fs.readFileSync('public/assets/characters/v1/essma-base.png');
const basePng = PNG.sync.read(baseData);

const handsPng = new PNG({ width: basePng.width, height: basePng.height });

// Copy arm & hand regions from essma-base.png
for (let y = 0; y < basePng.height; y++) {
  for (let x = 0; x < basePng.width; x++) {
    const idx = (basePng.width * y + x) << 2;
    const alpha = basePng.data[idx + 3];
    
    const isLeftHand = x >= 380 && x <= 550 && y >= 570 && y <= 850;
    const isRightHand = x >= 700 && x <= 870 && y >= 570 && y <= 850;

    if ((isLeftHand || isRightHand) && alpha > 10) {
      handsPng.data[idx] = basePng.data[idx];
      handsPng.data[idx + 1] = basePng.data[idx + 1];
      handsPng.data[idx + 2] = basePng.data[idx + 2];
      handsPng.data[idx + 3] = basePng.data[idx + 3];
    } else {
      handsPng.data[idx] = 0;
      handsPng.data[idx + 1] = 0;
      handsPng.data[idx + 2] = 0;
      handsPng.data[idx + 3] = 0;
    }
  }
}

fs.writeFileSync('public/assets/characters/v1/essma-hands.png', PNG.sync.write(handsPng));
console.log('Created public/assets/characters/v1/essma-hands.png successfully');
