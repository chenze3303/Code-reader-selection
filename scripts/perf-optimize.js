#!/usr/bin/env node
/**
 * 性能优化脚本 - 压缩 CSS 并显示优化报告
 * 用法：node scripts/perf-optimize.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('\n🔧 性能优化报告\n');

// 1. 压缩 CSS
console.log('=== CSS 压缩 ===');
const cssInput = path.join(ROOT, 'css', 'style.css');
const cssOutput = path.join(ROOT, 'css', 'style.min.css');

if (fs.existsSync(cssInput)) {
  const css = fs.readFileSync(cssInput, 'utf8');
  const minified = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;/g, ';')
    .replace(/;}/g, '}')
    .replace(/\s*,\s*/g, ',')
    .trim();

  fs.writeFileSync(cssOutput, minified, 'utf8');

  const originalSize = Buffer.byteLength(css, 'utf8');
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const saved = originalSize - minifiedSize;
  const percent = ((saved / originalSize) * 100).toFixed(1);

  console.log(`✓ style.css → style.min.css`);
  console.log(`  原始: ${(originalSize / 1024).toFixed(1)}KB → 压缩: ${(minifiedSize / 1024).toFixed(1)}KB`);
  console.log(`  节省: ${(saved / 1024).toFixed(1)}KB (${percent}%)\n`);
}

// 2. 文件大小统计
console.log('=== 文件大小统计 ===');
const dirs = [
  { path: path.join(ROOT, 'js', 'data'), label: 'JS 数据文件' },
  { path: path.join(ROOT, 'js'), label: 'JS 模块文件' },
  { path: path.join(ROOT, 'css'), label: 'CSS 文件' },
  { path: ROOT, label: '图片文件' }
];

let totalSize = 0;
for (const dir of dirs) {
  if (!fs.existsSync(dir.path)) continue;
  const files = fs.readdirSync(dir.path).filter(f => {
    const ext = path.extname(f).toLowerCase();
    // 排除备份文件和压缩文件
    if (f.includes('.bak.') || f.includes('.min.')) return false;
    if (dir.label.includes('JS')) return ext === '.js';
    if (dir.label.includes('CSS')) return ext === '.css';
    if (dir.label.includes('图片')) return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext);
    return false;
  });

  let dirSize = 0;
  for (const file of files) {
    const stat = fs.statSync(path.join(dir.path, file));
    dirSize += stat.size;
  }
  totalSize += dirSize;
  console.log(`${dir.label}: ${(dirSize / 1024).toFixed(1)}KB`);
}

console.log(`\n总计: ${(totalSize / 1024).toFixed(1)}KB (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);

// 3. 优化建议
console.log('\n=== 优化建议 ===');
console.log('1. 图片压缩：安装 sharp 或 imagemin 压缩 JPG/PNG');
console.log('2. 修改 CSS 后运行：node scripts/minify-css.js');
console.log('3. 版本号控制：更新 HTML 中的 ?v=N 强制刷新缓存');
