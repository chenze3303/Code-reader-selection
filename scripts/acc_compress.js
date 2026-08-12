const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = '/Users/chenjiaze/Downloads/Code-reader-selection-main/assets/accessories';
const OUT = '/Users/chenjiaze/Downloads/Code-reader-selection-main/assets/accessories/webp';

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter(f => /\.(png|jpe?g)$/i.test(f));
  let done = 0, skip = 0, fail = 0;
  for (const f of files) {
    const srcPath = path.join(SRC, f);
    const name = f.replace(/\.[^.]+$/, '');
    const outPath = path.join(OUT, name + '.webp');
    if (fs.existsSync(outPath)) { skip++; continue; }
    try {
      const inSize = fs.statSync(srcPath).size;
      await sharp(srcPath).webp({ quality: 82 }).toFile(outPath);
      const outSize = fs.statSync(outPath).size;
      console.log(`  ${f}: ${(inSize/1024).toFixed(1)}KB -> ${(outSize/1024).toFixed(1)}KB`);
      done++;
    } catch (e) {
      console.log(`  FAIL ${f}: ${e.message}`);
      fail++;
    }
  }
  console.log(`done: ${done}, skip(existing): ${skip}, fail: ${fail}`);

  // 生成图片清单（db_editor 需要，浏览器无法列目录）
  const webpFiles = fs.readdirSync(OUT).filter(f => /\.webp$/i.test(f)).sort();
  const manifest = webpFiles.map(f => ({ file: f, size: fs.statSync(path.join(OUT, f)).size }));
  fs.writeFileSync(path.join(SRC, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`manifest: ${manifest.length} images -> ${path.join(SRC, 'manifest.json')}`);
})();
