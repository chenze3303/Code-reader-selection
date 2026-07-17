#!/usr/bin/env node
/**
 * 从海康机器人官网批量抓取经销型号的「资料下载」列表
 * 依赖：agent-browser（npm i -g agent-browser）
 * 用法：node scripts/scrape_dist_downloads.js
 * 输出：js/data/dist_downloads.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'js', 'data', 'dist_downloads.js');

// 23个经销系列搜索关键词
const KEYWORDS = [
  "IDA02X","IDA05X","IDB005EXI","IDB005EPI","IDB005EX","IDB005EPX",
  "IDB003X","IDB005X","IDB007X","IDBX007X","IDBX008X",
  "IDC005X","IDC007X","IDC010X","IDCX007X","IDCX009X","IDCX010X","IDCR012X",
  "IDE010X","IDE012X","IDE024X","IDE030X","IDE030PX"
];

function run(cmd) {
  try { return execSync(cmd, { timeout: 30000, encoding: 'utf8' }).trim(); }
  catch(e) { return ''; }
}
function sleep(ms) { execSync(`sleep ${ms/1000}`); }

function parseDownloads(text) {
  const downloads = [];
  const lines = text.split('\n');
  const TYPES = ['技术规格书','用户手册','结构图纸','工业协议','其他','软件工具','快速入门','认证证书','产品文档'];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!TYPES.includes(t)) continue;
    const nextLine = (i+1 < lines.length) ? lines[i+1].trim() : '';
    const nextNextLine = (i+2 < lines.length) ? lines[i+2].trim() : '';
    let fileName = '';
    if (/\.(pdf|PDF|zip|ZIP|doc|DOC|xls|XLS)/.test(nextLine)) fileName = nextLine;
    else if (/\.(pdf|PDF|zip|ZIP|doc|DOC|xls|XLS)/.test(nextNextLine)) fileName = nextNextLine;
    if (fileName) downloads.push({ type: t, file: fileName });
  }
  return downloads;
}

const results = {};

for (let i = 0; i < KEYWORDS.length; i++) {
  const kw = KEYWORDS[i];
  console.log(`[${i+1}/${KEYWORDS.length}] ${kw}`);

  run(`agent-browser open "https://www.hikrobotics.com/cn/search?keyword=${kw}&type=-1&page=1"`);
  run('agent-browser wait --load networkidle');
  sleep(1000);

  const snap = run('agent-browser snapshot -i');
  const refMatch = snap.match(/heading "MV-[^"]*".*?ref=(e\d+)/);
  if (!refMatch) { console.log('  ✗ 无结果'); continue; }

  run(`agent-browser click @${refMatch[1]}`);
  run('agent-browser wait --load networkidle');
  sleep(1000);

  const url = run('agent-browser get url');
  const body = run('agent-browser get text body');
  const modelMatch = body.match(/MV-[A-Z0-9\-]+/);
  const model = modelMatch ? modelMatch[0] : kw;

  const snap2 = run('agent-browser snapshot -i');
  const tabMatch = snap2.match(/tab "资料下载".*?ref=(e\d+)/);
  if (tabMatch) {
    run(`agent-browser click @${tabMatch[1]}`);
    sleep(2000);
  }

  const dlBody = run('agent-browser get text body');
  const downloads = parseDownloads(dlBody);

  console.log(`  ✓ ${model} → ${downloads.length} 个文件`);
  downloads.forEach(d => console.log(`    ${d.type}: ${d.file}`));

  results[kw] = { model, url, downloads };
}

const out = `/**
 * 经销型号资料下载列表
 * 从海康机器人官网自动采集
 * 生成时间：${new Date().toISOString()}
 */
(function(){
  window.DIST_DOWNLOAD_DATA = ${JSON.stringify(results, null, 2)};
})();`;
fs.writeFileSync(OUT, out);
console.log(`\n=== 完成，共 ${Object.keys(results).length} 个系列 → ${OUT} ===`);
run('agent-browser close');
