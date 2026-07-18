#!/usr/bin/env node
/**
 * 完整性能测试脚本
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('\n📊 完整性能优化报告\n');

// 计算文件大小
function getSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

// 1. CSS
const cssOriginal = getSize(path.join(ROOT, 'css', 'style.css'));
const cssMinified = getSize(path.join(ROOT, 'css', 'style.min.css'));

console.log('=== CSS ===');
console.log(`原始: ${(cssOriginal / 1024).toFixed(1)}KB → 压缩: ${(cssMinified / 1024).toFixed(1)}KB`);
console.log(`节省: ${((cssOriginal - cssMinified) / 1024).toFixed(1)}KB (${((cssOriginal - cssMinified) / cssOriginal * 100).toFixed(1)}%)`);

// 2. JS 文件
const jsFiles = [
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

let jsOriginalTotal = 0;
let jsMinifiedTotal = 0;

console.log('\n=== JS ===');
for (const file of jsFiles) {
  const original = getSize(path.join(ROOT, file));
  const minified = getSize(path.join(ROOT, file.replace('.js', '.min.js')));
  if (original > 0 && minified > 0) {
    jsOriginalTotal += original;
    jsMinifiedTotal += minified;
    console.log(`${path.basename(file)}: ${(original / 1024).toFixed(1)}KB → ${(minified / 1024).toFixed(1)}KB`);
  }
}
console.log(`JS 总计: ${(jsOriginalTotal / 1024).toFixed(1)}KB → ${(jsMinifiedTotal / 1024).toFixed(1)}KB`);
console.log(`JS 节省: ${((jsOriginalTotal - jsMinifiedTotal) / 1024).toFixed(1)}KB (${((jsOriginalTotal - jsMinifiedTotal) / jsOriginalTotal * 100).toFixed(1)}%)`);

// 3. 图片
const images = [
  'assets/contact-wechat.jpg',
  'assets/contact-douyin.jpg',
  'assets/contact-bilibili.jpg',
  'assets/code-type-desc.png',
  'assets/code-type-desc-dark.png'
];

const imageOriginalSizes = {
  'assets/contact-wechat.jpg': 85842,
  'assets/contact-douyin.jpg': 113846,
  'assets/contact-bilibili.jpg': 138431,
  'assets/code-type-desc.png': 44580,
  'assets/code-type-desc-dark.png': 63727
};

let imgOriginalTotal = 0;
let imgCurrentTotal = 0;

console.log('\n=== 图片 ===');
for (const img of images) {
  const original = imageOriginalSizes[img] || 0;
  const current = getSize(path.join(ROOT, img));
  imgOriginalTotal += original;
  imgCurrentTotal += current;
  console.log(`${img}: ${(original / 1024).toFixed(1)}KB → ${(current / 1024).toFixed(1)}KB`);
}
console.log(`图片总计: ${(imgOriginalTotal / 1024).toFixed(1)}KB → ${(imgCurrentTotal / 1024).toFixed(1)}KB`);
console.log(`图片节省: ${((imgOriginalTotal - imgCurrentTotal) / 1024).toFixed(1)}KB (${((imgOriginalTotal - imgCurrentTotal) / imgOriginalTotal * 100).toFixed(1)}%)`);

// 总计
const totalOriginal = cssOriginal + jsOriginalTotal + imgOriginalTotal;
const totalCurrent = cssMinified + jsMinifiedTotal + imgCurrentTotal;
const totalSaved = totalOriginal - totalCurrent;

console.log('\n=== 总计 ===');
console.log(`优化前: ${(totalOriginal / 1024).toFixed(1)}KB (${(totalOriginal / 1024 / 1024).toFixed(2)}MB)`);
console.log(`优化后: ${(totalCurrent / 1024).toFixed(1)}KB (${(totalCurrent / 1024 / 1024).toFixed(2)}MB)`);
console.log(`节省: ${(totalSaved / 1024).toFixed(1)}KB (${(totalSaved / totalOriginal * 100).toFixed(1)}%)`);
