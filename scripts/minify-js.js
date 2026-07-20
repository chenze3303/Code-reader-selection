#!/usr/bin/env node
/**
 * JS 文件压缩脚本（使用 terser）
 * 用法：node scripts/minify-js.js
 */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');

// 需要压缩的 JS 文件
const JS_FILES = [
  'js/data/product_db.js',
  'js/data/competitor.js',
  'js/data/mapping.js',
  'js/data/download_urls.js',
  'js/app.js',
  'js/bom.js',
  'js/data/peidan.js',
  'js/mapping_module.js',
  'js/data/status_codes.js',
  'js/statuscode_module.js',
  'js/data/cat_dist_map.js'
];

async function main() {
  console.log('\n📦 JS 压缩脚本 (terser)\n');

  let totalSaved = 0;

  for (const file of JS_FILES) {
    const inputPath = path.join(ROOT, file);
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const dir = path.dirname(file);
    const outputPath = path.join(ROOT, dir, `${name}.min${ext}`);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  跳过 ${file}（文件不存在）`);
      continue;
    }

    const js = fs.readFileSync(inputPath, 'utf8');

    try {
      const result = await minify(js, {
        compress: { passes: 2 },
        mangle: false,
        output: { comments: false }
      });
      const minified = result.code;

      fs.writeFileSync(outputPath, minified, 'utf8');

      const originalSize = Buffer.byteLength(js, 'utf8');
      const minifiedSize = Buffer.byteLength(minified, 'utf8');
      const saved = originalSize - minifiedSize;
      const percent = ((saved / originalSize) * 100).toFixed(1);
      totalSaved += saved;

      console.log(`✓ ${file}`);
      console.log(`  ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (节省 ${percent}%)`);
    } catch (e) {
      console.log(`❌ ${file} — ${e.message}`);
    }
  }

  console.log(`\n=== 压缩完成 ===`);
  console.log(`总计节省: ${(totalSaved / 1024).toFixed(1)}KB`);
}

main();
