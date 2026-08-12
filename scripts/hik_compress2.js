const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const SRC = 'assets/products';
const OUT = 'assets/products/webp';
(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.png'));
  let done = 0;
  for (const f of files) {
    const name = f.replace(/\.png$/, '');
    const outPath = path.join(OUT, name + '.webp');
    if (fs.existsSync(outPath)) continue;
    await sharp(path.join(SRC, f)).webp({ quality: 82 }).toFile(outPath);
    done++;
  }
  console.log(`done: ${done}, webp total: ${fs.readdirSync(OUT).length}`);
})();
