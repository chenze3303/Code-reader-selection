#!/usr/bin/env node
/**
 * 替换压缩后的图片
 * 用法：node scripts/replace-images.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 压缩后的图片文件
const IMAGES = [
  'contact-wechat.jpg',
  'contact-douyin.jpg',
  'contact-bilibili.jpg',
  'code-type-desc.png',
  'code-type-desc-dark.png'
];

console.log('\n🔄 替换压缩后的图片\n');

let replaced = 0;
for (const file of IMAGES) {
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  const originalPath = path.join(ROOT, file);
  const compressedPath = path.join(ROOT, `${name}.min${ext}`);
  const backupPath = path.join(ROOT, `${name}.bak${ext}`);

  if (!fs.existsSync(compressedPath)) {
    console.log(`⚠️  跳过 ${file}（压缩文件不存在）`);
    continue;
  }

  // 备份原文件
  if (fs.existsSync(originalPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log(`📦 备份: ${file} → ${name}.bak${ext}`);
  }

  // 替换为压缩版
  fs.copyFileSync(compressedPath, originalPath);
  // 删除压缩文件
  fs.unlinkSync(compressedPath);

  const originalSize = fs.statSync(originalPath).size;
  console.log(`✓ 替换: ${file} (${(originalSize / 1024).toFixed(1)}KB)`);
  replaced++;
}

console.log(`\n完成！替换了 ${replaced} 张图片`);
console.log('原文件已备份为 *.bak.* 格式');
