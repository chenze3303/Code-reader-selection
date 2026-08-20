<template>
    <div class="page" id="page-bom">
      <div class="bom-page-wrap">

        <!-- 左侧：选型配置面板 -->
        <div class="bom-left">
          <div class="bom-left-header">
            <span class="bom-left-icon">📋</span>
            <span class="bom-left-title">{{ t('bomConfig') }}</span>
          </div>
          <div class="bom-left-inner">

            <!-- 快速搜索 -->
            <div class="bom-group">
              <div class="bom-group-label">{{ t('bomQuickSearch') }}</div>
              <div class="bom-search-wrap">
                <input type="text" id="bomQuickSearch" class="bom-search-input" v-model="searchKw" :placeholder="t('bomQuickSearchPh')" @input="onSearchInput" @blur="onSearchBlur" autocomplete="off">
                <div class="bom-search-results" id="bomSearchResults" v-show="searchOpen">
                  <template v-for="(res, i) in searchResults" :key="i">
                    <div v-if="res.type === 'product'" class="bom-search-item bom-search-product" role="button" tabindex="0" @click="selectProductByMatch(res)" @keydown.enter.prevent="selectProductByMatch(res)" @keydown.space.prevent="selectProductByMatch(res)">
                      <div class="bom-search-item-name">{{ res.name }}</div>
                      <div class="bom-search-item-code">{{ res.code }}</div>
                      <div class="bom-search-item-cat">{{ res.cat }} › {{ res.ser }}</div>
                    </div>
                    <div v-else-if="res.type === 'divider'" style="border-top:1px solid var(--border,#e2e8f0);margin:4px 0"></div>
                    <div v-else class="bom-search-item bom-search-acc" role="button" tabindex="0" @click="addAccToBom(res.code)" @keydown.enter.prevent="addAccToBom(res.code)" @keydown.space.prevent="addAccToBom(res.code)">
                      <div class="bom-search-item-name">{{ res.name }} <span style="font-size:10px;color:var(--primary,#f97316)">{{ res.category }}</span></div>
                      <div class="bom-search-item-code">{{ t('bomMatCode') }}{{ res.code }}<template v-if="res.detail"> | {{ res.detail }}</template></div>
                      <div class="bom-search-item-cat">{{ t('bomFitSeriesLabel') }}
                        <span v-for="g in res.seriesGroups" :key="g.cat + '\u0001' + g.ser" class="bom-search-ser" role="button" tabindex="0" @click.stop="onSerTagClick(g, res.code)" @keydown.enter.stop.prevent="onSerTagClick(g, res.code)" @keydown.space.stop.prevent="onSerTagClick(g, res.code)">{{ g.ser || g.cat }} <b>{{ g.count }}</b></span>
                      </div>
                    </div>
                  </template>
                  <div v-if="searchOpen && searchResults.length === 0" class="bom-search-item" style="color:var(--text-muted);cursor:default">{{ t('bomNoResult') }}</div>
                </div>
              </div>
            </div>

            <!-- 型号选择区 -->
            <div class="bom-group">
              <div class="bom-group-label">{{ t('bomModelSel') }}</div>
              <div class="bom-field">
                <label class="bom-field-label" for="bomCatSel"><span class="bom-step-num">1</span> <span>{{ t('bomStep1') }}</span></label>
                <select class="bom-select" id="bomCatSel" v-model="selCat" @change="onCatChange">
                  <option value="">{{ t('bomCatPh') }}</option>
                  <option v-for="c in cats" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div class="bom-field">
                <label class="bom-field-label" for="bomSerSel"><span class="bom-step-num">2</span> <span>{{ t('bomStep2') }}</span></label>
                <select class="bom-select" id="bomSerSel" v-model="selSer" @change="onSerChange" :disabled="!selCat">
                  <option value="">{{ t('bomSerPh') }}</option>
                  <option v-for="s in serOptions" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="bom-field">
                <label class="bom-field-label" for="bomModelSel"><span class="bom-step-num">3</span> <span>{{ t('bomStep3') }}</span></label>
                <select class="bom-select" id="bomModelSel" v-model="selModelIdx" @change="onModelChange" :disabled="!selCat || !selSer">
                  <option value="">{{ t('bomModelPh') }}</option>
                  <option v-for="(m, i) in modelOptions" :key="i" :value="i">{{ m.n }}</option>
                </select>
              </div>
            </div>

            <!-- 选装配件 -->
            <div class="bom-group bom-group-acc">
              <div class="bom-group-label">{{ t('bomAcc') }}</div>
              <div class="bom-acc-list" id="bomAccList">
                <div v-if="!currentModel" class="bom-acc-empty">{{ t('bomAccEmpty') }}</div>
                <div v-else-if="accGroups.length === 0" class="bom-acc-empty" style="color:#0b5e42;">✅ {{ t('bomNoOptAcc', currentModel.standardAcc.length) }}</div>
                <template v-else>
                  <div v-for="g in accGroups" :key="g.cat" class="bom-cat-card" role="button" tabindex="0" @click="openAccModal(g.cat, g.items)" @keydown.enter.prevent="openAccModal(g.cat, g.items)" @keydown.space.prevent="openAccModal(g.cat, g.items)">
                    <div class="bom-cat-icon">{{ g.icon }}</div>
                    <div class="bom-cat-info">
                      <div class="bom-cat-name">{{ g.cat }}</div>
                      <div class="bom-cat-count">{{ t('bomAccCount', g.items.length) }}<template v-if="g.checkedCount"> · <span class="bom-cat-checked">{{ t('bomSelected', g.checkedCount) }}</span></template></div>
                    </div>
                    <div class="bom-cat-arrow">›</div>
                  </div>
                </template>
              </div>
            </div>

          </div>

          <!-- 生成按钮固定在底部 -->
          <div class="bom-left-footer">
            <button class="bom-add-btn" id="bomAddToListBtn" :disabled="!currentModel" @click="onAddToList">{{ addBtnText || t('bomAdd') }}</button>
          </div>
        </div>

        <!-- 右侧：配单明细 -->
        <div class="bom-right">

          <!-- 右侧顶部 header（与左侧配单配置对齐） -->
          <div class="bom-right-header">
            <span class="bom-left-icon">📊</span>
            <span class="bom-left-title">{{ t('bomDetail') }}</span>
          </div>

          <!-- 顶部工具栏 -->
          <div class="bom-right-toolbar">
            <div class="bom-toolbar-left">
              <div class="bom-legend-inline">
                <span class="bom-legend-item main">{{ t('bomLegendMain') }}</span>
                <span class="bom-legend-item std">{{ t('bomLegendStd') }}</span>
                <span class="bom-legend-item opt">{{ t('bomLegendOpt') }}</span>
              </div>
            </div>
            <div class="bom-toolbar-actions">
              <div class="bom-stats-row">
                <div class="bom-stat">
                  <div class="bom-stat-num" id="bomStatTotal">{{ bomList.length }}</div>
                  <div class="bom-stat-label">{{ t('bomStatTotal') }}</div>
                </div>
                <div class="bom-stat-divider"></div>
                <div class="bom-stat">
                  <div class="bom-stat-num" id="bomStatMain">{{ bomMainCount }}</div>
                  <div class="bom-stat-label">{{ t('bomStatMain') }}</div>
                </div>
                <div class="bom-stat-divider"></div>
                <div class="bom-stat">
                  <div class="bom-stat-num" id="bomStatAcc">{{ bomAccCount }}</div>
                  <div class="bom-stat-label">{{ t('bomStatAcc') }}</div>
                </div>
              </div>
              <div class="bom-toolbar-btns">
                <button class="bom-btn-reset" id="bomQClearBtn" @click="clearBOM">{{ t('bomReset') }}</button>
                <a class="bom-btn-export" id="bomDownloadBtn" :href="dlUrl" target="_blank" v-show="dlUrl" style="text-decoration:none;">{{ t('bomDownload') }}</a>
                <button class="bom-btn-export" id="bomQExportBtn" @click="exportCSV">{{ t('bomExport') }}</button>
              </div>
            </div>
          </div>

          <!-- 表格 -->
          <div class="bom-table-scroll">
            <table class="bom-q-table">
              <thead>
                <tr>
                  <th style="width:28px;text-align:center">{{ t('bomThIdx') }}</th>
                  <th style="width:88px;text-align:center">{{ t('bomThType') }}</th>
                  <th style="min-width:120px;text-align:center">{{ t('bomThName') }}</th>
                  <th style="width:56px;text-align:center">{{ t('bomThImg') }}</th>
                  <th style="text-align:center">{{ t('bomThDesc') }}</th>
                  <th style="width:96px;text-align:center">{{ t('bomThCode') }}</th>
                </tr>
              </thead>
              <tbody id="bomQBody">
                <tr v-if="bomList.length === 0"><td colspan="6" class="bom-q-empty">{{ t('bomEmpty') }}</td></tr>
                <tr v-for="(row, i) in bomList" :key="i" :class="rowClass(row)">
                  <td class="bom-q-idx" style="text-align:center;">{{ i + 1 }}</td>
                  <td style="text-align:center;"><span class="bom-q-type-badge" :class="row.type === '配件' ? ' acc' : ''">{{ row.accType || row.type }}</span></td>
                  <td class="bom-td-name" style="text-align:center;">{{ row.n }}</td>
                  <td class="bom-q-img" style="text-align:center;">
                    <img v-if="rowImgSrc(row)" class="bom-model-img" :src="rowImgSrc(row)" width="44" height="44" :alt="row.n || ''" role="button" tabindex="0" @click="openLightbox(rowImgSrc(row))" @keydown.enter.prevent="openLightbox(rowImgSrc(row))" @keydown.space.prevent="openLightbox(rowImgSrc(row))">
                  </td>
                  <td class="bom-q-desc" style="text-align:center;">{{ rowDesc(row) }}</td>
                  <td style="text-align:center;"><span class="bom-q-code">{{ row.c || '—' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bom-right-footer">
            <span id="bomQCount">{{ t('bomCount', bomList.length) }}</span>
            <span class="bom-footer-hint">{{ t('bomFooterHint') }}</span>
          </div>
        </div>

      </div>

      <!-- 选配配件 Modal -->
      <div v-if="accModalOpen" class="acc-modal-overlay" @click.self="closeAccModal">
        <div class="acc-modal-box">
          <div class="acc-modal-header">
            <span class="acc-modal-title">{{ accModalTitle }}</span>
            <button class="acc-modal-close" @click="closeAccModal">✕</button>
          </div>
          <div class="acc-modal-body">
            <div class="acc-modal-filter-wrap" id="accModalFilter" v-if="accWarning || accAvailLen.length || accAvailTex.length">
              <div v-if="accWarning" class="acc-modal-warning"><span class="acc-modal-warning-icon">⚠️</span>{{ accWarning }}</div>
              <div v-if="accAvailLen.length || accAvailTex.length" class="acc-modal-filter">
                <div v-if="accAvailLen.length" class="acc-filter-row">
                  <span class="acc-filter-label">{{ t('bomLen') }}</span>
                  <button class="acc-filter-tag" :class="{ active: accLenFilter === '' }" @click="setAccFilter('len', '')">{{ t('bomAll') }}</button>
                  <button v-for="l in accAvailLen" :key="l" class="acc-filter-tag" :class="{ active: accLenFilter === l }" @click="setAccFilter('len', l)">{{ l }}</button>
                </div>
                <div v-if="accAvailTex.length" class="acc-filter-row">
                  <span class="acc-filter-label">{{ t('bomMat') }}</span>
                  <button class="acc-filter-tag" :class="{ active: accTexFilter === '' }" @click="setAccFilter('tex', '')">{{ t('bomAll') }}</button>
                  <button v-for="tx in accAvailTex" :key="tx" class="acc-filter-tag" :class="{ active: accTexFilter === tx }" @click="setAccFilter('tex', tx)">{{ tx }}</button>
                </div>
              </div>
            </div>
            <div class="acc-modal-list">
              <div v-if="modalAccList.length === 0" class="acc-modal-no-result">{{ t('bomNoMatchAcc') }}</div>
              <div v-for="a in modalAccList" :key="a._key" class="acc-modal-item" :class="{ checked: accCodes[a._key] }" role="button" tabindex="0" @click="toggleAccInModal(a)" @keydown.enter.prevent="toggleAccInModal(a)" @keydown.space.prevent="toggleAccInModal(a)">
                <div class="acc-modal-check">{{ accCodes[a._key] ? '✓' : '' }}</div>
                <div v-if="accImgSrc(a.name)" class="acc-modal-img"><img :src="accImgSrc(a.name)" width="56" height="56" alt="" loading="lazy" role="button" tabindex="0" @click.stop="openLightbox(accImgSrc(a.name))" @keydown.enter.stop.prevent="openLightbox(accImgSrc(a.name))" @keydown.space.stop.prevent="openLightbox(accImgSrc(a.name))"></div>
                <div class="acc-modal-info">
                  <div class="acc-modal-name">{{ a.name }}</div>
                  <div class="acc-modal-code">{{ a.code }}</div>
                  <div v-if="a.detail" class="acc-modal-detail">{{ a.detail }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="acc-modal-footer">
            <span class="acc-modal-hint">{{ t('accHint') }}</span>
            <button class="acc-modal-done" @click="closeAccModal">{{ t('accDone') }}</button>
          </div>
        </div>
      </div>

      <!-- 产品主图放大 Lightbox -->
      <div v-if="lightboxOpen" class="contact-lightbox-overlay" :class="{ active: lightboxOpen }" @click="lightboxOpen = false">
        <img :src="lightboxImg" width="480" height="480" alt="产品图">
        <div class="contact-lightbox-hint">{{ t('lightboxCloseHint') }}</div>
      </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useGlobalData } from '../composables/useLegacy'

const { t } = useI18n()
const accImgs = useGlobalData('ACC_IMGS')
const productImgs = useGlobalData('PRODUCT_IMGS')
const mappingData = useGlobalData('MAPPING_DATA')
const dlUrls = useGlobalData('MAPPING_DOWNLOAD_URLS')

const STORAGE_KEY = 'hikrobot_bom_state'
const CAT_PRIORITY = ['ID800', 'ID2013EM', 'ID2000M', 'ID2000XM', 'ID3000PM', 'ID3000XM', 'ID3000RM', 'ID5000M', 'ID5000XM']
const CABLE_CATS = ['线缆', '电源线', '网线', '一体线', 'IO线', 'IO电源线']
const CAT_WARNINGS = {
  '线缆': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
  '电源线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
  '网线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
  '一体线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
  'IO线': '7m线缆无法配置下单，须订单备注删除标配线缆，再额外下单！',
  '电源': '下单适配器或开关电源时，需要选择对应线缆。'
}
const POWER_ADAPTER_SERIES = ['电源适配器', '电源适配器DC']
const POWER_SUPPLY_SERIES = ['开关电源1', '开关电源2']
const CABLE_LENGTHS = ['1m', '2m', '3m', '3.5m', '5m', '7m', '10m', '15m', '20m', '30m']
const CABLE_TEXTURES = ['普通', '高柔', '超柔', '弯头']
const CAT_ICONS = { '线缆': '🔌', '网线': '🌐', '电源线': '🔋', '电源': '⚡', '安装': '🔩', '安装板': '📐', '其他': '📦', '外置配件': '🔧', '镜头': '🔍', '测试镜头': '👁', '镜头罩': '🛡', '光源': '💡', '微码光源': '🔬', '爆闪光源': '✨', '灯板': '💎', '大类': '📋', '一体线': '🔌', 'IO线': '🔗', 'FA镜头': '🔭', '扩展配件': '📦' }

function getAccKey(acc, index) {
  return (acc.code || 'no-code') + '||' + (acc.name || 'no-name') + '||' + index
}
function getCatIcon(cat) { return CAT_ICONS[cat] || '📦' }
function getCableTags(name, detail) {
  const text = (name || '') + ' ' + (detail || '')
  const found = text.match(/(\d+(?:\.\d+)?)m(?!m)/g) || []
  const lengths = [], textures = []
  CABLE_LENGTHS.forEach((l) => { if (found.indexOf(l) !== -1) lengths.push(l) })
  CABLE_TEXTURES.forEach((tt) => { if (text.indexOf(tt) !== -1) textures.push(tt) })
  if (textures.length === 0) {
    if (/\bHF\b/.test(text)) textures.push('高柔')
    if (/\bSF\b/.test(text)) textures.push('超柔')
    if (/\bST\b/.test(text)) textures.push('普通')
  }
  return { lengths, textures }
}
function getAccImg(name) {
  if (!name || !accImgs.value) return ''
  const n = name
    .replace(/([,_-])(\d+(?:\.\d+)?)m\b/g, '$1{LEN}m')
    .replace(/([,_-])(\d+(?:\.\d+)?)米/g, '$1{LEN}米')
    .replace(/(\d+(?:\.\d+)?)米/g, '{LEN}米')
  return accImgs.value[n] || ''
}

const tree = ref({})
const cats = ref([])
const reverseIndex = ref({})

const selCat = ref('')
const selSer = ref('')
const selModelIdx = ref(null)
const accCodes = ref({})
const bomList = ref([])
const addBtnText = ref('')

function buildTreeData(modelList) {
  const tr = {}
  modelList.forEach((item, index) => {
    const cat = (item.productCategory || '未分类').trim()
    const ser = (item.productSeries || '未分类').trim()
    const model = (item.productModel || '未知型号').trim()
    if (!tr[cat]) tr[cat] = {}
    if (!tr[cat][ser]) tr[cat][ser] = { mains: [] }
    const exists = tr[cat][ser].mains.some((m) => m.n === model)
    if (!exists) {
      tr[cat][ser].mains.push({
        n: model,
        c: item.materialCode || model,
        d: item.description || '读码器主机',
        remark: item.remark || '',
        index,
        standardAcc: (item.standardAccessories || []).map((a, idx) => ({
          name: a.name, code: a.code, detail: a.detail || '', category: a.category || '大类', series: a.series || '', _key: getAccKey(a, idx)
        })),
        optionalAcc: (item.optionalAccessories || []).map((a, idx) => ({
          name: a.name, code: a.code, detail: a.detail || '', category: a.category || '其他', series: a.series || '', _key: getAccKey(a, idx)
        }))
      })
    }
  })
  const catList = Object.keys(tr).sort((a, b) => {
    let ia = -1, ib = -1
    for (let i = 0; i < CAT_PRIORITY.length; i++) {
      if (a.indexOf(CAT_PRIORITY[i]) === 0) ia = i
      if (b.indexOf(CAT_PRIORITY[i]) === 0) ib = i
    }
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  const sorted = {}
  catList.forEach((cat) => {
    const sers = Object.keys(tr[cat]).sort()
    sorted[cat] = {}
    sers.forEach((s) => { sorted[cat][s] = tr[cat][s] })
  })
  return { tree: sorted, cats: catList }
}

function buildReverseIndex(modelList) {
  const idx = {}
  modelList.forEach((item) => {
    const model = item.productModel || ''
    const cat = (item.productCategory || '').trim()
    const ser = (item.productSeries || '').trim()
    const std = item.standardAccessories || []
    const allAcc = std.concat(item.optionalAccessories || [])
    allAcc.forEach((acc, i) => {
      const code = acc.code || ''
      if (!code) return
      const isStd = i < std.length
      if (!idx[code]) {
        idx[code] = { name: acc.name || '', category: acc.category || '', series: acc.series || '', detail: acc.detail || '', models: [] }
      }
      const exists = idx[code].models.some((m) => m.name === model && m.cat === cat && m.ser === ser)
      if (!exists) idx[code].models.push({ name: model, type: isStd ? 'standard' : 'optional', cat, ser })
    })
  })
  return idx
}

function buildData(raw) {
  if (!raw || !raw.modelList || raw.modelList.length === 0) { console.warn('PEIDAN_DATA invalid or empty'); return }
  const built = buildTreeData(raw.modelList)
  tree.value = built.tree
  cats.value = built.cats
  reverseIndex.value = buildReverseIndex(raw.modelList)
  loadState()
}

function loadPeidan() {
  const done = () => {
    if (window.PEIDAN_DATA) buildData(window.PEIDAN_DATA)
    else console.warn('PEIDAN_DATA not defined')
  }
  if (window.PEIDAN_DATA) { buildData(window.PEIDAN_DATA); return }
  const existing = document.querySelector('script[src*="peidan.min.js"]')
  if (existing) { existing.addEventListener('load', done); return }
  const script = document.createElement('script')
  script.src = 'js/data/peidan.min.js'
  script.onload = done
  script.onerror = () => { console.error('peidan.min.js load failed') }
  document.head.appendChild(script)
}

const currentModel = computed(() => {
  const m = tree.value[selCat.value] && tree.value[selCat.value][selSer.value] ? tree.value[selCat.value][selSer.value].mains : []
  if (selModelIdx.value === null || selModelIdx.value === '') return null
  return m[selModelIdx.value] || null
})

const serOptions = computed(() => {
  if (!selCat.value || !tree.value[selCat.value]) return []
  return Object.keys(tree.value[selCat.value]).sort()
})
const modelOptions = computed(() => {
  if (!selCat.value || !selSer.value || !tree.value[selCat.value] || !tree.value[selCat.value][selSer.value]) return []
  return tree.value[selCat.value][selSer.value].mains || []
})

const accGroups = computed(() => {
  const m = currentModel.value
  if (!m) return []
  const groups = []
  const seen = {}
  ;(m.optionalAcc || []).forEach((a) => {
    const cat = a.category || t('bomOther')
    if (!seen[cat]) { seen[cat] = groups.length; groups.push({ cat, items: [] }) }
    groups[seen[cat]].items.push(a)
  })
  return groups.map((g) => ({
    cat: g.cat,
    items: g.items,
    icon: getCatIcon(g.cat),
    checkedCount: g.items.filter((a) => accCodes.value[a._key]).length
  }))
})

const bomMainCount = computed(() => bomList.value.filter((r) => r.type === '主机').length)
const bomAccCount = computed(() => bomList.value.filter((r) => r.type === '配件').length)

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cat: selCat.value, ser: selSer.value, modelIdx: selModelIdx.value, accCodes: accCodes.value, bomList: bomList.value }))
  } catch (e) {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const state = JSON.parse(raw)
    if (!state || !state.cat) return false
    if (!tree.value[state.cat]) return false
    if (state.ser && !tree.value[state.cat][state.ser]) return false
    if (state.modelIdx !== null && state.modelIdx !== undefined) {
      const mains = tree.value[state.cat] && tree.value[state.cat][state.ser] ? tree.value[state.cat][state.ser].mains : []
      if (!mains || state.modelIdx >= mains.length) return false
    }
    selCat.value = state.cat
    selSer.value = state.ser || ''
    selModelIdx.value = state.modelIdx
    accCodes.value = state.accCodes || {}
    bomList.value = state.bomList || []
    return true
  } catch (e) { return false }
}

