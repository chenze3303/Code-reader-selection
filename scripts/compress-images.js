#!/usr/bin/env node
/**
 * 图片压缩脚本
 * 用法：node scripts/compress-images.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// 需要压缩的图片
const IMAGES = [
  { file: 'assets/contact-wechat.jpg', quality: 80 },
  { file: 'assets/contact-douyin.jpg', quality: 80 },
  { file: 'assets/contact-bilibili.jpg', quality: 80 },
  { file: 'assets/code-type-desc.png', quality: 80 },
  { file: 'assets/code-type-desc-dark.png', quality: 80 }
];

async function compressImage(file, quality) {
  const inputPath = path.join(ROOT, file);
  const ext = path.extname(file);
  const name = path.basename(file, ext);
  const outputPath = path.join(ROOT, `${name}.min${ext}`);

  if (!fs.existsSync(inputPath)) {
    console.log(`✗ 文件不存在: ${file}`);
    return null;
  }

  const inputSize = fs.statSync(inputPath).size;

  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(inputPath)
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toFile(outputPath);
    } else if (ext === '.png') {
      await sharp(inputPath)
        .png({ quality, compressionLevel: 9 })
        .toFile(outputPath);
    }

    const outputSize = fs.statSync(outputPath).size;
    const saved = inputSize - outputSize;
    const percent = ((saved / inputSize) * 100).toFixed(1);

    console.log(`✓ ${file}`);
    console.log(`  原始: ${(inputSize / 1024).toFixed(1)}KB → 压缩: ${(outputSize / 1024).toFixed(1)}KB`);
    console.log(`  节省: ${(saved / 1024).toFixed(1)}KB (${percent}%)`);

    return { file, inputPath, outputPath, inputSize, outputSize };
  } catch (err) {
    console.log(`✗ 压缩失败: ${file} - ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('\n🖼️  图片压缩脚本\n');

  let totalInput = 0;
  let totalOutput = 0;
  const results = [];

  for (const img of IMAGES) {
    const result = await compressImage(img.file, img.quality);
    if (result) {
      results.push(result);
      totalInput += result.inputSize;
      totalOutput += result.outputSize;
    }
  }

  if (results.length > 0) {
    console.log('\n=== 压缩完成 ===');
    console.log(`压缩了 ${results.length} 张图片`);
    console.log(`总计节省: ${((totalInput - totalOutput) / 1024).toFixed(1)}KB`);
    console.log('\n压缩后的文件已保存为 *.min.* 格式');
    console.log('如需替换原文件，请手动重命名');
  }
}

main().catch(console.error);
