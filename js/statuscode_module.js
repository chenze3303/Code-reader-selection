/**
 * 状态码查询模块
 * 依赖：js/data/status_codes.js (STATUS_CODES)
 */
(function() {
  'use strict';

  var searchInput = document.getElementById('scSearchInput');
  var searchClear = document.getElementById('scSearchClear');
  var catSelect = document.getElementById('scCatSelect');
  var tableBody = document.getElementById('scTableBody');
  var statsEl = document.getElementById('scStats');
  var footerCountEl = document.getElementById('scFooterCount');

  // 获取所有分类
  function getCategories() {
    var cats = [];
    STATUS_CODES.forEach(function(item) {
      if (cats.indexOf(item.category) === -1) {
        cats.push(item.category);
      }
    });
    return cats;
  }

  // 初始化分类下拉框
  function initCategorySelect() {
    var cats = getCategories();
    cats.forEach(function(cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });
  }

  // 过滤状态码
  function filterCodes() {
    var keyword = (searchInput.value || '').trim().toLowerCase();
    var selectedCat = catSelect.value;

    var filtered = STATUS_CODES.filter(function(item) {
      // 分类过滤
      if (selectedCat !== 'all' && item.category !== selectedCat) {
        return false;
      }
      // 关键词过滤（包含解决方法字段）
      if (keyword) {
        return item.name.toLowerCase().indexOf(keyword) !== -1 ||
               item.value.toLowerCase().indexOf(keyword) !== -1 ||
               item.description.toLowerCase().indexOf(keyword) !== -1 ||
               (item.solution && item.solution.toLowerCase().indexOf(keyword) !== -1);
      }
      return true;
    });

    renderTable(filtered);
  }

  // 渲染表格
  function renderTable(data) {
    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="sc-empty">' + (typeof t === 'function' ? t('scNoMatch') : '😔 未找到匹配的状态码') + '</td></tr>';
    } else {
      var html = '';
      data.forEach(function(item, index) {
        var rowClass = item.value === '0x00000000' ? 'sc-row-success' : 'sc-row-error';
        var solutionText = item.solution || '';
        html += '<tr class="' + rowClass + '" data-name="' + item.name + '">' +
                '<td style="text-align:center">' + (index + 1) + '</td>' +
                '<td><span class="sc-cat-tag sc-cat-' + getCategoryClass(item.category) + '">' + item.category + '</span></td>' +
                '<td class="sc-code-name">' + item.name + '</td>' +
                '<td class="sc-code-value">' + item.value + '</td>' +
                '<td>' + item.description + '</td>' +
                '<td class="sc-solution">' + solutionText + '</td>' +
                '</tr>';
      });
      tableBody.innerHTML = html;
    }

    // 更新统计
    var countText = data.length + '';
    if (typeof t === 'function') {
      statsEl.textContent = t('scStats').replace('{n}', countText);
      footerCountEl.textContent = t('scCount').replace('{n}', countText);
    } else {
      statsEl.textContent = '共 ' + countText + ' 条状态码';
      footerCountEl.textContent = '共 ' + countText + ' 条';
    }
  }

  // 获取分类样式类名
  function getCategoryClass(category) {
    if (category.indexOf('正确') !== -1) return 'success';
    if (category.indexOf('通用') !== -1) return 'general';
    if (category.indexOf('GenICam') !== -1) return 'genicam';
    if (category.indexOf('设备') !== -1) return 'device';
    if (category.indexOf('USB') !== -1 || category.indexOf('U口') !== -1) return 'usb';
    if (category.indexOf('升级') !== -1) return 'upgrade';
    if (category.indexOf('网络') !== -1) return 'network';
    if (category.indexOf('IDMVS') !== -1) return 'idmvs';
    if (category.indexOf('读码器控制') !== -1) return 'control';
    if (category.indexOf('网口') !== -1) return 'ethernet';
    if (category.indexOf('底层') !== -1) return '底层';
    return 'default';
  }

  // 清空搜索
  function onClearSearch() {
    searchInput.value = '';
    searchInput.focus();
    filterCodes();
  }

  // 点击行复制状态码名称
  function onRowClick(e) {
    var tr = e.target.closest('tr');
    if (!tr || !tr.dataset.name) return;
    var name = tr.dataset.name;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(name).then(function() {
        showToast('已复制: ' + name);
      });
    } else {
      // fallback
      var textarea = document.createElement('textarea');
      textarea.value = name;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('已复制: ' + name);
    }
  }

  // 绑定事件
  function bindEvents() {
    // 搜索防抖（200ms）
    var timer;
    searchInput.addEventListener('input', function() {
      clearTimeout(timer);
      timer = setTimeout(filterCodes, 200);
    });
    searchClear.addEventListener('click', onClearSearch);
    catSelect.addEventListener('change', filterCodes);
    tableBody.addEventListener('click', onRowClick);
  }

  // 初始化
  function init() {
    if (typeof STATUS_CODES === 'undefined') {
      tableBody.innerHTML = '<tr><td colspan="6" class="sc-empty">状态码数据未加载</td></tr>';
      return;
    }
    initCategorySelect();
    bindEvents();
    filterCodes();
  }

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