function autoGenerateBOM() {
  const m = currentModel.value
  if (!m) return
  const qty = 1
  const newBom = []
  newBom.push({ type: '主机', n: m.n, c: m.c, d: m.d, remark: m.remark || '', qty, cat: selCat.value, ser: selSer.value })
  const selectedOptCats = {}
  ;(m.optionalAcc || []).forEach((a) => {
    if (a.code && a.name && accCodes.value[a._key]) selectedOptCats[a.category] = true
  })
  ;(m.standardAcc || []).forEach((a) => {
    if (a.code && a.name && !selectedOptCats[a.category]) {
      newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty, accType: '标配', cat: selCat.value, ser: selSer.value })
    }
  })
  ;(m.optionalAcc || []).forEach((a) => {
    if (a.code && a.name && accCodes.value[a._key]) {
      newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty, accType: '选配', cat: selCat.value, ser: selSer.value })
    }
  })
  bomList.value = newBom
  saveState()
}

function onCatChange() {
  selSer.value = ''
  selModelIdx.value = null
  accCodes.value = {}
  bomList.value = []
  saveState()
}
function onSerChange() {
  selModelIdx.value = null
  accCodes.value = {}
  bomList.value = []
  saveState()
}
function onModelChange() {
  const v = selModelIdx.value
  selModelIdx.value = (v === '' || v === null) ? null : Number(v)
  accCodes.value = {}
  bomList.value = []
  saveState()
  if (currentModel.value) autoGenerateBOM()
}
function onAddToList() {
  if (!currentModel.value) return
  autoGenerateBOM()
  addBtnText.value = '✓ ' + t('bomUpdated')
  setTimeout(() => { addBtnText.value = '✓ ' + t('bomAutoGen') }, 1000)
}
function clearBOM() {
  if (!bomList.value.length) return
  accCodes.value = {}
  if (currentModel.value) autoGenerateBOM()
  else bomList.value = bomList.value.filter((r) => r.type === '主机' || r.accType === '标配')
  saveState()
}

