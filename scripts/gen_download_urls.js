#!/usr/bin/env node
/**
 * 从 mapping.js + downloads.js + dist_downloads.js 生成 download_urls.js
 * 用法：node scripts/gen_download_urls.js
 * 输出：js/data/download_urls.js
 *
 * 先运行 scrape_base_downloads.js 和 scrape_dist_downloads.js 获取下载数据，
 * 再运行本脚本生成 URL 映射文件。
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'js', 'data');

// 读取 mapping.js 中的 cat → distName 映射
const mappingSrc = fs.readFileSync(path.join(BASE_DIR, 'mapping.js'), 'utf8');
const catDistMap = {};
let curCat = '';
mappingSrc.split('\n').forEach(line => {
  const catM = line.match(/cat:\s*'([^']+)'/);
  if (catM) curCat = catM[1];
  const distM = line.match(/distName:\s*'([^']+)'/);
  if (distM && curCat && !catDistMap[curCat] && distM[1] !== '无经销型号') {
    const prefix = distM[1].match(/MV-([A-Z]+\d+[A-Z]*)/);
    if (prefix) catDistMap[curCat] = prefix[1];
  }
});

// 读取 downloads.js
let baseData = {};
try {
  const dlSrc = fs.readFileSync(path.join(BASE_DIR, 'downloads.js'), 'utf8');
  const m = dlSrc.match(/window\.DOWNLOAD_DATA\s*=\s*(\{[\s\S]*?\});/);
  if (m) baseData = JSON.parse(m[1]);
  console.log(`✓ downloads.js: ${Object.keys(baseData).length} 个系列`);
} catch(e) { console.log('✗ downloads.js 未找到或解析失败'); }

// 读取 dist_downloads.js
let distData = {};
try {
  const distSrc = fs.readFileSync(path.join(BASE_DIR, 'dist_downloads.js'), 'utf8');
  const m = distSrc.match(/window\.DIST_DOWNLOAD_DATA\s*=\s*(\{[\s\S]*?\});/);
  if (m) distData = JSON.parse(m[1]);
  console.log(`✓ dist_downloads.js: ${Object.keys(distData).length} 个系列`);
} catch(e) { console.log('✗ dist_downloads.js 未找到或解析失败'); }

// 建立 cat → baseUrl 映射（用关键词模糊匹配）
const baseUrlMap = {};
Object.entries(baseData).forEach(([kw, val]) => {
  // 找到所有 cat 包含此关键词的
  Object.keys(catDistMap).forEach(cat => {
    if (!baseUrlMap[cat] && (cat.includes(kw) || kw.includes(cat.replace(/系列.*/,'').trim()))) {
      baseUrlMap[cat] = val.url;
    }
  });
});

// 建立 cat → distUrl 映射
const distUrlMap = {};
Object.entries(catDistMap).forEach(([cat, distKey]) => {
  if (distData[distKey]) distUrlMap[cat] = distData[distKey].url;
});

// 生成 download_urls.js
const out = `/**
 * 各系列资料下载页面 URL
 * 自动生成 — 请勿手动编辑
 * 生成时间：${new Date().toISOString()}
 *
 * 运行以下命令重新生成：
 *   node scripts/scrape_base_downloads.js
 *   node scripts/scrape_dist_downloads.js
 *   node scripts/gen_download_urls.js
 */
(function() {
  'use strict';

  var BASE_DOWNLOAD_URLS = ${JSON.stringify(baseUrlMap, null, 4)};

  var DIST_DOWNLOAD_URLS = ${JSON.stringify(distUrlMap, null, 4)};

  window.MAPPING_DOWNLOAD_URLS = {
    base: BASE_DOWNLOAD_URLS,
    dist: DIST_DOWNLOAD_URLS,
    getBaseUrl: function(cat) { return BASE_DOWNLOAD_URLS[cat] || ''; },
    getDistUrl: function(cat) { return DIST_DOWNLOAD_URLS[cat] || ''; }
  };
})();`;

fs.writeFileSync(path.join(BASE_DIR, 'download_urls.js'), out);
console.log(`\n✓ 已生成 download_urls.js`);
console.log(`  基线 URL: ${Object.keys(baseUrlMap).length} 个系列`);
console.log(`  经销 URL: ${Object.keys(distUrlMap).length} 个系列`);
