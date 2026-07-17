#!/usr/bin/env node
/**
 * 简单的 CSS 压缩脚本
 * 用法：node scripts/minify-css.js
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'css', 'style.css');
const OUTPUT = path.join(__dirname, '..', 'css', 'style.min.css');

const css = fs.readFileSync(INPUT, 'utf8');

const minified = css
  // 移除注释
  .replace(/\/\*[\s\S]*?\*\//g, '')
  // 移除换行
  .replace(/\n/g, '')
  // 移除多余空格
  .replace(/\s{2,}/g, ' ')
  // 移除规则前后的空格
  .replace(/\s*{\s*/g, '{')
  .replace(/\s*}\s*/g, '}')
  // 移除属性值前后的空格
  .replace(/\s*:\s*/g, ':')
  // 移除分号前的空格
  .replace(/\s*;/g, ';')
  // 移除最后分号（可选）
  .replace(/;}/g, '}')
  // 移除选择器前后的空格
  .replace(/\s*,\s*/g, ',')
  .trim();

fs.writeFileSync(OUTPUT, minified, 'utf8');

const originalSize = Buffer.byteLength(css, 'utf8');
const minifiedSize = Buffer.byteLength(minified, 'utf8');
const saved = originalSize - minifiedSize;
const percent = ((saved / originalSize) * 100).toFixed(1);

console.log(`✓ 压缩完成`);
console.log(`  原始: ${(originalSize / 1024).toFixed(1)}KB`);
console.log(`  压缩: ${(minifiedSize / 1024).toFixed(1)}KB`);
console.log(`  节省: ${(saved / 1024).toFixed(1)}KB (${percent}%)`);