function extractSeries(name) {
  const m = (name || '').match(/(?:MV-)?(ID[A-Z0-9]+[A-Z]?)/i)
  return m ? m[1].toUpperCase() : ''
}
function cleanName(name) {
  return (name || '').replace(/[\(（].*?[\)）]/g, '').replace(/V\d+\.\d+/g, '').replace(/\s+/g, '').trim()
}
function findMappingMatch(bomName) {
  if (!bomName || !mappingData.value) return null
  const md = mappingData.value
  const c = cleanName(bomName)
  const p = extractSeries(bomName)
  for (let i = 0; i < md.length; i++) {
    const r = md[i]
    const cb = cleanName(r.baseName || '')
    const cd = cleanName(r.distName || '')
    if (r.baseName && r.baseName.indexOf(bomName) !== -1) return r
    if (r.distName && r.distName.indexOf(bomName) !== -1) return r
    if (cb && c.indexOf(cb) !== -1) return r
    if (cd && c.indexOf(cd) !== -1) return r
    if (cb && cb.indexOf(c) !== -1) return r
    if (cd && cd.indexOf(c) !== -1) return r
  }
  if (p) {
    for (let i = 0; i < md.length; i++) {
      if (extractSeries(md[i].baseName) === p || extractSeries(md[i].distName) === p) return md[i]
    }
  }
  return null
}

