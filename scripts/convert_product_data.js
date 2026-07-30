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

// 相机行的配件列配置（25列格式）
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
          if (!val) return; // 相机行该列为空，跳过

          const flag = cfg.flagCol ? (r[cfg.flagCol] || '').trim() : '';

          // 解析相机行的配件引用标签（分号分隔）
          const refTags = val.split(';')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);

          // 标配配件：flag === '1'
          if (flag === '1') {
            for (let j = 0; j < accessoryRows.length; j++) {
              const ar = accessoryRows[j];
              const accCat = (ar[1] || '').trim();    // 配件类别名
              const accRef = (ar[7] || '').trim().toLowerCase(); // 配件行的匹配标签
              const accFlag = (ar[8] || '').trim();   // 配件标志

              if (accCat !== cfg.accCategory) continue;
              if (accFlag !== '1') continue;

              // 检查配件行的ref标签是否匹配相机行的ref标签
              let matched = false;
              for (let k = 0; k < refTags.length; k++) {
                if (accRef.indexOf(refTags[k]) >= 0 || refTags[k].indexOf(accRef) >= 0) {
                  matched = true;
                  break;
                }
              }

              if (matched) {
                const accName = (ar[3] || '').trim();
                const accCode = (ar[4] || '').trim();
                const accDesc = (ar[5] || '').trim();
                if (!standardAcc.some(a => a.name === accName && a.code === accCode)) {
                  standardAcc.push({
                    category: cfg.accCategory,
                    series: (ar[2] || '').trim(),
                    name: accName,
                    code: accCode,
                    detail: accDesc
                  });
                }
              }
            }
          }

          // 选配配件：匹配所有可用配件（排除已作为标配的）
          const standardNames = new Set(standardAcc.map(a => a.name));

          accessoryRows.forEach(ar => {
            const accCat = (ar[1] || '').trim();
            const accRef = (ar[7] || '').trim().toLowerCase();
            const accName = (ar[3] || '').trim();
            const accCode = (ar[4] || '').trim();
            const accDesc = (ar[5] || '').trim();

            if (accCat !== cfg.accCategory) return;
            if (!accName || !accCode) return;
            if (standardNames.has(accName)) return;

            // 检查匹配
            let match = false;
            if (refTags.length === 0) {
              match = true; // 无ref标签时匹配所有
            } else {
              for (let k = 0; k < refTags.length; k++) {
                if (accRef.indexOf(refTags[k]) >= 0 || refTags[k].indexOf(accRef) >= 0) {
                  match = true;
                  break;
                }
              }
            }

            if (match) {
              if (!optionalAcc.some(a => a.name === accName && a.code === accCode)) {
                optionalAcc.push({
                  category: cfg.accCategory,
                  series: (ar[2] || '').trim(),
                  name: accName,
                  code: accCode,
                  detail: accDesc
                });
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
