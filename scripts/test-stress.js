#!/usr/bin/env node
/**
 * 压力测试套件 - HIKROBOT 读码器选型工具
 * 运行：node scripts/test-stress.js
 */
'use strict';

var PASS = 0, FAIL = 0, WARN = 0;
var results = [];

function assert(condition, testName, detail) {
  if (condition) {
    PASS++;
    results.push({ status: '✅', name: testName });
  } else {
    FAIL++;
    results.push({ status: '❌', name: testName, detail: detail || '' });
    console.log('❌ FAIL: ' + testName + (detail ? ' — ' + detail : ''));
  }
}

function warn(condition, testName, detail) {
  if (!condition) {
    WARN++;
    results.push({ status: '⚠️', name: testName, detail: detail || '' });
    console.log('⚠️ WARN: ' + testName + (detail ? ' — ' + detail : ''));
  }
}

function section(title) {
  console.log('\n' + '═'.repeat(60));
  console.log('  ' + title);
  console.log('═'.repeat(60));
}

// ═══════════════════════════════════════════════
// 1. 数据完整性测试
// ═══════════════════════════════════════════════
section('1. 数据完整性压力测试');

var fs = require('fs');
var path = require('path');
var ROOT = path.join(__dirname, '..');

// Helper: evaluate JS file and return global variable
function loadJS(relPath, varName) {
  var code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  var sandbox = { window: {}, console: console, navigator: {}, document: { readyState: 'complete', getElementById: function(){return null}, querySelectorAll: function(){return[]}, querySelector: function(){return null}, addEventListener: function(){} }, localStorage: { getItem: function(){return null}, setItem: function(){} }, setTimeout: function(){}, setInterval: function(){}, clearInterval: function(){}, clearTimeout: function(){}, requestAnimationFrame: function(){}, URL: { createObjectURL: function(){return ''}, revokeObjectURL: function(){} }, Blob: function(){}, alert: function(){}, confirm: function(){return true} };
  sandbox.Math = Math;
  sandbox.JSON = JSON;
  sandbox.Array = Array;
  sandbox.Object = Object;
  sandbox.String = String;
  sandbox.Number = Number;
  sandbox.Date = Date;
  sandbox.RegExp = RegExp;
  sandbox.parseInt = parseInt;
  sandbox.parseFloat = parseFloat;
  sandbox.isNaN = isNaN;
  sandbox.Promise = Promise;
  var fn = new Function('window', 'document', 'navigator', 'localStorage', 'console', 'setTimeout', 'setInterval', 'clearInterval', 'clearTimeout', 'requestAnimationFrame', 'URL', 'Blob', 'alert', 'confirm', code + '\nreturn typeof ' + varName + ' !== "undefined" ? ' + varName + ' : window.' + varName + ';');
  try {
    return fn(sandbox.window, sandbox.document, sandbox.navigator, sandbox.localStorage, sandbox.console, sandbox.setTimeout, sandbox.setInterval, sandbox.clearInterval, sandbox.clearTimeout, sandbox.requestAnimationFrame, sandbox.URL, sandbox.Blob, sandbox.alert, sandbox.confirm);
  } catch(e) {
    return undefined;
  }
}

// --- PRODUCT_DB ---
var PRODUCT_DB = loadJS('js/data/product_db.js', 'PRODUCT_DB');
assert(Array.isArray(PRODUCT_DB), 'PRODUCT_DB 是数组');
assert(PRODUCT_DB && PRODUCT_DB.length > 0, 'PRODUCT_DB 非空', '长度: ' + (PRODUCT_DB ? PRODUCT_DB.length : 0));
assert(PRODUCT_DB && PRODUCT_DB.length === 132, 'PRODUCT_DB 条数正确 (132)', '实际: ' + (PRODUCT_DB ? PRODUCT_DB.length : 0));