const dlUrl = computed(() => {
  const hostRow = bomList.value.find((r) => r.type === '主机')
  if (!hostRow || !mappingData.value || !dlUrls.value) return ''
  const match = findMappingMatch(hostRow.n)
  if (match) {
    const u = dlUrls.value.getBaseUrl(match.cat) || ''
    if (u) return u
  }
  if (dlUrls.value.getSpecUrl) return dlUrls.value.getSpecUrl(hostRow.n) || ''
  return ''
})

function rowClass(row) {
  return row.type === '主机' ? 'bom-row-main' : (row.accType === '标配' ? 'bom-row-std' : 'bom-row-opt')
}
function rowDesc(row) {
  let text = row.d || ''
  if (row.type === '主机' && row.remark) text += ' (' + row.remark + ')'
  return text
}
function rowImgSrc(row) {
  if (row.type === '主机') {
    const img = (productImgs.value && productImgs.value[row.n]) ? productImgs.value[row.n] : ''
    return img ? 'assets/products/webp/' + img : ''
  }
  if (row.type === '配件') {
    const img = getAccImg(row.n)
    return img ? 'assets/accessories/webp/' + img : ''
  }
  return ''
}
function openLightbox(src) {
  if (!src) return
  lightboxImg.value = src
  lightboxOpen.value = true
}

