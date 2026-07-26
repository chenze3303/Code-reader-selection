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

  // 配单不持久化：刷新页面即清空（按需求设计），save() 保留为空函数兼容调用点
  function save() {}

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
      var cat = a.category || '其他';
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
      listEl.innerHTML = '<div class="acc-modal-no-result">无匹配配件</div>';
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
          filterHtml += '<span class="acc-filter-label">长度</span>';
          filterHtml += '<button class="acc-filter-tag active" data-type="len" data-val="">全部</button>';
          availLens.forEach(function(l) {
            filterHtml += '<button class="acc-filter-tag" data-type="len" data-val="' + l + '">' + l + '</button>';
          });
          filterHtml += '</div>';
        }
        if (availTexs.length > 0) {
          filterHtml += '<div class="acc-filter-row">';
          filterHtml += '<span class="acc-filter-label">材质</span>';
          filterHtml += '<button class="acc-filter-tag active" data-type="tex" data-val="">全部</button>';
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

    // 下载按钮：查找主机型号在 mapping 中的下载链接
    var dlBtn = document.getElementById('bomDownloadBtn');
    if (dlBtn) {
      var hostRow = bomList.find(function(r) { return r.type === '主机'; });
      var dlUrl = '';
      if (hostRow && window.MAPPING_DATA && window.MAPPING_DOWNLOAD_URLS) {
        var modelName = hostRow.n || '';
        var match = window.MAPPING_DATA.find(function(m) {
          return m.baseName && modelName && m.baseName.indexOf(modelName) !== -1;
        });
        if (match && match.cat) {
          dlUrl = window.MAPPING_DOWNLOAD_URLS.getBaseUrl(match.cat) || '';
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
    if (!bomList.length) { alert('配单表为空'); return; }
    var rows = [['#', '配件类型', '物料名称', '描述', '物料代码']].concat(
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
    a.download = 'HIKROBOT_配单表_' + new Date().toLocaleDateString('zh-CN').split('/').join('-') + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearBOM() {
    if (!bomList.length) return;
    // 只清除选配配件，保留主机和标配
    bomList = bomList.filter(function(r) { return r.type === '主机' || r.accType === '标配'; });
    // 清除所有选配勾选状态
    selState.accCodes = {};
    // 重新标记标配
    var m = getCurrentModel();
    if (m) {
      (m.standardAcc || []).forEach(function(a) {
        if (a._key) selState.accCodes[a._key] = true;
      });
    }
    save();
    renderTable();
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
    
    selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
    renderCatSel();
    renderSerSel();
    renderModelSel();
    renderAccList();
    updateAddBtn();
    renderTable();
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
          addBtn.textContent = '✓ 已更新';
          setTimeout(function() { addBtn.textContent = '✓ 自动生成配单'; }, 1000);
        }
      });
    }

    var clearBtn = document.getElementById('bomQClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearBOM);
    var exportBtn = document.getElementById('bomQExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // ─── 快速搜索 ───
    var searchInput = document.getElementById('bomQuickSearch');
    var searchResults = document.getElementById('bomSearchResults');
    if (searchInput && searchResults) {
      var searchTimer = null;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        var kw = this.value.trim().toLowerCase();
        if (!kw) { searchResults.style.display = 'none'; return; }
        searchTimer = setTimeout(function() {
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
          if (!matches.length) {
            searchResults.innerHTML = '<div class="bom-search-item" style="color:var(--text-muted);cursor:default">无匹配结果</div>';
          } else {
            searchResults.innerHTML = matches.slice(0, 20).map(function(m, i) {
              return '<div class="bom-search-item" data-idx="' + i + '">' +
                '<div class="bom-search-item-name">' + esc(m.name) + '</div>' +
                '<div class="bom-search-item-code">' + esc(m.code) + '</div>' +
                '<div class="bom-search-item-cat">' + esc(m.cat) + ' › ' + esc(m.ser) + '</div>' +
              '</div>';
            }).join('');
            searchResults.querySelectorAll('.bom-search-item[data-idx]').forEach(function(el) {
              el.addEventListener('click', function() {
                var m = matches[+el.dataset.idx];
                // 设置下拉框
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
                setTimeout(autoGenerateBOM, 50);
                // 清空搜索
                searchInput.value = '';
                searchResults.style.display = 'none';
              });
            });
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
  function init() {
    bindEvents();
    bomList = [];
    renderTable();

    if (window.PEIDAN_DATA) {
      applyData(window.PEIDAN_DATA);
      bindEvents();
    } else {
      loadPeidanScript(function() {
        if (window.PEIDAN_DATA) {
          applyData(window.PEIDAN_DATA);
          bindEvents();
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
    rerender: function() {
      renderCatSel();
      renderSerSel();
      renderModelSel();
      renderAccList();
      renderTable();
    }
  };

})();