/**
 * 基线-经销对照表模块
 */
(function() {
  'use strict';

  var db = [];
  var currentData = [];
  var expandedCats = {}; // 记录哪些系列展开了
  var showCodeColumns = false; // 是否显示代码列（默认隐藏）
  var mappingTabClickCount = 0; // 产品表tab点击计数
  var mappingTabClickTimer = null; // 计时器

  function normalize(s) {
    return (s || '').toLowerCase().replace(/^[\s\-_\/]*mv[-_\s]*/i, '').replace(/[\s\-_\/]+/g, '');
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  function getUniqueCats() {
    var seen = {}, cats = [];
    db.forEach(function(r) { if (r.cat && !seen[r.cat]) { seen[r.cat]=1; cats.push(r.cat); } });
    return cats;
  }

  // ─── i18n 辅助 ───
  function _t(key, n) {
    if (window._i18n && window._i18n.t) return window._i18n.t(key, n);
    return key;
  }

  function initCatFilter() {
    var sel = document.getElementById('mpCatSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="all">' + _t('mpCatAll') + '</option>';
    getUniqueCats().forEach(function(c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
  }

  function doFilter() {
    var cat = document.getElementById('mpCatSelect').value;
    var kw  = normalize(document.getElementById('mpSearchInput').value.trim());
    currentData = db.filter(function(r) {
      var catOK = cat === 'all' || r.cat === cat;
      var kwOK  = !kw || [r.baseName, r.baseCode, r.distName, r.distCode]
        .some(function(v) { return normalize(v).indexOf(kw) !== -1; });
      return catOK && kwOK;
    });
    render();
  }

  function render() {
    var tbody = document.getElementById('mpTableBody');
    var stats = document.getElementById('mpStats');
    if (!tbody) return;

    if (stats) stats.textContent = _t('mpStats', currentData.length);

    if (!currentData.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="mp-empty">' + _t('mpNoMatch') + '</td></tr>';
      return;
    }

    // 按系列分组
    var groups = {};
    var groupOrder = [];
    currentData.forEach(function(r) {
      if (!groups[r.cat]) { groups[r.cat] = []; groupOrder.push(r.cat); }
      groups[r.cat].push(r);
    });

    var isSearching = document.getElementById('mpSearchInput').value.trim().length > 0;

    var html = '';
    var colCount = showCodeColumns ? 7 : 5; // 根据是否显示代码列决定colspan
    groupOrder.forEach(function(cat) {
      var rows = groups[cat];
      // 搜索时自动展开有结果的系列；否则用用户手动展开状态
      var isOpen = isSearching ? true : !!expandedCats[cat];

      html += '<tr class="mp-cat-row' + (isOpen ? ' open' : '') + '" data-cat="' + esc(cat) + '">' +
        '<td colspan="' + colCount + '">' +
          '<span class="mp-cat-toggle">' + (isOpen ? '▼' : '▶') + '</span>' +
          '📂 ' + esc(cat) +
          '<span class="mp-cat-badge">' + _t('mpRecords', rows.length) + '</span>' +
        '</td></tr>';

      if (isOpen) {
        rows.forEach(function(r) {
          var baseUrl = window.MAPPING_DOWNLOAD_URLS ? window.MAPPING_DOWNLOAD_URLS.getBaseUrl(r.cat) : '';
          var distUrl = window.MAPPING_DOWNLOAD_URLS ? window.MAPPING_DOWNLOAD_URLS.getDistUrl(r.cat) : '';
          var baseDlBtn = baseUrl ? '<a class="mp-dl-btn base" href="' + esc(baseUrl) + '" target="_blank" title="' + _t('mpDlBase') + '">📥</a>' : '<span class="mp-dl-btn disabled" title="' + _t('mpNone') + '">—</span>';
          var distDlBtn = distUrl ? '<a class="mp-dl-btn dist" href="' + esc(distUrl) + '" target="_blank" title="' + _t('mpDlDist') + '">📥</a>' : '<span class="mp-dl-btn disabled" title="' + _t('mpNone') + '">—</span>';
          html += '<tr class="mp-data-row" data-parent-cat="' + esc(cat) + '">' +
            '<td class="mp-seq">' + esc(r.seq) + '</td>' +
            '<td class="mp-base-name">' + esc(r.baseName) + '</td>';
          if (showCodeColumns) {
            html += '<td class="mp-base-code"><span class="mp-code-tag base">' + (r.baseCode || '—') + '</span></td>';
          }
          html += '<td class="mp-dl-cell">' + baseDlBtn + '</td>' +
            '<td class="mp-dist-name">' + esc(r.distName) + '</td>';
          if (showCodeColumns) {
            html += '<td class="mp-dist-code"><span class="mp-code-tag dist">' + (r.distCode || '—') + '</span></td>';
          }
          html += '<td class="mp-dl-cell">' + distDlBtn + '</td>' +
          '</tr>';
        });
      }
    });
    tbody.innerHTML = html;

    // 绑定系列标题点击展开/收起
    tbody.querySelectorAll('.mp-cat-row').forEach(function(tr) {
      tr.addEventListener('click', function() {
        var cat = tr.dataset.cat;
        expandedCats[cat] = !expandedCats[cat];
        render();
      });
    });

    updateToggleBtn();
  }

  function isAllExpanded() {
    var cats = getUniqueCats();
    return cats.length > 0 && cats.every(function(c) { return expandedCats[c]; });
  }

  function updateToggleBtn() {
    var btn = document.getElementById('mpToggleAllBtn');
    if (!btn) return;
    btn.textContent = isAllExpanded() ? _t('mpCollapse') : _t('mpExpand');
  }

  function toggleAll() {
    if (isAllExpanded()) {
      expandedCats = {};
    } else {
      currentData.forEach(function(r) { expandedCats[r.cat] = true; });
    }
    render();
  }

  // 更新表头显示
  function updateTableHeader() {
    var thead = document.querySelector('.mp-table thead tr');
    if (!thead) return;

    if (showCodeColumns) {
      thead.innerHTML =
        '<th style="width:52px;text-align:center">#</th>' +
        '<th style="width:28%;text-align:center" data-i18n="mpThBaseModel">' + _t('mpThBaseModel') + '</th>' +
        '<th style="width:110px;text-align:center" data-i18n="mpThBaseCode">' + _t('mpThBaseCode') + '</th>' +
        '<th style="width:50px;text-align:center" data-i18n="mpThDocs">' + _t('mpThDocs') + '</th>' +
        '<th style="width:28%;text-align:center" data-i18n="mpThDistModel">' + _t('mpThDistModel') + '</th>' +
        '<th style="width:110px;text-align:center" data-i18n="mpThDistCode">' + _t('mpThDistCode') + '</th>' +
        '<th style="width:50px;text-align:center" data-i18n="mpThDocs">' + _t('mpThDocs') + '</th>';
    } else {
      thead.innerHTML =
        '<th style="width:52px;text-align:center">#</th>' +
        '<th style="width:35%;text-align:center" data-i18n="mpThBaseModel">' + _t('mpThBaseModel') + '</th>' +
        '<th style="width:50px;text-align:center" data-i18n="mpThDocs">' + _t('mpThDocs') + '</th>' +
        '<th style="width:35%;text-align:center" data-i18n="mpThDistModel">' + _t('mpThDistModel') + '</th>' +
        '<th style="width:50px;text-align:center" data-i18n="mpThDocs">' + _t('mpThDocs') + '</th>';
    }
  }

  // 切换代码列显示状态（供外部调用）
  function toggleCodeColumns() {
    showCodeColumns = !showCodeColumns;
    updateTableHeader();
    render();
    // 同步显示/隐藏命名规则按钮
    var namingBtn = document.getElementById('mpNamingBtn');
    if (namingBtn) {
      if (showCodeColumns) namingBtn.classList.add('show');
      else namingBtn.classList.remove('show');
    }
    return showCodeColumns;
  }

  // 处理产品表tab点击（四次点击显示代码列）
  function handleMappingTabClick() {
    mappingTabClickCount++;

    if (mappingTabClickTimer) {
      clearTimeout(mappingTabClickTimer);
    }

    if (mappingTabClickCount >= 4) {
      // 四次点击，切换代码列显示
      mappingTabClickCount = 0;
      toggleCodeColumns();
    } else {
      // 设置超时，2秒内未完成四次点击则重置计数
      mappingTabClickTimer = setTimeout(function() {
        mappingTabClickCount = 0;
      }, 2000);
    }
  }

  function applyData(data) {
    if (!Array.isArray(data) || !data.length) return;
    db = data;
    currentData = data.slice();
    initCatFilter();
    doFilter();
    console.log('✅ 对照表加载，共 ' + db.length + ' 条');
  }

  function init() {
    try {
      var searchInput = document.getElementById('mpSearchInput');
      var catSelect   = document.getElementById('mpCatSelect');
      if (!searchInput || !catSelect) {
        console.warn('⚠️ 产品表模块 DOM 元素未找到');
        return;
      }

      // 初始化表头（默认隐藏代码列）
      updateTableHeader();

      // 搜索防抖
      var timer;
      searchInput.addEventListener('input', function() {
        clearTimeout(timer);
        timer = setTimeout(doFilter, 200);
      });
      catSelect.addEventListener('change', doFilter);

      var toggleAllBtn = document.getElementById('mpToggleAllBtn');
      if (toggleAllBtn) toggleAllBtn.addEventListener('click', toggleAll);

      if (window.MAPPING_DATA) applyData(window.MAPPING_DATA);
      else {
        var check = setInterval(function() {
          if (window.MAPPING_DATA) { clearInterval(check); applyData(window.MAPPING_DATA); }
        }, 100);
        setTimeout(function() { clearInterval(check); }, 5000);
    }

    // 命名规则弹窗
    initNamingModal();
    } catch(e) {
      console.error('❌ 产品表模块初始化失败:', e);
      var tbody = document.getElementById('mpTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="mp-empty">' + _t('mpLoadErr') + '</td></tr>';
    }
  }

  // ─── 命名规则弹窗 ───
  var NAMING_DATA = {
    prefix: {
      title: '品牌·品类前缀', titleEn: 'Brand & Category Prefix', color: '#00796b',
      html: '<table><tr class="naming-cur"><td>MV</td><td>Machine Vision（机器视觉）— 所有型号固定前缀</td></tr><tr class="naming-cur"><td>ID</td><td>Industrial Decoder（工业读码器）— 所有型号固定前缀</td></tr></table>',
      htmlEn: '<table><tr class="naming-cur"><td>MV</td><td>Machine Vision — fixed prefix for all models</td></tr><tr class="naming-cur"><td>ID</td><td>Industrial Decoder — fixed prefix for all models</td></tr></table>'
    },
    series: {
      title: '系列号', titleEn: 'Series', color: '#7b1fa2',
      html: '<table><tr><td>8xx</td><td><b>入门级·超小型</b> — 38×38×19mm，塑料外壳，IP54防护，M10/M5.8镜头接口，支持USB/RS-232/RJ45</td></tr><tr><td>2xxx</td><td><b>中端·极小型</b> — M12/M5.8/D14镜头接口，IP54~IP65，搭载自研深度学习算法，支持4路光源分控</td></tr><tr><td>3xxx</td><td><b>高端·标准型</b> — M12/D14/C-Mount镜头接口，IP67金属外壳，14颗LED复合光源，偏振/扩散/全透三路光学照明</td></tr><tr><td>5xxx</td><td><b>旗舰·大视野</b> — M12/D14/C-Mount镜头接口，IP67金属外壳，千兆网口，1200万+ Sensor</td></tr></table><div class="naming-note"><b>分辨率编码：</b>系列号后2-3位数字代表传感器分辨率。如 2023 = 2系 + 23(240万)，5120 = 5系 + 120(1200万)</div>',
      htmlEn: '<table><tr><td>8xx</td><td><b>Entry · Ultra-compact</b> — 38×38×19mm, plastic housing, IP54, M10/M5.8 lens mount, USB/RS-232/RJ45</td></tr><tr><td>2xxx</td><td><b>Mid-range · Micro</b> — M12/M5.8/D14 lens mount, IP54~IP65, built-in deep-learning algorithm, 4-channel illumination control</td></tr><tr><td>3xxx</td><td><b>High-end · Standard</b> — M12/D14/C-Mount lens mount, IP67 metal housing, 14-LED composite illumination, polarization/diffuse/full-transmission optics</td></tr><tr><td>5xxx</td><td><b>Flagship · Wide FOV</b> — M12/D14/C-Mount lens mount, IP67 metal housing, Gigabit Ethernet, 12MP+ sensor</td></tr></table><div class="naming-note"><b>Resolution code:</b> The 2-3 digits after the series indicate sensor resolution. e.g. 2023 = Series 2 + 23 (2.4MP), 5120 = Series 5 + 120 (12MP)</div>'
    },
    type: {
      title: '产品类型', titleEn: 'Product Type', color: '#1565c0',
      html: '<table><tr><td>M</td><td><b>Mono 黑白</b> — 黑白传感器</td></tr><tr><td>XM</td><td><b>增强款</b> — 2系/3系标配，搭载深度学习算法，支持4路光源分控</td></tr><tr><td>PM</td><td><b>高端款</b> — 3系专用，14颗LED复合光源，聚光白光，支持偏振快速切换</td></tr><tr><td>RM</td><td><b>卷帘快门款</b> — Rolling Shutter Sensor，不适合高速运动场景</td></tr><tr><td>EM</td><td><b>经济 Mono</b> — 经济型黑白款，45×43×25mm，塑料上盖，M5.8镜头接口</td></tr><tr><td>EMI</td><td><b>经济 Mono 增强</b> — 经济型黑白增强版，支持光源分控</td></tr><tr><td>EP</td><td><b>经济型（金属上盖）</b> — 经济型金属上盖版本</td></tr><tr><td>EPI</td><td><b>经济型增强</b> — 经济型金属上盖+光源分控</td></tr></table>',
      htmlEn: '<table><tr><td>M</td><td><b>Mono</b> — monochrome sensor</td></tr><tr><td>XM</td><td><b>Enhanced</b> — standard on Series 2/3, deep-learning algorithm, 4-channel illumination control</td></tr><tr><td>PM</td><td><b>Premium</b> — Series 3 only, 14-LED composite illumination, spot white light, quick polarization switching</td></tr><tr><td>RM</td><td><b>Rolling Shutter</b> — rolling shutter sensor, not for high-speed motion</td></tr><tr><td>EM</td><td><b>Economy Mono</b> — budget monochrome, 45×43×25mm, plastic top cover, M5.8 lens mount</td></tr><tr><td>EMI</td><td><b>Economy Mono Enhanced</b> — budget monochrome enhanced, illumination control supported</td></tr><tr><td>EP</td><td><b>Economy (Metal Cover)</b> — economy model with metal top cover</td></tr><tr><td>EPI</td><td><b>Economy Enhanced</b> — economy metal cover + illumination control</td></tr></table>'
    },
    focal: {
      title: '焦距', titleEn: 'Focal Length', color: '#f57f17',
      html: '<table><tr><td>03</td><td><b>3mm</b> / 2.48mm — 8系803M标称3.1mm</td></tr><tr><td>05</td><td><b>4.63mm</b> / 5mm — EMI系列标称05</td></tr><tr><td>08</td><td><b>8mm</b> — 通用中焦距，最常见配置</td></tr><tr><td>12</td><td><b>12mm</b> — 中长焦距</td></tr><tr><td>16</td><td><b>16mm</b> — 长焦距</td></tr><tr><td>25</td><td><b>25mm</b> — 长焦距，远距离读码</td></tr><tr style="background:rgba(230,81,0,0.06);"><td style="color:#e65100;">00C</td><td><b>C-Mount接口</b> — 无内置镜头和光源，需外接C口镜头</td></tr></table><div class="naming-note"><b>调焦方式：</b><b style="color:#558b2f;">M</b>=机械调焦 · <b style="color:#558b2f;">L</b>=液态调焦（自动对焦） · <b style="color:#558b2f;">S</b>=定焦（仅8系）</div>',
      htmlEn: '<table><tr><td>03</td><td><b>3mm</b> / 2.48mm — Series 8 803M rated 3.1mm</td></tr><tr><td>05</td><td><b>4.63mm</b> / 5mm — EMI series rated 05</td></tr><tr><td>08</td><td><b>8mm</b> — general medium focal length, most common</td></tr><tr><td>12</td><td><b>12mm</b> — medium-long focal length</td></tr><tr><td>16</td><td><b>16mm</b> — long focal length</td></tr><tr><td>25</td><td><b>25mm</b> — long focal length, long-distance reading</td></tr><tr style="background:rgba(230,81,0,0.06);"><td style="color:#e65100;">00C</td><td><b>C-Mount</b> — no built-in lens or light, requires external C-mount lens</td></tr></table><div class="naming-note"><b>Focusing:</b><b style="color:#558b2f;">M</b>=Mechanical · <b style="color:#558b2f;">L</b>=Liquid (auto focus) · <b style="color:#558b2f;">S</b>=Fixed (Series 8 only)</div>'
    },
    focus: {
      title: '调焦方式', titleEn: 'Focusing', color: '#558b2f',
      html: '<table><tr><td>M</td><td><b>机械调焦 (Mechanical)</b> — 手动旋转镜头调整焦距</td></tr><tr><td>L</td><td><b>液态调焦 (Liquid)</b> — 支持自动对焦，搭配 IDMVS V5.0.0+ 可一键调谐</td></tr><tr><td>S</td><td><b>定焦</b> — 仅8系803M专用，焦距固定为3.1mm</td></tr></table><div class="naming-note"><b>液态调焦优势：</b>支持自动对焦，搭配 IDMVS V5.0.0+ 客户端可一键调谐，实时变焦。</div>',
      htmlEn: '<table><tr><td>M</td><td><b>Mechanical</b> — manually rotate the lens to adjust focus</td></tr><tr><td>L</td><td><b>Liquid</b> — auto focus supported, one-click tuning with IDMVS V5.0.0+</td></tr><tr><td>S</td><td><b>Fixed</b> — Series 8 803M only, fixed at 3.1mm</td></tr></table><div class="naming-note"><b>Liquid focus advantage:</b> auto focus with one-click tuning in IDMVS V5.0.0+, real-time zoom.</div>'
    },
    light: {
      title: '光源颜色', titleEn: 'Illumination Color', color: '#c62828',
      html: '<table><tr><td>R</td><td><b>红光 (Red)</b> — 工业读码最常用波长，对比度高</td></tr><tr><td>W</td><td><b>白光 (White)</b> — 高显色性，适合需要彩色识别的场景</td></tr></table><div class="naming-note"><b>光源选购：</b>部分型号可选购白光、蓝光、红外光、紫外光或红蓝双色光源。C口型号（00C）无自带光源。</div>',
      htmlEn: '<table><tr><td>R</td><td><b>Red</b> — most common wavelength for industrial reading, high contrast</td></tr><tr><td>W</td><td><b>White</b> — high color rendering, for color-recognition scenarios</td></tr></table><div class="naming-note"><b>Optional illumination:</b> some models offer white, blue, IR, UV, or red+blue dual-color. C-mount models (00C) have no built-in light.</div>'
    },
    variant: {
      title: '光源变体', titleEn: 'Light Variant', color: '#512da8',
      html: '<table><tr><td>B</td><td><b>基础/标准光源</b> — 标准光学配置，适合常规条码识别</td></tr></table><div class="naming-note"><b>说明：</b>大多数型号使用标准光源配置。部分高端型号（PM）支持14颗LED复合光源。</div>',
      htmlEn: '<table><tr><td>B</td><td><b>Basic/Standard</b> — standard optical config for regular barcode reading</td></tr></table><div class="naming-note"><b>Note:</b> most models use standard illumination. Some premium models (PM) support 14-LED composite light.</div>'
    },
    lens: {
      title: '镜头类型', titleEn: 'Lens Type', color: '#00838f',
      html: '<table><tr><td>N</td><td><b>普通镜头（非偏振）</b> — 标准光学配置，适合无反光的常规场景</td></tr><tr><td>P</td><td><b>偏振镜头 (Polarized)</b> — 可抑制金属、薄膜等反光表面的眩光</td></tr></table><div class="naming-note"><b>偏振 vs 非偏振：</b>偏振镜头可有效抑制金属表面和薄膜的反光，提升条码识别率。</div>',
      htmlEn: '<table><tr><td>N</td><td><b>Standard (non-polarized)</b> — standard optical config for non-glare regular scenes</td></tr><tr><td>P</td><td><b>Polarized</b> — suppresses glare from metal, film and other reflective surfaces</td></tr></table><div class="naming-note"><b>Polarized vs non-polarized:</b> polarized lenses suppress reflection from metal and film surfaces, improving barcode readability.</div>'
    }
  };

  var activeNamingPart = null;

  function showNamingDetail(part) {
    var d = NAMING_DATA[part];
    if (!d) return;
    activeNamingPart = part;
    document.querySelectorAll('.naming-blk.active').forEach(function(el) { el.classList.remove('active'); });
    document.querySelectorAll('.naming-blk').forEach(function(el) {
      if (el.getAttribute('data-naming-part') === part) el.classList.add('active');
    });
    var header = document.getElementById('namingDetailHeader');
    var body = document.getElementById('namingDetailBody');
    var isEn = (window._i18n && window._i18n.getLang) ? window._i18n.getLang() === 'en' : false;
    header.innerHTML = '<span class="naming-detail-dot" style="background:' + d.color + ';"></span>' + (isEn ? (d.titleEn || d.title) : d.title);
    body.innerHTML = isEn ? (d.htmlEn || d.html) : d.html;
    var panel = document.getElementById('namingDetail');
    panel.classList.add('show');
  }

  function hideNamingDetail() {
    activeNamingPart = null;
    document.getElementById('namingDetail').classList.remove('show');
    document.querySelectorAll('.naming-blk.active').forEach(function(el) { el.classList.remove('active'); });
  }

  function initNamingModal() {
    var btn = document.getElementById('mpNamingBtn');
    var overlay = document.getElementById('namingModal');
    var closeBtn = document.getElementById('namingModalClose');
    if (!btn || !overlay) return;

    btn.addEventListener('click', function() {
      overlay.classList.add('active');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        overlay.classList.remove('active');
        hideNamingDetail();
      });
    }

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        hideNamingDetail();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        hideNamingDetail();
      }
    });

    document.querySelectorAll('.naming-blk[data-naming-part]').forEach(function(blk) {
      blk.addEventListener('click', function() {
        var part = blk.getAttribute('data-naming-part');
        if (activeNamingPart === part) { hideNamingDetail(); return; }
        showNamingDetail(part);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MAPPING = { applyData: applyData, reset: function() { db = []; currentData = []; expandedCats = {}; render(); }, getData: function() { return db; }, rerender: function() { initCatFilter(); doFilter(); }, handleTabClick: handleMappingTabClick, isCodeColumnsVisible: function() { return showCodeColumns; } };
})();
