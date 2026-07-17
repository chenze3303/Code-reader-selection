/**
 * 主应用模块 - 导航切换、智能选型计算
 * 依赖：js/data/product_db.js (PRODUCT_DB)
 */

(function() {
  'use strict';

  // ═══════════ DEBOUNCE UTILITY ═══════════
  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
        timer = null;
      }, delay);
    };
  }

  // ═══════════ THEME & LANGUAGE ═══════════
  function swapThemeImages(isDark) {
    document.querySelectorAll('img[data-dark-src]').forEach(function(img) {
      var lightSrc = img.getAttribute('src').replace('-dark', '');
      var darkSrc = img.getAttribute('data-dark-src');
      img.setAttribute('src', isDark ? darkSrc : lightSrc);
    });
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    var icon = isDark ? '☀️' : '🌙';
    var btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = icon;
    var btnM = document.getElementById('themeBtnMobile');
    if (btnM) btnM.textContent = icon;
    swapThemeImages(isDark);

    // 重新渲染拼接SVG以适配主题
    if (window._stitchResults && window._stitchResults.length > 0) {
      var svgArea = document.getElementById('stitchSvgArea');
      if (svgArea && svgArea.style.display !== 'none') {
        var activeIdx = window._stitchActiveIdx || 0;
        var best = window._stitchResults[activeIdx];
        if (best) {
          svgArea.innerHTML = renderStitchSVG(best, window._stitchBarcodeW, window._stitchBarcodeH, 'auto', window._stitchTotalW, window._stitchTotalH);
        }
      }
    }
  }

  // ─── Toast 通知 ───
  function showToast(msg, type) {
    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function() {
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      setTimeout(function() { el.remove(); }, 300);
    }, 2000);
  }
  window.showToast = showToast;

  function initTheme() {
    var saved = localStorage.getItem('theme');
    var isDark = saved === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      var icon = '☀️';
      var btn = document.getElementById('themeBtn');
      if (btn) btn.textContent = icon;
      var btnM = document.getElementById('themeBtnMobile');
      if (btnM) btnM.textContent = icon;
    }
    swapThemeImages(isDark);
  }

  var currentLang = localStorage.getItem('lang') || 'zh';
  var i18n = {
    zh: {
      // Titlebar
      title: 'HIKROBOT · 读码器工具箱',
      status: '计算结果仅供参考，建议实测验证',
      // Nav tabs
      tab0: '首页', tab1: '智能选型', tab2: '竞品对标', tab3: '配单表', tab4: '产品表', tab5: '状态码查询', tabSdk: '二次开发', tab6: '方案解决', tabMore: '更多', moreTitle: '更多功能',
      homeTitle: '读码器工具箱', homeDesc: '集成智能选型、竞品对标、配单生成、产品对照、状态码查询五大功能模块，一站式解决读码器选型与配置需求。', homeFeatures: '功能模块',
      homeDesc1: '输入码制类型、模块尺寸、工作距离，自动计算 PPM，从产品库中推荐最佳读码器型号。',
      homeDesc2: '覆盖 Cognex、Keyence、Datalogic 等 7 大品牌，39 条友商型号与海康对应型号的对标查询。',
      homeDesc3: '三级联动选型，选定型号后自动生成 BOM，支持选配配件勾选与 CSV 导出。',
      homeDesc4: '424 条基线 ↔ 经销型号物料代码对照，含资料下载按钮可直达海康官网下载页面。',
      homeDesc5: '224 条海康读码器 SDK 状态码定义，支持模糊搜索、分类筛选、点击复制。',
      homeDesc6: '固件下载、智能助手、技术文档等常用资源快速入口。',
      homeDescSdk: 'MvCodeReader SDK C/C# 编程学习指南，从环境搭建到完整示例。',
      homeAct1: '开始选型', homeAct2: '查看对标', homeAct3: '生成配单', homeAct4: '查看对照', homeAct5: '查询状态码', homeActSdk: '学习开发', homeAct6: '查看方案',
      // Solutions page
      solTitle: '方案解决', solDesc: '固件下载与技术方案文档，点击卡片即可跳转',
      solVTitle: '小V智能助手', solVDesc: '在线智能问答，快速解决产品使用与选型问题',
      solFwTitle: '读码器固件下载', solFwDesc: '包含各系列读码器最新固件版本，支持在线升级',
      solHhTitle: '手持巴枪固件下载', solHhDesc: '手持式读码器专用固件，适用于移动扫码场景',
      solDocTitle: '方案解决文档', solDocDesc: '读码器应用方案、接线指南、调试教程等技术文档',
      solRepairTitle: '维修状态查询', solRepairDesc: '查询产品维修进度与售后状态',
      solHint: '💡 所有链接将在新标签页中打开',
      // Selection page
      card1: '📋 核心参数配置', card2: '📐 方案示意图', card3: '🏆 最佳推荐型号',
      sec1: '🔖 码制 & 模块尺寸', sec2: '📐 距离 & 视野参数',
      codeType: '码制类型 *', moduleSize: '模块尺寸 *',
      codeTypePh: '-- 请选择 --',
      codeType2D: '二维码 (2D)', codeType1D: '一维码 (1D)',
      workDist: '工作距离 *', fovW: '期望视野宽度 *', fovH: '期望视野高度 *',
      placeholder: '请输入',
      imgCaption: '💡 码制类型与模块尺寸说明',
      runBtn: '⚡ 开始智能选型',
      showModal: '📋 查看所有满足条件的型号清单',
      emptyState: '等待选型结果...',
      // SVG schematic
      svgEstW: '预估宽度', svgEstH: '预估高度', svgWd: '工作距离', svgFovAngle: '视场角',
      // Modal
      modalTitle: '📌 满足过滤条件的推荐型号',
      filterLabel: '🔍 按系列筛选', filterReset: '全选',
      modalEmpty: '请先进行选型',
      // Competitor page
      cpSearch: '搜索友商型号 / 海康型号，如 SR-1000、ID3013PM…',
      cpBrandLabel: '品牌筛选',
      cpBrandAll: '全部品牌',
      cpExpand: '📂 展开所有',
      cpStats: '共 {n} 条对标记录',
      cpStatsHint: '蓝色 = 友商核心特点 · 绿色 = 海康竞争优势',
      cpEmpty: '✨ 点击「展开所有」浏览全部对标数据，或在搜索框输入关键词自动匹配',
      // BOM page
      bomConfig: '配单配置',
      bomModelSel: '型号选择',
      bomStep1: '产品大类', bomStep2: '产品系列', bomStep3: '具体型号',
      bomCatPh: '-- 请选择产品大类 --', bomSerPh: '-- 请先选择大类 --', bomModelPh: '-- 请先选择系列 --',
      bomAcc: '选装配件',
      bomAccEmpty: '请先完成产品型号选择',
      bomAdd: '⚡ 生成配单',
      bomDetail: '配单明细',
      bomLegendMain: '■ 主机', bomLegendStd: '■ 标配', bomLegendOpt: '■ 选配',
      bomStatTotal: '总计', bomStatMain: '主机', bomStatAcc: '配件',
      bomReset: '重置', bomExport: '⬇ 导出 CSV',
      bomThIdx: '#', bomThType: '类型', bomThName: '物料名称', bomThDesc: '描述', bomThCode: '物料代码', bomThAction: '操作',
      bomEmpty: '请选择型号，配单将自动生成',
      bomCount: '共 {n} 行',
      bomFooterHint: '💡 蓝色 = 主机 · 浅蓝 = 标配 · 浅橙 = 选配',
      // Mapping page
      mpSearch: '搜索基线/经销 型号名称或物料代码，如 MV-ID803、IDA02X…',
      mpCatLabel: '系列筛选', mpCatAll: '全部系列',
      mpExpand: '📂 全部展开', mpCollapse: '📁 全部收起',
      mpStats: '共 {n} 条记录',
      mpStatsHint: '基线 = 直销物料 · 经销 = 渠道物料 · 每行一一对应',
      mpThBaseModel: '基线型号', mpThBaseCode: '基线代码',
      mpThDistModel: '经销型号', mpThDistCode: '经销代码',
      mpLoading: '正在加载产品表数据…',
      mpCount: '共 {n} 条',
      mpFooterHint: '💡 支持搜索基线和经销的型号名称及物料代码',
      mpNoMatch: '😔 未找到匹配记录，请调整搜索条件',
      mpRecords: '{n} 条',
      // Acc modal
      accTitle: '选装配件',
      accHint: '点击配件行即可勾选/取消',
      accDone: '完成',
      // BOM dynamic
      bomReadHost: '读码器主机',
      bomNoOptAcc: '✅ 无选装配件，标配 {n} 项已自动包含',
      bomAccCount: '{n} 个配件',
      bomSelected: '{n} 已选',
      // Mapping dynamic
      mpNoResult: '😔 未找到匹配记录，请调整搜索条件',

      // Status code page
      scSearch: '输入状态码名称或十六进制值，如 MV_CODEREADER_E_HANDLE 或 0x80020000',
      scCatLabel: '分类筛选', scCatAll: '全部分类',
      scStats: '共 {n} 条状态码',
      scStatsHint: '💡 支持按名称、值、描述模糊搜索',
      scThCategory: '分类', scThName: '名称', scThValue: '值', scThDesc: '说明', scThSolution: '解决方法',
      scLoading: '正在加载状态码数据…',
      scCount: '共 {n} 条',
      scFooterHint: '💡 点击行可复制状态码名称',
      scNoMatch: '😔 未找到匹配的状态码，请调整搜索条件',
      scCopied: '✅ 已复制: ',

      // PPM levels
      ppmExcellent: '优秀', ppmGood: '良好', ppmPass: '合格',
      ppmLow: '较低', ppmUnknown: '未知',

      // Reasons
      reasonResOk: '分辨率满足', reasonResNear: '分辨率接近', reasonResLow: '分辨率偏低',
      reasonDistOk: '距离适配', reasonDistFail: '距离不适配',
      reasonFovOk: '视野满足', reasonFovFail: '视野不足',
      reasonCMount: 'C-Mount',

      // Stitch
      stitchTitle: '🔗 多相机拼接方案', stitchHint: '⚠️ 单相机视野不足，可使用多相机拼接覆盖', stitchBack: '← 返回单相机',
      barcodeW: '条码实际宽度 *', barcodeH: '条码实际高度 *',
      barcodeOrient: '条码摆放方向', orientAuto: '自动推荐', orientH: '水平（沿宽度方向）', orientV: '垂直（沿高度方向）',
      safetyMargin: '安全余量', stitchBtn: '⚡ 计算拼接方案',
      stitchAlertBase: '请先完成基础选型参数填写（码制、模块尺寸、工作距离、视野宽高）',
      stitchAlertBarcode: '请填写条码实际尺寸（宽度和高度）',

      // Alerts
      alertFillAll: '请完整填写所有必填参数（码制类型、模块尺寸、工作距离、视野宽度、视野高度），且数值必须大于0',
      alertNoDB: '产品数据库未加载，请确保 product_db.js 已引入',

      // Result display
      resultEstFOV: '📐 预估视野 {w}×{h}mm',
      resultPPM: '📊 真实 PPM',
      resultDist: '📏 工作距离 {min}-{max}mm',
      resultNoMatch: '⚠️ 没有找到同时满足所有条件的型号<br>请调整参数后重试',
      resultNoMatchShort: '⚠️ 当前勾选的系列中无匹配型号，请勾选其他系列',
      resultModalEmpty: '暂无满足条件的型号，请调整参数后重新选型',
      resultWaitParam: '等待参数输入...',
      resultFovStatus: '📐 预估视野 {w}×{h}mm',

      // Competitor dynamic
      cpNoMatch: '未找到匹配记录',
      cpNoMatchHint: '尝试其他关键词，支持友商型号 / 海康型号混合搜索',
      cpFeatLabel: '友商特点',
      cpAdvLabel: '我方优势',
      cpRecLabel: '推荐型号',
      cpCollapse: '📁 折叠所有',

      // BOM defaults
      bomUncategorized: '未分类',
      bomUnknownModel: '未知型号',
      bomOther: '其他',
      langBtn: 'EN',
      // Contact modal
      contactUs: '联系我们', contactTitle: '📱 关注我们~了解更多海康机器人最新动态！', contactHint: '💡 扫码关注，获取最新资讯'
    },
    en: {
      title: 'HIKROBOT · CodeReader Toolbox',
      status: 'Results are for reference only, please verify with actual tests',
      tab0: 'Home', tab1: 'Selection', tab2: 'Competitor', tab3: 'BOM', tab4: 'Product Table', tab5: 'Status Codes', tabSdk: 'SDK Guide', tab6: 'Solutions', tabMore: 'More', moreTitle: 'More Features',
      homeTitle: 'Code Reader Toolkit', homeDesc: 'Integrated selection, competitor comparison, BOM generation, product mapping, and status code lookup — all in one place.', homeFeatures: 'Features',
      homeDesc1: 'Enter code type, module size, and working distance to auto-calculate PPM and recommend the best reader model.',
      homeDesc2: 'Covers 7 brands including Cognex, Keyence, Datalogic with 39 competitor-to-Hikvision model mappings.',
      homeDesc3: 'Three-level linked selection, auto-generate BOM after model selection, with optional accessories and CSV export.',
      homeDesc4: '424 baseline ↔ distribution model mappings with download buttons linking to Hikrobotics official site.',
      homeDesc5: '224 Hikrobotics SDK status code definitions with fuzzy search, category filter, and click-to-copy.',
      homeDesc6: 'Firmware download, smart assistant, technical docs and more resource links.',
      homeDescSdk: 'MvCodeReader SDK C/C# programming guide, from setup to complete examples.',
      homeAct1: 'Start Selection', homeAct2: 'View Comparison', homeAct3: 'Generate BOM', homeAct4: 'View Mapping', homeAct5: 'Query Codes', homeActSdk: 'Learn SDK', homeAct6: 'View Solutions',
      solTitle: 'Solutions', solDesc: 'Firmware downloads and technical documentation — click a card to open',
      solVTitle: 'V Assistant', solVDesc: 'Online Q&A for product usage and selection questions',
      solFwTitle: 'Code Reader Firmware', solFwDesc: 'Latest firmware for all code reader series, supports online upgrade',
      solHhTitle: 'Handheld Reader Firmware', solHhDesc: 'Firmware for handheld code readers, ideal for mobile scanning',
      solDocTitle: 'Solution Documents', solDocDesc: 'Application guides, wiring diagrams, debugging tutorials and more',
      solRepairTitle: 'Repair Status', solRepairDesc: 'Check product repair progress and after-sales status',
      solHint: '💡 All links open in a new tab',
      card1: '📋 Core Parameters', card2: '📐 Schematic', card3: '🏆 Best Match',
      sec1: '🔖 Code Type & Module Size', sec2: '📐 Distance & FOV',
      codeType: 'Code Type *', moduleSize: 'Module Size *',
      codeTypePh: '-- Select --',
      codeType2D: 'QR Code (2D)', codeType1D: 'Barcode (1D)',
      workDist: 'Working Distance *', fovW: 'FOV Width *', fovH: 'FOV Height *',
      placeholder: 'Enter value',
      imgCaption: '💡 Code Type & Module Size Guide',
      runBtn: '⚡ Start Selection',
      showModal: '📋 View All Matching Models',
      emptyState: 'Waiting for selection...',
      svgEstW: 'Est. Width', svgEstH: 'Est. Height', svgWd: 'Work Dist.', svgFovAngle: 'FOV Angle',
      modalTitle: '📌 Matching Models',
      filterLabel: '🔍 Filter by Series', filterReset: 'Select All',
      modalEmpty: 'Run selection first',
      cpSearch: 'Search competitor / HIKROBOT model, e.g. SR-1000, ID3013PM…',
      cpBrandLabel: 'Brand',
      cpBrandAll: 'All Brands',
      cpExpand: '📂 Expand All',
      cpStats: '{n} records',
      cpStatsHint: 'Blue = Competitor Features · Green = HIKROBOT Advantages',
      cpEmpty: '✨ Click "Expand All" to browse, or type keywords to search',
      bomConfig: 'BOM Config',
      bomModelSel: 'Model Selection',
      bomStep1: 'Category', bomStep2: 'Series', bomStep3: 'Model',
      bomCatPh: '-- Select Category --', bomSerPh: '-- Select Category First --', bomModelPh: '-- Select Series First --',
      bomAcc: 'Optional Accessories',
      bomAccEmpty: 'Select a model first',
      bomAdd: '⚡ Generate BOM',
      bomDetail: 'BOM Details',
      bomLegendMain: '■ Main Unit', bomLegendStd: '■ Standard', bomLegendOpt: '■ Optional',
      bomStatTotal: 'Total', bomStatMain: 'Main', bomStatAcc: 'Accessories',
      bomReset: 'Reset', bomExport: '⬇ Export CSV',
      bomThIdx: '#', bomThType: 'Type', bomThName: 'Part Name', bomThDesc: 'Description', bomThCode: 'Part Code', bomThAction: 'Action',
      bomEmpty: 'Select a model to auto-generate BOM',
      bomCount: '{n} rows',
      bomFooterHint: '💡 Blue = Main · Light Blue = Standard · Light Orange = Optional',
      mpSearch: 'Search model name or material code, e.g. MV-ID803, IDA02X…',
      mpCatLabel: 'Series', mpCatAll: 'All Series',
      mpExpand: '📂 Expand All', mpCollapse: '📁 Collapse All',
      mpStats: '{n} records',
      mpStatsHint: 'Baseline = Direct Sales · Distribution = Channel · One-to-one mapping',
      mpThBaseModel: 'Baseline Model', mpThBaseCode: 'Baseline Code',
      mpThDistModel: 'Dist. Model', mpThDistCode: 'Dist. Code',
      mpLoading: 'Loading product table data…',
      mpCount: '{n} items',
      mpFooterHint: '💡 Search baseline/distribution model names and material codes',
      mpNoMatch: '😔 No matching records found',
      mpRecords: '{n} items',
      accTitle: 'Accessories',
      accHint: 'Click an item to toggle selection',
      accDone: 'Done',
      bomReadHost: 'Code Reader',
      bomNoOptAcc: '✅ No optional accessories, {n} standard items included',
      bomAccCount: '{n} items',
      bomSelected: '{n} selected',
      mpNoResult: '😔 No matching records, adjust search criteria',

      // Status code page
      scSearch: 'Enter status code name or hex value, e.g. MV_CODEREADER_E_HANDLE or 0x80020000',
      scCatLabel: 'Category', scCatAll: 'All Categories',
      scStats: '{n} status codes',
      scStatsHint: '💡 Search by name, value, or description',
      scThCategory: 'Category', scThName: 'Name', scThValue: 'Value', scThDesc: 'Description', scThSolution: 'Solution',
      scLoading: 'Loading status codes…',
      scCount: '{n} items',
      scFooterHint: '💡 Click a row to copy the status code name',
      scNoMatch: '😔 No matching status codes found',
      scCopied: '✅ Copied: ',

      // PPM levels
      ppmExcellent: 'Excellent', ppmGood: 'Good', ppmPass: 'Pass',
      ppmLow: 'Low', ppmUnknown: 'Unknown',

      // Reasons
      reasonResOk: 'Resolution OK', reasonResNear: 'Resolution Near', reasonResLow: 'Resolution Low',
      reasonDistOk: 'Distance OK', reasonDistFail: 'Distance Mismatch',
      reasonFovOk: 'FOV OK', reasonFovFail: 'FOV Insufficient',
      reasonCMount: 'C-Mount',

      // Stitch
      stitchTitle: '🔗 Multi-Camera Stitching', stitchHint: '⚠️ Single camera FOV insufficient, use multi-camera stitching', stitchBack: '← Back to Single',
      barcodeW: 'Barcode Width *', barcodeH: 'Barcode Height *',
      barcodeOrient: 'Barcode Orientation', orientAuto: 'Auto Recommend', orientH: 'Horizontal', orientV: 'Vertical',
      safetyMargin: 'Safety Margin', stitchBtn: '⚡ Calculate Stitching',
      stitchAlertBase: 'Please complete basic selection parameters first',
      stitchAlertBarcode: 'Please enter barcode dimensions (width and height)',

      // Alerts
      alertFillAll: 'Please fill all required fields (Code Type, Module Size, Working Distance, FOV Width, FOV Height) with values > 0',
      alertNoDB: 'Product database not loaded. Ensure product_db.js is included.',

      // Result display
      resultEstFOV: '📐 Est. FOV {w}×{h}mm',
      resultPPM: '📊 True PPM',
      resultDist: '📏 Distance {min}-{max}mm',
      resultNoMatch: '⚠️ No model matches all criteria.<br>Adjust parameters and retry.',
      resultNoMatchShort: '⚠️ No matching models in selected series.',
      resultModalEmpty: 'No matching models. Adjust parameters and re-run selection.',
      resultWaitParam: 'Waiting for parameters...',
      resultFovStatus: '📐 Est. FOV {w}×{h}mm',

      // Competitor dynamic
      cpNoMatch: 'No matching records',
      cpNoMatchHint: 'Try other keywords. Supports competitor / HIKROBOT model search.',
      cpFeatLabel: 'Competitor Features',
      cpAdvLabel: 'Our Advantages',
      cpRecLabel: 'Recommended Model',
      cpCollapse: '📁 Collapse All',

      // BOM defaults
      bomUncategorized: 'Uncategorized',
      bomUnknownModel: 'Unknown Model',
      bomOther: 'Other',
      langBtn: '中',
      contactUs: 'Contact Us', contactTitle: '📱 Follow Us~Learn more about HIKROBOT latest updates！', contactHint: '💡 Scan to follow for latest updates'
    }
  };

  // 获取翻译文本，支持 {n} 占位符和 {key} 命名占位符
  function t(key, n) {
    var val = (i18n[currentLang] || i18n.zh)[key] || (i18n.zh[key] || key);
    if (n !== undefined) {
      if (typeof n === 'object' && n !== null) {
        Object.keys(n).forEach(function(k) {
          val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), n[k]);
        });
      } else {
        val = val.replace('{n}', n);
      }
    }
    return val;
  }

  // 暴露给 bom.js / mapping_module.js 使用
  window._i18n = {
    t: t,
    getLang: function() { return currentLang; }
  };

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // 1. 处理所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') {
        el.placeholder = val;
      } else if (el.tagName === 'OPTION') {
        el.textContent = val;
      } else {
        el.textContent = val;
      }
    });

    // 2. 处理 data-i18n-ph (placeholder)
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });

    // 2b. 处理 data-i18n-alt (alt text)
    document.querySelectorAll('[data-i18n-alt]').forEach(function(el) {
      el.alt = t(el.getAttribute('data-i18n-alt'));
    });

    // 3. 处理 data-i18n-html (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    // 4. Logo 区域（包含 SVG）
    document.querySelector('.logo-area h1').innerHTML = 
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect x="2" y="2" width="9" height="9" rx="1" fill="#f76504"/><rect x="13" y="2" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="2" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="13" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.15)"/></svg> ' + t('title') + ' <span class="contact-link" id="contactLink" data-i18n="contactUs">' + t('contactUs') + '</span>';

    // 5. 更新页面标题
    document.title = t('title');

    // 6. 通知 bom.js 和 mapping_module.js 重新渲染
    if (window.BOM && window.BOM.rerender) window.BOM.rerender();
    if (window.MAPPING && window.MAPPING.rerender) window.MAPPING.rerender();
  }

  function toggleLang() {
    applyLang(currentLang === 'zh' ? 'en' : 'zh');
  }

  // Expose to global scope for onclick handlers
  window.toggleTheme = toggleTheme;
  window.toggleLang = toggleLang;

  // ─── 导航切换 ───
  function switchToPage(pageId) {
    var tabs = document.querySelectorAll('.nav-tab');
    var pages = document.querySelectorAll('.page');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    pages.forEach(function(p) { p.classList.remove('active'); });
    // 激活对应tab（桌面端侧边栏里的）
    tabs.forEach(function(t) {
      if (t.dataset.page === pageId) t.classList.add('active');
    });
    var targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
  }

  function initNav() {
    var tabs = document.querySelectorAll('.nav-tab:not(.nav-tab-more)');
    var moreBtn = document.getElementById('navMoreBtn');
    var morePopup = document.getElementById('morePopup');
    var morePopupClose = document.getElementById('morePopupClose');
    var moreItems = document.querySelectorAll('.more-popup-item');

    // 常规tab点击
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        switchToPage(tab.dataset.page);

        // 产品表tab特殊处理：四次点击显示/隐藏代码列
        if (tab.dataset.page === 'page-mapping' && window.MAPPING && window.MAPPING.handleTabClick) {
          window.MAPPING.handleTabClick();
        }
      });
    });

    // 更多按钮 → 打开弹窗
    if (moreBtn) {
      moreBtn.addEventListener('click', function() {
        morePopup.classList.add('active');
      });
    }

    // 关闭弹窗
    function closeMore() {
      morePopup.classList.remove('active');
    }
    if (morePopupClose) morePopupClose.addEventListener('click', closeMore);
    if (morePopup) {
      morePopup.addEventListener('click', function(e) {
        if (e.target === morePopup) closeMore();
      });
    }

    // 弹窗内选项 → 切换页面并关闭
    moreItems.forEach(function(item) {
      item.addEventListener('click', function() {
        var pageId = item.dataset.page;
        switchToPage(pageId);
        closeMore();
      });
    });

    // 首页卡片点击跳转
    document.querySelectorAll('.home-card[data-goto]').forEach(function(card) {
      card.addEventListener('click', function() {
        switchToPage(card.dataset.goto);
      });
    });
  }

  // ─── SDK 页面初始化 ───
  function initSdkPage() {
    var sdkPage = document.getElementById('page-sdk');
    if (!sdkPage) return;

    // 语言切换（主内容区）
    var langBtns = document.querySelectorAll('.sdk-lang-btn');
    var contents = document.querySelectorAll('.sdk-content');
    var tocLangBtns = document.querySelectorAll('.sdk-toc-lang-btn');
    var tocSections = document.querySelectorAll('.sdk-toc-section');

    function switchSdkLang(lang) {
      // 主内容区
      langBtns.forEach(function(b) { b.classList.remove('active'); });
      contents.forEach(function(c) { c.classList.remove('active'); });
      langBtns.forEach(function(b) { if (b.dataset.lang === lang) b.classList.add('active'); });
      var target = document.getElementById('sdk-' + lang);
      if (target) target.classList.add('active');

      // 目录区
      tocLangBtns.forEach(function(b) { b.classList.remove('active'); });
      tocSections.forEach(function(s) { s.classList.remove('active'); });
      tocLangBtns.forEach(function(b) { if (b.dataset.lang === lang) b.classList.add('active'); });
      var tocTarget = document.querySelector('.sdk-toc-section[data-lang="' + lang + '"]');
      if (tocTarget) tocTarget.classList.add('active');
    }

    langBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchSdkLang(btn.dataset.lang);
      });
    });

    tocLangBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchSdkLang(btn.dataset.lang);
      });
    });

    // 平滑滚动
    function smoothScroll(e) {
      var href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    document.querySelectorAll('.sdk-path-card').forEach(function(link) {
      link.addEventListener('click', smoothScroll);
    });

    document.querySelectorAll('.sdk-toc-link').forEach(function(link) {
      link.addEventListener('click', smoothScroll);
    });

    // 滚动监听 - 高亮当前章节
    var progressBar = document.getElementById('sdkProgressBar');
    var percentText = document.getElementById('sdkPercent');
    var tocLinks = document.querySelectorAll('.sdk-toc-link');

    function updateTocHighlight() {
      var scrollTop = sdkPage.scrollTop;
      var scrollHeight = sdkPage.scrollHeight - sdkPage.clientHeight;
      var percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      // 更新进度条
      if (progressBar) progressBar.style.width = percent + '%';
      if (percentText) percentText.textContent = percent + '%';

      // 找到当前可见的章节
      var sections = sdkPage.querySelectorAll('.sdk-section');
      var currentSection = null;

      sections.forEach(function(section) {
        var rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = section;
        }
      });

      // 高亮对应的目录链接
      tocLinks.forEach(function(link) { link.classList.remove('active'); });
      if (currentSection) {
        var id = currentSection.id;
        var activeLink = sdkPage.querySelector('.sdk-toc-link[href="#' + id + '"]');
        if (activeLink) activeLink.classList.add('active');
      }
    }

    sdkPage.addEventListener('scroll', updateTocHighlight);
    // 初始执行一次
    setTimeout(updateTocHighlight, 100);
  }

  // ─── 工具函数 ───
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

  function isCodeType2D(codeType) { return codeType === 'QR'; }

  function getPPMFilterRange(codeType) {
    return isCodeType2D(codeType) ? { min: 3, max: 20 } : { min: 1.15, max: 4 };
  }

  function getPPMScoreAndLevel(ppm, codeType) {
    var is2D = isCodeType2D(codeType);
    if (is2D) {
      if (ppm >= 4 && ppm <= 8)  return { score: 30, level: t('ppmExcellent') };
      if (ppm > 8 && ppm <= 12)  return { score: 25, level: t('ppmGood') };
      if (ppm >= 12 || (ppm >= 3 && ppm < 4)) return { score: 15, level: t('ppmPass') };
      if (ppm < 3) return { score: -15, level: t('ppmLow') };
      return { score: 0, level: t('ppmUnknown') };
    } else {
      if (ppm >= 1.4 && ppm <= 2) return { score: 30, level: t('ppmExcellent') };
      if (ppm >= 2 && ppm <= 3)   return { score: 25, level: t('ppmGood') };
      if ((ppm >= 1 && ppm < 1.4) || ppm >= 3) return { score: 15, level: t('ppmPass') };
      if (ppm < 1) return { score: -15, level: t('ppmLow') };
      return { score: 0, level: t('ppmUnknown') };
    }
  }

  var cachedFilteredList = null;

  function updateSchematic(wdMM, estW, estH) {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('lblWd', wdMM + ' mm');
    set('lblFovW', (estW !== null && estW !== undefined) ? estW + ' mm' : '— mm');
    set('lblFovH', (estH !== null && estH !== undefined) ? estH + ' mm' : '— mm');
    if (estW !== null && estW !== undefined && estH !== null && estH !== undefined && wdMM > 0) {
      var hAngle = 2 * Math.atan(estW / (2 * wdMM)) * (180 / Math.PI);
      var vAngle = 2 * Math.atan(estH / (2 * wdMM)) * (180 / Math.PI);
      set('lblFovAngle', 'H:V=' + hAngle.toFixed(1) + '°*' + vAngle.toFixed(1) + '°');
    } else {
      set('lblFovAngle', '—');
    }
  }

  function resetSchematic() {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('lblWd', '— mm');
    set('lblFovW', '— mm');
    set('lblFovH', '— mm');
    set('lblFovAngle', '—');
  }

  // ─── 选型计算 ───
  function runSelection() {
    var codeType = document.getElementById('codeType').value;
    var mSize = parseFloat(document.getElementById('moduleSize').value);
    var mUnit = document.getElementById('moduleUnit').value;
    var fovW = parseFloat(document.getElementById('fovWidth').value);
    var fovWUnit = document.getElementById('fovUnit').value;
    var fovH = parseFloat(document.getElementById('fovHeight').value);
    var fovHUnit = document.getElementById('fovHeightUnit').value;
    var wd = parseFloat(document.getElementById('workingDistance').value);
    var dUnit = document.getElementById('distanceUnit').value;

    if (!codeType || isNaN(mSize) || isNaN(fovW) || isNaN(fovH) || isNaN(wd) || 
        mSize <= 0 || fovW <= 0 || fovH <= 0 || wd <= 0) {
      alert('请完整填写所有必填参数（码制类型、模块尺寸、工作距离、视野宽度、视野高度），且数值必须大于0');
      resetSchematic();
      document.getElementById('top1Content').innerHTML = '<div class="empty-state">等待参数输入...</div>';
      document.getElementById('showModalBtn').disabled = true;
      cachedFilteredList = null;
      return;
    }

    // 添加 loading 状态
    var runBtn = document.getElementById('runBtn');
    runBtn.classList.add('loading');
    runBtn.textContent = '';

    // 使用 requestAnimationFrame 延迟执行，让 loading 动画先渲染
    requestAnimationFrame(function() {
      setTimeout(function() {

    var moduleMM = toMM(mSize, mUnit);
    var fovReqW_mm = toMM(fovW, fovWUnit);
    var fovReqH_mm = toMM(fovH, fovHUnit);
    var wdMM = toMM(wd, dUnit);
    var is2D = isCodeType2D(codeType);
    var divisor = is2D ? 5 : 1.5;
    var requiredPrecision = moduleMM / divisor;
    var requiredPixelsW = Math.ceil(fovReqW_mm / requiredPrecision);
    var requiredPixelsH = Math.ceil(fovReqH_mm / requiredPrecision);
    var ppmRange = getPPMFilterRange(codeType);

    // 检查 PRODUCT_DB 是否可用
    if (typeof PRODUCT_DB === 'undefined') {
      alert(t('alertNoDB'));
      return;
    }

    var allScored = PRODUCT_DB.map(function(model) {
      var score = 0, reasons = [];
      var sensorWidthPx = model.resolution.w;
      var sensorHeightPx = model.resolution.h;
      var fovEst = estimateFOV(model, wdMM);
      var ppm = null, ppmLevel = '', ppmScore = 0;

      if (model.focal && fovEst) {
        ppm = (sensorWidthPx / fovEst.width) * moduleMM;
        var ppmResult = getPPMScoreAndLevel(ppm, codeType);
        ppmScore = ppmResult.score;
        ppmLevel = ppmResult.level;
      }

      // 分辨率评分
      if (sensorWidthPx >= requiredPixelsW && sensorHeightPx >= requiredPixelsH) {
        score += 30;
        reasons.push(t('reasonResOk'));
      } else if (sensorWidthPx >= requiredPixelsW * 0.8 && sensorHeightPx >= requiredPixelsH * 0.8) {
        score += 15;
        reasons.push(t('reasonResNear'));
      } else {
        score -= 20;
        reasons.push(t('reasonResLow'));
      }

      // PPM 评分
      if (ppm !== null) {
        score += ppmScore;
        reasons.push('PPM' + ppmLevel + '(' + ppm.toFixed(2) + ')');
      } else {
        score += 5;
        reasons.push(t('reasonCMount'));
      }

      // 工作距离评分
      if (wdMM >= model.workingDist.min && wdMM <= model.workingDist.max) {
        score += 15;
        reasons.push(t('reasonDistOk'));
      } else {
        score -= 5;
        reasons.push(t('reasonDistFail'));
      }

      // 视野评分
      if (model.focal && fovEst) {
        if (fovEst.width >= fovReqW_mm && fovEst.height >= fovReqH_mm) {
          score += 15;
          reasons.push(t('reasonFovOk'));
        } else {
          score -= 20;
          reasons.push(t('reasonFovFail'));
        }
      }

      return { model: model, score: score, ppm: ppm, ppmLevel: ppmLevel, reasons: reasons, fovEst: fovEst };
    });

    allScored.sort(function(a, b) { return b.score - a.score; });

    var filtered = allScored.filter(function(item) {
      var wdOK = (wdMM >= item.model.workingDist.min && wdMM <= item.model.workingDist.max);
      var ppmOK = true;
      if (item.model.focal && item.ppm !== null) {
        ppmOK = (item.ppm >= ppmRange.min && item.ppm <= ppmRange.max);
      }
      var fovOK = true;
      if (item.model.focal && item.fovEst) {
        fovOK = (item.fovEst.width >= fovReqW_mm && item.fovEst.height >= fovReqH_mm);
      }
      return wdOK && ppmOK && fovOK;
    });

    cachedFilteredList = filtered;
    document.getElementById('showModalBtn').disabled = false;

    if (filtered.length > 0) {
      var best = filtered[0];
      var ppmDisplay = best.ppm !== null ? best.ppm.toFixed(2) : '—';
      var ppmLevelDisplay = best.ppmLevel ? ' (' + best.ppmLevel + ')' : '';
      document.getElementById('top1Content').innerHTML = 
        '<div class="result-main">' +
          '<div class="result-card"><strong>' + t('showModal').replace('📋 ', '') + '</strong><span>' + best.model.model + '</span></div>' +
          '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
        '</div>' +
        '<div class="model-preview">' +
          '<span>' + best.model.series + ' · ' + best.model.resolution.w + '×' + best.model.resolution.h + ' · ' + best.model.interface + '</span>' +
          '<span class="tag">' + best.model.protection + '</span>' +
        '</div>';
      var estW = best.fovEst ? best.fovEst.width : null;
      var estH = best.fovEst ? best.fovEst.height : null;
      updateSchematic(wdMM, estW, estH);
      // 单相机已满足，隐藏拼接卡片
      if (window._stitch) window._stitch.hide();
    } else {
      updateSchematic(wdMM, null, null);

      // 分析单相机失败原因
      var failReasons = [];
      allScored.forEach(function(item) {
        if (item.fovEst && (item.fovEst.width < fovReqW_mm || item.fovEst.height < fovReqH_mm)) {
          if (failReasons.indexOf('fov') === -1) failReasons.push('fov');
        }
        if (wdMM < item.model.workingDist.min || wdMM > item.model.workingDist.max) {
          if (failReasons.indexOf('dist') === -1) failReasons.push('dist');
        }
      });

      var reasonTags = '';
      if (failReasons.indexOf('fov') !== -1) reasonTags += '<span class="stitch-hint-reason">视野超出单机极限</span>';
      if (failReasons.indexOf('dist') !== -1) reasonTags += '<span class="stitch-hint-reason">工作距离受限</span>';
      if (!reasonTags) reasonTags = '<span class="stitch-hint-reason">视野超出单机极限</span>';

      document.getElementById('top1Content').innerHTML =
        '<div class="stitch-hint-card">' +
          '<div class="stitch-hint-icon">📷</div>' +
          '<div class="stitch-hint-title">单相机方案无法满足当前需求</div>' +
          '<div class="stitch-hint-desc">您输入的视野范围较大，单台读码器无法完整覆盖。建议采用多相机组网拼接方案，通过多台读码器协同工作实现完整视野覆盖。</div>' +
          '<button class="stitch-hint-btn" id="showStitchBtn">📐 查看拼接方案</button>' +
          '<div class="stitch-hint-reasons">' + reasonTags + '</div>' +
        '</div>';

      // 绑定按钮事件
      document.getElementById('showStitchBtn').addEventListener('click', function() {
        if (window._stitch) window._stitch.show();
      });
    }

    // 移除 loading 状态
    runBtn.classList.remove('loading');
    runBtn.textContent = t('runBtn');

      }, 80); // setTimeout end
    }); // requestAnimationFrame end
  }

  // ─── Modal 渲染 ───
  function renderModalWithSeriesFilter() {
    if (!cachedFilteredList || cachedFilteredList.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="empty-state">' + t('resultModalEmpty') + '</div>';
      return;
    }

    var checkboxes = document.querySelectorAll('#seriesCheckGroup input[type="checkbox"]');
    var selectedSeries = Array.from(checkboxes).filter(function(cb) { return cb.checked; }).map(function(cb) { return cb.value; });
    var filteredBySeries = cachedFilteredList.filter(function(item) {
      return selectedSeries.indexOf(item.model.series) !== -1;
    });

    if (filteredBySeries.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="warning-badge">' + t('resultNoMatchShort') + '</div>';
      return;
    }

    var html = '';
    filteredBySeries.forEach(function(item, idx) {
      var m = item.model;
      var fovEst = item.fovEst;
      var ppmDisplay = item.ppm !== null ? item.ppm.toFixed(2) : '— (C-Mount)';
      var ppmLevelDisplay = item.ppmLevel ? ' (' + item.ppmLevel + ')' : '';
      var fovStatus = fovEst ? t('resultFovStatus', { w: fovEst.width, h: fovEst.height }) : '🔧 C-Mount';
      html += '<div class="modal-model-entry ' + (idx === 0 ? 'recommended' : '') + '">' +
        '<div class="modal-entry-header">' +
          '<span class="modal-model-name">' + m.model + '</span>' +
          '<span class="modal-model-series">' + m.series + '</span>' +
        '</div>' +
        '<div class="modal-spec-grid">' +
          '<div class="spec-item">🔘 ' + m.resolution.w + '×' + m.resolution.h + '</div>' +
          '<div class="spec-item">🔌 ' + m.interface + '</div>' +
          '<div class="spec-item">🛡️ ' + m.protection + '</div>' +
          '<div class="spec-item">' + (m.focal ? '🔍 ' + m.focal + 'mm' : '🔧 C-Mount') + '</div>' +
        '</div>' +
        '<div class="ppm-value-row"><span>' + t('resultPPM') + '：<span class="ppm-value-highlight">' + ppmDisplay + '</span>' + ppmLevelDisplay + '</span></div>' +
        '<div class="info-row">' +
          '<span class="info-tag">' + t('resultDist', {min: m.workingDist.min, max: m.workingDist.max}) + '</span>' +
          '<span class="info-tag">' + fovStatus + '</span>' +
        '</div>' +
        '<div class="reasons-row">' + item.reasons.map(function(r) { return '<span class="reason-badge">✨ ' + r + '</span>'; }).join('') + '</div>' +
      '</div>';
    });
    document.getElementById('modalModelList').innerHTML = html;
  }

  function initModal() {
    var modal = document.getElementById('modelModal');
    var showBtn = document.getElementById('showModalBtn');
    var closeBtn = document.getElementById('closeModalBtn');
    var resetBtn = document.getElementById('resetSeriesFilterBtn');

    showBtn.addEventListener('click', function() {
      renderModalWithSeriesFilter();
      modal.classList.add('active');
    });

    closeBtn.addEventListener('click', function() {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.classList.remove('active');
    });

    var seriesChecks = document.querySelectorAll('#seriesCheckGroup input');
    seriesChecks.forEach(function(cb) {
      cb.addEventListener('change', function() {
        if (modal.classList.contains('active')) renderModalWithSeriesFilter();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        seriesChecks.forEach(function(cb) { cb.checked = true; });
        if (modal.classList.contains('active')) renderModalWithSeriesFilter();
      });
    }
  }

  function initContactModal() {
    var contactModal = document.getElementById('contactModal');
    var contactClose = document.getElementById('contactModalClose');
    var lightbox = document.getElementById('contactLightbox');
    var lightboxImg = document.getElementById('contactLightboxImg');

    if (!contactModal) return;

    // 使用事件委托，因为 applyLang 会重建 h1 导致 contactLink 元素被替换
    document.addEventListener('click', function(e) {
      var link = e.target.closest('#contactLink');
      if (link) {
        e.stopPropagation();
        contactModal.classList.add('active');
      }
    });

    if (contactClose) {
      contactClose.addEventListener('click', function() {
        contactModal.classList.remove('active');
      });
    }

    contactModal.addEventListener('click', function(e) {
      if (e.target === contactModal) contactModal.classList.remove('active');
    });

    // 点击图片打开 lightbox
    if (lightbox && lightboxImg) {
      contactModal.addEventListener('click', function(e) {
        var wrap = e.target.closest('.contact-card-img-wrap');
        if (wrap) {
          lightboxImg.src = wrap.getAttribute('data-src');
          lightbox.classList.add('active');
        }
      });

      lightbox.addEventListener('click', function() {
        lightbox.classList.remove('active');
      });
    }
  }

  // ─── 初始化 ───
  function init() {
    initNav();

    // 清空表单
    document.getElementById('codeType').value = '';
    document.getElementById('moduleSize').value = '';
    document.getElementById('workingDistance').value = '';
    document.getElementById('fovWidth').value = '';
    document.getElementById('fovHeight').value = '';
    resetSchematic();
    document.getElementById('top1Content').innerHTML = '<div class="empty-state">' + t('emptyState') + '</div>';
    document.getElementById('showModalBtn').disabled = true;

    // 绑定选型按钮
    document.getElementById('runBtn').addEventListener('click', runSelection);

    initModal();
    initContactModal();
    initSdkPage();

    // 拼接示意图放大灯箱关闭
    var stitchLb = document.getElementById('stitchLightbox');
    if (stitchLb) {
      stitchLb.addEventListener('click', function() {
        stitchLb.classList.remove('active');
        document.getElementById('stitchLightboxInner').innerHTML = '';
      });
    }

    // 绑定拼接计算按钮
    var stitchBtn = document.getElementById('stitchBtn');
    if (stitchBtn) stitchBtn.addEventListener('click', runStitchCalculation);

    // 绑定返回单相机按钮
    var stitchBackBtn = document.getElementById('stitchBackBtn');
    if (stitchBackBtn) stitchBackBtn.addEventListener('click', function() {
      if (window._stitch) window._stitch.hide();
      // 清空右侧结果
      document.getElementById('top1Content').innerHTML = '<div class="empty-state">' + t('emptyState') + '</div>';
      document.getElementById('showModalBtn').disabled = true;
      resetSchematic();
    });

    // 拼接示意图下载
    var stitchDlBtn = document.getElementById('stitchDownloadBtn');
    if (stitchDlBtn) {
      stitchDlBtn.addEventListener('click', function() {
        var svgWrap = document.getElementById('stitchSvgWrap');
        if (!svgWrap) return;
        var svgEl = svgWrap.querySelector('svg');
        if (!svgEl) return;
        // 创建高分辨率SVG
        var clone = svgEl.cloneNode(true);
        clone.setAttribute('width', '1920');
        clone.setAttribute('height', '1200');
        var svgData = new XMLSerializer().serializeToString(clone);
        var blob = new Blob([svgData], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var activeIdx = window._stitchActiveIdx || 0;
        var activeModel = window._stitchResults ? window._stitchResults[activeIdx] : null;
        a.download = '拼接方案_' + (activeModel ? activeModel.model.model : 'diagram') + '.svg';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // 三次点击左上角 logo 跳转 db_editor.html
    var _logoClickCount = 0;
    var _logoClickTimer = null;
    var logoArea = document.querySelector('.logo-area');
    if (logoArea) {
      logoArea.style.cursor = 'pointer';
      logoArea.addEventListener('click', function() {
        _logoClickCount++;
        if (_logoClickTimer) clearTimeout(_logoClickTimer);
        if (_logoClickCount >= 3) {
          _logoClickCount = 0;
          window.location.href = 'db_editor.html';
          return;
        }
        _logoClickTimer = setTimeout(function() { _logoClickCount = 0; }, 600);
      });
    }

    console.log('✅ 智能选型模块初始化完成，共 ' + (typeof PRODUCT_DB !== 'undefined' ? PRODUCT_DB.length : 0) + ' 个型号');
  }

  // SDK 代码复制功能
  function copySdkCode(btn) {
    var codeBlock = btn.closest('.sdk-code');
    var code = codeBlock.querySelector('code');
    var text = code.textContent || code.innerText;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        var original = btn.textContent;
        btn.textContent = '已复制';
        btn.style.background = '#27ae60';
        setTimeout(function() {
          btn.textContent = original;
          btn.style.background = '';
        }, 2000);
      });
    } else {
      // fallback
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      var original = btn.textContent;
      btn.textContent = '已复制';
      btn.style.background = '#27ae60';
      setTimeout(function() {
        btn.textContent = original;
        btn.style.background = '';
      }, 2000);
    }
  }

  // 暴露到全局
  window.copySdkCode = copySdkCode;


  // ═══════════ 多相机拼接计算 ═══════════

  function getCameraFOV(model, wdMM, rotation, moduleMM) {
    if (!model.focal || !model.pixelSize) return null;
    var sensorW = (model.resolution.w * model.pixelSize) / 1000;
    var sensorH = (model.resolution.h * model.pixelSize) / 1000;
    var fovW, fovH, resW, resH;
    if (rotation === 90) {
      fovW = (sensorH * wdMM) / model.focal;
      fovH = (sensorW * wdMM) / model.focal;
      resW = model.resolution.h;
      resH = model.resolution.w;
    } else {
      fovW = (sensorW * wdMM) / model.focal;
      fovH = (sensorH * wdMM) / model.focal;
      resW = model.resolution.w;
      resH = model.resolution.h;
    }
    var ppm = resW / fovW * moduleMM;
    return { width: Math.round(fovW), height: Math.round(fovH), ppm: ppm, resW: resW, resH: resH };
  }

  function calcGrid(totalW, totalH, fovW, fovH, overlapW, overlapH) {
    var cols = totalW <= fovW ? 1 : Math.ceil((totalW - fovW) / (fovW - overlapW)) + 1;
    var rows = totalH <= fovH ? 1 : Math.ceil((totalH - fovH) / (fovH - overlapH)) + 1;
    return {
      cols: cols, rows: rows, total: cols * rows,
      actualW: Math.round(fovW + (cols - 1) * (fovW - overlapW)),
      actualH: Math.round(fovH + (rows - 1) * (fovH - overlapH))
    };
  }

  function runStitchCalculation() {
    var codeType = document.getElementById('codeType').value;
    var mSize = parseFloat(document.getElementById('moduleSize').value);
    var mUnit = document.getElementById('moduleUnit').value;
    var fovReqW = parseFloat(document.getElementById('fovWidth').value);
    var fovWUnit = document.getElementById('fovUnit').value;
    var fovReqH = parseFloat(document.getElementById('fovHeight').value);
    var fovHUnit = document.getElementById('fovHeightUnit').value;
    var wd = parseFloat(document.getElementById('workingDistance').value);
    var dUnit = document.getElementById('distanceUnit').value;
    var barcodeW = parseFloat(document.getElementById('barcodeW').value);
    var barcodeH = parseFloat(document.getElementById('barcodeH').value);
    var barcodeWUnit = document.getElementById('barcodeWUnit').value;
    var barcodeHUnit = document.getElementById('barcodeHUnit').value;
    var orient = document.getElementById('barcodeOrient').value;
    var safetyPct = parseFloat(document.getElementById('safetyMargin').value) || 5;

    if (!codeType || isNaN(mSize) || isNaN(fovReqW) || isNaN(fovReqH) || isNaN(wd) ||
        mSize <= 0 || fovReqW <= 0 || fovReqH <= 0 || wd <= 0) {
      alert(t('stitchAlertBase'));
      return;
    }
    if (isNaN(barcodeW) || isNaN(barcodeH) || barcodeW <= 0 || barcodeH <= 0) {
      alert(t('stitchAlertBarcode'));
      return;
    }

    var btn = document.getElementById('stitchBtn');
    btn.classList.add('loading');
    btn.textContent = '';

    requestAnimationFrame(function() { setTimeout(function() {

    var moduleMM = toMM(mSize, mUnit);
    var totalW = toMM(fovReqW, fovWUnit);
    var totalH = toMM(fovReqH, fovHUnit);
    var wdMM = toMM(wd, dUnit);
    var barcodeWMM = toMM(barcodeW, barcodeWUnit);
    var barcodeHMM = toMM(barcodeH, barcodeHUnit);
    var ppmRange = getPPMFilterRange(codeType);
    var effW = totalW * (1 + safetyPct / 100);
    var effH = totalH * (1 + safetyPct / 100);

    var results = [];

    PRODUCT_DB.forEach(function(model) {
      if (!model.focal) return;
      if (wdMM < model.workingDist.min || wdMM > model.workingDist.max) return;

      // 关键：0°和90°都算，取相机数最少的
      [0, 90].forEach(function(rot) {
        var fov = getCameraFOV(model, wdMM, rot, moduleMM);
        if (!fov) return;
        if (fov.ppm < ppmRange.min || fov.ppm > ppmRange.max) return;

        // 重叠区：根据条码方向决定
        var overlapW, overlapH;
        if (orient === 'v') {
          overlapW = barcodeHMM * (1 + safetyPct / 100);
          overlapH = barcodeWMM * (1 + safetyPct / 100);
        } else if (orient === 'h') {
          overlapW = barcodeWMM * (1 + safetyPct / 100);
          overlapH = barcodeHMM * (1 + safetyPct / 100);
        } else {
          // 自动：条码可能任意角度摆放，按对角线计算重叠区
          var diag = Math.sqrt(barcodeWMM * barcodeWMM + barcodeHMM * barcodeHMM);
          overlapW = diag * (1 + safetyPct / 100);
          overlapH = diag * (1 + safetyPct / 100);
        }
        overlapW = Math.min(overlapW, fov.width * 0.4);
        overlapH = Math.min(overlapH, fov.height * 0.4);

        var grid;
        if (fov.width >= effW && fov.height >= effH) {
          grid = { cols: 1, rows: 1, total: 1, actualW: fov.width, actualH: fov.height };
        } else {
          grid = calcGrid(effW, effH, fov.width, fov.height, overlapW, overlapH);
        }
        if (grid.total >= 33) return;

        results.push({
          model: model, rotation: rot, fov: fov, grid: grid,
          overlapW: grid.total > 1 ? Math.round(overlapW) : 0,
          overlapH: grid.total > 1 ? Math.round(overlapH) : 0,
          ppm: fov.ppm
        });
      });
    });

    // 排序：相机数最少 > 视野最接近 > PPM最高
    results.sort(function(a, b) {
      if (a.grid.total !== b.grid.total) return a.grid.total - b.grid.total;
      var aWaste = a.grid.actualW * a.grid.actualH - effW * effH;
      var bWaste = b.grid.actualW * b.grid.actualH - effW * effH;
      if (Math.abs(aWaste - bWaste) > 100) return aWaste - bWaste;
      return b.ppm - a.ppm;
    });

    // 同型号只保留相机数最少的旋转方案
    var seen = {};
    var deduped = [];
    results.forEach(function(r) {
      var key = r.model.model;
      if (!seen[key]) {
        seen[key] = true;
        deduped.push(r);
      }
    });

    // 按系列分组
    var grouped = {};
    deduped.forEach(function(r) {
      var series = r.model.series;
      if (!grouped[series]) grouped[series] = [];
      grouped[series].push(r);
    });
    window._stitchResults = deduped;
    window._stitchGrouped = grouped;
    window._stitchTotalW = totalW;
    window._stitchTotalH = totalH;
    window._stitchActiveIdx = 0;
    window._stitchBarcodeW = barcodeWMM;
    window._stitchBarcodeH = barcodeHMM;
    window._stitchOrient = orient;
    renderStitchResult(deduped, totalW, totalH, barcodeWMM, barcodeHMM, orient, 0, null);

    btn.classList.remove('loading');
    btn.textContent = t('stitchBtn');

    }, 80); });
  }

  function renderStitchResult(results, totalW, totalH, barcodeW, barcodeH, orient, activeIdx, filterSeries) {
    var svgArea = document.getElementById('stitchSvgArea');
    var planArea = document.getElementById('stitchPlanArea');
    if (!results || results.length === 0) {
      svgArea.style.display = 'none';
      planArea.innerHTML = '<div class="stitch-warning">😔 未找到合适的拼接方案<br>请调整参数：增大工作距离、减小覆盖区域、或选择更高分辨率型号</div>';
      planArea.style.display = '';
      return;
    }

    // 系列筛选
    var displayResults = filterSeries ? results.filter(function(r) { return r.model.series === filterSeries; }) : results;
    if (displayResults.length === 0) displayResults = results;

    // 确保 activeIdx 在范围内
    if (activeIdx >= displayResults.length) activeIdx = 0;
    var best = displayResults[activeIdx];

    // 大图放SVG区域
    svgArea.innerHTML = renderStitchSVG(best, barcodeW, barcodeH, orient, totalW, totalH);
    svgArea.style.display = '';
    // 显示下载按钮
    var dlBtn = document.getElementById('stitchDownloadBtn');
    if (dlBtn) dlBtn.style.display = '';

    // 点击放大
    var svgWrap = document.getElementById('stitchSvgWrap');
    if (svgWrap) {
      svgWrap.onclick = function() {
        var svgEl = svgWrap.querySelector('svg');
        var lightbox = document.getElementById('stitchLightbox');
        var lightboxInner = document.getElementById('stitchLightboxInner');
        lightboxInner.innerHTML = svgEl.outerHTML;
        lightbox.classList.add('active');
      };
    }

    // 获取所有出现的系列
    var allSeries = [];
    var seriesSeen = {};
    results.forEach(function(r) {
      if (!seriesSeen[r.model.series]) {
        seriesSeen[r.model.series] = true;
        allSeries.push(r.model.series);
      }
    });

    var html = '';

    // 顶部卡片：与单相机风格一致
    html += '<div class="result-main">';
    html += '<div class="result-card"><strong>推荐型号</strong><span>' + best.model.model + '</span></div>';
    html += '<div class="result-card"><strong>相机数量</strong><span>' + best.grid.total + ' 台</span></div>';
    html += '</div>';
    html += '<div class="model-preview">';
    html += '<span>' + best.model.series + ' · ' + best.model.resolution.w + '×' + best.model.resolution.h + ' · ' + best.grid.cols + '×' + best.grid.rows + ' 拼接</span>';
    html += '<span class="tag">PPM ' + best.ppm.toFixed(2) + '</span>';
    html += '</div>';

    // 系列筛选标签
    html += '<div class="stitch-series-tabs">';
    html += '<span class="stitch-series-tab' + (!filterSeries ? ' active' : '') + '" data-series="all">全部 (' + results.length + ')</span>';
    allSeries.forEach(function(s) {
      var count = results.filter(function(r) { return r.model.series === s; }).length;
      html += '<span class="stitch-series-tab' + (filterSeries === s ? ' active' : '') + '" data-series="' + s + '">' + s + ' (' + count + ')</span>';
    });
    html += '</div>';

    // 方案列表
    html += '<div class="stitch-plan-list" id="stitchPlanList">';
    displayResults.forEach(function(r, idx) {
      var isActive = idx === activeIdx;
      var hidden = idx >= 5 ? ' style="display:none"' : '';
      html += '<div class="stitch-plan-item' + (isActive ? ' active' : '') + '" data-stitch-idx="' + idx + '"' + hidden + '>';
      html += '<div class="stitch-plan-left">';
      html += '<span class="stitch-plan-model">' + r.model.model + '</span>';
      html += '<span class="stitch-plan-spec">' + r.model.resolution.w + '×' + r.model.resolution.h + '</span>';
      html += '</div>';
      html += '<div class="stitch-plan-right">';
      html += '<span class="stitch-plan-count">' + r.grid.cols + '×' + r.grid.rows + ' = ' + r.grid.total + '台</span>';
      html += '<span class="stitch-plan-ppm">PPM ' + r.ppm.toFixed(2) + '</span>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';

    // 更多按钮
    if (displayResults.length > 5) {
      html += '<button class="stitch-more-btn" id="stitchMoreBtn">📋 显示全部 ' + displayResults.length + ' 个方案</button>';
    }

    // 详情 - 使用与单相机一致的卡片风格
    html += '<div class="stitch-detail-cards">';
    html += '<div class="stitch-detail-card"><span class="stitch-detail-label">覆盖区域</span><span class="stitch-detail-value">' + Math.round(totalW) + '×' + Math.round(totalH) + 'mm</span></div>';
    html += '<div class="stitch-detail-card highlight"><span class="stitch-detail-label">实际覆盖</span><span class="stitch-detail-value">' + best.grid.actualW + '×' + best.grid.actualH + 'mm</span></div>';
    html += '<div class="stitch-detail-card"><span class="stitch-detail-label">单视野</span><span class="stitch-detail-value">' + best.fov.width + '×' + best.fov.height + 'mm</span></div>';
    if (best.grid.total > 1) {
      html += '<div class="stitch-detail-card"><span class="stitch-detail-label">重叠区</span><span class="stitch-detail-value">' + best.overlapW + '×' + best.overlapH + 'mm</span></div>';
    }
    html += '</div>';

    if (best.grid.total > 1) {
      html += '<div class="stitch-warning">';
      html += '⚠️ <strong>拼接注意事项：</strong><br>';
      html += '• 条码切勿跨越拼接线，确保每个条码完整落在单个相机视野内<br>';
      html += '• 相邻相机重叠 ' + best.overlapW + 'mm，防止边缘漏读<br>';
      html += '• 建议相邻相机间距 = ' + (best.fov.width - best.overlapW) + 'mm';
      html += '</div>';
    }

    planArea.innerHTML = html;
    planArea.style.display = '';

    // 绑定方案切换
    planArea.querySelectorAll('.stitch-plan-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.getAttribute('data-stitch-idx'));
        window._stitchActiveIdx = idx;
        renderStitchResult(results, totalW, totalH, barcodeW, barcodeH, orient, idx, filterSeries);
      });
    });

    // 绑定系列筛选
    planArea.querySelectorAll('.stitch-series-tab').forEach(function(el) {
      el.addEventListener('click', function() {
        var s = el.getAttribute('data-series');
        renderStitchResult(results, totalW, totalH, barcodeW, barcodeH, orient, 0, s === 'all' ? null : s);
      });
    });

    // 绑定更多按钮
    var moreBtn = document.getElementById('stitchMoreBtn');
    if (moreBtn) {
      moreBtn.addEventListener('click', function() {
        planArea.querySelectorAll('.stitch-plan-item').forEach(function(el) { el.style.display = ''; });
        moreBtn.style.display = 'none';
      });
    }
  }

  function renderStitchSVG(plan, barcodeW, barcodeH, orient, reqW, reqH) {
    var cols = plan.grid.cols, rows = plan.grid.rows;
    var padL = 100, padR = 80, padT = 90, padB = 80;
    var maxSvgW = 1400, maxSvgH = 900;
    var scaleX = (maxSvgW - padL - padR) / plan.grid.actualW;
    var scaleY = (maxSvgH - padT - padB) / plan.grid.actualH;
    var scale = Math.min(scaleX, scaleY);
    var camW = plan.fov.width * scale;
    var camH = plan.fov.height * scale;
    var overlapPxW = plan.overlapW * scale;
    var overlapPxH = plan.overlapH * scale;
    var stepX = camW - overlapPxW;
    var stepY = camH - overlapPxH;
    var svgW = Math.round(camW * cols - overlapPxW * (cols - 1) + padL + padR);
    var svgH = Math.round(camH * rows - overlapPxH * (rows - 1) + padT + padB);
    svgW = Math.max(svgW, 600); svgH = Math.max(svgH, 450);
    var regionX = padL, regionY = padT;
    var regionW = plan.grid.actualW * scale;
    var regionH = plan.grid.actualH * scale;

    // 暗色模式检测
    var isDark = document.documentElement.classList.contains('dark');
    var bgColor = isDark ? '#161b22' : '#F5F7FA';
    var textColor = isDark ? '#e6edf3' : '#555';
    var mutedColor = isDark ? '#8b949e' : '#888';
    var dimColor = isDark ? '#484f58' : '#bbb';
    var borderDim = isDark ? '#30363d' : '#aaa';
    var reqAreaColor = isDark ? '#58a6ff' : '#3884f4';

    var camColor = '#f76504';
    var overlapHColor = '#e74c3c';
    var overlapVColor = '#3884f4';

    var svg = '<div class="stitch-svg-wrap" id="stitchSvgWrap" title="点击放大"><svg viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect width="' + svgW + '" height="' + svgH + '" fill="' + bgColor + '" rx="6"/>';

    // 实际覆盖区域尺寸标注（顶部）- 放在外层
    var dimTopY = regionY - 40;
    svg += '<line x1="' + regionX + '" y1="' + dimTopY + '" x2="' + (regionX + regionW) + '" y2="' + dimTopY + '" stroke="' + camColor + '" stroke-width="1" marker-start="url(#sL)" marker-end="url(#sR)"/>';
    svg += '<text x="' + (regionX + regionW / 2) + '" y="' + (dimTopY - 6) + '" fill="' + camColor + '" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">' + Math.round(plan.grid.actualW) + 'mm</text>';
    svg += '<line x1="' + regionX + '" y1="' + (dimTopY + 3) + '" x2="' + regionX + '" y2="' + (regionY - 3) + '" stroke="' + dimColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
    svg += '<line x1="' + (regionX + regionW) + '" y1="' + (dimTopY + 3) + '" x2="' + (regionX + regionW) + '" y2="' + (regionY - 3) + '" stroke="' + dimColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';

    // 实际覆盖区域尺寸标注（左侧）- 放在外层
    var dimLeftX = regionX - 40;
    svg += '<line x1="' + dimLeftX + '" y1="' + regionY + '" x2="' + dimLeftX + '" y2="' + (regionY + regionH) + '" stroke="' + camColor + '" stroke-width="1" marker-start="url(#aU)" marker-end="url(#aD)"/>';
    svg += '<text x="' + (dimLeftX - 6) + '" y="' + (regionY + regionH / 2) + '" fill="' + camColor + '" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">' + Math.round(plan.grid.actualH) + 'mm</text>';
    svg += '<line x1="' + (dimLeftX + 3) + '" y1="' + regionY + '" x2="' + (regionX - 3) + '" y2="' + regionY + '" stroke="' + dimColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
    svg += '<line x1="' + (dimLeftX + 3) + '" y1="' + (regionY + regionH) + '" x2="' + (regionX - 3) + '" y2="' + (regionY + regionH) + '" stroke="' + dimColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';

    // 总覆盖区域虚线框（实际覆盖）
    svg += '<rect x="' + regionX + '" y="' + regionY + '" width="' + regionW + '" height="' + regionH + '" fill="none" stroke="' + borderDim + '" stroke-width="1" stroke-dasharray="5,3" rx="3"/>';

    // 需求覆盖区域（蓝色虚线框）
    if (reqW && reqH) {
      var reqPxW = reqW * scale;
      var reqPxH = reqH * scale;
      var reqX = regionX + (regionW - reqPxW) / 2;
      var reqY = regionY + (regionH - reqPxH) / 2;
      svg += '<rect x="' + reqX + '" y="' + reqY + '" width="' + reqPxW + '" height="' + reqPxH + '" fill="none" stroke="' + reqAreaColor + '" stroke-width="1.5" stroke-dasharray="6,4" rx="3"/>';
      svg += '<text x="' + (reqX + reqPxW / 2) + '" y="' + (reqY - 6) + '" fill="' + reqAreaColor + '" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">需求覆盖 ' + Math.round(reqW) + '×' + Math.round(reqH) + 'mm</text>';
    }

    // 箭头 marker 定义
    svg += '<defs>';
    svg += '<marker id="aL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="' + camColor + '"/></marker>';
    svg += '<marker id="aR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="' + camColor + '"/></marker>';
    svg += '<marker id="aU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="' + camColor + '"/></marker>';
    svg += '<marker id="aD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="' + camColor + '"/></marker>';
    svg += '<marker id="oL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="' + overlapHColor + '"/></marker>';
    svg += '<marker id="oR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="' + overlapHColor + '"/></marker>';
    svg += '<marker id="oU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="' + overlapVColor + '"/></marker>';
    svg += '<marker id="oD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="' + overlapVColor + '"/></marker>';
    // 单机标注用 markers
    var singleColorForMarker = isDark ? '#a0c4ff' : '#4a90d9';
    svg += '<marker id="sL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="' + singleColorForMarker + '"/></marker>';
    svg += '<marker id="sR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="' + singleColorForMarker + '"/></marker>';
    svg += '<marker id="sU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="' + singleColorForMarker + '"/></marker>';
    svg += '<marker id="sD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="' + singleColorForMarker + '"/></marker>';
    svg += '</defs>';

    // 绘制相机视野
    var camNum = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = regionX + c * stepX;
        var y = regionY + r * stepY;
        svg += '<rect x="' + x + '" y="' + y + '" width="' + camW + '" height="' + camH + '" fill="' + camColor + '" fill-opacity="0.08" stroke="' + camColor + '" stroke-width="1.5" rx="3"/>';
        var cx = x + camW / 2, cy = y + camH / 2;
        svg += '<text x="' + cx + '" y="' + (cy + 5) + '" fill="' + camColor + '" font-size="16" font-weight="bold" font-family="sans-serif" text-anchor="middle">#' + (camNum + 1) + '</text>';

        // 单机视野尺寸标注（只标第一台相机）- 使用不同样式区分
        if (camNum === 0) {
          var singleColor = isDark ? '#a0c4ff' : '#4a90d9';
          var dimY = y - 15;
          svg += '<line x1="' + x + '" y1="' + dimY + '" x2="' + (x + camW) + '" y2="' + dimY + '" stroke="' + singleColor + '" stroke-width="1" stroke-dasharray="4,2" marker-start="url(#sL)" marker-end="url(#sR)"/>';
          svg += '<text x="' + cx + '" y="' + (dimY - 5) + '" fill="' + singleColor + '" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="middle">单机 ' + plan.fov.width + 'mm</text>';
          svg += '<line x1="' + x + '" y1="' + (dimY + 2) + '" x2="' + x + '" y2="' + (y - 2) + '" stroke="' + singleColor + '" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.5"/>';
          svg += '<line x1="' + (x + camW) + '" y1="' + (dimY + 2) + '" x2="' + (x + camW) + '" y2="' + (y - 2) + '" stroke="' + singleColor + '" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.5"/>';
          var dimX = x - 15;
          svg += '<line x1="' + dimX + '" y1="' + y + '" x2="' + dimX + '" y2="' + (y + camH) + '" stroke="' + singleColor + '" stroke-width="1" stroke-dasharray="4,2" marker-start="url(#sU)" marker-end="url(#sD)"/>';
          svg += '<text x="' + (dimX - 5) + '" y="' + cy + '" fill="' + singleColor + '" font-size="11" font-weight="600" font-family="sans-serif" text-anchor="middle">单机 ' + plan.fov.height + 'mm</text>';
          svg += '<line x1="' + (dimX + 2) + '" y1="' + y + '" x2="' + (x - 2) + '" y2="' + y + '" stroke="' + singleColor + '" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.5"/>';
          svg += '<line x1="' + (dimX + 2) + '" y1="' + (y + camH) + '" x2="' + (x - 2) + '" y2="' + (y + camH) + '" stroke="' + singleColor + '" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.5"/>';
        }

        // 水平重叠区
        if (c < cols - 1 && plan.overlapW > 0) {
          var ox = x + camW - overlapPxW;
          svg += '<rect x="' + ox + '" y="' + y + '" width="' + overlapPxW + '" height="' + camH + '" fill="' + overlapHColor + '" fill-opacity="0.12" stroke="' + overlapHColor + '" stroke-width="0.8" stroke-dasharray="3,2"/>';
          var ocx = ox + overlapPxW / 2;
          var ocy = y + camH + 18;
          svg += '<line x1="' + ox + '" y1="' + ocy + '" x2="' + (ox + overlapPxW) + '" y2="' + ocy + '" stroke="' + overlapHColor + '" stroke-width="1" marker-start="url(#oL)" marker-end="url(#oR)"/>';
          svg += '<text x="' + ocx + '" y="' + (ocy + 14) + '" fill="' + overlapHColor + '" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">' + plan.overlapW + 'mm</text>';
          svg += '<line x1="' + ox + '" y1="' + (y + camH) + '" x2="' + ox + '" y2="' + (ocy - 3) + '" stroke="' + overlapHColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
          svg += '<line x1="' + (ox + overlapPxW) + '" y1="' + (y + camH) + '" x2="' + (ox + overlapPxW) + '" y2="' + (ocy - 3) + '" stroke="' + overlapHColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
        }
        // 垂直重叠区
        if (r < rows - 1 && plan.overlapH > 0) {
          var oy = y + camH - overlapPxH;
          svg += '<rect x="' + x + '" y="' + oy + '" width="' + camW + '" height="' + overlapPxH + '" fill="' + overlapVColor + '" fill-opacity="0.12" stroke="' + overlapVColor + '" stroke-width="0.8" stroke-dasharray="3,2"/>';
          var ocx2 = x + camW + 18;
          var ocy2 = oy + overlapPxH / 2;
          svg += '<line x1="' + ocx2 + '" y1="' + oy + '" x2="' + ocx2 + '" y2="' + (oy + overlapPxH) + '" stroke="' + overlapVColor + '" stroke-width="1" marker-start="url(#oU)" marker-end="url(#oD)"/>';
          svg += '<text x="' + (ocx2 + 6) + '" y="' + ocy2 + '" fill="' + overlapVColor + '" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="start">' + plan.overlapH + 'mm</text>';
          svg += '<line x1="' + (x + camW) + '" y1="' + oy + '" x2="' + (ocx2 - 3) + '" y2="' + oy + '" stroke="' + overlapVColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
          svg += '<line x1="' + (x + camW) + '" y1="' + (oy + overlapPxH) + '" x2="' + (ocx2 - 3) + '" y2="' + (oy + overlapPxH) + '" stroke="' + overlapVColor + '" stroke-width="0.5" stroke-dasharray="2,2"/>';
        }
        camNum++;
      }
    }

    // 图例（左下角）
    var legX = regionX + 4;
    var legY = regionY + regionH + 30;
    svg += '<rect x="' + legX + '" y="' + legY + '" width="12" height="12" fill="' + camColor + '" fill-opacity="0.12" stroke="' + camColor + '" stroke-width="0.8" rx="2"/>';
    svg += '<text x="' + (legX + 16) + '" y="' + (legY + 10) + '" fill="' + textColor + '" font-size="11" font-family="sans-serif">相机视野 ' + plan.fov.width + '\u00d7' + plan.fov.height + 'mm</text>';
    var legY1b = legY + 18;
    svg += '<rect x="' + legX + '" y="' + legY1b + '" width="12" height="12" fill="none" stroke="' + camColor + '" stroke-width="1" stroke-dasharray="4,2" rx="2"/>';
    svg += '<text x="' + (legX + 16) + '" y="' + (legY1b + 10) + '" fill="' + textColor + '" font-size="11" font-family="sans-serif">覆盖 ' + Math.round(plan.grid.actualW) + '\u00d7' + Math.round(plan.grid.actualH) + 'mm</text>';
    if (plan.overlapW > 0) {
      var legY2 = legY + 36;
      svg += '<rect x="' + legX + '" y="' + legY2 + '" width="12" height="12" fill="' + overlapHColor + '" fill-opacity="0.12" stroke="' + overlapHColor + '" stroke-width="0.8" stroke-dasharray="3,2" rx="2"/>';
      svg += '<text x="' + (legX + 16) + '" y="' + (legY2 + 10) + '" fill="' + textColor + '" font-size="11" font-family="sans-serif">水平重叠 ' + plan.overlapW + 'mm</text>';
    }
    if (plan.overlapH > 0) {
      var legY3 = legY + (plan.overlapW > 0 ? 54 : 36);
      svg += '<rect x="' + legX + '" y="' + legY3 + '" width="12" height="12" fill="' + overlapVColor + '" fill-opacity="0.12" stroke="' + overlapVColor + '" stroke-width="0.8" stroke-dasharray="3,2" rx="2"/>';
      svg += '<text x="' + (legX + 16) + '" y="' + (legY3 + 10) + '" fill="' + textColor + '" font-size="11" font-family="sans-serif">垂直重叠 ' + plan.overlapH + 'mm</text>';
    }
    if (reqW && reqH) {
      var legY4 = legY + (plan.overlapW > 0 ? (plan.overlapH > 0 ? 72 : 54) : (plan.overlapH > 0 ? 54 : 36));
      svg += '<rect x="' + legX + '" y="' + legY4 + '" width="12" height="12" fill="none" stroke="' + reqAreaColor + '" stroke-width="1" stroke-dasharray="3,2" rx="2"/>';
      svg += '<text x="' + (legX + 16) + '" y="' + (legY4 + 10) + '" fill="' + textColor + '" font-size="11" font-family="sans-serif">需求覆盖 ' + Math.round(reqW) + '×' + Math.round(reqH) + 'mm</text>';
    }

    // 右下角信息
    svg += '<text x="' + (regionX + regionW - 4) + '" y="' + (legY + 10) + '" fill="' + mutedColor + '" font-size="11" font-family="sans-serif" text-anchor="end">' + plan.model.model + ' \u00b7 ' + cols + '\u00d7' + rows + '</text>';

    svg += '</svg></div>';
    return svg;
  }

  function calcRulerStep(totalMM) {
    var steps = [5, 10, 20, 50, 100, 200, 500];
    for (var i = 0; i < steps.length; i++) {
      if (totalMM / steps[i] <= 15) return steps[i];
    }
    return 500;
  }

  window._stitch = {
    show: function() {
      var card = document.getElementById('stitchCard');
      var schematic = document.querySelector('.schematic-wrap');
      var svgArea = document.getElementById('stitchSvgArea');
      var planArea = document.getElementById('stitchPlanArea');
      var top1 = document.getElementById('top1Content');
      var modalBtn = document.getElementById('showModalBtn');
      var runBtn = document.getElementById('runBtn');
      if (card) card.style.display = '';
      if (schematic) schematic.style.display = 'none';
      if (svgArea) svgArea.style.display = 'none';
      if (planArea) planArea.style.display = 'none';
      if (top1) top1.style.display = 'none';
      if (modalBtn) modalBtn.style.display = 'none';
      if (runBtn) runBtn.style.display = 'none';
      // 隐藏码制说明图片
      var codeImg = document.getElementById('codeImgContainer');
      if (codeImg) codeImg.style.display = 'none';
    },
    hide: function() {
      var card = document.getElementById('stitchCard');
      var schematic = document.querySelector('.schematic-wrap');
      var svgArea = document.getElementById('stitchSvgArea');
      var planArea = document.getElementById('stitchPlanArea');
      var top1 = document.getElementById('top1Content');
      var modalBtn = document.getElementById('showModalBtn');
      var runBtn = document.getElementById('runBtn');
      if (card) card.style.display = 'none';
      if (schematic) schematic.style.display = '';
      if (svgArea) { svgArea.style.display = 'none'; svgArea.innerHTML = ''; }
      if (planArea) { planArea.style.display = 'none'; planArea.innerHTML = ''; }
      var dlBtn = document.getElementById('stitchDownloadBtn');
      if (dlBtn) dlBtn.style.display = 'none';
      if (top1) top1.style.display = '';
      if (modalBtn) modalBtn.style.display = '';
      if (runBtn) runBtn.style.display = '';
      // 恢复码制说明图片
      var codeImg = document.getElementById('codeImgContainer');
      if (codeImg) codeImg.style.display = '';
    }
  };

  function boot() {
    initTheme();
    applyLang(currentLang);
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