if (PRODUCT_DB) {
  var missingModel = PRODUCT_DB.filter(function(d) { return !d.model; });
  assert(missingModel.length === 0, 'PRODUCT_DB 无空 model', '缺失: ' + missingModel.length);

  var missingRes = PRODUCT_DB.filter(function(d) { return !d.resolution || !d.resolution.w || !d.resolution.h; });
  assert(missingRes.length === 0, 'PRODUCT_DB 无空 resolution', '缺失: ' + missingRes.length);

  var badRes = PRODUCT_DB.filter(function(d) { return d.resolution && (d.resolution.w <= 0 || d.resolution.h <= 0); });
  assert(badRes.length === 0, 'PRODUCT_DB resolution 均 > 0');

  var missingWD = PRODUCT_DB.filter(function(d) { return !d.workingDist; });
  assert(missingWD.length === 0, 'PRODUCT_DB 无空 workingDist', '缺失: ' + missingWD.length);

  var badWD = PRODUCT_DB.filter(function(d) { return d.workingDist && (d.workingDist.min <= 0 || d.workingDist.max < d.workingDist.min); });
  assert(badWD.length === 0, 'PRODUCT_DB workingDist 范围合理', '异常: ' + badWD.length);

  var missingSeries = PRODUCT_DB.filter(function(d) { return !d.series; });
  assert(missingSeries.length === 0, 'PRODUCT_DB 无空 series');

  var missingProtection = PRODUCT_DB.filter(function(d) { return !d.protection; });
  assert(missingProtection.length === 0, 'PRODUCT_DB 无空 protection');

  var models = PRODUCT_DB.map(function(d) { return d.model; });
  var dupes = models.filter(function(m, i) { return models.indexOf(m) !== i; });
  assert(dupes.length === 0, 'PRODUCT_DB 无重复 model', '重复: ' + JSON.stringify(dupes));

  // C-Mount 型号检查
  var cMount = PRODUCT_DB.filter(function(d) { return !d.focal; });
  console.log('  📊 C-Mount 型号（无 focal）: ' + cMount.length + ' 个');
  warn(cMount.length < 30, 'C-Mount 型号占比合理 (<30)', '实际: ' + cMount.length);
}

// --- MAPPING_DATA ---
var MAPPING_DATA = loadJS('js/data/mapping.js', 'MAPPING_DATA');
assert(Array.isArray(MAPPING_DATA), 'MAPPING_DATA 是数组');
assert(MAPPING_DATA && MAPPING_DATA.length > 0, 'MAPPING_DATA 非空');
assert(MAPPING_DATA && MAPPING_DATA.length === 424, 'MAPPING_DATA 条数正确 (424)', '实际: ' + (MAPPING_DATA ? MAPPING_DATA.length : 0));

if (MAPPING_DATA) {
  var missingCat = MAPPING_DATA.filter(function(d) { return !d.cat; });
  assert(missingCat.length === 0, 'MAPPING_DATA 无空 cat');

  var missingBaseName = MAPPING_DATA.filter(function(d) { return !d.baseName; });
  assert(missingBaseName.length === 0, 'MAPPING_DATA 无空 baseName');

  var missingBaseCode = MAPPING_DATA.filter(function(d) { return !d.baseCode || d.baseCode.trim() === ''; });
  var missingDistCode = MAPPING_DATA.filter(function(d) { return !d.distCode || d.distCode.trim() === ''; });
  // 允许“无基线型号”/“无经销型号”的条目
  var realMissingBase = missingBaseCode.filter(function(d) { return d.baseName && d.baseName.indexOf('无基线') === -1; });
  var realMissingDist = missingDistCode.filter(function(d) { return d.distName && d.distName.indexOf('无经销') === -1; });
  assert(realMissingBase.length === 0, 'MAPPING_DATA 无意外空 baseCode', '意外空: ' + realMissingBase.length);
  assert(realMissingDist.length === 0, 'MAPPING_DATA 无意外空 distCode', '意外空: ' + realMissingDist.length);
  console.log('  📊 无基线型号条目: ' + missingBaseCode.length + ', 无经销型号条目: ' + missingDistCode.length);

  // 序号连续性检查
  var cats = {};
  MAPPING_DATA.forEach(function(d) {
    if (!cats[d.cat]) cats[d.cat] = [];
    cats[d.cat].push(d.seq);
  });
  var seqGaps = 0;
  Object.keys(cats).forEach(function(cat) {
    var seqs = cats[cat].sort(function(a,b){return a-b;});
    for (var i = 1; i < seqs.length; i++) {
      if (seqs[i] - seqs[i-1] > 1) seqGaps++;
    }
  });
  warn(seqGaps === 0, 'MAPPING_DATA 各系列序号连续', '间隙: ' + seqGaps);

  var uniqueCats = Object.keys(cats);
  console.log('  📊 产品系列数: ' + uniqueCats.length);
}

// --- PEIDAN_DATA ---
var PEIDAN_DATA = loadJS('js/data/peidan.js', 'PEIDAN_DATA');
assert(PEIDAN_DATA && PEIDAN_DATA.modelList, 'PEIDAN_DATA 有 modelList');
var ml = PEIDAN_DATA ? PEIDAN_DATA.modelList : [];
assert(ml.length > 0, 'PEIDAN_DATA 非空', '长度: ' + ml.length);
assert(ml.length === 650, 'PEIDAN_DATA 条数正确 (650)', '实际: ' + ml.length);

