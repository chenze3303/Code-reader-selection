#!/usr/bin/env node
/**
 * 将 product_data.json 转换为 PEIDAN_DATA 格式
 * 用法：node scripts/convert_product_data.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'product_data.json');
const OUTPUT = path.join(ROOT, 'public', 'js', 'data', 'peidan.js');

// 相机行的配件列配置（支持25列和26列格式）
// col: 配件引用列, flagCol: 标配/选配标志列, accCategory: 配件行[1]的类别名
const ACCESSORY_COLUMNS = {
  '电源':     { name: '电源',     col: 7,  flagCol: 8,  accCategory: '电源' },
  '安装板':   { name: '安装板',   col: 9,  flagCol: 10, accCategory: '安装板' },
  '一体线':   { name: '一体线',   col: 11, flagCol: 12, accCategory: '一体线' },
  'IO电源线': { name: 'IO电源线', col: 13, flagCol: 14, accCategory: 'IO电源线' },
  '网线':     { name: '网线',     col: 15, flagCol: 16, accCategory: '网线' },
  '灯板':     { name: '灯板',     col: 17, flagCol: 18, accCategory: '灯板' },
  '镜头罩':   { name: '镜头罩',   col: 19, flagCol: 20, accCategory: '镜头罩' },
  'FA镜头':   { name: 'FA镜头',   col: 21, flagCol: 22, accCategory: 'FA镜头' },
  '扩展配件': { name: '扩展配件', col: 23, flagCol: 24, accCategory: '扩展配件' },
};

// 自动检测列数并调整映射
function detectColumnFormat(rows) {
  const maxCols = Math.max(...rows.map(r => r.length));
  console.log(`📊 检测到最大列数: ${maxCols}`);
  return maxCols;
}

// 产品大类排序优先级
const CATEGORY_ORDER = [
  'ID800', 'ID2013EM', 'ID2000M', 'ID2000XM',
  'ID3000PM', 'ID3000XM', 'ID3000RM',
  'ID5000M', 'ID5000XM'
];

function sortOrder(a, b) {
  let ia = -1, ib = -1;
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    if (a.indexOf(CATEGORY_ORDER[i]) === 0) ia = i;
    if (b.indexOf(CATEGORY_ORDER[i]) === 0) ib = i;
  }
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return 1;
  return ia - ib;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8').replace(/^\uFEFF/, ''));
  const rows = raw.map(item => item.value || item);

  // 自动检测列数
  const maxCols = detectColumnFormat(rows);
  const is26ColFormat = maxCols >= 26;
  console.log(`📋 使用 ${is26ColFormat ? '26列' : '25列'} 格式`);

  // 分离相机行和配件行
  const cameraRows = [];
  const accessoryRows = [];
  rows.forEach(r => {
    if (r[0] && r[0].trim() === '相机') {
      cameraRows.push(r);
    } else if (r[0] && r[0].trim() !== '数据分类') {
      accessoryRows.push(r);
    }
  });

  console.log(`📷 相机型号: ${cameraRows.length} 条`);
  console.log(`🔧 配件数据: ${accessoryRows.length} 条`);

  // 按大类→系列分组
  const tree = {};
  cameraRows.forEach(r => {
    const cat = (r[1] || '').trim();
    const ser = (r[2] || '').trim();
    if (!cat || !ser) return;
    if (!tree[cat]) tree[cat] = {};
    if (!tree[cat][ser]) tree[cat][ser] = [];
    tree[cat][ser].push(r);
  });

  // 构建 modelList
  const modelList = [];
  const cats = Object.keys(tree).sort(sortOrder);

  cats.forEach(cat => {
    const series = Object.keys(tree[cat]).sort();
    series.forEach(ser => {
      tree[cat][ser].forEach(r => {
        const model = (r[3] || '').trim();
        const code = (r[4] || '').trim();
        const desc = (r[5] || '').trim();
        const remark = (r[6] || '').trim();
        if (!model) return;

        const standardAcc = [];
        const optionalAcc = [];

        // 遍历每个配件列
        const keys = Object.keys(ACCESSORY_COLUMNS);
        keys.forEach(key => {
          const cfg = ACCESSORY_COLUMNS[key];
          const val = (r[cfg.col] || '').trim();
          if (!val) return; // 相机行该列为空，跳过

          // 解析相机行的配件引用标签及逐标签标配标志（分号分隔）
          const refTags = val.split(';')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);
          const refFlags = (r[cfg.flagCol] || '').split(';').map(s => s.trim());
          const standardTags = new Set(refTags.filter((tag, index) => refFlags[index] === '1'));

          accessoryRows.forEach(ar => {
            const accCat = (ar[1] || '').trim();
            const accRefs = (ar[7] || '').split(';')
              .map(s => s.trim().toLowerCase())
              .filter(Boolean);
            const accFlag = (ar[8] || '').trim();
            const accName = (ar[3] || '').trim();
            const accCode = (ar[4] || '').trim();
            const accDesc = (ar[5] || '').trim();
            const accRemark = (ar[6] || '').trim();

            if (accCat !== cfg.accCategory) return;
            if (!accName || !accCode) return;
            const matchedTag = refTags.find(tag => accRefs.includes(tag));
            if (!matchedTag) return;

            const item = {
              category: cfg.accCategory,
              series: (ar[2] || '').trim(),
              name: accName,
              code: accCode,
              detail: accDesc,
              remark: accRemark
            };
            const isStandard = standardTags.has(matchedTag) && accFlag === '1';
            if (isStandard) {
              if (!standardAcc.some(a => a.name === accName && a.code === accCode)) standardAcc.push(item);
              return;
            }

            // 参考站对 ID2000XM 的该旧款 USB 尾线做了显式排除。
            if (key === '一体线' && cat.indexOf('ID2000XM') >= 0 && accCode === '101515363') return;
            if (!optionalAcc.some(a => a.name === accName && a.code === accCode)) optionalAcc.push(item);
          });
        });

        modelList.push({
          productCategory: cat,
          productSeries: ser,
          productModel: model,
          materialCode: code,
          description: desc,
          remark: remark,
          standardAccessories: standardAcc,
          optionalAccessories: optionalAcc
        });
      });
    });
  });

  // 统计
  let totalStd = 0, totalOpt = 0;
  modelList.forEach(m => {
    totalStd += m.standardAccessories.length;
    totalOpt += m.optionalAccessories.length;
  });

  console.log(`\n✅ 转换完成`);
  console.log(`   型号总数: ${modelList.length}`);
  console.log(`   标配配件: ${totalStd} 条`);
  console.log(`   选配配件: ${totalOpt} 条`);

  // 输出
  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
  const output = `// peidan.js - 配单数据文件\n// 自动生成于 ${timestamp}\n// 数据来源: product_data.json\n\nwindow.PEIDAN_DATA = ${JSON.stringify({ modelList }, null, 2)};\n`;

  fs.writeFileSync(OUTPUT, output, 'utf8');
  console.log(`   输出文件: ${path.relative(ROOT, OUTPUT)}`);
}

main();
