#!/usr/bin/env node
/**
 * 性能对比测试脚本
 * 对比优化前后的文件大小和加载时间
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('\n📊 性能优化对比报告\n');

// 优化前的数据（从 git 或备份恢复）
const BEFORE = {
  css: 124078,        // style.css 原始大小
  images: {
    'assets/contact-wechat.jpg': 85842,
    'assets/contact-douyin.jpg': 113846,
    'assets/contact-bilibili.jpg': 138431,
    'assets/code-type-desc.png': 44580,
    'assets/code-type-desc-dark.png': 63727
  }
};

// 读取当前文件大小
function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

// 计算优化后的大小
const cssCurrent = getFileSize(path.join(ROOT, 'css', 'style.min.css'));
const imagesCurrent = {};
let imagesTotalBefore = 0;
let imagesTotalAfter = 0;

for (const [file, beforeSize] of Object.entries(BEFORE.images)) {
  const currentSize = getFileSize(path.join(ROOT, file));
  imagesCurrent[file] = currentSize;
  imagesTotalBefore += beforeSize;
  imagesTotalAfter += currentSize;
}

const cssSaved = BEFORE.css - cssCurrent;
const imagesSaved = imagesTotalBefore - imagesTotalAfter;
const totalSaved = cssSaved + imagesSaved;

// 显示结果
console.log('=== CSS 优化 ===');
console.log(`原始: ${(BEFORE.css / 1024).toFixed(1)}KB`);
console.log(`压缩: ${(cssCurrent / 1024).toFixed(1)}KB`);
console.log(`节省: ${(cssSaved / 1024).toFixed(1)}KB (${((cssSaved / BEFORE.css) * 100).toFixed(1)}%)`);

console.log('\n=== 图片优化 ===');
for (const [file, beforeSize] of Object.entries(BEFORE.images)) {
  const afterSize = imagesCurrent[file];
  const saved = beforeSize - afterSize;
  const percent = ((saved / beforeSize) * 100).toFixed(1);
  console.log(`${file}: ${(beforeSize / 1024).toFixed(1)}KB → ${(afterSize / 1024).toFixed(1)}KB (节省 ${percent}%)`);
}

console.log('\n=== 总计 ===');
console.log(`优化前: ${((BEFORE.css + imagesTotalBefore) / 1024).toFixed(1)}KB`);
console.log(`优化后: ${((cssCurrent + imagesTotalAfter) / 1024).toFixed(1)}KB`);
console.log(`总计节省: ${(totalSaved / 1024).toFixed(1)}KB (${((totalSaved / (BEFORE.css + imagesTotalBefore)) * 100).toFixed(1)}%)`);

// 预估加载时间
console.log('\n=== 预估加载时间 ===');
const savingsKB = totalSaved / 1024;
// 假设平均网速 10Mbps
const downloadTimeSaved = (savingsKB * 8) / (10 * 1000); // 秒
console.log(`节省带宽: ${savingsKB.toFixed(1)}KB`);
console.log(`预估节省下载时间: ${(downloadTimeSaved * 1000).toFixed(0)}ms (10Mbps 网速)`);
console.log(`预估节省下载时间: ${(downloadTimeSaved * 1000 / 3).toFixed(0)}ms (3Mbps 4G 网速)`);

console.log('\n=== 测试建议 ===');
console.log('1. 在浏览器中打开 index.html');
console.log('2. 按 F12 打开开发者工具');
console.log('3. 切换到 Network 面板');
console.log('4. 按 Ctrl+Shift+R 强制刷新');
console.log('5. 查看底部的 Total 和 Finish 时间');