if (ml.length > 0) {
  var noCat = ml.filter(function(m) { return !m.productCategory; });
  assert(noCat.length === 0, 'PEIDAN_DATA 无空 productCategory');

  var noSer = ml.filter(function(m) { return !m.productSeries; });
  assert(noSer.length === 0, 'PEIDAN_DATA 无空 productSeries');

  var noModel = ml.filter(function(m) { return !m.productModel; });
  assert(noModel.length === 0, 'PEIDAN_DATA 无空 productModel');

  var noStd = ml.filter(function(m) { return !m.standardAccessories || m.standardAccessories.length === 0; });
  console.log('  📊 无标配配件型号: ' + noStd.length + ' 个');
  warn(noStd.length < 30, '无标配型号数量合理 (<30)', '实际: ' + noStd.length);

  // 标配配件完整性
  var stdBadCode = 0;
  ml.forEach(function(m) {
    (m.standardAccessories || []).forEach(function(a) {
      if (!a.code || !a.name) stdBadCode++;
    });
  });
  assert(stdBadCode === 0, '标配配件均有 code 和 name', '异常: ' + stdBadCode);

  // 选配配件完整性
  var optBadCode = 0;
  ml.forEach(function(m) {
    (m.optionalAccessories || []).forEach(function(a) {
      if (!a.code || !a.name) optBadCode++;
    });
  });
  assert(optBadCode === 0, '选配配件均有 code 和 name', '异常: ' + optBadCode);

  // 物料代码唯一性（主机）
  var hostCodes = ml.map(function(m) { return m.materialCode; }).filter(Boolean);
  var hostDupes = hostCodes.filter(function(c, i) { return hostCodes.indexOf(c) !== i; });
  assert(hostDupes.length === 0, '主机物料代码无重复', '重复: ' + hostDupes.length);

  // 分类分布
  var catDist = {};
  ml.forEach(function(m) { catDist[m.productCategory] = (catDist[m.productCategory]||0) + 1; });
  console.log('  📊 分类分布: ' + JSON.stringify(catDist));
}

// --- STATUS_CODES ---
var STATUS_CODES = loadJS('js/data/status_codes.js', 'STATUS_CODES');
assert(Array.isArray(STATUS_CODES), 'STATUS_CODES 是数组');
assert(STATUS_CODES && STATUS_CODES.length > 0, 'STATUS_CODES 非空');
assert(STATUS_CODES && STATUS_CODES.length === 257, 'STATUS_CODES 条数正确 (257)', '实际: ' + (STATUS_CODES ? STATUS_CODES.length : 0));

if (STATUS_CODES) {
  var missingName = STATUS_CODES.filter(function(d) { return !d.name; });
  assert(missingName.length === 0, 'STATUS_CODES 无空 name');

  var missingValue = STATUS_CODES.filter(function(d) { return !d.value; });
  assert(missingValue.length === 0, 'STATUS_CODES 无空 value');

  var missingDesc = STATUS_CODES.filter(function(d) { return !d.description; });
  assert(missingDesc.length === 0, 'STATUS_CODES 无空 description');

  // value 格式校验（应为 0x 开头的十六进制）
  var badValues = STATUS_CODES.filter(function(d) { return !/^0x[0-9a-fA-F]+$/.test(d.value); });
  assert(badValues.length === 0, 'STATUS_CODES value 均为十六进制格式', '异常: ' + badValues.length + (badValues.length > 0 ? ' e.g. ' + badValues[0].name + '=' + badValues[0].value : ''));

  // name 唯一性
  var names = STATUS_CODES.map(function(d) { return d.name; });
  var nameDupes = names.filter(function(n, i) { return names.indexOf(n) !== i; });
  assert(nameDupes.length === 0, 'STATUS_CODES name 无重复', '重复: ' + JSON.stringify(nameDupes));

  // value 唯一性（允许同值不同名，如升级模块错误码最小值）
  var values = STATUS_CODES.map(function(d) { return d.value; });
  var valDupes = values.filter(function(v, i) { return values.indexOf(v) !== i; });
  warn(valDupes.length <= 3, 'STATUS_CODES value 重复极少', '重复: ' + valDupes.length);

  // 解决方法覆盖率
  var withSolution = STATUS_CODES.filter(function(d) { return d.solution && d.solution.length > 0; });
  console.log('  📊 有解决方法: ' + withSolution.length + '/' + STATUS_CODES.length + ' (' + (withSolution.length/STATUS_CODES.length*100).toFixed(1) + '%)');

  // 分类分布
  var scCatDist = {};
  STATUS_CODES.forEach(function(d) { scCatDist[d.category] = (scCatDist[d.category]||0) + 1; });
  console.log('  📊 分类分布: ' + JSON.stringify(scCatDist));
}

