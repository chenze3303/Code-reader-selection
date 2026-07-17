#!/usr/bin/env node
/**
 * Excel 转换为 JS 数据文件
 * 用法：node scripts/excel2js.js <excel文件路径>
 * 示例：node scripts/excel2js.js data_import.xlsx
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'js', 'data');

console.log('\n📊 Excel → JS 转换脚本\n');

// 获取输入文件
const inputFile = process.argv[2];
if (!inputFile) {
  console.log('用法: node scripts/excel2js.js <excel文件路径>');
  console.log('示例: node scripts/excel2js.js data_import.xlsx');
  process.exit(1);
}

const inputPath = path.resolve(inputFile);
if (!fs.existsSync(inputPath)) {
  console.log(`❌ 文件不存在: ${inputPath}`);
  process.exit(1);
}

// 读取 Excel
console.log(`读取文件: ${path.basename(inputPath)}`);
const wb = XLSX.readFile(inputPath);
console.log(`包含 ${wb.SheetNames.length} 个工作表: ${wb.SheetNames.join(', ')}\n`);

// 辅助函数：解析配件字符串
function parseAccessories(str) {
  if (!str) return [];
  return str.split('\n').filter(s => s.trim()).map(line => {
    const parts = line.split('|');
    return {
      category: parts[0] || '',
      name: parts[1] || '',
      code: parts[2] || '',
      detail: parts[3] || ''
    };
  });
}

// 辅助函数：生成 JS 内容
function generateJS(filename, content) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ 已生成: ${filename}`);
}

// 处理配单数据
if (wb.SheetNames.includes('配单数据')) {
  console.log('处理配单数据...');
  const ws = wb.Sheets['配单数据'];
  const data = XLSX.utils.sheet_to_json(ws);

  const modelList = data.map(row => ({
    productCategory: row['产品大类'] || '',
    productSeries: row['产品系列'] || '',
    productModel: row['具体型号'] || '',
    standardAccessories: parseAccessories(row['标配配件']),
    optionalAccessories: parseAccessories(row['选配配件'])
  }));

  const jsContent = [
    '// peidan.js - 配单数据文件',
    '// 自动生成于 ' + new Date().toLocaleString('zh-CN'),
    '',
    'window.PEIDAN_DATA = ' + JSON.stringify({ currentConfig: modelList[0] || {}, modelList }, null, 2) + ';',
    '',
    'if (window.BOM && window.BOM.applyData) { window.BOM.applyData(window.PEIDAN_DATA); }'
  ].join('\n');

  generateJS('peidan.js', jsContent);
  console.log(`  共 ${modelList.length} 条数据\n`);
}

// 处理产品表
if (wb.SheetNames.includes('产品表')) {
  console.log('处理产品表...');
  const ws = wb.Sheets['产品表'];
  const data = XLSX.utils.sheet_to_json(ws);

  const lines = data.map(row =>
    '  { cat: ' + JSON.stringify(row['系列分类'] || '') +
    ', seq: ' + (row['序号'] || 0) +
    ', baseName: ' + JSON.stringify(row['基线型号'] || '') +
    ', baseCode: ' + JSON.stringify(row['基线代码'] || '') +
    ', distName: ' + JSON.stringify(row['经销型号'] || '') +
    ', distCode: ' + JSON.stringify(row['经销代码'] || '') + ' },'
  );

  const jsContent = [
    '// mapping.js - 基线-经销对照表',
    '// 自动生成于 ' + new Date().toLocaleString('zh-CN'),
    '',
    'window.MAPPING_DATA = [',
    lines.join('\n'),
    '];',
    '',
    'if (window.MAPPING && window.MAPPING.applyData) { window.MAPPING.applyData(window.MAPPING_DATA); }'
  ].join('\n');

  generateJS('mapping.js', jsContent);
  console.log(`  共 ${data.length} 条数据\n`);
}

// 处理竞品数据
if (wb.SheetNames.includes('竞品对标')) {
  console.log('处理竞品数据...');
  const ws = wb.Sheets['竞品对标'];
  const data = XLSX.utils.sheet_to_json(ws);

  const lines = data.map(row =>
    '    { brand: ' + JSON.stringify(row['友商品牌'] || '') +
    ', model: ' + JSON.stringify(row['友商型号'] || '') +
    ', competitorDesc: ' + JSON.stringify(row['友商特点'] || '') +
    ', hikModel: ' + JSON.stringify(row['海康型号'] || '') +
    ', advantageDesc: ' + JSON.stringify(row['海康优势'] || '') + ' },'
  );

  // 读取原始文件，替换 competitorDB 数组
  const originalFile = path.join(DATA_DIR, 'competitor.js');
  let originalContent = fs.readFileSync(originalFile, 'utf8');

  const newDB = 'var competitorDB = [\n' + lines.join('\n') + '\n];';

  // 替换 competitorDB 部分
  const startMarker = 'var competitorDB = [';
  const startIdx = originalContent.indexOf(startMarker);
  if (startIdx !== -1) {
    // 找到对应的结束 ]
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx + startMarker.length - 1; i < originalContent.length; i++) {
      if (originalContent[i] === '[') depth++;
      else if (originalContent[i] === ']') depth--;
      if (depth === 0) { endIdx = i + 1; break; }
    }
    if (endIdx !== -1) {
      originalContent = originalContent.slice(0, startIdx) + newDB + originalContent.slice(endIdx);
      fs.writeFileSync(originalFile, originalContent, 'utf8');
      console.log(`✅ 已更新: competitor.js`);
      console.log(`  共 ${data.length} 条数据\n`);
    }
  }
}

// 处理选型产品库
if (wb.SheetNames.includes('选型产品库')) {
  console.log('处理选型产品库...');
  const ws = wb.Sheets['选型产品库'];
  const data = XLSX.utils.sheet_to_json(ws);

  const lines = data.map(row => {
    let line = '  { model: ' + JSON.stringify(row['型号'] || '') +
      ', series: ' + JSON.stringify(row['系列'] || '') +
      ', resolution: { w: ' + (row['分辨率宽'] || 0) + ', h: ' + (row['分辨率高'] || 0) + ' }' +
      ', pixelSize: ' + (row['像素尺寸'] || 0);

    if (row['焦距']) {
      line += ', focal: ' + row['焦距'];
    }

    line += ', interface: ' + JSON.stringify(row['接口'] || '') +
      ', protection: ' + JSON.stringify(row['防护等级'] || 'IP54') +
      ', workingDist: { min: ' + (row['最小工作距离'] || 0) + ', max: ' + (row['最大工作距离'] || 0) + ' } },';

    return line;
  });

  const jsContent = [
    '// product_db.js - 选型产品数据库',
    '// 自动生成于 ' + new Date().toLocaleString('zh-CN'),
    '',
    'const PRODUCT_DB = [',
    lines.join('\n'),
    '];'
  ].join('\n');

  generateJS('product_db.js', jsContent);
  console.log(`  共 ${data.length} 条数据\n`);
}

// 处理状态码
if (wb.SheetNames.includes('状态码')) {
  console.log('处理状态码...');
  const ws = wb.Sheets['状态码'];
  const data = XLSX.utils.sheet_to_json(ws);

  const lines = data.map(row =>
    '  { category: ' + JSON.stringify(row['分类'] || '') +
    ', name: ' + JSON.stringify(row['名称'] || '') +
    ', value: ' + JSON.stringify(row['十六进制值'] || '') +
    ', description: ' + JSON.stringify(row['描述'] || '') + ' },'
  );

  const jsContent = [
    '// status_codes.js - 状态码数据',
    '// 自动生成于 ' + new Date().toLocaleString('zh-CN'),
    '',
    'var STATUS_CODES = [',
    lines.join('\n'),
    '];'
  ].join('\n');

  generateJS('status_codes.js', jsContent);
  console.log(`  共 ${data.length} 条数据\n`);
}

console.log('✅ 转换完成！');
console.log('请刷新浏览器查看更新后的数据。');
