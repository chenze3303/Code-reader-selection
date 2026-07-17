#!/usr/bin/env node
/**
 * JS 文件压缩脚本
 * 用法：node scripts/minify-js.js
 */
const fs = require('fs');
const path = require('path');

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

console.log('\n📦 JS 压缩脚本\n');

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

  // 简单的 JS 压缩
  const minified = js
    // 移除多行注释
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // 移除单行注释（保留 URL 中的 //）
    .replace(/(?<![:"'])\/\/.*$/gm, '')
    // 移除换行
    .replace(/\n/g, ' ')
    // 移除多余空格
    .replace(/\s{2,}/g, ' ')
    // 移除空格 around operators
    .replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, '$1')
    // 移除尾部分号前的空格
    .replace(/\s+;/g, ';')
    // 移除函数名后的空格
    .replace(/(\w+)\s*\(/g, '$1(')
    .trim();

  fs.writeFileSync(outputPath, minified, 'utf8');

  const originalSize = Buffer.byteLength(js, 'utf8');
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const saved = originalSize - minifiedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);
  totalSaved += saved;

  console.log(`✓ ${file}`);
  console.log(`  ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (节省 ${percent}%)`);
}

console.log(`\n=== 压缩完成 ===`);
console.log(`总计节省: ${(totalSaved / 1024).toFixed(1)}KB`);
