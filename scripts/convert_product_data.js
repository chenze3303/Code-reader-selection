#!/usr/bin/env node
/**
 * 将 product_data.json 转换为 PEIDAN_DATA 格式
 * 用法：node scripts/convert_product_data.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INPUT = path.join(ROOT, 'product_data.json');
const OUTPUT = path.join(ROOT, 'js', 'data', 'peidan.js');

// 配件列配置（与 peidan.html 一致）
const ACCESSORY_COLUMNS = {
  '电源':     { name: '电源',     col: 7 },
  '安装板':   { name: '安装板',   col: 8,  flagCol: 9 },
  '一体线':   { name: '一体线',   col: 10, flagCol: 11 },
  'IO线':     { name: 'IO电源线', col: 12, flagCol: 13 },
  '网线':     { name: '网线',     col: 14, flagCol: 15 },
  '灯板':     { name: '灯板',     col: 16, flagCol: 17 },
  '镜头罩':   { name: '镜头罩',   col: 18, flagCol: 19 },
  'FA镜头':   { name: 'FA镜头',   col: 20, flagCol: 21 },
  '扩展配件': { name: '扩展配件', col: 22, flagCol: 23 },
};

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
          if (!val) return;

          const flag = cfg.flagCol ? (r[cfg.flagCol] || '').trim() : '';

          if (flag === '1') {
            // 标配配件：通过 refTag 匹配 accessoryRows
            const refTags = val.split(';')
              .map(s => s.trim().toLowerCase())
              .filter(s => s.length > 0);

            let matched = false;
            for (let j = 0; j < accessoryRows.length; j++) {
              const ar = accessoryRows[j];
              const accTag = ((ar[cfg.col] || '')).toLowerCase();
              const accFlag = cfg.flagCol ? (ar[cfg.flagCol] || '') : '';
              for (let k = 0; k < refTags.length; k++) {
                if (accTag.indexOf(refTags[k]) >= 0 && accFlag === '1') {
                  const accName = (ar[3] || key).trim();
                  const accCode = (ar[4] || '').trim();
                  const accDesc = (ar[5] || '').trim();
                  // 避免重复
                  if (!standardAcc.some(a => a.name === accName && a.code === accCode)) {
                    standardAcc.push({ category: key, series: (ar[2] || '').trim(), name: accName, code: accCode, detail: accDesc });
                  }
                  matched = true;
                  break;
                }
              }
              if (matched) break;
            }
          }

          // 选配配件：匹配所有可用配件（排除已作为标配的）
          const refTags = val.split(';')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);

          const standardNames = new Set(standardAcc.map(a => a.name));

          accessoryRows.forEach(ar => {
            const accTag = ((ar[cfg.col] || '')).toLowerCase();
            const accName = (ar[3] || '').trim();
            const accCode = (ar[4] || '').trim();
            const accDesc = (ar[5] || '').trim();
            const accRemark = (ar[6] || '').trim();

            if (!accName || !accCode) return;
            if (standardNames.has(accName)) return;

            let match = false;
            for (let k = 0; k < refTags.length; k++) {
              if (accTag.indexOf(refTags[k]) >= 0 ||
                  (ar[3] || '').toLowerCase().indexOf(refTags[k]) >= 0 ||
                  (ar[5] || '').toLowerCase().indexOf(refTags[k]) >= 0 ||
                  (ar[4] || '').toLowerCase().indexOf(refTags[k]) >= 0) {
                match = true;
                break;
              }
            }

            if (match || refTags.length === 0) {
              if (!optionalAcc.some(a => a.name === accName && a.code === accCode)) {
                optionalAcc.push({ category: key, series: (ar[2] || '').trim(), name: accName, code: accCode, detail: accDesc });
              }
            }
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
