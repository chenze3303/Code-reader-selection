const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = '/Users/chenjiaze/Downloads/Code-reader-selection-main/assets/products';
const OUT = '/Users/chenjiaze/Downloads/Code-reader-selection-main/assets/products/webp';

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.png'));
  let totalIn = 0, totalOut = 0, done = 0;
  for (const f of files) {
    const srcPath = path.join(SRC, f);
    const name = f.replace(/\.png$/, '');
    const outPath = path.join(OUT, name + '.webp');
    if (fs.existsSync(outPath)) continue;
    const inSize = fs.statSync(srcPath).size;
    await sharp(srcPath).webp({ quality: 82 }).toFile(outPath);
    const outSize = fs.statSync(outPath).size;
    totalIn += inSize; totalOut += outSize; done++;
    if (done % 50 === 0) console.log(`  ${done}/${files.length}`);
  }
  console.log(`done: ${done}/${files.length}, in=${(totalIn/1024/1024).toFixed(1)}MB out=${(totalOut/1024/1024).toFixed(1)}MB`);
})();