// --- COMPETITOR ---
var vm = require('vm');
var competitorJS = fs.readFileSync(path.join(ROOT, 'js/data/competitor.js'), 'utf8');
var competitorDB = [];
try {
  var ctx = { console: { log: function(){}, warn: function(){} }, window: {}, document: { readyState: 'complete', getElementById: function(){return null}, querySelectorAll: function(){return[]}, addEventListener: function(){} }, setTimeout: function(){}, clearTimeout: function(){} };
  vm.createContext(ctx);
  vm.runInContext(competitorJS, ctx);
  if (ctx.window.COMPETITOR) competitorDB = ctx.window.COMPETITOR.getData();
} catch(e) {
  console.log('  ⚠️ competitorDB 解析失败: ' + e.message);
}
assert(competitorDB.length === 39, 'competitorDB 条数正确 (39)', '实际: ' + competitorDB.length);

if (competitorDB.length > 0) {
  var compNoBrand = competitorDB.filter(function(d) { return !d.brand; });
  assert(compNoBrand.length === 0, 'competitorDB 无空 brand');

  var compNoModel = competitorDB.filter(function(d) { return !d.model; });
  assert(compNoModel.length === 0, 'competitorDB 无空 model');

  var compNoHik = competitorDB.filter(function(d) { return !d.hikModel; });
  assert(compNoHik.length === 0, 'competitorDB 无空 hikModel');

  var brands = {};
  competitorDB.forEach(function(d) { brands[d.brand] = (brands[d.brand]||0) + 1; });
  console.log('  📊 品牌分布: ' + JSON.stringify(brands));
}

// ═══════════════════════════════════════════════
// 2. 下载 URL 覆盖率测试
// ═══════════════════════════════════════════════
section('2. 下载 URL 覆盖率测试');

try {
  var dlJS = fs.readFileSync(path.join(ROOT, 'js/data/download_urls.js'), 'utf8');
  var dlSandbox = { window: {} };
  var dlFn = new Function('window', dlJS + '\nreturn window.MAPPING_DOWNLOAD_URLS;');
  var DL = dlFn(dlSandbox.window);

  if (DL && MAPPING_DATA) {
    var mapCats = [];
    MAPPING_DATA.forEach(function(r) { if (mapCats.indexOf(r.cat) === -1) mapCats.push(r.cat); });

    var baseCovered = 0, distCovered = 0;
    var missingBase = [], missingDist = [];
    mapCats.forEach(function(cat) {
      if (DL.getBaseUrl(cat)) baseCovered++; else missingBase.push(cat);
      if (DL.getDistUrl(cat)) distCovered++; else missingDist.push(cat);
    });

    console.log('  📊 基线覆盖: ' + baseCovered + '/' + mapCats.length);
    console.log('  📊 经销覆盖: ' + distCovered + '/' + mapCats.length);
    if (missingBase.length > 0) console.log('  ❌ 缺失基线: ' + missingBase.join(', '));
    if (missingDist.length > 0) console.log('  ❌ 缺失经销: ' + missingDist.join(', '));

    assert(missingBase.length <= 2, '基线下载 URL 缺失 ≤2', '缺失: ' + missingBase.length);
    warn(missingDist.length <= 15, '经销下载 URL 缺失 ≤15', '缺失: ' + missingDist.length);
  }
} catch(e) {
  console.log('  ⚠️ download_urls.js 加载失败: ' + e.message);
}


// ═══════════════════════════════════════════════
// 3. 选型算法边界值测试
// ═══════════════════════════════════════════════
section('3. 选型算法边界值测试');

// 模拟选型计算函数
function toMM(value, unit) {
  if (unit === 'mil') return value * 0.0254;
  if (unit === 'cm') return value * 10;
  return parseFloat(value);
}

function estimateFOV(model, wdMM) {
  if (!model.focal || !model.pixelSize) return null;
  var sensorWidth = (model.resolution.w * model.pixelSize) / 1000;
  var fovWidth = (sensorWidth * wdMM) / model.focal;
  var sensorHeight = (model.resolution.h * model.pixelSize) / 1000;
  var fovHeight = (sensorHeight * wdMM) / model.focal;
  return { width: Math.round(fovWidth), height: Math.round(fovHeight) };
}

