#!/usr/bin/env node
/**
 * JS 数据文件转换为 Excel
 * 用法：node scripts/js2excel.js
 * 输出：data_export.xlsx（包含多个 sheet）
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'js', 'data');
const OUTPUT = path.join(ROOT, 'exports', 'data_export.xlsx');

console.log('\n📊 JS → Excel 转换脚本\n');

// 加载 JS 数据文件
function loadJS(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  文件不存在: ${filename}`);
    return null;
  }
  const content = fs.readFileSync(filepath, 'utf8');
  const result = {};

  try {
    // 使用正则提取数据（更可靠）
    // 匹配 window.XXX = {...} 或 window.XXX = [...]
    const windowPatterns = [
      { regex: /window\.(PEIDAN_DATA)\s*=\s*(\{[\s\S]*?\});/, key: 'PEIDAN_DATA' },
      { regex: /window\.(MAPPING_DATA)\s*=\s*(\[[\s\S]*?\]);/, key: 'MAPPING_DATA' },
      { regex: /window\.(MAPPING_DOWNLOAD_URLS)\s*=\s*(\{[\s\S]*?\});/, key: 'MAPPING_DOWNLOAD_URLS' },
      { regex: /var\s+(competitorDB)\s*=\s*(\[[\s\S]*?\]);/, key: 'competitorDB' },
      { regex: /const\s+(PRODUCT_DB)\s*=\s*(\[[\s\S]*?\]);/, key: 'PRODUCT_DB' },
      { regex: /var\s+(STATUS_CODES)\s*=\s*(\[[\s\S]*?\]);/, key: 'STATUS_CODES' }
    ];

    for (const p of windowPatterns) {
      const match = content.match(p.regex);
      if (match) {
        try {
          result[p.key] = JSON.parse(match[2]);
        } catch (e) {
          // 如果 JSON 解析失败，尝试 eval
          result[p.key] = eval(match[2]);
        }
      }
    }

    return result;
  } catch (e) {
    console.log(`❌ 解析失败: ${filename} - ${e.message}`);
    return null;
  }
}

// 1. 配单数据
console.log('加载配单数据...');
const peidanData = loadJS('peidan.js');
const peidanSheet = [];
if (peidanData && peidanData.PEIDAN_DATA && peidanData.PEIDAN_DATA.modelList) {
  peidanData.PEIDAN_DATA.modelList.forEach(item => {
    // 标配配件
    const stdAccs = (item.standardAccessories || []).map(a =>
      `${a.category}|${a.name}|${a.code}|${a.detail}`
    ).join('\n');
    // 选配配件
    const optAccs = (item.optionalAccessories || []).map(a =>
      `${a.category}|${a.name}|${a.code}|${a.detail}`
    ).join('\n');

    peidanSheet.push({
      '产品大类': item.productCategory || '',
      '产品系列': item.productSeries || '',
      '具体型号': item.productModel || '',
      '标配配件': stdAccs,
      '选配配件': optAccs
    });
  });
  console.log(`✅ 配单数据: ${peidanSheet.length} 条`);
}

// 2. 产品表
console.log('加载产品表...');
const mappingData = loadJS('mapping.js');
const mappingSheet = [];
if (mappingData && mappingData.MAPPING_DATA) {
  mappingData.MAPPING_DATA.forEach(item => {
    mappingSheet.push({
      '系列分类': item.cat || '',
      '序号': item.seq || 0,
      '基线型号': item.baseName || '',
      '基线代码': item.baseCode || '',
      '经销型号': item.distName || '',
      '经销代码': item.distCode || ''
    });
  });
  console.log(`✅ 产品表: ${mappingSheet.length} 条`);
}

// 3. 竞品数据
console.log('加载竞品数据...');
const competitorData = loadJS('competitor.js');
const competitorSheet = [];
if (competitorData && competitorData.competitorDB) {
  competitorData.competitorDB.forEach(item => {
    competitorSheet.push({
      '友商品牌': item.brand || '',
      '友商型号': item.model || '',
      '友商特点': item.competitorDesc || '',
      '海康型号': item.hikModel || '',
      '海康优势': item.advantageDesc || ''
    });
  });
  console.log(`✅ 竞品数据: ${competitorSheet.length} 条`);
}

// 4. 选型产品库
console.log('加载选型产品库...');
const productData = loadJS('product_db.js');
const productSheet = [];
if (productData && productData.PRODUCT_DB) {
  productData.PRODUCT_DB.forEach(item => {
    productSheet.push({
      '型号': item.model || '',
      '系列': item.series || '',
      '分辨率宽': item.resolution ? item.resolution.w : 0,
      '分辨率高': item.resolution ? item.resolution.h : 0,
      '像素尺寸': item.pixelSize || 0,
      '焦距': item.focal || '',
      '接口': item.interface || '',
      '防护等级': item.protection || '',
      '最小工作距离': item.workingDist ? item.workingDist.min : 0,
      '最大工作距离': item.workingDist ? item.workingDist.max : 0
    });
  });
  console.log(`✅ 选型产品库: ${productSheet.length} 条`);
}

// 5. 状态码
console.log('加载状态码...');
const statusData = loadJS('status_codes.js');
const statusSheet = [];
if (statusData && statusData.STATUS_CODES) {
  statusData.STATUS_CODES.forEach(item => {
    statusSheet.push({
      '分类': item.category || '',
      '名称': item.name || '',
      '十六进制值': item.value || '',
      '描述': item.description || ''
    });
  });
  console.log(`✅ 状态码: ${statusSheet.length} 条`);
}

// 创建 Excel 工作簿
const wb = XLSX.utils.book_new();

if (peidanSheet.length) {
  const ws = XLSX.utils.json_to_sheet(peidanSheet);
  XLSX.utils.book_append_sheet(wb, ws, '配单数据');
}
if (mappingSheet.length) {
  const ws = XLSX.utils.json_to_sheet(mappingSheet);
  XLSX.utils.book_append_sheet(wb, ws, '产品表');
}
if (competitorSheet.length) {
  const ws = XLSX.utils.json_to_sheet(competitorSheet);
  XLSX.utils.book_append_sheet(wb, ws, '竞品对标');
}
if (productSheet.length) {
  const ws = XLSX.utils.json_to_sheet(productSheet);
  XLSX.utils.book_append_sheet(wb, ws, '选型产品库');
}
if (statusSheet.length) {
  const ws = XLSX.utils.json_to_sheet(statusSheet);
  XLSX.utils.book_append_sheet(wb, ws, '状态码');
}

// 写入文件
XLSX.writeFile(wb, OUTPUT);

console.log(`\n✅ 已导出: ${path.basename(OUTPUT)}`);
console.log(`包含 ${wb.SheetNames.length} 个工作表: ${wb.SheetNames.join(', ')}`);
