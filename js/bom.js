/**
 * 配单表模块 - 修复版本
 * 基于 PEIDAN_DATA 数据
 */

(function() {
  'use strict';

  var bomList = [];
  var selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
  var dataVersion = '';
  var tree = {};
  var cats = [];

  // ─── 数据指纹 ───
  function fingerprint(data) {
    if (!data || !data.modelList) return '';
    var str = JSON.stringify(data.modelList);
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return String(h);
  }

  // ─── 生成配件唯一ID ───
  function getAccKey(acc, index) {
    // 使用 code + name + index 组合确保唯一性
    var code = acc.code || 'no-code';
    var name = acc.name || 'no-name';
    return code + '||' + name + '||' + index;
  }

  // ─── 构建数据树（修复版） ───
  function buildTree(data) {
    tree = {};
    var modelList = data.modelList || [];
    
    modelList.forEach(function(item, index) {
      var cat = (item.productCategory || _t('bomUncategorized')).trim();
      var ser = (item.productSeries || _t('bomUncategorized')).trim();
      var model = (item.productModel || _t('bomUnknownModel')).trim();

      if (!tree[cat]) tree[cat] = {};
      if (!tree[cat][ser]) tree[cat][ser] = { mains: [] };

      var exists = tree[cat][ser].mains.some(function(m) { return m.n === model; });
      if (!exists) {
        tree[cat][ser].mains.push({
          n: model,
          c: item.materialCode || model,
          d: item.description || _t('bomReadHost'),
          remark: item.remark || '',
          index: index,
          standardAcc: (item.standardAccessories || []).map(function(a, idx) {
            return { 
              name: a.name, 
              code: a.code, 
              detail: a.detail || '',
              category: a.category || '大类',
              series: a.series || '',
              _key: getAccKey(a, idx)
            };
          }),
          optionalAcc: (item.optionalAccessories || []).map(function(a, idx) {
            return { 
              name: a.name, 
              code: a.code, 
              detail: a.detail || '', 
              category: a.category || '其他',
              series: a.series || '',
              _key: getAccKey(a, idx)
            };
          })
        });
      }
    });

    // 按 peidan.html 优先级排序大类
    var CAT_PRIORITY = ['ID800', 'ID2013EM', 'ID2000M', 'ID2000XM', 'ID3000PM', 'ID3000XM', 'ID3000RM', 'ID5000M', 'ID5000XM'];
    cats = Object.keys(tree).sort(function(a, b) {
      var ia = -1, ib = -1;
      for (var i = 0; i < CAT_PRIORITY.length; i++) {
        if (a.indexOf(CAT_PRIORITY[i]) === 0) ia = i;
        if (b.indexOf(CAT_PRIORITY[i]) === 0) ib = i;
      }
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return 1;
      return ia - ib;
    });
    cats.forEach(function(cat) {
      var serKeys = Object.keys(tree[cat]).sort();
      var sortedSer = {};
      serKeys.forEach(function(key) {
        sortedSer[key] = tree[cat][key];
      });
      tree[cat] = sortedSer;
    });

    console.log('✅ buildTree 完成：' + cats.length + ' 个大类');
  }

  // ─── 获取当前选中型号对象 ───
  function getCurrentModel() {
    if (selState.modelIdx === null || !selState.cat || !selState.ser) return null;
    try {
      var mains = (tree[selState.cat] && tree[selState.cat][selState.ser])
                  ? tree[selState.cat][selState.ser].mains : [];
      return mains[selState.modelIdx] || null;
    } catch(e) {
      return null;
    }
  }

  // ─── localStorage 持久化 ───
  var STORAGE_KEY = 'hikrobot_bom_state';

  function save() {
    try {
      var state = {
        cat: selState.cat,
        ser: selState.ser,
        modelIdx: selState.modelIdx,
        accCodes: selState.accCodes,
        bomList: bomList
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) { /* quota exceeded or private mode */ }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var state = JSON.parse(raw);
      if (!state || !state.cat) return false;
      // 验证数据仍然有效
      if (!tree[state.cat]) return false;
      if (state.ser && !tree[state.cat][state.ser]) return false;
      if (state.modelIdx !== null) {
        var mains = tree[state.cat] && tree[state.cat][state.ser] ? tree[state.cat][state.ser].mains : [];
        if (!mains || state.modelIdx >= mains.length) return false;
      }
      selState.cat = state.cat;
      selState.ser = state.ser || '';
      selState.modelIdx = state.modelIdx;
      selState.accCodes = state.accCodes || {};
      bomList = state.bomList || [];
      return true;
    } catch(e) { return false; }
  }

  function clearSavedState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ─── i18n 辅助 ───
  function _t(key, n) {
    if (window._i18n && window._i18n.t) return window._i18n.t(key, n);
    // fallback: 返回 key
    return key;
  }

  // ─── 下拉菜单渲染 ───
  function renderCatSel() {
    var sel = document.getElementById('bomCatSel');
    if (!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="">' + _t('bomCatPh') + '</option>';
    cats.forEach(function(c) {
      var o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      if (c === cur) o.selected = true;
      sel.appendChild(o);
    });
    if (cur && cats.indexOf(cur) === -1) {
      sel.value = '';
      selState.cat = '';
    }
  }

  function renderSerSel() {
    var sel = document.getElementById('bomSerSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">' + _t('bomSerPh') + '</option>';
    sel.disabled = true;
    if (!selState.cat || !tree[selState.cat]) {
      selState.ser = '';
      return;
    }
    var sers = Object.keys(tree[selState.cat]).sort();
    if (sers.length === 0) return;
    sers.forEach(function(s) {
      var o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.ser && sers.indexOf(selState.ser) !== -1) {
      sel.value = selState.ser;
    } else {
      sel.value = '';
      selState.ser = '';
    }
  }

  function renderModelSel() {
    var sel = document.getElementById('bomModelSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">' + _t('bomModelPh') + '</option>';
    sel.disabled = true;
    if (!selState.cat || !selState.ser || !tree[selState.cat] || !tree[selState.cat][selState.ser]) {
      selState.modelIdx = null;
      return;
    }
    var mains = tree[selState.cat][selState.ser].mains || [];
    if (mains.length === 0) return;
    mains.forEach(function(m, i) {
      var o = document.createElement('option');
      o.value = i;
      o.textContent = m.n;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.modelIdx !== null && selState.modelIdx < mains.length) {
      sel.value = selState.modelIdx;
    } else {
      sel.value = '';
      selState.modelIdx = null;
    }
  }

  // ─── 配件列表 ───
  function renderAccList() {
    var container = document.getElementById('bomAccList');
    if (!container) return;
    var m = getCurrentModel();
    if (!m) {
      container.innerHTML = '<div class="bom-acc-empty">' + _t('bomAccEmpty') + '</div>';
      return;
    }

    var standardAccs = m.standardAcc || [];
    var optionalAccs = m.optionalAcc || [];

    // 标配自动勾选 - 使用 _key
    standardAccs.forEach(function(a) { 
      if (a._key) selState.accCodes[a._key] = true; 
    });

    if (!optionalAccs.length) {
      container.innerHTML = '<div class="bom-acc-empty" style="color:#0b5e42;">✅ ' + _t('bomNoOptAcc', standardAccs.length) + '</div>';
      return;
    }

    var groups = {};
    var groupOrder = [];
    optionalAccs.forEach(function(a) {
      var cat = a.category || _t('bomOther');
      if (!groups[cat]) { groups[cat] = []; groupOrder.push(cat); }
      groups[cat].push(a);
    });

    var html = '';
    groupOrder.forEach(function(cat) {
      var items = groups[cat];
      var checkedCount = items.filter(function(a) { return selState.accCodes[a._key]; }).length;
      html += '<div class="bom-cat-card" data-cat="' + esc(cat) + '">' +
        '<div class="bom-cat-icon">' + getCatIcon(cat) + '</div>' +
        '<div class="bom-cat-info">' +
          '<div class="bom-cat-name">' + esc(cat) + '</div>' +
          '<div class="bom-cat-count">' + _t('bomAccCount', items.length) + (checkedCount ? ' · <span class="bom-cat-checked">' + _t('bomSelected', checkedCount) + '</span>' : '') + '</div>' +
        '</div>' +
        '<div class="bom-cat-arrow">›</div>' +
      '</div>';
    });
    container.innerHTML = html;

    container.querySelectorAll('.bom-cat-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var cat = card.dataset.cat;
        openAccModal(cat, groups[cat]);
      });
    });
  }

  function getCatIcon(cat) {
    var map = { '线缆': '🔌', '网线': '🌐', '电源线': '🔋', '电源': '⚡', '安装': '🔩', '安装板': '📐', '其他': '📦', '外置配件': '🔧', '镜头': '🔍', '测试镜头': '👁', '镜头罩': '🛡', '光源': '💡', '微码光源': '🔬', '爆闪光源': '✨', '灯板': '💎', '大类': '📋', '一体线': '🔌', 'IO线': '🔗', 'FA镜头': '🔭', '扩展配件': '📦' };
    return map[cat] || '📦';
  }

  // ─── 选配配件 Modal ───
  var CABLE_CATS = ['线缆', '电源线', '网线', '一体线', 'IO线'];

  // 各大类的提示信息，key 为 category 名称
  var CAT_WARNINGS = {
    '线缆':  '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
    '电源线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
    '网线':  '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
    '一体线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
    'IO线':  '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
    '电源':  '下单适配器或开关电源时，需要选择对应线缆。'
  };

  // 电源适配器/线缆自动联动（按 series 字段匹配）
  var POWER_ADAPTER_SERIES = ['电源适配器', '电源适配器DC'];
  var POWER_SUPPLY_SERIES = ['开关电源1', '开关电源2'];
  var POWER_CABLE_SERIES = ['电源适配器线缆', '开关电源线缆'];
  var CABLE_LENGTHS = ['2m', '3m', '3.5m', '5m', '7m', '10m', '15m','20m','30m'];
  var CABLE_TEXTURES = ['普通', '高柔', '超柔', '弯头'];

  // 从名称/描述中提取长度/材质标签（用于筛选）
  function getCableTags(name, detail) {
    var text = (name || '') + ' ' + (detail || '');
    var lengths = [], textures = [];
    CABLE_LENGTHS.forEach(function(l) {
      if (text.indexOf(l) !== -1) lengths.push(l);
    });
    CABLE_TEXTURES.forEach(function(t) {
      if (text.indexOf(t) !== -1) textures.push(t);
    });
    // 映射英文缩写
    if (textures.length === 0) {
      if (/\bHF\b/.test(text)) textures.push('高柔');
      if (/\bSF\b/.test(text)) textures.push('超柔');
      if (/\bST\b/.test(text)) textures.push('普通');
    }
    return { lengths: lengths, textures: textures };
  }

  // 渲染弹窗配件列表（支持筛选）
  function renderAccModalList(listEl, items, filterLen, filterTex, catName) {
    var html = '';
    var filtered = items.filter(function(a) {
      if (!filterLen && !filterTex) return true;
      var tags = getCableTags(a.name, a.detail);
      var lenOK = !filterLen || tags.lengths.indexOf(filterLen) !== -1;
      var texOK = !filterTex || tags.textures.indexOf(filterTex) !== -1;
      return lenOK && texOK;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<div class="acc-modal-no-result">' + _t('bomNoMatchAcc') + '</div>';
      return;
    }

    filtered.forEach(function(a) {
      var checked = !!selState.accCodes[a._key];
      html += '<div class="acc-modal-item' + (checked ? ' checked' : '') + '" data-key="' + esc(a._key) + '">' +
        '<div class="acc-modal-check">' + (checked ? '✓' : '') + '</div>' +
        '<div class="acc-modal-info">' +
          '<div class="acc-modal-name">' + esc(a.name) + '</div>' +
          '<div class="acc-modal-code">' + esc(a.code) + '</div>' +
          (a.detail ? '<div class="acc-modal-detail">' + esc(a.detail) + '</div>' : '') +
        '</div>' +
      '</div>';
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.acc-modal-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var key = el.dataset.key;
        var wasChecked = !!selState.accCodes[key];
        selState.accCodes[key] = !wasChecked;
        var isChecked = !wasChecked;
        el.classList.toggle('checked', isChecked);
        var checkEl = el.querySelector('.acc-modal-check');
        if (checkEl) checkEl.textContent = isChecked ? '✓' : '';


        // 电源适配器/线缆自动联动（按 series 匹配，参考 peidan.html 逻辑）
        if (catName === '电源') {
          var clickedItem = items.find(function(a) { return a._key === key; });
          if (clickedItem && clickedItem.series) {
            var ms = clickedItem.series;
            var targetSeries = null;
            if (POWER_ADAPTER_SERIES.indexOf(ms) !== -1) targetSeries = ['电源适配器线缆'];
            else if (ms === '电源适配器线缆') targetSeries = POWER_ADAPTER_SERIES;
            else if (POWER_SUPPLY_SERIES.indexOf(ms) !== -1) targetSeries = ['开关电源线缆'];
            else if (ms === '开关电源线缆') targetSeries = POWER_SUPPLY_SERIES;

            if (targetSeries) {
              if (isChecked) {
                // 选择：自动勾选关联项
                var target = items.find(function(a) {
                  return a.series && targetSeries.indexOf(a.series) !== -1 && !selState.accCodes[a._key];
                });
                if (target) {
                  selState.accCodes[target._key] = true;
                  listEl.querySelectorAll('.acc-modal-item').forEach(function(itemEl) {
                    if (itemEl.dataset.key === target._key) {
                      itemEl.classList.add('checked');
                      var targetCheck = itemEl.querySelector('.acc-modal-check');
                      if (targetCheck) targetCheck.textContent = '✓';
                    }
                  });
                }
              } else {
                // 取消：自动取消关联项
                var target = items.find(function(a) {
                  return a.series && targetSeries.indexOf(a.series) !== -1 && selState.accCodes[a._key];
                });
                if (target) {
                  selState.accCodes[target._key] = false;
                  listEl.querySelectorAll('.acc-modal-item').forEach(function(itemEl) {
                    if (itemEl.dataset.key === target._key) {
                      itemEl.classList.remove('checked');
                      var targetCheck = itemEl.querySelector('.acc-modal-check');
                      if (targetCheck) targetCheck.textContent = '';
                    }
                  });
                }
              }
            }
          }
        }

        autoGenerateBOM();
        renderAccList();
      });
    });
  }

  function openAccModal(catName, items) {
    var modal = document.getElementById('accModal');
    if (!modal) return;
    document.getElementById('accModalTitle').textContent = getCatIcon(catName) + ' ' + catName;

    var listEl = document.getElementById('accModalList');
    var isCableCat = CABLE_CATS.indexOf(catName) !== -1;

    // 从映射表获取提示信息（线缆/电源等各类别可独立配置）
    var warningMsg = CAT_WARNINGS[catName] || '';
    var warningHtml = warningMsg
      ? '<div class="acc-modal-warning"><span class="acc-modal-warning-icon">⚠️</span>' + warningMsg + '</div>'
      : '';

    // 线缆类：警告 + 筛选器
    if (isCableCat) {

      // 收集当前 items 里实际出现的长度和材质
      var availLens = [], availTexs = [];
      items.forEach(function(a) {
        var tags = getCableTags(a.name, a.detail);
        tags.lengths.forEach(function(l) { if (availLens.indexOf(l) === -1) availLens.push(l); });
        tags.textures.forEach(function(t) { if (availTexs.indexOf(t) === -1) availTexs.push(t); });
      });
      // 按预设顺序排
      availLens = CABLE_LENGTHS.filter(function(l) { return availLens.indexOf(l) !== -1; });
      availTexs = CABLE_TEXTURES.filter(function(t) { return availTexs.indexOf(t) !== -1; });

      var filterHtml = '';
      if (availLens.length > 0 || availTexs.length > 0) {
        filterHtml = '<div class="acc-modal-filter">';
        if (availLens.length > 0) {
          filterHtml += '<div class="acc-filter-row">';
          filterHtml += '<span class="acc-filter-label">' + _t('bomLen') + '</span>';
          filterHtml += '<button class="acc-filter-tag active" data-type="len" data-val="">' + _t('bomAll') + '</button>';
          availLens.forEach(function(l) {
            filterHtml += '<button class="acc-filter-tag" data-type="len" data-val="' + l + '">' + l + '</button>';
          });
          filterHtml += '</div>';
        }
        if (availTexs.length > 0) {
          filterHtml += '<div class="acc-filter-row">';
          filterHtml += '<span class="acc-filter-label">' + _t('bomMat') + '</span>';
          filterHtml += '<button class="acc-filter-tag active" data-type="tex" data-val="">' + _t('bomAll') + '</button>';
          availTexs.forEach(function(t) {
            filterHtml += '<button class="acc-filter-tag" data-type="tex" data-val="' + t + '">' + t + '</button>';
          });
          filterHtml += '</div>';
        }
        filterHtml += '</div>';
      }

      // 组装 modal body：warning + filter + list容器
      var filterContainer = document.getElementById('accModalFilter');
      if (filterContainer) {
        filterContainer.innerHTML = warningHtml + filterHtml;
        filterContainer.style.display = 'block';
      }

      // 初始渲染全部
      renderAccModalList(listEl, items, '', '', catName);

      // 绑定筛选按钮事件
      var activeLen = '', activeTex = '';
      filterContainer.querySelectorAll('.acc-filter-tag').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var type = btn.dataset.type;
          var val = btn.dataset.val;
          // 同组按钮切换 active
          filterContainer.querySelectorAll('.acc-filter-tag[data-type="' + type + '"]').forEach(function(b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');
          if (type === 'len') activeLen = val;
          else activeTex = val;
          renderAccModalList(listEl, items, activeLen, activeTex, catName);
        });
      });

    } else {
      // 非线缆类：隐藏 filter 区域；若有提示信息则用 filterContainer 显示
      var filterContainer = document.getElementById('accModalFilter');
      if (filterContainer) {
        if (warningHtml) {
          filterContainer.innerHTML = warningHtml;
          filterContainer.style.display = 'block';
        } else {
          filterContainer.style.display = 'none';
        }
      }
      renderAccModalList(listEl, items, '', '', catName);
    }

    modal.classList.add('active');
  }

  function initAccModal() {
    var modal = document.getElementById('accModal');
    if (!modal) return;
    function closeModal() { modal.classList.remove('active'); }
    document.getElementById('accModalClose').addEventListener('click', closeModal);
    var doneBtn = document.getElementById('accModalClose2');
    if (doneBtn) doneBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
  }

  function updateAddBtn() {
    var btn = document.getElementById('bomAddToListBtn');
    if (btn) btn.disabled = (getCurrentModel() === null);
  }

  // ─── 配单型号 → 产品表下载URL 匹配 ───
  function extractSeries(name) {
    var m = (name || '').match(/(?:MV-)?(ID[A-Z0-9]+[A-Z]?)/i);
    return m ? m[1].toUpperCase() : '';
  }

  function cleanName(name) {
    return (name || '').replace(/[\(（].*?[\)）]/g, '').replace(/V\d+\.\d+/g, '').replace(/\s+/g, '').trim();
  }

  function findMappingMatch(bomName) {
    if (!bomName || !window.MAPPING_DATA) return null;
    var md = window.MAPPING_DATA;
    var c = cleanName(bomName);
    var p = extractSeries(bomName);

    for (var i = 0; i < md.length; i++) {
      var r = md[i];
      var cb = cleanName(r.baseName || '');
      var cd = cleanName(r.distName || '');
      // 1. 精确包含：baseName 包含 BOM 型号
      if (r.baseName && r.baseName.indexOf(bomName) !== -1) return r;
      // 2. 精确包含：distName 包含 BOM 型号
      if (r.distName && r.distName.indexOf(bomName) !== -1) return r;
      // 3. 反向包含：BOM 型号包含 baseName（去括号后）
      if (cb && c.indexOf(cb) !== -1) return r;
      // 4. 反向包含：BOM 型号包含 distName（去括号后）
      if (cd && c.indexOf(cd) !== -1) return r;
      // 5. 去括号后互相包含
      if (cb && cb.indexOf(c) !== -1) return r;
      if (cd && cd.indexOf(c) !== -1) return r;
    }
    // 6. 系列前缀匹配（fallback）
    if (p) {
      for (var i = 0; i < md.length; i++) {
        if (extractSeries(md[i].baseName) === p || extractSeries(md[i].distName) === p) {
          return md[i];
        }
      }
    }
    return null;
  }

  // ─── 自动生成配单 ───
  function autoGenerateBOM() {
    var m = getCurrentModel();
    if (!m) { console.warn('[BOM] autoGenerateBOM: getCurrentModel() returned null'); return; }
    var qty = 1;
    var newBom = [];

    newBom.push({ type: '主机', n: m.n, c: m.c, d: m.d, remark: m.remark || '', qty: qty,
                  cat: selState.cat, ser: selState.ser });

    // 收集已选配的分类（用于替换标配）
    var selectedOptCats = {};
    (m.optionalAcc || []).forEach(function(a) {
      if (a.code && a.name && selState.accCodes[a._key]) {
        selectedOptCats[a.category] = true;
      }
    });

    // 标配配件：如果该分类有选配项被选中，则跳过标配（被替换）
    (m.standardAcc || []).forEach(function(a) {
      if (a.code && a.name && !selectedOptCats[a.category]) {
        newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty: qty, accType: '标配', cat: selState.cat, ser: selState.ser });
      }
    });

    var optionalCount = 0;
    (m.optionalAcc || []).forEach(function(a) {
      if (a.code && a.name && selState.accCodes[a._key]) {
        newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty: qty, accType: '选配', cat: selState.cat, ser: selState.ser });
        optionalCount++;
      }
    });

    bomList = newBom;
    save();
    renderTable();
  }

  // ─── 配单表 ───
  function renderTable() {
    var tbody = document.getElementById('bomQBody');
    if (!tbody) return;

    var setStat = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    var countEl = document.getElementById('bomQCount');
    if (countEl) countEl.textContent = _t('bomCount', bomList.length);
    setStat('bomStatTotal', bomList.length);
    setStat('bomStatMain',  bomList.filter(function(r) { return r.type === '主机'; }).length);
    setStat('bomStatAcc',   bomList.filter(function(r) { return r.type === '配件'; }).length);

    if (!bomList.length) {
      tbody.innerHTML = 
        '<tr>' +
          '<td colspan="5" class="bom-q-empty" style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted);">' + _t('bomEmpty') + '</td>' +
        '</tr>';
      return;
    }

    tbody.innerHTML = bomList.map(function(row, i) {
      var typeLabel = row.accType || row.type;
      var typeClass = row.type === '配件' ? ' acc' : '';
      var rowBg = row.type === '主机' ? 'bom-row-main' : (row.accType === '标配' ? 'bom-row-std' : 'bom-row-opt');
      
      var codeDisplay = row.c || '—';
      var descText = row.d || '';
      if (row.type === '主机' && row.remark) descText += ' (' + row.remark + ')';
      
      return '<tr data-i="' + i + '" class="' + rowBg + '">' +
        '<td class="bom-q-idx" style="text-align:center;">' + (i + 1) + '</td>' +
        '<td style="text-align:center;"><span class="bom-q-type-badge' + typeClass + '">' + esc(typeLabel) + '</span></td>' +
        '<td class="bom-td-name" style="text-align:center;">' + esc(row.n || '') + '</td>' +
        '<td class="bom-q-desc" style="text-align:center;">' + esc(descText.slice(0, 80)) + '</td>' +
        '<td style="text-align:center;"><span class="bom-q-code">' + esc(codeDisplay) + '</span></td>' +
      '</tr>';
    }).join('');

    // 下载按钮：查找主机型号在 mapping 中的下载链接（多级匹配）
    var dlBtn = document.getElementById('bomDownloadBtn');
    if (dlBtn) {
      var hostRow = bomList.find(function(r) { return r.type === '主机'; });
      var dlUrl = '';
      if (hostRow && window.MAPPING_DATA && window.MAPPING_DOWNLOAD_URLS) {
        var modelName = hostRow.n || '';
        var match = findMappingMatch(modelName);
        if (match) {
          dlUrl = window.MAPPING_DOWNLOAD_URLS.getBaseUrl(match.cat) || '';
        }
        if (!dlUrl && window.MAPPING_DOWNLOAD_URLS.getSpecUrl) {
          dlUrl = window.MAPPING_DOWNLOAD_URLS.getSpecUrl(modelName) || '';
        }
      }
      if (dlUrl) {
        dlBtn.href = dlUrl;
        dlBtn.style.display = '';
      } else {
        dlBtn.style.display = 'none';
      }
    }
  }

  // ─── 导出 CSV ───
  function exportCSV() {
    if (!bomList.length) { alert(_t('bomEmptyAlert')); return; }
    var rows = [[_t('bomCsvHash'), _t('bomCsvType'), _t('bomCsvName'), _t('bomCsvDesc'), _t('bomCsvCode')]].concat(
      bomList.map(function(r, i) {
        var code = r.type === '主机' ? '-' : r.c;
        return [i + 1, r.type + (r.accType ? ' (' + r.accType + ')' : ''), r.n, r.d, code];
      })
    );
    var csv = rows.map(function(r) {
      return r.map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    a.download = 'HIKROBOT_' + _t('bomCsvNameFile') + '_' + dateStr + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearBOM() {
    if (!bomList.length) return;
    // 清除所有选配勾选状态
    selState.accCodes = {};
    // 重新标记标配
    var m = getCurrentModel();
    if (m) {
      (m.standardAcc || []).forEach(function(a) {
        if (a._key) selState.accCodes[a._key] = true;
      });
      // 重新生成配单（含被选配替换掉的标配，会恢复出来）
      autoGenerateBOM();
    } else {
      // 无型号时不生成，仅保留主机与标配
      bomList = bomList.filter(function(r) { return r.type === '主机' || r.accType === '标配'; });
      save();
      renderTable();
    }
    renderAccList();
  }

  // ─── 数据加载 ───
  function applyData(data) {
    if (!data || !data.modelList || data.modelList.length === 0) {
      console.warn('⚠️ PEIDAN_DATA 无效或为空');
      return;
    }
    var fp = fingerprint(data);
    if (fp === dataVersion && Object.keys(tree).length > 0) return;
    dataVersion = fp;
    buildTree(data);
    buildReverseIndex(data);
    
    selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
    renderCatSel();
    renderSerSel();
    renderModelSel();
    renderAccList();
    updateAddBtn();
    renderTable();
  }

  // ─── 物料号反查索引 ───
  var reverseIndex = {};
  function buildReverseIndex(data) {
    reverseIndex = {};
    if (!data || !data.modelList) return;
    data.modelList.forEach(function(item) {
      var model = item.productModel || '';
      var cat = (item.productCategory || '').trim();
      var ser = (item.productSeries || '').trim();
      var allAcc = (item.standardAccessories || []).concat(item.optionalAccessories || []);
      allAcc.forEach(function(acc, i) {
        var code = acc.code || '';
        if (!code) return;
        var isStd = i < (item.standardAccessories || []).length;
        if (!reverseIndex[code]) {
          reverseIndex[code] = {
            name: acc.name || '',
            category: acc.category || '',
            series: acc.series || '',
            detail: acc.detail || '',
            models: []
          };
        }
        var exists = reverseIndex[code].models.some(function(m) { return m.name === model && m.cat === cat && m.ser === ser; });
        if (!exists) {
          reverseIndex[code].models.push({ name: model, type: isStd ? 'standard' : 'optional', cat: cat, ser: ser });
        }
      });
    });
    console.log('✅ 反查索引构建完成，' + Object.keys(reverseIndex).length + ' 条');
  }

  // ─── 事件绑定 ───
  var _eventsBound = false;
  function bindEvents() {
    if (_eventsBound) return;
    _eventsBound = true;

    var catSel = document.getElementById('bomCatSel');
    var serSel = document.getElementById('bomSerSel');
    var modelSel = document.getElementById('bomModelSel');

    if (!catSel || !serSel || !modelSel) {
      console.warn('⚠️ 配单表关键 DOM 元素未找到，事件绑定失败');
      _eventsBound = false; // 允许下次重试
      return;
    }

    catSel.addEventListener('change', function() {
      selState.cat = this.value;
      selState.ser = '';
      selState.modelIdx = null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderSerSel();
      renderModelSel();
      renderAccList();
      updateAddBtn();
    });

    serSel.addEventListener('change', function() {
      selState.ser = this.value;
      selState.modelIdx = null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderModelSel();
      renderAccList();
      updateAddBtn();
    });

    modelSel.addEventListener('change', function() {
      selState.modelIdx = this.value !== '' ? +this.value : null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderAccList();
      updateAddBtn();
      if (selState.modelIdx !== null) setTimeout(autoGenerateBOM, 50);
    });

    var addBtn = document.getElementById('bomAddToListBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        if (getCurrentModel()) {
          autoGenerateBOM();
          addBtn.textContent = '✓ ' + _t('bomUpdated');
          setTimeout(function() { addBtn.textContent = '✓ ' + _t('bomAutoGen'); }, 1000);
        }
      });
    }

    var clearBtn = document.getElementById('bomQClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearBOM);
    var exportBtn = document.getElementById('bomQExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // ─── 快速搜索（含配件反查） ───
    var searchInput = document.getElementById('bomQuickSearch');
    var searchResults = document.getElementById('bomSearchResults');
    if (searchInput && searchResults) {
      var searchTimer = null;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        var kw = this.value.trim().toLowerCase();
        if (!kw) { searchResults.style.display = 'none'; return; }
        searchTimer = setTimeout(function() {
          var html = '';
          // 1. 搜索产品型号
          var matches = [];
          cats.forEach(function(cat) {
            var sers = Object.keys(tree[cat] || {});
            sers.forEach(function(ser) {
              var mains = (tree[cat][ser] && tree[cat][ser].mains) || [];
              mains.forEach(function(m, idx) {
                var name = (m.n || '').toLowerCase();
                var code = (m.c || '').toLowerCase();
                if (name.indexOf(kw) !== -1 || code.indexOf(kw) !== -1) {
                  matches.push({ cat: cat, ser: ser, idx: idx, name: m.n, code: m.c });
                }
              });
            });
          });
          if (matches.length) {
            html += matches.slice(0, 15).map(function(m, i) {
              return '<div class="bom-search-item bom-search-product" data-idx="' + i + '">' +
                '<div class="bom-search-item-name">' + esc(m.name) + '</div>' +
                '<div class="bom-search-item-code">' + esc(m.code) + '</div>' +
                '<div class="bom-search-item-cat">' + esc(m.cat) + ' › ' + esc(m.ser) + '</div>' +
              '</div>';
            }).join('');
          }
          // 2. 搜索配件物料号
          var accMatches = [];
          if (reverseIndex) {
            Object.keys(reverseIndex).forEach(function(code) {
              var info = reverseIndex[code];
              var name = (info.name || '').toLowerCase();
              var cat = (info.category || '').toLowerCase();
              if (code.toLowerCase().indexOf(kw) !== -1 || name.indexOf(kw) !== -1) {
                accMatches.push({ code: code, name: info.name, category: info.category, series: info.series, detail: info.detail, count: info.models.length, models: info.models });
              }
            });
          }
          if (accMatches.length) {
            if (html) html += '<div style="border-top:1px solid var(--border,#e2e8f0);margin:4px 0"></div>';
            html += accMatches.slice(0, 10).map(function(a, i) {
              // 按 (cat,ser) 分组去重，只显示系列，不展开具体型号（避免型号过多卡顿）
              var serMap = {};
              a.models.forEach(function(mm) {
                var key = (mm.cat || '') + '\u0001' + (mm.ser || '');
                if (!serMap[key]) serMap[key] = { cat: mm.cat, ser: mm.ser, count: 0 };
                serMap[key].count++;
              });
              var serRows = Object.keys(serMap).map(function(key) {
                var g = serMap[key];
                return '<span class="bom-search-ser" data-acc-code="' + esc(a.code) + '" data-ser-cat="' + esc(g.cat) + '" data-ser-name="' + esc(g.ser) + '" data-ser-count="' + g.count + '">' +
                  esc(g.ser || g.cat) + ' <b>' + g.count + '</b></span>';
              }).join('');
              return '<div class="bom-search-item bom-search-acc" data-acc="' + esc(a.code) + '">' +
                '<div class="bom-search-item-name">' + esc(a.name) + ' <span style="font-size:10px;color:var(--primary,#f97316)">' + esc(a.category) + '</span></div>' +
                '<div class="bom-search-item-code">' + _t('bomMatCode') + esc(a.code) + (a.detail ? ' | ' + esc(a.detail) : '') + '</div>' +
                '<div class="bom-search-item-cat">' + _t('bomFitSeriesLabel') + serRows + '</div>' +
              '</div>';
            }).join('');
          }
          // 无结果
          if (!html) {
            html = '<div class="bom-search-item" style="color:var(--text-muted);cursor:default">' + _t('bomNoResult') + '</div>';
          }
          searchResults.innerHTML = html;
          // 选中产品型号（配件型号列表点击复用）
          function selectProductByMatch(m, extraAccCode) {
            document.getElementById('bomCatSel').value = m.cat;
            selState.cat = m.cat;
            renderSerSel();
            document.getElementById('bomSerSel').value = m.ser;
            selState.ser = m.ser;
            renderModelSel();
            document.getElementById('bomModelSel').value = m.idx;
            selState.modelIdx = m.idx;
            selState.accCodes = {};
            bomList = [];
            renderTable();
            renderAccList();
            updateAddBtn();
            setTimeout(function() {
              autoGenerateBOM();
              if (extraAccCode) {
                var info = reverseIndex[extraAccCode];
                if (info) {
                  var exists = bomList.some(function(r) { return r.c === extraAccCode; });
                  if (!exists) {
                    bomList.push({
                      type: '配件',
                      n: info.name,
                      c: extraAccCode,
                      d: info.detail || '',
                      qty: 1,
                      accType: '选配',
                      cat: info.category,
                      ser: info.series
                    });
                    save();
                    renderTable();
                  }
                }
              }
            }, 50);
            searchInput.value = '';
            searchResults.style.display = 'none';
          }
          // 点击产品型号
          searchResults.querySelectorAll('.bom-search-product[data-idx]').forEach(function(el) {
            el.addEventListener('click', function() {
              selectProductByMatch(matches[+el.dataset.idx]);
            });
          });
          // 点击系列标签 — 跳转选中该系列（选该系列第一个型号）
          searchResults.querySelectorAll('.bom-search-ser[data-acc-code]').forEach(function(el) {
            el.addEventListener('click', function(e) {
              e.stopPropagation();
              var cat = el.dataset.serCat;
              var ser = el.dataset.serName;
              var code = el.dataset.accCode;
              var found = null;
              var mains = (tree[cat] && tree[cat][ser] && tree[cat][ser].mains) || [];
              if (mains.length) {
                found = { cat: cat, ser: ser, idx: 0, name: mains[0].n, code: mains[0].c };
              }
              if (found) {
                selectProductByMatch(found, code);
              } else {
                // 该系列无型号可跳转，退回加入配单
                addAccToBom(code);
              }
            });
          });
          // 点击配件项主体 — 加入配单
          searchResults.querySelectorAll('.bom-search-acc[data-acc]').forEach(function(el) {
            el.addEventListener('click', function(e) {
              if (e.target.closest('.bom-search-ser')) return;
              addAccToBom(el.dataset.acc);
            });
          });
          function addAccToBom(code) {
            var info = reverseIndex[code];
            if (!info) return;
            // 检查是否已存在
            var exists = bomList.some(function(r) { return r.c === code; });
            if (exists) {
              alert(_t('bomExists'));
              searchInput.value = '';
              searchResults.style.display = 'none';
              return;
            }
            // 添加到配单
            bomList.push({
              type: '配件',
              n: info.name,
              c: code,
              d: info.detail || '',
              qty: 1,
              accType: '选配',
              cat: info.category,
              ser: info.series
            });
            save();
            renderTable();
            searchInput.value = '';
            searchResults.style.display = 'none';
          }
          searchResults.style.display = 'block';
        }, 200);
      });
      searchInput.addEventListener('blur', function() {
        setTimeout(function() { searchResults.style.display = 'none'; }, 200);
      });
    }

    initAccModal();
  }

  // ─── 动态加载 peidan.min.js ───
  function loadPeidanScript(callback) {
    if (window.PEIDAN_DATA) { callback(); return; }
    var existing = document.querySelector('script[src*="peidan.min.js"]');
    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }
    var script = document.createElement('script');
    script.src = 'js/data/peidan.min.js';
    script.onload = callback;
    script.onerror = function() { console.error('❌ peidan.min.js 加载失败'); };
    document.head.appendChild(script);
  }

  // ─── 初始化 ───
  function restoreAfterData() {
    if (loadState()) {
      // 恢复下拉框状态
      renderCatSel();
      renderSerSel();
      renderModelSel();
      renderAccList();
      updateAddBtn();
      renderTable();
    }
  }

  function init() {
    bindEvents();
    bomList = [];
    renderTable();

    if (window.PEIDAN_DATA) {
      applyData(window.PEIDAN_DATA);
      bindEvents();
      restoreAfterData();
    } else {
      loadPeidanScript(function() {
        if (window.PEIDAN_DATA) {
          applyData(window.PEIDAN_DATA);
          bindEvents();
          restoreAfterData();
        } else {
          console.warn('⚠️ PEIDAN_DATA 未定义');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BOM = {
    init: init,
    applyData: applyData,
    exportCSV: exportCSV,
    clearBOM: clearBOM,
    getData: function() { return bomList; },
    getTree: function() { return tree; },
    getCats: function() { return cats; },
    getReverseIndex: function() { return reverseIndex; },
    rerender: function() {
      renderCatSel();
      renderSerSel();
      renderModelSel();
      renderAccList();
      renderTable();
    }
  };

})();