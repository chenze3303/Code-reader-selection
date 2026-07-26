/**
 * 主应用模块 - 导航切换、智能选型计算
 * 依赖：js/data/product_db.js (PRODUCT_DB)
 */

(function() {
  'use strict';

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

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

    // 重新渲染拼接3D场景以适配主题
    if (window._stitchResults && window._stitchResults.length > 0) {
      var svgArea = document.getElementById('stitchSvgArea');
      if (svgArea && svgArea.style.display !== 'none') {
        var activeIdx = window._stitchActiveIdx || 0;
        var best = window._stitchResults[activeIdx];
        if (best) {
          renderStitchSVG(best, window._stitchBarcodeW, window._stitchBarcodeH, 'auto', window._stitchTotalW, window._stitchTotalH);
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
      tab0: '首页', tab1: '智能选型', tabStitch: '多相机拼接', tab2: '竞品对标', tab3: '配单表', tab4: '产品表', tab5: '状态码查询', tab6: '方案解决', tabMore: '更多', moreTitle: '更多功能',
      homeTitle: '读码器工具箱', homeDesc: '集成智能选型、竞品对标、配单生成、产品对照、状态码查询五大功能模块，一站式解决读码器选型与配置需求。', homeFeatures: '功能模块',
      homeDesc1: '输入码制类型、模块尺寸、工作距离，自动计算 PPM，从产品库中推荐最佳读码器型号。',
      homeDescStitch: '单相机视野不足时，自动计算多相机拼接方案，支持 3D 视野图和方案下载。',
      homeActStitch: '计算拼接',
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
      bomQuickSearch: '🔍 快速搜索', bomQuickSearchPh: '输入型号名称或物料代码…',
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
      // Verify page
      verifyTitle: '📊 PPM 计算', verifyModelSel: '📷 选择型号', verifyDist: '📐 工作距离',
      verifyBarcode: '🔖 条码参数',
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
      tab0: 'Home', tab1: 'Selection', tabStitch: 'Stitching', tab2: 'Competitor', tab3: 'BOM', tab4: 'Product Table', tab5: 'Status Codes', tab6: 'Solutions', tabMore: 'More', moreTitle: 'More Features',
      homeTitle: 'Code Reader Toolkit', homeDesc: 'Integrated selection, competitor comparison, BOM generation, product mapping, and status code lookup — all in one place.', homeFeatures: 'Features',
      homeDesc1: 'Enter code type, module size, and working distance to auto-calculate PPM and recommend the best reader model.',
      homeDescStitch: 'When single camera FOV is insufficient, auto-calculate multi-camera stitching with 3D view and download.',
      homeActStitch: 'Calculate Stitching',
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
      bomQuickSearch: '🔍 Quick Search', bomQuickSearchPh: 'Search model name or material code…',
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
      // Verify page
      verifyTitle: '📊 PPM Calculator', verifyModelSel: '📷 Select Model', verifyDist: '📐 Working Distance',
      verifyBarcode: '🔖 Barcode Parameters',
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

    // 6. 通知 bom.js、mapping_module.js、competitor.js 重新渲染
    if (window.BOM && window.BOM.rerender) window.BOM.rerender();
    if (window.MAPPING && window.MAPPING.rerender) window.MAPPING.rerender();
    if (window.COMPETITOR && window.COMPETITOR.reset) window.COMPETITOR.reset();
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

    // 多相机拼接：复用选型页面，展开拼接卡片
    if (pageId === 'page-stitch') {
      var selPage = document.getElementById('page-selection');
      if (selPage) selPage.classList.add('active');
      if (window._stitch) window._stitch.show();
      return;
    }

    // 离开选型页面时，恢复拼接卡片状态
    if (window._stitch) window._stitch.hide();

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
      var top1El = document.getElementById('top1Content');
      if (top1El) top1El.innerHTML = '<div class="empty-state">等待参数输入...</div>';
      var modalBtnEl = document.getElementById('showModalBtn');
      if (modalBtnEl) modalBtnEl.disabled = true;
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
    var modalBtnEl2 = document.getElementById('showModalBtn');
    if (modalBtnEl2) modalBtnEl2.disabled = false;

    if (filtered.length > 0) {
      var best = filtered[0];
      var ppmDisplay = best.ppm !== null ? best.ppm.toFixed(2) : '—';
      var ppmLevelDisplay = best.ppmLevel ? ' (' + best.ppmLevel + ')' : '';
      var top1El = document.getElementById('top1Content');
      if (top1El) top1El.innerHTML = 
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
        if (item.model.focal && item.ppm !== null && item.ppm > ppmRange.max) {
          if (failReasons.indexOf('ppm') === -1) failReasons.push('ppm');
        }
      });

      var reasonTags = '';
      if (failReasons.indexOf('fov') !== -1) reasonTags += '<span class="stitch-hint-reason">视野超出单机极限</span>';
      if (failReasons.indexOf('dist') !== -1) reasonTags += '<span class="stitch-hint-reason">工作距离受限</span>';
      if (failReasons.indexOf('ppm') !== -1) reasonTags += '<span class="stitch-hint-reason">PPM超出范围</span>';
      if (!reasonTags) reasonTags = '<span class="stitch-hint-reason">视野超出单机极限</span>';

      // 只要有PPM超出范围，一律不显示拼接方案
      var canStitch = failReasons.indexOf('ppm') === -1 && failReasons.indexOf('fov') !== -1;
      var stitchBtnHtml = canStitch ? '<button class="stitch-hint-btn" id="showStitchBtn">📐 查看拼接方案</button>' : '';

      var top1El2 = document.getElementById('top1Content');
      if (top1El2) top1El2.innerHTML =
        '<div class="stitch-hint-card">' +
          '<div class="stitch-hint-icon">📷</div>' +
          '<div class="stitch-hint-title">单相机方案无法满足当前需求</div>' +
          '<div class="stitch-hint-desc">' + (canStitch ? '您输入的视野范围较大，单台读码器无法完整覆盖。建议采用多相机组网拼接方案，通过多台读码器协同工作实现完整视野覆盖。' : '当前参数下所有型号的PPM均超出合理范围，请调整模块尺寸、工作距离或视野参数。') + '</div>' +
          stitchBtnHtml +
          '<div class="stitch-hint-reasons">' + reasonTags + '</div>' +
        '</div>';

      // 绑定按钮事件（仅在有拼接按钮时）
      if (canStitch) {
        var showStitchBtn = document.getElementById('showStitchBtn');
        if (showStitchBtn) showStitchBtn.addEventListener('click', function() {
          switchToPage('page-stitch');
        });
      }
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

    if (showBtn) showBtn.addEventListener('click', function() {
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
    var top1Init = document.getElementById('top1Content');
    if (top1Init) top1Init.innerHTML = '<div class="empty-state">' + t('emptyState') + '</div>';
    var modalBtnInit = document.getElementById('showModalBtn');
    if (modalBtnInit) modalBtnInit.disabled = true;

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
      switchToPage('page-selection');
      var top1El = document.getElementById('top1Content');
      if (top1El) top1El.innerHTML = '<div class="empty-state">' + t('emptyState') + '</div>';
      var modalBtnEl = document.getElementById('showModalBtn');
      if (modalBtnEl) modalBtnEl.disabled = true;
      resetSchematic();
    });

    // 拼接示意图下载 (高清合成：3D场景 + 图例)
    var stitchDlBtn = document.getElementById('stitchDownloadBtn');
    if (stitchDlBtn) {
      stitchDlBtn.addEventListener('click', function() {
        var container = document.getElementById('stitch3dContainer');
        if (!container) return;
        var srcCanvas = container.querySelector('canvas');
        if (!srcCanvas) return;

        // 获取当前方案数据
        var activeIdx = window._stitchActiveIdx || 0;
        var plan = window._stitchResults ? window._stitchResults[activeIdx] : null;
        if (!plan) return;

        // 临时用高分辨率重新渲染3D场景
        var state = _stitch3dState;
        if (!state || !state.renderer || !state.scene || !state.camera) return;

        var origW = srcCanvas.width, origH = srcCanvas.height;
        var hiScale = 3; // 3倍高清
        var hiW = origW * hiScale, hiH = origH * hiScale;

        state.renderer.setSize(hiW, hiH);
        state.renderer.setPixelRatio(1);
        state.camera.aspect = hiW / hiH;
        state.camera.updateProjectionMatrix();
        state.renderer.render(state.scene, state.camera);

        // 截取高清图
        var hiDataURL = srcCanvas.toDataURL('image/png');

        // 恢复原始尺寸
        state.renderer.setSize(origW / (window.devicePixelRatio || 1), origH / (window.devicePixelRatio || 1));
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        state.camera.aspect = origW / origH;
        state.camera.updateProjectionMatrix();
        state.renderer.render(state.scene, state.camera);

        // 合成最终图片
        var legendH = 145;
        var outW = hiW, outH = hiH + legendH;

        var exportCanvas = document.createElement('canvas');
        exportCanvas.width = outW;
        exportCanvas.height = outH;
        var ctx = exportCanvas.getContext('2d');

        // 背景
        var isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#161b22' : '#f5f7fa';
        ctx.fillRect(0, 0, outW, outH);

        // 绘制高清3D场景
        var hiImg = new Image();
        hiImg.onload = function() {
          ctx.drawImage(hiImg, 0, 0, hiW, hiH);

          // 图例区域
          var ly = hiH;
          ctx.fillStyle = isDark ? '#1e2430' : '#ffffff';
          ctx.fillRect(0, ly, outW, legendH);
          ctx.strokeStyle = isDark ? '#30363d' : '#dde5ef';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(outW, ly); ctx.stroke();

          var dotR = 7;
          var lx = 36, lyy = ly + 28;
          var textColor = isDark ? '#e6edf3' : '#333333';
          var mutedColor = isDark ? '#8b949e' : '#888888';

          // 型号信息
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#f76504';
          ctx.fillText(plan.model.model + '  ·  ' + plan.grid.cols + 'x' + plan.grid.rows + ' = ' + plan.grid.total + '台', lx, lyy);
          lyy += 24;
          ctx.font = '13px sans-serif';
          ctx.fillStyle = mutedColor;
          ctx.fillText('PPM ' + plan.ppm.toFixed(2) + '  ·  安装高度 ' + Math.round(plan.workingDist || 200) + 'mm', lx, lyy);
          lyy += 28;

          // 颜色图例
          ctx.font = '14px sans-serif';
          var items = [
            { color: '#4a90d9', label: '单机视野 ' + plan.fov.width + 'x' + plan.fov.height + 'mm' },
            { color: '#f76504', label: '总覆盖 ' + Math.round(plan.grid.actualW) + 'x' + Math.round(plan.grid.actualH) + 'mm' }
          ];
          if (plan.overlapW > 0) items.push({ color: '#e74c3c', label: '水平重叠 ' + plan.overlapW + 'mm' });
          if (plan.overlapH > 0) items.push({ color: '#3884f4', label: '垂直重叠 ' + plan.overlapH + 'mm' });
          items.push({ color: '#0A1628', label: '需求覆盖 ' + Math.round(window._stitchTotalW) + 'x' + Math.round(window._stitchTotalH) + 'mm' });

          var colX = lx;
          items.forEach(function(item, i) {
            if (i === 3) { colX = lx; lyy += 24; }
            ctx.fillStyle = item.color;
            ctx.beginPath(); ctx.arc(colX + dotR, lyy - 4, dotR, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = textColor;
            ctx.fillText(item.label, colX + dotR * 2 + 8, lyy);
            colX += ctx.measureText(item.label).width + dotR * 2 + 36;
          });

          // 下载
          var url = exportCanvas.toDataURL('image/png');
          var a = document.createElement('a');
          a.href = url;
          a.download = 'stitch_3d_' + plan.model.model + '.png';
          a.click();
          URL.revokeObjectURL(url);
        };
        hiImg.src = hiDataURL;
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
          ppm: fov.ppm,
          workingDist: wdMM
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

    // 先显示容器，再渲染3D（否则容器尺寸为0）
    svgArea.style.display = '';
    // 显示方案卡片
    var planCard = document.getElementById('stitchPlanCard');
    if (planCard) planCard.style.display = '';
    // 等待浏览器完成reflow，确保容器有正确尺寸
    setTimeout(function() {
      renderStitchSVG(best, barcodeW, barcodeH, orient, totalW, totalH);
    }, 100);
    // 显示下载按钮
    var dlBtn = document.getElementById('stitchDownloadBtn');
    if (dlBtn) dlBtn.style.display = '';

    // 3D view: no lightbox needed (interactive rotation/zoom)

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

    // 方案切换按钮（弹窗）
    html += '<button class="stitch-plan-switch-btn" id="stitchPlanSwitchBtn">📋 查看全部方案 (' + displayResults.length + ')</button>';

    // 弹窗移到 body 上，避免被父容器裁剪
    var modalHtml = '<div class="stitch-plan-modal-overlay" id="stitchPlanModal">';
    modalHtml += '<div class="stitch-plan-modal">';
    modalHtml += '<div class="stitch-plan-modal-header">';
    modalHtml += '<span>选择拼接方案</span>';
    modalHtml += '<button class="stitch-plan-modal-close" id="stitchPlanModalClose">&times;</button>';
    modalHtml += '</div>';
    modalHtml += '<div class="stitch-series-tabs">';
    modalHtml += '<span class="stitch-series-tab' + (!filterSeries ? ' active' : '') + '" data-series="all">全部 (' + results.length + ')</span>';
    allSeries.forEach(function(s) {
      var count = results.filter(function(r) { return r.model.series === s; }).length;
      modalHtml += '<span class="stitch-series-tab' + (filterSeries === s ? ' active' : '') + '" data-series="' + s + '">' + s + ' (' + count + ')</span>';
    });
    modalHtml += '</div>';
    modalHtml += '<div class="stitch-plan-list" id="stitchPlanList">';
    displayResults.forEach(function(r, idx) {
      var isActive = idx === activeIdx;
      modalHtml += '<div class="stitch-plan-item' + (isActive ? ' active' : '') + '" data-stitch-idx="' + idx + '">';
      modalHtml += '<div class="stitch-plan-left">';
      modalHtml += '<span class="stitch-plan-model">' + r.model.model + '</span>';
      modalHtml += '<span class="stitch-plan-spec">' + r.model.resolution.w + '×' + r.model.resolution.h + '</span>';
      modalHtml += '</div>';
      modalHtml += '<div class="stitch-plan-right">';
      modalHtml += '<span class="stitch-plan-count">' + r.grid.cols + '×' + r.grid.rows + ' = ' + r.grid.total + '台</span>';
      modalHtml += '<span class="stitch-plan-ppm">PPM ' + r.ppm.toFixed(2) + '</span>';
      modalHtml += '</div>';
      modalHtml += '</div>';
    });
    modalHtml += '</div>';
    modalHtml += '</div>';
    modalHtml += '</div>';
    // Remove old modal if exists
    var oldModal = document.getElementById('stitchPlanModal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    planArea.innerHTML = html;
    planArea.style.display = '';

    // 绑定弹窗开关（弹窗在 body 上）
    var switchBtn = document.getElementById('stitchPlanSwitchBtn');
    var modal = document.getElementById('stitchPlanModal');
    var closeBtn = document.getElementById('stitchPlanModalClose');
    if (switchBtn) {
      switchBtn.onclick = function() { modal.classList.add('active'); };
    }
    if (closeBtn) {
      closeBtn.onclick = function() { modal.classList.remove('active'); };
    }
    if (modal) {
      modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('active'); };
    }

    // 绑定方案切换（body 上的弹窗）
    if (modal) {
      modal.querySelectorAll('.stitch-plan-item').forEach(function(el) {
        el.onclick = function() {
          var idx = parseInt(el.getAttribute('data-stitch-idx'));
          window._stitchActiveIdx = idx;
          renderStitchResult(results, totalW, totalH, barcodeW, barcodeH, orient, idx, filterSeries);
          modal.classList.remove('active');
        };
      });
      modal.querySelectorAll('.stitch-series-tab').forEach(function(el) {
        el.onclick = function(e) {
          e.stopPropagation();
          var s = el.getAttribute('data-series');
          // 更新 tab 高亮
          modal.querySelectorAll('.stitch-series-tab').forEach(function(t) { t.classList.remove('active'); });
          el.classList.add('active');
          // 重新渲染方案列表（不关闭弹窗）
          var listEl = document.getElementById('stitchPlanList');
          if (!listEl) return;
          var displayResults = s === 'all' ? results : results.filter(function(r) { return r.model.series === s; });
          if (displayResults.length === 0) displayResults = results;
          var listHtml = '';
          displayResults.forEach(function(r, idx) {
            var isActive = idx === (window._stitchActiveIdx || 0);
            listHtml += '<div class="stitch-plan-item' + (isActive ? ' active' : '') + '" data-stitch-idx="' + idx + '">';
            listHtml += '<div class="stitch-plan-left">';
            listHtml += '<span class="stitch-plan-model">' + r.model.model + '</span>';
            listHtml += '<span class="stitch-plan-spec">' + r.model.resolution.w + '×' + r.model.resolution.h + '</span>';
            listHtml += '</div>';
            listHtml += '<div class="stitch-plan-right">';
            listHtml += '<span class="stitch-plan-count">' + r.grid.cols + '×' + r.grid.rows + ' = ' + r.grid.total + '台</span>';
            listHtml += '<span class="stitch-plan-ppm">PPM ' + r.ppm.toFixed(2) + '</span>';
            listHtml += '</div>';
            listHtml += '</div>';
          });
          listEl.innerHTML = listHtml;
          // 重新绑定方案点击事件
          listEl.querySelectorAll('.stitch-plan-item').forEach(function(itemEl) {
            itemEl.onclick = function() {
              var idx = parseInt(itemEl.getAttribute('data-stitch-idx'));
              window._stitchActiveIdx = idx;
              renderStitchResult(results, totalW, totalH, barcodeW, barcodeH, orient, idx, s === 'all' ? null : s);
              modal.classList.remove('active');
            };
          });
        };
      });
    }
  }


  // ═══════════ 3D STITCH VISUALIZATION ═══════════
  var _stitch3dState = null;

  function renderStitch3D(plan, barcodeW, barcodeH, orient, reqW, reqH) {
    var container = document.getElementById('stitch3dContainer');
    if (!container) { console.warn('[Stitch] stitch3dContainer not found'); return ''; }
    // cleanup old scene
    if (_stitch3dState) {
      if (_stitch3dState.animId) cancelAnimationFrame(_stitch3dState.animId);
      if (_stitch3dState.renderer) {
        _stitch3dState.renderer.dispose();
        var oldCanvas = container.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
      }
      _stitch3dState = null;
    }
    container.innerHTML = '';

    if (typeof THREE === 'undefined') {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:#888">Three.js loading, please wait...</div>';
      if (!container._3dRetryDone) {
        container._3dRetryDone = true;
        setTimeout(function() { renderStitch3D(plan, barcodeW, barcodeH, orient, reqW, reqH); }, 2000);
      }
      return '';
    }

    try {
      _doRender3D(container, plan, barcodeW, barcodeH, orient, reqW, reqH);
    } catch(e) {
      console.error('3D render error:', e);
      container.innerHTML = '<div style="padding:40px;text-align:center;color:#c00">3D render failed: ' + e.message + '</div>';
    }
    return '';
  }

  function _doRender3D(container, plan, barcodeW, barcodeH, orient, reqW, reqH) {
    var isDark = document.documentElement.classList.contains('dark');
    var cols = plan.grid.cols, rows = plan.grid.rows;
    var fovW = plan.fov.width, fovH = plan.fov.height;
    var actualW = plan.grid.actualW, actualH = plan.grid.actualH;
    var overlapW = plan.overlapW, overlapH = plan.overlapH;

    var camDepth = 200;
    var sceneW = Math.max(actualW, 300);
    var sceneD = Math.max(actualH, 300);
    var sceneH = camDepth + 60;

    // Scene
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x161b22 : 0xf5f7fa);
    scene.fog = new THREE.Fog(isDark ? 0x161b22 : 0xf5f7fa, sceneW * 3, sceneW * 6);

    // Renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    // Force size: use container if visible, fallback to 450
    var renderW = container.clientWidth || 600;
    var renderH = container.clientHeight || 450;
    renderer.setSize(renderW, renderH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Camera (created after renderer so aspect is correct)
    var aspect = renderW / renderH;
    var camera = new THREE.PerspectiveCamera(45, aspect, 1, sceneW * 10);
    camera.position.set(sceneW * 0.6, sceneH * 1.2, sceneD * 1.4);
    camera.lookAt(0, 0, 0);

    // Orbit controls (manual)
    var isDragging = false, prevMouse = { x: 0, y: 0 };
    var spherical = { radius: camera.position.length(), theta: Math.atan2(camera.position.x, camera.position.z), phi: Math.acos(camera.position.y / camera.position.length()) };
    var target = new THREE.Vector3(0, 0, 0);

    function updateCamera() {
      camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(target);
    }
    updateCamera();

    var canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', function(e) {
      isDragging = true;
      prevMouse.x = e.clientX; prevMouse.y = e.clientY;
    });
    canvasEl.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      spherical.theta -= (e.clientX - prevMouse.x) * 0.005;
      spherical.phi = Math.max(0.15, Math.min(Math.PI * 0.48, spherical.phi + (e.clientY - prevMouse.y) * 0.005));
      prevMouse.x = e.clientX; prevMouse.y = e.clientY;
      updateCamera();
    });
    window.addEventListener('mouseup', function() { isDragging = false; });
    canvasEl.addEventListener('wheel', function(e) {
      e.preventDefault();
      spherical.radius = Math.max(sceneW * 0.3, Math.min(sceneW * 4, spherical.radius * (1 + e.deltaY * 0.001)));
      updateCamera();
    }, { passive: false });

    // Touch support
    var touchStartDist = 0;
    canvasEl.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse.x = e.touches[0].clientX; prevMouse.y = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    });
    canvasEl.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        spherical.theta -= (e.touches[0].clientX - prevMouse.x) * 0.005;
        spherical.phi = Math.max(0.15, Math.min(Math.PI * 0.48, spherical.phi + (e.touches[0].clientY - prevMouse.y) * 0.005));
        prevMouse.x = e.touches[0].clientX; prevMouse.y = e.touches[0].clientY;
        updateCamera();
      } else if (e.touches.length === 2) {
        var dx2 = e.touches[0].clientX - e.touches[1].clientX;
        var dy2 = e.touches[0].clientY - e.touches[1].clientY;
        var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (touchStartDist > 0) {
          spherical.radius = Math.max(sceneW * 0.3, Math.min(sceneW * 4, spherical.radius * (touchStartDist / dist)));
          updateCamera();
        }
        touchStartDist = dist;
      }
    }, { passive: false });
    canvasEl.addEventListener('touchend', function() { isDragging = false; touchStartDist = 0; });

    // Lights
    var ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.5 : 0.7);
    scene.add(ambient);
    var dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.6 : 0.8);
    dirLight.position.set(sceneW, sceneH * 2, sceneD);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Ground
    var groundSize = Math.max(sceneW, sceneD) * 2.5;
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(groundSize, groundSize),
      new THREE.MeshStandardMaterial({ color: isDark ? 0x1e2430 : 0xe8ecf1, roughness: 0.9, metalness: 0.0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    var gridHelper = new THREE.GridHelper(groundSize, Math.round(groundSize / 50), isDark ? 0x2d3748 : 0xc8cdd5, isDark ? 0x222933 : 0xd8dde5);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // Axes
    var axisLen = Math.max(sceneW, sceneD) * 0.6;
    var axisMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0.1,0), new THREE.Vector3(axisLen,0.1,0)]), axisMat));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0.1,0), new THREE.Vector3(0,0.1,axisLen)]), axisMat));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,sceneH+40,0)]), axisMat));

    // Required coverage area - dark navy with dashed border
    if (reqW && reqH) {
      var reqColor = 0x0A1628;
      var reqShape = new THREE.Shape();
      reqShape.moveTo(-reqW/2, -reqH/2); reqShape.lineTo(reqW/2, -reqH/2);
      reqShape.lineTo(reqW/2, reqH/2); reqShape.lineTo(-reqW/2, reqH/2);
      reqShape.lineTo(-reqW/2, -reqH/2);
      // Dashed border lines
      var reqDashedMat = new THREE.LineDashedMaterial({ color: reqColor, dashSize: 8, gapSize: 5, linewidth: 1 });
      var reqCorners = [
        [-reqW/2, -reqH/2], [reqW/2, -reqH/2],
        [reqW/2, reqH/2], [-reqW/2, reqH/2]
      ];
      for (var ri = 0; ri < 4; ri++) {
        var p1 = reqCorners[ri], p2 = reqCorners[(ri+1)%4];
        var reqLineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p1[0], 0.5, p1[1]),
          new THREE.Vector3(p2[0], 0.5, p2[1])
        ]);
        var reqLine = new THREE.Line(reqLineGeo, reqDashedMat);
        reqLine.computeLineDistances();
        scene.add(reqLine);
      }
      // Semi-transparent fill
      var reqFace = new THREE.Mesh(new THREE.ShapeGeometry(reqShape), new THREE.MeshBasicMaterial({ color: reqColor, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
      reqFace.rotation.x = -Math.PI / 2; reqFace.position.y = 0.3;
      scene.add(reqFace);
    }

    // Cameras and frustums
    var camNum = 0;
    var stepX = fovW - overlapW, stepZ = fovH - overlapH;
    var startX = -(cols - 1) * stepX / 2, startZ = -(rows - 1) * stepZ / 2;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = startX + c * stepX, cz = startZ + r * stepZ;

        // Camera body
        var body = new THREE.Mesh(new THREE.BoxGeometry(30, 25, 25), new THREE.MeshStandardMaterial({ color: 0x1a2b4a, roughness: 0.3, metalness: 0.7 }));
        body.position.set(cx, camDepth, cz); body.castShadow = true; scene.add(body);

        // Lens
        var lens = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 10, 16), new THREE.MeshStandardMaterial({ color: 0xf76504, roughness: 0.2, metalness: 0.8 }));
        lens.rotation.x = Math.PI / 2; lens.position.set(cx, camDepth - 5, cz); scene.add(lens);

        // LED
        var led = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
        led.position.set(cx + 10, camDepth + 8, cz); scene.add(led);

        // Pillar
        var pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, camDepth, 8), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4, transparent: true, opacity: 0.3 }));
        pillar.position.set(cx, camDepth / 2, cz); scene.add(pillar);

        // Frustum
        var fovHalfW = fovW / 2, fovHalfH = fovH / 2;
        var isSingle = (camNum === 0);
        var coneColor = isSingle ? 0x4a90d9 : 0xf76504;
        var fovGeo = createFrustumGeometry(cx, camDepth, cz, fovHalfW, fovHalfH);
        scene.add(new THREE.Mesh(fovGeo, new THREE.MeshBasicMaterial({ color: coneColor, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })));
        scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(fovGeo), new THREE.LineBasicMaterial({ color: coneColor, transparent: true, opacity: 0.5 })));

        // Ground coverage rect
        var rectS = new THREE.Shape();
        rectS.moveTo(cx-fovHalfW, cz-fovHalfH); rectS.lineTo(cx+fovHalfW, cz-fovHalfH);
        rectS.lineTo(cx+fovHalfW, cz+fovHalfH); rectS.lineTo(cx-fovHalfW, cz+fovHalfH);
        rectS.lineTo(cx-fovHalfW, cz-fovHalfH);
        var rectEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(rectS)), new THREE.LineBasicMaterial({ color: coneColor, transparent: true, opacity: 0.6 }));
        rectEdge.position.y = 0.5; scene.add(rectEdge);
        var rectFace = new THREE.Mesh(new THREE.ShapeGeometry(rectS), new THREE.MeshBasicMaterial({ color: coneColor, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
        rectFace.rotation.x = -Math.PI / 2; rectFace.position.y = 0.2; scene.add(rectFace);

        // Label
        var label = makeTextSprite('#' + (camNum + 1), coneColor, isSingle ? 1.0 : 0.8);
        label.position.set(cx, camDepth + 18, cz); scene.add(label);

        if (isSingle) {
          var dimLabel = makeTextSprite(fovW + 'mm x ' + fovH + 'mm', 0x4a90d9, 0.65);
          dimLabel.position.set(cx, camDepth - 20, cz); scene.add(dimLabel);
        }
        camNum++;
      }
    }

    // Overlap regions
    if (overlapW > 0) {
      for (var r2 = 0; r2 < rows; r2++) {
        for (var c2 = 0; c2 < cols - 1; c2++) {
          var ox = startX + c2 * stepX + fovW / 2 - overlapW / 2;
          var oz = startZ + r2 * stepZ;
          var olS = new THREE.Shape();
          olS.moveTo(ox-overlapW/2, oz-fovH/2); olS.lineTo(ox+overlapW/2, oz-fovH/2);
          olS.lineTo(ox+overlapW/2, oz+fovH/2); olS.lineTo(ox-overlapW/2, oz+fovH/2);
          olS.lineTo(ox-overlapW/2, oz-fovH/2);
          var olM = new THREE.Mesh(new THREE.ShapeGeometry(olS), new THREE.MeshBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
          olM.rotation.x = -Math.PI/2; olM.position.y = 0.8; scene.add(olM);
          var olE = new THREE.LineSegments(new THREE.EdgesGeometry(olM.geometry), new THREE.LineBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: 0.5 }));
          olE.rotation.x = -Math.PI/2; olE.position.set(ox, 1.0, oz); scene.add(olE);
        }
      }
    }
    if (overlapH > 0) {
      for (var r3 = 0; r3 < rows - 1; r3++) {
        for (var c3 = 0; c3 < cols; c3++) {
          var ox2 = startX + c3 * stepX;
          var oz2 = startZ + r3 * stepZ + fovH / 2 - overlapH / 2;
          var olS2 = new THREE.Shape();
          olS2.moveTo(ox2-fovW/2, oz2-overlapH/2); olS2.lineTo(ox2+fovW/2, oz2-overlapH/2);
          olS2.lineTo(ox2+fovW/2, oz2+overlapH/2); olS2.lineTo(ox2-fovW/2, oz2+overlapH/2);
          olS2.lineTo(ox2-fovW/2, oz2-overlapH/2);
          var olM2 = new THREE.Mesh(new THREE.ShapeGeometry(olS2), new THREE.MeshBasicMaterial({ color: 0x3884f4, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
          olM2.rotation.x = -Math.PI/2; olM2.position.y = 0.8; scene.add(olM2);
          var olE2 = new THREE.LineSegments(new THREE.EdgesGeometry(olM2.geometry), new THREE.LineBasicMaterial({ color: 0x3884f4, transparent: true, opacity: 0.5 }));
          olE2.rotation.x = -Math.PI/2; olE2.position.set(ox2, 1.0, oz2); scene.add(olE2);
        }
      }
    }

    // Dimension lines
    var dimMat = new THREE.LineBasicMaterial({ color: 0xf76504 });
    var dimOff = 20;
    var topZ = -(rows-1)*stepZ/2 - fovH/2 - dimOff;
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-actualW/2,1,topZ), new THREE.Vector3(actualW/2,1,topZ)]), dimMat));
    var endDotGeo = new THREE.SphereGeometry(1.5, 8, 8);
    var endDotMat = new THREE.MeshBasicMaterial({ color: 0xf76504 });
    var d1 = new THREE.Mesh(endDotGeo, endDotMat); d1.position.set(-actualW/2,1,topZ); scene.add(d1);
    var d2 = new THREE.Mesh(endDotGeo, endDotMat); d2.position.set(actualW/2,1,topZ); scene.add(d2);
    var wLbl = makeTextSprite(Math.round(actualW)+'mm', 0xf76504, 0.75); wLbl.position.set(0,8,topZ); scene.add(wLbl);

    var sideX = -(cols-1)*stepX/2 - fovW/2 - dimOff;
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sideX,1,-actualH/2), new THREE.Vector3(sideX,1,actualH/2)]), dimMat));
    var d3 = new THREE.Mesh(endDotGeo, endDotMat); d3.position.set(sideX,1,-actualH/2); scene.add(d3);
    var d4 = new THREE.Mesh(endDotGeo, endDotMat); d4.position.set(sideX,1,actualH/2); scene.add(d4);
    var hLbl = makeTextSprite(Math.round(actualH)+'mm', 0xf76504, 0.75); hLbl.position.set(sideX-25,8,0); scene.add(hLbl);

    // Info overlay (inside 3D container)
    var infoHtml = '<div class="stitch-3d-info">';
    infoHtml += '<div class="stitch-3d-info-title">' + plan.model.model + '</div>';
    infoHtml += '<div class="stitch-3d-info-row">' + cols + 'x' + rows + ' = ' + (cols*rows) + '台</div>';
    infoHtml += '</div>';
    infoHtml += '<div class="stitch-3d-controls">';
    infoHtml += '<button class="stitch-3d-ctrl-btn" id="stitch3dReset" title="重置视角">&#x27F2;</button>';
    infoHtml += '<button class="stitch-3d-ctrl-btn" id="stitch3dTop" title="俯视图">&#x2B07;</button>';
    infoHtml += '</div>';
    container.insertAdjacentHTML('afterbegin', infoHtml);

    // Bottom annotation panel (below 3D view) - 2 column grid
    var annHtml = '<div class="stitch-3d-annotation">';
    annHtml += '<div class="stitch-3d-ann-grid">';
    // Row 1: 相机数量 | 单机视野
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#f76504"></span><span class="stitch-3d-ann-label">相机数量</span><span class="stitch-3d-ann-val">' + (cols * rows) + ' 台 (' + cols + 'x' + rows + ')</span></div>';
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#4a90d9"></span><span class="stitch-3d-ann-label">单机视野</span><span class="stitch-3d-ann-val">' + fovW + ' x ' + fovH + ' mm</span></div>';
    // Row 2: 总覆盖区域 | 需求覆盖区域
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#f76504"></span><span class="stitch-3d-ann-label">总覆盖区域</span><span class="stitch-3d-ann-val">' + Math.round(actualW) + ' x ' + Math.round(actualH) + ' mm</span></div>';
    if (reqW && reqH) {
      annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#0A1628"></span><span class="stitch-3d-ann-label">需求覆盖</span><span class="stitch-3d-ann-val">' + Math.round(reqW) + ' x ' + Math.round(reqH) + ' mm</span></div>';
    } else {
      annHtml += '<div class="stitch-3d-ann-cell"></div>';
    }
    // Row 3: PPM | 安装高度
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#888"></span><span class="stitch-3d-ann-label">PPM</span><span class="stitch-3d-ann-val">' + plan.ppm.toFixed(2) + '</span></div>';
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#888"></span><span class="stitch-3d-ann-label">安装高度</span><span class="stitch-3d-ann-val">' + Math.round(plan.workingDist || 200) + ' mm</span></div>';
    // Row 4: 重叠区域 (full width)
    if (overlapW > 0 || overlapH > 0) {
      var overlapParts = [];
      if (overlapW > 0) overlapParts.push(overlapW + 'mm(水平)');
      if (overlapH > 0) overlapParts.push(overlapH + 'mm(垂直)');
      annHtml += '<div class="stitch-3d-ann-cell stitch-3d-ann-cell-full"><span class="stitch-3d-ann-dot" style="background:#e74c3c"></span><span class="stitch-3d-ann-label">重叠区域</span><span class="stitch-3d-ann-val">' + overlapParts.join(' / ') + '</span></div>';
    }
    annHtml += '</div></div>';
    annHtml += '</div>';
    // Insert after container
    var existing = container.parentNode.querySelector('.stitch-3d-annotation');
    if (existing) existing.remove();
    container.insertAdjacentHTML('afterend', annHtml);

    setTimeout(function() {
      var rb = document.getElementById('stitch3dReset');
      if (rb) rb.onclick = function() { spherical.radius = sceneW*1.2; spherical.theta = Math.atan2(sceneW*0.6,sceneD*1.4); spherical.phi = Math.acos((sceneH*1.2)/(sceneW*1.2)); updateCamera(); };
      var tb = document.getElementById('stitch3dTop');
      if (tb) tb.onclick = function() { spherical.radius = Math.max(sceneW,sceneD)*1.3; spherical.theta = 0; spherical.phi = 0.15; updateCamera(); };
    }, 50);

    // Resize
    function onResize() { var w = container.clientWidth, h = container.clientHeight || 450; camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
    window.addEventListener('resize', onResize);

    // Must set _stitch3dState BEFORE animate() so animId can be assigned
    _stitch3dState = { scene: scene, camera: camera, renderer: renderer, animId: null, onResize: onResize };

    // Animation
    function animate() { _stitch3dState.animId = requestAnimationFrame(animate); renderer.render(scene, camera); }
    animate();
    return '';
  }

  function createFrustumGeometry(cx, cy, cz, halfW, halfH) {
    var geo = new THREE.BufferGeometry();
    var bL = new THREE.Vector3(cx-halfW, 0, cz-halfH);
    var bR = new THREE.Vector3(cx+halfW, 0, cz-halfH);
    var tR = new THREE.Vector3(cx+halfW, 0, cz+halfH);
    var tL = new THREE.Vector3(cx-halfW, 0, cz+halfH);
    var top = new THREE.Vector3(cx, cy, cz);
    var v = new Float32Array([
      top.x,top.y,top.z, bL.x,bL.y,bL.z, bR.x,bR.y,bR.z,
      top.x,top.y,top.z, bR.x,bR.y,bR.z, tR.x,tR.y,tR.z,
      top.x,top.y,top.z, tR.x,tR.y,tR.z, tL.x,tL.y,tL.z,
      top.x,top.y,top.z, tL.x,tL.y,tL.z, bL.x,bL.y,bL.z,
      bL.x,bL.y,bL.z, tL.x,tL.y,tL.z, tR.x,tR.y,tR.z,
      bL.x,bL.y,bL.z, tR.x,tR.y,tR.z, bR.x,bR.y,bR.z
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
    return geo;
  }

  function makeTextSprite(text, color, scale) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 256; canvas.height = 64;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#' + (color.toString(16).padStart(6, '0'));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    var texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    var s = (scale || 1) * 60;
    sprite.scale.set(s, s * 0.25, 1);
    return sprite;
  }

  function renderStitchSVG(plan, barcodeW, barcodeH, orient, reqW, reqH) {
    return renderStitch3D(plan, barcodeW, barcodeH, orient, reqW, reqH);
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
      var planCard = document.getElementById('stitchPlanCard');
      var runBtn = document.getElementById('runBtn');
      var verifyBtn = document.getElementById('verifyBtn');
      var top1Card = document.getElementById('top1Content');
      var showModalBtn = document.getElementById('showModalBtn');
      var stitchBackBtn = document.getElementById('stitchBackBtn');
      if (card) card.style.display = '';
      if (schematic) schematic.style.display = 'none';
      // 如果有拼接结果，恢复显示
      if (svgArea && window._stitchResults && window._stitchResults.length > 0) {
        svgArea.style.display = '';
      }
      if (planCard && window._stitchResults && window._stitchResults.length > 0) {
        planCard.style.display = '';
      }
      if (runBtn) runBtn.style.display = 'none';
      if (verifyBtn) verifyBtn.style.display = 'none';
      if (stitchBackBtn) stitchBackBtn.style.display = 'none';
      // 隐藏单相机结果
      if (top1Card && top1Card.parentElement) top1Card.parentElement.style.display = 'none';
      if (showModalBtn && showModalBtn.parentElement) showModalBtn.parentElement.style.display = 'none';
      var codeImg = document.getElementById('codeImgContainer');
      if (codeImg) codeImg.style.display = 'none';
    },
    hide: function() {
      var card = document.getElementById('stitchCard');
      var schematic = document.querySelector('.schematic-wrap');
      var svgArea = document.getElementById('stitchSvgArea');
      var planCard = document.getElementById('stitchPlanCard');
      var runBtn = document.getElementById('runBtn');
      var verifyBtn = document.getElementById('verifyBtn');
      if (card) card.style.display = 'none';
      if (schematic) schematic.style.display = '';
      // 隐藏但不清除 stitchSvgArea 内容（保留3D渲染结果）
      if (svgArea) svgArea.style.display = 'none';
      if (planCard) { planCard.style.display = 'none'; }
      var dlBtn = document.getElementById('stitchDownloadBtn');
      if (dlBtn) dlBtn.style.display = 'none';
      if (runBtn) runBtn.style.display = '';
      if (verifyBtn) verifyBtn.style.display = '';
      // 恢复单相机结果卡片
      var top1Card = document.getElementById('top1Content');
      if (top1Card && top1Card.parentElement) top1Card.parentElement.style.display = '';
      var showModalBtn = document.getElementById('showModalBtn');
      if (showModalBtn && showModalBtn.parentElement) showModalBtn.parentElement.style.display = '';
      var codeImg = document.getElementById('codeImgContainer');
      if (codeImg) codeImg.style.display = '';
    }
  };

  function boot() {
    initTheme();
    applyLang(currentLang);
    init();
  }

  // ═══════════ PPM 计算 ═══════════
  var _verifyFilteredModels = [];

  function initVerifyPage() {
    if (typeof PRODUCT_DB === 'undefined') return;
    var seriesSel = document.getElementById('verifySeriesSel');
    if (!seriesSel) return;
    seriesSel.innerHTML = '<option value="">-- 请选择大类 --</option>';
    var seriesMap = {};
    PRODUCT_DB.forEach(function(m) {
      if (m.series && !seriesMap[m.series]) seriesMap[m.series] = true;
    });
    Object.keys(seriesMap).sort().forEach(function(s) {
      var opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      seriesSel.appendChild(opt);
    });
  }

  window.onVerifySeriesChange = function() {
    var series = document.getElementById('verifySeriesSel').value;
    var resSel = document.getElementById('verifyResSel');
    var modelSel = document.getElementById('verifyModelSel');
    var info = document.getElementById('verifyModelInfo');
    resSel.innerHTML = '<option value="">-- 全部分辨率 --</option>';
    resSel.disabled = true;
    modelSel.innerHTML = '<option value="">-- 请选择型号 --</option>';
    modelSel.disabled = true;
    if (info) info.innerHTML = '';
    _verifyFilteredModels = [];
    if (!series || typeof PRODUCT_DB === 'undefined') return;
    // 按大类筛选
    var filtered = [];
    PRODUCT_DB.forEach(function(m, i) {
      if (m.series === series) filtered.push({ model: m, idx: i });
    });
    // 提取分辨率选项
    var resMap = {};
    filtered.forEach(function(item) {
      if (item.model.resolution) {
        var key = item.model.resolution.w + '×' + item.model.resolution.h;
        resMap[key] = true;
      }
    });
    Object.keys(resMap).sort().forEach(function(r) {
      var parts = r.split('×');
      var pixels = parseInt(parts[0]) * parseInt(parts[1]);
      var label = (pixels / 10000).toFixed(0) + '万';
      var opt = document.createElement('option');
      opt.value = r;
      opt.textContent = label + ' (' + r + ')';
      resSel.appendChild(opt);
    });
    resSel.disabled = false;
    _verifyFilteredModels = filtered;
    // 直接填充型号
    fillVerifyModels(filtered);
  };

  window.onVerifyResChange = function() {
    var res = document.getElementById('verifyResSel').value;
    if (!res) { fillVerifyModels(_verifyFilteredModels); return; }
    var filtered = _verifyFilteredModels.filter(function(item) {
      return item.model.resolution && (item.model.resolution.w + '×' + item.model.resolution.h) === res;
    });
    fillVerifyModels(filtered);
  };

  function fillVerifyModels(filtered) {
    var modelSel = document.getElementById('verifyModelSel');
    var info = document.getElementById('verifyModelInfo');
    modelSel.innerHTML = '<option value="">-- 请选择型号 --</option>';
    modelSel.disabled = true;
    if (info) info.innerHTML = '';
    if (!filtered.length) return;
    filtered.forEach(function(item) {
      var opt = document.createElement('option');
      opt.value = item.idx;
      var m = item.model;
      var focal = m.focal ? m.focal + 'mm' : 'C-Mount';
      opt.textContent = m.model + ' (' + focal + ')';
      modelSel.appendChild(opt);
    });
    modelSel.disabled = false;
    modelSel.onchange = function() {
      if (!info || this.value === '') { info.innerHTML = ''; return; }
      var m = PRODUCT_DB[+this.value];
      info.innerHTML = '<span style="color:#f76504;">' + esc(m.model) + '</span> · ' +
        (m.resolution ? m.resolution.w + '×' + m.resolution.h + 'px' : '') + ' · ' +
        (m.pixelSize ? m.pixelSize + 'μm' : '') + ' · ' +
        (m.focal ? m.focal + 'mm' : 'C-Mount');
      // 显示工作距离范围
      var rangeEl = document.getElementById('verifyWDRange');
      if (rangeEl && m.workingDist && m.workingDist.min != null) {
        var minV = m.workingDist.min;
        var maxV = m.workingDist.max;
        if (minV === maxV) {
          rangeEl.innerHTML = '推荐工作距离：<strong>' + minV + 'mm</strong>';
        } else {
          rangeEl.innerHTML = '工作距离范围：<strong>' + minV + ' ~ ' + maxV + 'mm</strong>';
        }
        rangeEl.style.color = '#f76504';
      } else if (rangeEl) {
        rangeEl.innerHTML = '';
      }
    };
  }

  window.showVerifyPage = function() {
    var main = document.getElementById('page-selection');
    var sel = main.querySelector('.main-content');
    var verify = document.getElementById('page-verify');
    if (sel) sel.style.display = 'none';
    if (verify) verify.style.display = 'block';
    initVerifyPage();
  };

  window.hideVerifyPage = function() {
    var main = document.getElementById('page-selection');
    var sel = main.querySelector('.main-content');
    var verify = document.getElementById('page-verify');
    if (sel) sel.style.display = '';
    if (verify) verify.style.display = 'none';
  };

  function toMM_v(val, unit) {
    val = parseFloat(val);
    if (isNaN(val)) return 0;
    if (unit === 'mil') return val * 0.0254;
    if (unit === 'cm') return val * 10;
    return val;
  }

  window.runVerify = function() {
    var modelIdx = document.getElementById('verifyModelSel').value;
    var wd = parseFloat(document.getElementById('verifyWD').value);
    var wdUnit = document.getElementById('verifyWDUnit').value;
    var codeType = document.getElementById('verifyCodeType').value;
    var moduleSize = parseFloat(document.getElementById('verifyModuleSize').value);
    var moduleUnit = document.getElementById('verifyModuleUnit').value;

    if (modelIdx === '' || isNaN(wd) || wd <= 0 || isNaN(moduleSize) || moduleSize <= 0) {
      showToast('请填写完整参数（型号、工作距离、模块尺寸）', 'error');
      return;
    }

    var model = PRODUCT_DB[+modelIdx];
    var wdMM = toMM_v(wd, wdUnit);
    var moduleMM = toMM_v(moduleSize, moduleUnit);

    // 工作距离范围校验
    if (model.workingDist && model.workingDist.min != null) {
      var minV = model.workingDist.min;
      var maxV = model.workingDist.max;
      if (wdMM < minV || wdMM > maxV) {
        showToast('工作距离 ' + wdMM + 'mm 超出范围（' + minV + '~' + maxV + 'mm）', 'error');
        return;
      }
    }

    var fovEst = estimateFOV(model, wdMM);
    if (!fovEst) {
      showToast('该型号缺少焦距/像素尺寸信息，无法计算', 'error');
      return;
    }

    var sensorWidthPx = model.resolution ? model.resolution.w : 0;
    var ppm = (sensorWidthPx / fovEst.width) * moduleMM;
    var ppmResult = getPPMScoreAndLevel(ppm, codeType);

    var hAngle = 2 * Math.atan(fovEst.width / (2 * wdMM)) * (180 / Math.PI);
    var vAngle = 2 * Math.atan(fovEst.height / (2 * wdMM)) * (180 / Math.PI);

    // 更新示意图
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('vLblWd', wdMM + ' mm');
    set('vLblFovW', fovEst.width + ' mm');
    set('vLblFovH', fovEst.height + ' mm');
    set('vLblFovAngle', 'H:V=' + hAngle.toFixed(1) + '°×' + vAngle.toFixed(1) + '°');

    // 计算最大曝光时间（可选）
    var exposureHtml = '';
    var speedVal = parseFloat(document.getElementById('verifySpeed').value);
    var speedUnit = document.getElementById('verifySpeedUnit').value;
    if (!isNaN(speedVal) && speedVal > 0) {
      var speedMmS = speedUnit === 'm/s' ? speedVal * 1000 : (speedUnit === 'cm/s' ? speedVal * 10 : speedVal);
      var moduleMM = toMM_v(moduleSize, moduleUnit);
      var maxExposureUs = (moduleMM / ppm) / speedMmS * 1000000;
      exposureHtml = '<div class="result-card"><strong>最大曝光</strong><span>' + maxExposureUs.toFixed(0) + ' μs</span></div>';
    }

    // 结果卡片
    var ppmDisplay = ppm.toFixed(2);
    var ppmLevelDisplay = ppmResult.level ? ' (' + ppmResult.level + ')' : '';

    var html;
    if (exposureHtml) {
      // 有运动速度：三列一行
      html = '<div class="result-main" style="grid-template-columns:1fr 1fr 1fr;">' +
        '<div class="result-card"><strong>型号</strong><span>' + esc(model.model) + '</span></div>' +
        '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
        exposureHtml +
      '</div>';
    } else {
      // 无运动速度：两列
      html = '<div class="result-main">' +
        '<div class="result-card"><strong>型号</strong><span>' + esc(model.model) + '</span></div>' +
        '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
      '</div>';
    }
    html += '<div class="model-preview">' +
      '<span>' + (model.series || '') + ' · ' + (model.resolution ? model.resolution.w + '×' + model.resolution.h : '') + ' · ' + (model.interface || '') + '</span>' +
      '<span class="tag">' + (model.protection || '') + '</span>' +
    '</div>';

    document.getElementById('verifyResult').innerHTML = html;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