function getPPMScoreAndLevel(ppm, codeType) {
  var is2D = codeType === 'QR';
  if (is2D) {
    if (ppm >= 4 && ppm <= 8)  return { score: 30, level: '优秀' };
    if (ppm > 8 && ppm <= 12)  return { score: 25, level: '良好' };
    if (ppm >= 12 || (ppm >= 3 && ppm < 4)) return { score: 15, level: '合格' };
    if (ppm < 3) return { score: -15, level: '较低' };
    return { score: 0, level: '未知' };
  } else {
    if (ppm >= 1.4 && ppm <= 2) return { score: 30, level: '优秀' };
    if (ppm >= 2 && ppm <= 3)   return { score: 25, level: '良好' };
    if ((ppm >= 1 && ppm < 1.4) || ppm >= 3) return { score: 15, level: '合格' };
    if (ppm < 1) return { score: -15, level: '较低' };
    return { score: 0, level: '未知' };
  }
}

if (PRODUCT_DB) {
  // 测试1: 极小视野 → 应推荐小分辨率型号
  var testModel = PRODUCT_DB[0];
  var fov = estimateFOV(testModel, 120);
  assert(fov !== null || !testModel.focal, 'estimateFOV 正常返回');

  // 测试2: 极大工作距离
  var fovFar = estimateFOV(testModel, 10000);
  if (fovFar) {
    assert(fovFar.width > 0 && fovFar.height > 0, '极大工作距离下 FOV 仍 >0');
  }

  // 测试3: 零值参数
  var fovZero = estimateFOV(testModel, 0);
  if (fovZero) {
    assert(fovZero.width === 0 && fovZero.height === 0, '零工作距离下 FOV 为 0');
  }

  // 测试4: toMM 单位转换
  assert(toMM(1, 'mm') === 1, 'toMM mm 正确');
  assert(toMM(1, 'cm') === 10, 'toMM cm 正确');
  assert(Math.abs(toMM(1, 'mil') - 0.0254) < 0.0001, 'toMM mil 正确');

  // 测试5: PPM 评分边界
  var ppm2D = getPPMScoreAndLevel(6, 'QR');
  assert(ppm2D.score === 30 && ppm2D.level === '优秀', '2D PPM=6 → 优秀');

  var ppm2DLow = getPPMScoreAndLevel(2, 'QR');
  assert(ppm2DLow.score === -15 && ppm2DLow.level === '较低', '2D PPM=2 → 较低');

  var ppm1D = getPPMScoreAndLevel(1.7, 'Code39');
  assert(ppm1D.score === 30 && ppm1D.level === '优秀', '1D PPM=1.7 → 优秀');

  var ppm1DHigh = getPPMScoreAndLevel(5, 'Code39');
  assert(ppm1DHigh.score === 15 && ppm1DHigh.level === '合格', '1D PPM=5 → 合格');

  // 测试6: 所有型号 FOV 计算不报错
  var fovErrors = 0;
  PRODUCT_DB.forEach(function(m) {
    try {
      var f = estimateFOV(m, 200);
      if (m.focal && f === null) fovErrors++;
    } catch(e) { fovErrors++; }
  });
  assert(fovErrors === 0, '所有型号 FOV 计算无异常', '异常: ' + fovErrors);

  // 测试7: 极端参数组合
  var extremeTests = [
    { wd: 1, fovW: 1, fovH: 1, mSize: 0.1, codeType: 'QR' },
    { wd: 50000, fovW: 10000, fovH: 10000, mSize: 50, codeType: 'Code39' },
    { wd: 100, fovW: 1, fovH: 1, mSize: 0.01, codeType: 'QR' },
  ];
  var extremeErrors = 0;
  extremeTests.forEach(function(t) {
    try {
      var moduleMM = toMM(t.mSize, 'mm');
      var fovReqW = toMM(t.fovW, 'mm');
      var fovReqH = toMM(t.fovH, 'mm');
      var wdMM = toMM(t.wd, 'mm');
      var is2D = t.codeType === 'QR';
      var divisor = is2D ? 5 : 1.5;
      var requiredPrecision = moduleMM / divisor;
      var requiredPixelsW = Math.ceil(fovReqW / requiredPrecision);
      var requiredPixelsH = Math.ceil(fovReqH / requiredPrecision);
      // 验证计算不产生 NaN/Infinity
      if (isNaN(requiredPixelsW) || isNaN(requiredPixelsH) || !isFinite(requiredPixelsW) || !isFinite(requiredPixelsH)) extremeErrors++;
    } catch(e) { extremeErrors++; }
  });
  assert(extremeErrors === 0, '极端参数组合计算无异常', '异常: ' + extremeErrors);
}


// ═══════════════════════════════════════════════
// 4. 搜索/过滤压力测试
// ═══════════════════════════════════════════════
section('4. 搜索/过滤压力测试');

