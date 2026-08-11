#!/usr/bin/env node
/**
 * 从参考站 spec-mapping.js 合并模型级下载链接到项目 download_urls.js
 * 保留原有 cat 级 BASE/DIST 映射，新增 MODEL_DOWNLOAD_URLS + getSpecUrl
 * 用法：node scripts/gen_spec_urls.js
 * 输出：js/data/download_urls.js
 */
const fs = require('fs');
const path = require('path');

const REF = '/var/folders/6z/0hkh55mj6_vbrjdsth3g3mmh0000gn/T/opencode/idbom/spec-mapping.js';
const OUT = path.join(__dirname, '..', 'js', 'data', 'download_urls.js');

// 1) 从参考站提取 DOWNLOAD_URLS 对象逐行解析
const refSrc = fs.readFileSync(REF, 'utf8');
const dlBlock = refSrc.match(/var DOWNLOAD_URLS\s*=\s*\{([\s\S]*?)\n\s*\};/);
if (!dlBlock) { console.error('✗ 未找到 DOWNLOAD_URLS'); process.exit(1); }
const modelMap = {};
const re = /"([^"]+)"\s*:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(dlBlock[1]))) modelMap[m[1]] = m[2];
console.log(`✓ 参考站模型映射: ${Object.keys(modelMap).length} 条`);

// 2) 复用现有 download_urls.js 的两个 cat 映射（原样保留）
const cur = fs.readFileSync(OUT, 'utf8');
const baseBlock = cur.match(/var BASE_DOWNLOAD_URLS\s*=\s*\{([\s\S]*?)\n\s*\};/);
const distBlock = cur.match(/var DIST_DOWNLOAD_URLS\s*=\s*\{([\s\S]*?)\n\s*\};/);
if (!baseBlock) { console.error('✗ 现有文件无 BASE_DOWNLOAD_URLS'); process.exit(1); }

const out = `/**
 * 各系列资料下载页面 URL
 * 基线型号和经销型号各自对应海康官网产品详情页
 * 含模型级映射（新增系列）：
 *   - ID2020RM / 行业型号(IVD·医药) / IDP / IDM 等由 MODEL_DOWNLOAD_URLS 按型号匹配
 * 点击下载按钮可直接跳转到对应页面的"资料下载"tab
 */
(function() {
  'use strict';

  var BASE_DOWNLOAD_URLS = {${baseBlock[1]}};

  var DIST_DOWNLOAD_URLS = {${distBlock ? distBlock[1] : ''}};

  // 模型级 → 官网产品页 URL（来自海康官网产品图鉴 spec-mapping.js）
  // 覆盖 ID2020RM / 行业型号(IVD·医药) / IDP / IDM 等新增系列
  var MODEL_DOWNLOAD_URLS = ${JSON.stringify(modelMap, null, 2)};

  function cleanName(name) {
    return (name || '')
      .replace(/\\([^)]*\\)/g, '')
      .replace(/\\s*V?\\d+(\\.\\d+)?\\s*$/, '')
      .replace(/\\)$/, '')
      .trim();
  }

  function getSpecUrl(modelName) {
    if (!modelName) return '';
    var cleaned = cleanName(modelName);
    if (MODEL_DOWNLOAD_URLS[cleaned]) return MODEL_DOWNLOAD_URLS[cleaned];
    var keys = Object.keys(MODEL_DOWNLOAD_URLS);
    for (var i = 0; i < keys.length; i++) {
      if (cleaned.indexOf(keys[i]) >= 0 || keys[i].indexOf(cleaned) >= 0) {
        return MODEL_DOWNLOAD_URLS[keys[i]];
      }
    }
    return '';
  }

  window.MAPPING_DOWNLOAD_URLS = {
    base: BASE_DOWNLOAD_URLS,
    dist: DIST_DOWNLOAD_URLS,
    spec: MODEL_DOWNLOAD_URLS,
    getBaseUrl: function(cat) { return BASE_DOWNLOAD_URLS[cat] || ''; },
    getDistUrl: function(cat) { return DIST_DOWNLOAD_URLS[cat] || ''; },
    getSpecUrl: getSpecUrl
  };
})();
`;

fs.writeFileSync(OUT, out);
console.log(`✓ 已生成 ${OUT}`);
console.log(`  模型级 URL: ${Object.keys(modelMap).length} 条`);
console.log(`  基线 cat: ${Object.keys(baseBlock[1].match(/"([^"]+)"/g) || []).filter(k => !k.startsWith('"//')).length} 条`);