const lightboxOpen = ref(false)
const lightboxImg = ref('')

function exportCSV() {
  if (!bomList.value.length) { alert(t('bomEmptyAlert')); return }
  const rows = [[t('bomCsvHash'), t('bomCsvType'), t('bomCsvName'), t('bomCsvDesc'), t('bomCsvCode')]].concat(
    bomList.value.map((r, i) => {
      const code = r.type === '主机' ? '-' : r.c
      return [i + 1, r.type + (r.accType ? ' (' + r.accType + ')' : ''), r.n, r.d, code]
    })
  )
  const csv = rows.map((r) => r.map((v) => '"' + String(v || '').replace(/"/g, '""') + '"').join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat('en-CA').format(now)
  a.download = 'HIKROBOT_' + t('bomCsvNameFile') + '_' + dateStr + '.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

const searchKw = ref('')
const searchResults = ref([])
const searchOpen = ref(false)
let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  const kw = searchKw.value.trim().toLowerCase()
  if (!kw) { searchOpen.value = false; searchResults.value = []; return }
  searchTimer = setTimeout(() => { runSearch(kw) }, 200)
}
function onSearchBlur() {
  setTimeout(() => { searchOpen.value = false }, 200)
}
function runSearch(kw) {
  const products = []
  const accs = []
  cats.value.forEach((cat) => {
    const sers = Object.keys(tree.value[cat] || {})
    sers.forEach((ser) => {
      const mains = (tree.value[cat][ser] && tree.value[cat][ser].mains) || []
      mains.forEach((m, idx) => {
        if ((m.n || '').toLowerCase().indexOf(kw) !== -1 || (m.c || '').toLowerCase().indexOf(kw) !== -1) {
          products.push({ type: 'product', name: m.n, code: m.c, cat, ser, idx })
        }
      })
    })
  })
  Object.keys(reverseIndex.value).forEach((code) => {
    const info = reverseIndex.value[code]
    if (code.toLowerCase().indexOf(kw) !== -1 || (info.name || '').toLowerCase().indexOf(kw) !== -1) {
      const serMap = {}
      info.models.forEach((mm) => {
        const key = (mm.cat || '') + '\u0001' + (mm.ser || '')
        if (!serMap[key]) serMap[key] = { cat: mm.cat, ser: mm.ser, count: 0 }
        serMap[key].count++
      })
      accs.push({ type: 'acc', code, name: info.name, category: info.category, detail: info.detail, seriesGroups: Object.keys(serMap).map((k) => serMap[k]) })
    }
  })
  const out = products.slice(0, 15).map((p) => Object.assign({}, p, { type: 'product' }))
  if (products.length && accs.length) out.push({ type: 'divider' })
  accs.slice(0, 10).forEach((a) => out.push(a))
  searchResults.value = out
  searchOpen.value = true
}

function selectProductByMatch(m, extraAccCode) {
  selCat.value = m.cat
  selSer.value = m.ser
  selModelIdx.value = m.idx
  accCodes.value = {}
  bomList.value = []
  autoGenerateBOM()
  if (extraAccCode) {
    const info = reverseIndex.value[extraAccCode]
    if (info) {
      const exists = bomList.value.some((r) => r.c === extraAccCode)
      if (!exists) {
        bomList.value.push({ type: '配件', n: info.name, c: extraAccCode, d: info.detail || '', qty: 1, accType: '选配', cat: info.category, ser: info.series })
      }
    }
  }
  saveState()
  searchKw.value = ''
  searchOpen.value = false
}
function addAccToBom(code) {
  const info = reverseIndex.value[code]
  if (!info) return
  if (bomList.value.some((r) => r.c === code)) {
    alert(t('bomExists'))
    searchKw.value = ''
    searchOpen.value = false
    return
  }
  bomList.value.push({ type: '配件', n: info.name, c: code, d: info.detail || '', qty: 1, accType: '选配', cat: info.category, ser: info.series })
  saveState()
  searchKw.value = ''
  searchOpen.value = false
}
function onSerTagClick(g, accCode) {
  const mains = tree.value[g.cat] && tree.value[g.cat][g.ser] ? tree.value[g.cat][g.ser].mains : []
  if (mains.length) selectProductByMatch({ cat: g.cat, ser: g.ser, idx: 0, name: mains[0].n, code: mains[0].c }, accCode)
  else addAccToBom(accCode)
}

const accModalOpen = ref(false)
const accCatName = ref('')
const accItems = ref([])
const accLenFilter = ref('')
const accTexFilter = ref('')
const accModalTitle = computed(() => getCatIcon(accCatName.value) + ' ' + accCatName.value)
const accWarning = computed(() => CAT_WARNINGS[accCatName.value] || '')
const accAvailLen = computed(() => {
  const seen = []
  accItems.value.forEach((a) => {
    getCableTags(a.name, a.detail).lengths.forEach((l) => { if (seen.indexOf(l) === -1) seen.push(l) })
  })
  return CABLE_LENGTHS.filter((l) => seen.indexOf(l) !== -1)
})
const accAvailTex = computed(() => {
  const seen = []
  accItems.value.forEach((a) => {
    getCableTags(a.name, a.detail).textures.forEach((tt) => { if (seen.indexOf(tt) === -1) seen.push(tt) })
  })
  return CABLE_TEXTURES.filter((tt) => seen.indexOf(tt) !== -1)
})
const modalAccList = computed(() => {
  const fl = accLenFilter.value
  const ft = accTexFilter.value
  if (!fl && !ft) return accItems.value
  return accItems.value.filter((a) => {
    const tags = getCableTags(a.name, a.detail)
    const lenOK = !fl || tags.lengths.indexOf(fl) !== -1
    const texOK = !ft || tags.textures.indexOf(ft) !== -1
    return lenOK && texOK
  })
})
function openAccModal(catName, items) {
  accModalOpen.value = true
  accCatName.value = catName
  accItems.value = items
  accLenFilter.value = ''
  accTexFilter.value = ''
}
function closeAccModal() { accModalOpen.value = false }
function setAccFilter(type, val) {
  if (type === 'len') accLenFilter.value = val
  else accTexFilter.value = val
}
function toggleAccInModal(a) {
  const key = a._key
  const wasChecked = !!accCodes.value[key]
  accCodes.value[key] = !wasChecked
  const isChecked = !wasChecked
  if (accCatName.value === '电源') {
    const ms = a.series
    let targetSeries = null
    if (POWER_ADAPTER_SERIES.indexOf(ms) !== -1) targetSeries = ['电源适配器线缆']
    else if (ms === '电源适配器线缆') targetSeries = POWER_ADAPTER_SERIES
    else if (POWER_SUPPLY_SERIES.indexOf(ms) !== -1) targetSeries = ['开关电源线缆']
    else if (ms === '开关电源线缆') targetSeries = POWER_SUPPLY_SERIES
    if (targetSeries) {
      const target = accItems.value.find((x) => x.series && targetSeries.indexOf(x.series) !== -1 && (isChecked ? !accCodes.value[x._key] : accCodes.value[x._key]))
      if (target) accCodes.value[target._key] = isChecked
    }
  }
  autoGenerateBOM()
}

function accImgSrc(name) {
  const img = getAccImg(name)
  return img ? 'assets/accessories/webp/' + img : ''
}

onMounted(() => {
  window.BOM = {
    init: () => {},
    applyData: () => {},
    exportCSV: exportCSV,
    clearBOM: clearBOM,
    getData: () => bomList.value,
    getTree: () => tree.value,
    getCats: () => cats.value,
    getReverseIndex: () => reverseIndex.value,
    rerender: () => {}
  }
  loadPeidan()
})
</script>