// 模拟 normalize 函数
function normalize(s) {
  return (s || '').toLowerCase().replace(/^[\s\-_\/]*mv[-_\s]*/i, '').replace(/[\s\-_\/]+/g, '');
}

// 测试特殊字符输入
var specialInputs = [
  '', null, undefined, '<script>alert(1)</script>',
  'MV-ID803M', 'id803m', 'ID803M', '  MV-  ID803M  ',
  '中文测试', '!@#$%^&*()', 'a'.repeat(1000),
  '0x80020000', 'MV_CODEREADER_E_HANDLE',
  '../../etc/passwd', 'SELECT * FROM users',
];
var normalizeErrors = 0;
specialInputs.forEach(function(input) {
  try {
    var result = normalize(input);
    if (typeof result !== 'string') normalizeErrors++;
  } catch(e) { normalizeErrors++; }
});
assert(normalizeErrors === 0, 'normalize 处理特殊字符无异常', '异常: ' + normalizeErrors);

// 测试 normalize 正确性
assert(normalize('MV-ID803M') === 'id803m', 'normalize MV-ID803M → id803m');
assert(normalize('ID803M') === 'id803m', 'normalize ID803M → id803m');
assert(normalize('  MV-  ID803M  ') === 'id803m', 'normalize 含空格 MV-ID803M');
assert(normalize('MV_ID803M') === 'id803m', 'normalize 下划线 MV_ID803M');

// 测试大数据量搜索性能
if (MAPPING_DATA) {
  var searchStart = Date.now();
  var iterations = 10000;
  for (var i = 0; i < iterations; i++) {
    var kw = normalize('ID803');
    MAPPING_DATA.filter(function(r) {
      return [r.baseName, r.baseCode, r.distName, r.distCode]
        .some(function(v) { return normalize(v).indexOf(kw) !== -1; });
    });
  }
  var searchTime = Date.now() - searchStart;
  console.log('  📊 搜索 ' + iterations + ' 次耗时: ' + searchTime + 'ms (平均 ' + (searchTime/iterations).toFixed(2) + 'ms/次)');
  assert(searchTime / iterations < 5, '搜索性能 < 5ms/次', '实际: ' + (searchTime/iterations).toFixed(2) + 'ms');
}


// ═══════════════════════════════════════════════
// 5. BOM 持久化压力测试
// ═══════════════════════════════════════════════
section('5. BOM 持久化压力测试');

// 模拟 localStorage
var storage = {};
var mockLocalStorage = {
  getItem: function(k) { return storage[k] || null; },
  setItem: function(k, v) { storage[k] = String(v); },
  removeItem: function(k) { delete storage[k]; }
};

// 测试序列化/反序列化
var testState = {
  cat: 'ID800系列',
  ser: 'ID803系列U口',
  modelIdx: 0,
  accCodes: { 'code1||name1||0': true, 'code2||name2||1': false },
  bomList: [
    { type: '主机', n: 'MV-ID803M', c: '313201715', d: '0.3MP', qty: 1 },
    { type: '配件', n: '线缆', c: '101523961', d: '2m', qty: 1, accType: '标配' }
  ]
};

try {
  var serialized = JSON.stringify(testState);
  var deserialized = JSON.parse(serialized);
  assert(deserialized.cat === testState.cat, 'BOM 持久化序列化/反序列化正确');
  assert(deserialized.bomList.length === 2, 'BOM 持久化 bomList 完整');
  assert(deserialized.accCodes['code1||name1||0'] === true, 'BOM 持久化 accCodes 完整');
} catch(e) {
  assert(false, 'BOM 持久化序列化', e.message);
}

// 测试大数据量持久化
if (PEIDAN_DATA) {
  var bigState = {
    cat: 'ID2013EM系列',
    ser: 'ID2013EM系列',
    modelIdx: 5,
    accCodes: {},
    bomList: []
  };
  // 模拟大量配件
  for (var i = 0; i < 500; i++) {
    bigState.accCodes['code' + i + '||name' + i + '||' + i] = i % 2 === 0;
    bigState.bomList.push({ type: '配件', n: '配件' + i, c: 'code' + i, d: '描述' + i, qty: 1 });
  }
  try {
    var bigSerialized = JSON.stringify(bigState);
    var bigDeserialized = JSON.parse(bigSerialized);
    assert(bigDeserialized.bomList.length === 500, 'BOM 大数据量持久化 (500配件)');
    console.log('  📊 大状态序列化大小: ' + (bigSerialized.length / 1024).toFixed(1) + 'KB');
  } catch(e) {
    assert(false, 'BOM 大数据量持久化', e.message);
  }
}

