#!/usr/bin/env node
/**
 * JS 文件压缩脚本（terser + 语法验证）
 * 用法：
 *   node scripts/minify-js.js          # 压缩并验证
 *   node scripts/minify-js.js --check  # 仅验证已有的 .min.js 文件
 */
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');
const CHECK_MODE = process.argv.includes('--check');

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

function syntaxCheck(code, label) {
  try {
    new Function(code);
    return true;
  } catch (e) {
    console.log(`❌ 语法错误 ${label}: ${e.message}`);
    return false;
  }
}

async function main() {
  let totalSaved = 0;
  let hasError = false;

  if (CHECK_MODE) {
    console.log('\n🔍 验证 .min.js 文件语法\n');
    for (const file of JS_FILES) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const dir = path.dirname(file);
      const minPath = path.join(ROOT, dir, `${name}.min${ext}`);
      if (!fs.existsSync(minPath)) {
        console.log(`⚠️  文件不存在: ${minPath}`);
        hasError = true;
        continue;
      }
      const code = fs.readFileSync(minPath, 'utf8');
      const ok = syntaxCheck(code, name + '.min.js');
      if (ok) console.log(`✅ ${name}.min.js`);
      else hasError = true;
    }
  } else {
    console.log('\n📦 JS 压缩脚本 (terser)\n');
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

        // 压缩后验证语法
        if (!syntaxCheck(minified, file)) {
          hasError = true;
          console.log(`  ⚠️  跳过写入 ${file}（语法不通过）`);
          continue;
        }

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
        hasError = true;
      }
    }
    console.log(`\n=== 压缩完成 ===`);
    console.log(`总计节省: ${(totalSaved / 1024).toFixed(1)}KB`);
  }

  if (hasError) {
    console.log('\n❌ 存在错误，退出码 1');
    process.exit(1);
  } else {
    console.log('\n✅ 全部通过');
  }
}

main();