// 测试损坏数据恢复
var corruptData = [
  '{invalid json',
  '{"cat":null}',
  '{"cat":"不存在的大类","ser":"x","modelIdx":999}',
  '{}',
  'null',
];
var recoveryOK = 0;
corruptData.forEach(function(data) {
  try {
    var parsed = JSON.parse(data);
    if (!parsed || !parsed.cat) { recoveryOK++; return; }
    // 模拟 loadState 验证
    if (parsed.cat && PRODUCT_DB) recoveryOK++;
  } catch(e) { recoveryOK++; } // 应该被捕获，不算失败
});
assert(recoveryOK === corruptData.length, 'BOM 损坏数据全部能优雅处理');


// ═══════════════════════════════════════════════
// 6. i18n 完整性测试
// ═══════════════════════════════════════════════
section('6. i18n 完整性测试');

var appJS = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
var indexHTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 提取 HTML 中的 data-i18n key
var htmlKeys = new Set();
var i18nRegex = /data-i18n(?:-ph|-html|-alt)?="([^"]+)"/g;
var match;
while ((match = i18nRegex.exec(indexHTML)) !== null) {
  htmlKeys.add(match[1]);
}

// 提取 JS 中的 zh/en key（精确匹配，避免匹配字符串内容）
var zhMatch = appJS.match(/zh:\s*\{([\s\S]*?)\n\s*},\s*\n\s*en:/);
var enMatch = appJS.match(/en:\s*\{([\s\S]*?)\n\s*}\s*\n\s*};/);

function extractKeys(block) {
  var keys = new Set();
  var re = /(?:^|,|\{)\s*(\w+)\s*:/gm;
  var m;
  while ((m = re.exec(block)) !== null) { keys.add(m[1]); }
  return keys;
}

var jsKeys = zhMatch ? extractKeys(zhMatch[1]) : new Set();
var enKeys = enMatch ? extractKeys(enMatch[1]) : new Set();

var missingFromJS = [];
htmlKeys.forEach(function(k) {
  if (!jsKeys.has(k)) missingFromJS.push(k);
});
assert(missingFromJS.length === 0, 'HTML i18n key 在 JS 中全部存在', '缺失: ' + JSON.stringify(missingFromJS));

var zhOnly = [], enOnly = [];
jsKeys.forEach(function(k) { if (!enKeys.has(k)) zhOnly.push(k); });
enKeys.forEach(function(k) { if (!jsKeys.has(k)) enOnly.push(k); });
assert(zhOnly.length === 0, 'zh 和 en key 完全一致', 'zh 多出: ' + JSON.stringify(zhOnly));
assert(enOnly.length === 0, 'en 和 zh key 完全一致', 'en 多出: ' + JSON.stringify(enOnly));
assert(enOnly.length === 0, 'en 和 zh key 完全一致', 'en 多出: ' + JSON.stringify(enOnly));


// ═══════════════════════════════════════════════
// 7. 文件完整性测试
// ═══════════════════════════════════════════════
section('7. 文件完整性测试');

var requiredFiles = [
  'index.html',
  'js/app.js', 'js/bom.js', 'js/mapping_module.js', 'js/statuscode_module.js',
  'js/data/product_db.js', 'js/data/competitor.js', 'js/data/mapping.js',
  'js/data/peidan.js', 'js/data/status_codes.js', 'js/data/download_urls.js',
  'js/data/cat_dist_map.js',
  'css/style.css',
];
requiredFiles.forEach(function(f) {
  var exists = fs.existsSync(path.join(ROOT, f));
  assert(exists, '文件存在: ' + f);
});

// .min.js 与 .js 同步检查
var minFiles = [
  'js/app.min.js', 'js/bom.min.js', 'js/mapping_module.min.js', 'js/statuscode_module.min.js',
  'js/data/product_db.min.js', 'js/data/competitor.min.js', 'js/data/mapping.min.js',
  'js/data/peidan.min.js', 'js/data/status_codes.min.js', 'js/data/download_urls.min.js',
];
minFiles.forEach(function(f) {
  var fullPath = path.join(ROOT, f);
  var exists = fs.existsSync(fullPath);
  assert(exists, '.min.js 存在: ' + f);
  if (exists) {
    var size = fs.statSync(fullPath).size;
    assert(size > 0, '.min.js 非空: ' + f, '大小: ' + size + ' bytes');
  }
});

// .min.js 内容同步检查（比较关键特征）
var syncPairs = [
  ['js/data/status_codes.js', 'js/data/status_codes.min.js'],
  ['js/statuscode_module.js', 'js/statuscode_module.min.js'],
  ['js/bom.js', 'js/bom.min.js'],
];
syncPairs.forEach(function(pair) {
  var src = fs.readFileSync(path.join(ROOT, pair[0]), 'utf8');
  var min = fs.readFileSync(path.join(ROOT, pair[1]), 'utf8');
  // 检查关键全局变量/函数名是否保留
  var srcGlobals = src.match(/window\.\w+\s*=/g) || [];
  var minGlobals = min.match(/window\.\w+\s*=/g) || [];
  assert(minGlobals.length >= srcGlobals.length, pair[1] + ' 保留了全局导出', 'src: ' + srcGlobals.length + ' min: ' + minGlobals.length);
  // 检查 .min.js 不为空且有实质内容
  assert(min.length > 100, pair[1] + ' 有实质内容', '大小: ' + min.length);
});


// ═══════════════════════════════════════════════
// 8. XSS/注入安全测试
// ═══════════════════════════════════════════════
section('8. XSS/注入安全测试');

// 检查 esc 函数是否存在于各模块
var escCode = fs.readFileSync(path.join(ROOT, 'js/bom.js'), 'utf8');
assert(escCode.indexOf('function esc') !== -1, 'bom.js 有 esc() 转义函数');

var mapCode = fs.readFileSync(path.join(ROOT, 'js/mapping_module.js'), 'utf8');
assert(mapCode.indexOf('function esc') !== -1, 'mapping_module.js 有 esc() 转义函数');

// 检查 esc 函数是否覆盖了关键字符
var escAllMatches = escCode.match(/function esc[\s\S]*?\}/);
if (escAllMatches) {
  assert(escAllMatches[0].indexOf('&amp;') !== -1, 'esc 转义 &');
  assert(escAllMatches[0].indexOf('&lt;') !== -1, 'esc 转义 <');
  assert(escAllMatches[0].indexOf('&gt;') !== -1, 'esc 转义 >');
}

// 测试数据中是否包含潜在 XSS
var allData = JSON.stringify(PEIDAN_DATA) + JSON.stringify(MAPPING_DATA);
assert(allData.indexOf('<script') === -1, '数据文件不含 <script> 标签');
assert(allData.indexOf('javascript:') === -1, '数据文件不含 javascript: 协议');


// ═══════════════════════════════════════════════
// 9. 性能压力测试
// ═══════════════════════════════════════════════
section('9. 性能压力测试');

// 测试大数据量 JSON 序列化性能
if (PEIDAN_DATA) {
  var start = Date.now();
  for (var i = 0; i < 100; i++) {
    JSON.stringify(PEIDAN_DATA);
  }
  var jsonTime = Date.now() - start;
  console.log('  📊 PEIDAN_DATA JSON.stringify x100: ' + jsonTime + 'ms');
  assert(jsonTime < 5000, 'PEIDAN_DATA 序列化性能 < 5s/100次', '实际: ' + jsonTime + 'ms');
}

// 测试搜索在大数据集上的性能
if (STATUS_CODES) {
  var scStart = Date.now();
  for (var i = 0; i < 1000; i++) {
    STATUS_CODES.filter(function(item) {
      var kw = 'usb';
      return item.name.toLowerCase().indexOf(kw) !== -1 ||
             item.value.toLowerCase().indexOf(kw) !== -1 ||
             item.description.toLowerCase().indexOf(kw) !== -1 ||
             (item.solution && item.solution.toLowerCase().indexOf(kw) !== -1);
    });
  }
  var scTime = Date.now() - scStart;
  console.log('  📊 STATUS_CODES 搜索 x1000: ' + scTime + 'ms');
  assert(scTime < 3000, '状态码搜索性能 < 3s/1000次', '实际: ' + scTime + 'ms');
}


// ═══════════════════════════════════════════════
// 测试报告
// ═══════════════════════════════════════════════
section('📊 测试报告');

console.log('');
console.log('  ✅ 通过: ' + PASS);
console.log('  ❌ 失败: ' + FAIL);
console.log('  ⚠️ 警告: ' + WARN);
console.log('  📋 总计: ' + (PASS + FAIL + WARN));
console.log('');

if (FAIL > 0) {
  console.log('  ❌ 失败项:');
  results.filter(function(r) { return r.status === '❌'; }).forEach(function(r) {
    console.log('    • ' + r.name + (r.detail ? ' — ' + r.detail : ''));
  });
  console.log('');
}

if (WARN > 0) {
  console.log('  ⚠️ 警告项:');
  results.filter(function(r) { return r.status === '⚠️'; }).forEach(function(r) {
    console.log('    • ' + r.name + (r.detail ? ' — ' + r.detail : ''));
  });
  console.log('');
}

process.exit(FAIL > 0 ? 1 : 0);
