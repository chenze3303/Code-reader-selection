<template>
    <div class="page" id="page-mapping">
      <div class="mp-page-wrap">
      <div class="mp-page">

        <!-- 工具栏 -->
        <div class="mp-toolbar">
          <div class="mp-search-wrap">
            <input type="text" id="mpSearchInput" class="mp-search-input" v-model="keyword" :placeholder="t('mpSearch')" autocomplete="off">
          </div>
          <div class="mp-filter-wrap">
            <span class="mp-filter-label">{{ t('mpCatLabel') }}</span>
            <select id="mpCatSelect" class="mp-cat-select" v-model="cat">
              <option value="all">{{ t('mpCatAll') }}</option>
              <option v-for="c in cats" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <button class="mp-btn-expand" id="mpToggleAllBtn" @click="toggleAll">{{ allExpanded ? t('mpCollapse') : t('mpExpand') }}</button>
          <button class="mp-btn-naming" id="mpNamingBtn" :class="{ show: showCodeColumns }" @click="namingOpen = true">{{ t('mpNamingBtn') }}</button>
        </div>

        <!-- 状态栏 -->
        <div class="mp-statsbar">
          <span id="mpStats">{{ t('mpStats', filtered.length) }}</span>
          <span class="mp-statsbar-hint">{{ t('mpStatsHint') }}</span>
        </div>

        <!-- 表格 -->
        <div class="mp-table-scroll">
          <table class="mp-table">
            <thead>
              <tr>
                <th style="width:52px;text-align:center">#</th>
                <th style="width:28%;text-align:center">{{ t('mpThBaseModel') }}</th>
                <th v-if="showCodeColumns" style="width:110px;text-align:center">{{ t('mpThBaseCode') }}</th>
                <th style="width:50px;text-align:center">{{ t('mpThDocs') }}</th>
                <th style="width:28%;text-align:center">{{ t('mpThDistModel') }}</th>
                <th v-if="showCodeColumns" style="width:110px;text-align:center">{{ t('mpThDistCode') }}</th>
                <th style="width:50px;text-align:center">{{ t('mpThDocs') }}</th>
              </tr>
            </thead>
            <tbody id="mpTableBody">
              <tr v-if="!ready"><td :colspan="7" class="mp-empty">{{ t('mpLoading') }}</td></tr>
              <tr v-else-if="filtered.length === 0"><td :colspan="colCount" class="mp-empty">{{ t('mpNoMatch') }}</td></tr>
              <template v-for="g in groups" :key="g.cat">
                <tr class="mp-cat-row" :class="{ open: isCatOpen(g.cat) }" @click="toggleCat(g.cat)">
                  <td :colspan="colCount">
                    <span class="mp-cat-toggle">{{ isCatOpen(g.cat) ? '▼' : '▶' }}</span>
                    📂 {{ g.cat }}
                    <span class="mp-cat-badge">{{ t('mpRecords', g.items.length) }}</span>
                  </td>
                </tr>
                <template v-if="isCatOpen(g.cat)">
                  <tr v-for="(r, i) in g.items" :key="r.seq + '_' + i" class="mp-data-row">
                    <td class="mp-seq">{{ r.seq }}</td>
                    <td class="mp-base-name">{{ r.baseName }}</td>
                    <td v-if="showCodeColumns" class="mp-base-code"><span class="mp-code-tag base">{{ r.baseCode || '—' }}</span></td>
                    <td class="mp-dl-cell">
                      <a v-if="baseUrl(r)" class="mp-dl-btn base" :href="baseUrl(r)" target="_blank" :title="t('mpDlBase')">📥</a>
                      <span v-else class="mp-dl-btn disabled" :title="t('mpNone')">—</span>
                    </td>
                    <td class="mp-dist-name">{{ r.distName }}</td>
                    <td v-if="showCodeColumns" class="mp-dist-code"><span class="mp-code-tag dist">{{ r.distCode || '—' }}</span></td>
                    <td class="mp-dl-cell">
                      <a v-if="distUrl(r)" class="mp-dl-btn dist" :href="distUrl(r)" target="_blank" :title="t('mpDlDist')">📥</a>
                      <span v-else class="mp-dl-btn disabled" :title="t('mpNone')">—</span>
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>

        <div class="mp-footer">
          <span id="mpFooterCount">{{ t('mpCount', filtered.length) }}</span>
          <span class="mp-footer-hint">{{ t('mpFooterHint') }}</span>
        </div>

      </div>
      </div>

      <!-- 命名规则弹窗 -->
      <div v-if="namingOpen" class="naming-modal-overlay" id="namingModal" @click.self="closeNamingModal">
        <div class="naming-modal">
          <div class="naming-modal-header">
            <span class="naming-modal-title">{{ t('namingTitle') }}</span>
            <button class="naming-modal-close" id="namingModalClose" @click="closeNamingModal">&times;</button>
          </div>
          <div class="naming-modal-body" id="namingModalBody">
            <!-- 型号结构 -->
            <div class="naming-section">
              <div class="naming-section-title">{{ t('namingStructure') }}</div>
              <div class="naming-model-row">
                <div class="naming-blk naming-b-brand" data-naming-part="prefix" :class="{ active: namingActive === 'prefix' }" @click="toggleNamingPart('prefix')"><div class="naming-blk-top">{{ t('namingBrand') }}</div><div class="naming-blk-mid">MV</div><div class="naming-blk-bot">Machine Vision</div></div>
                <div class="naming-sep">-</div>
                <div class="naming-blk naming-b-brand" data-naming-part="prefix" :class="{ active: namingActive === 'prefix' }" @click="toggleNamingPart('prefix')"><div class="naming-blk-top">{{ t('namingCategory') }}</div><div class="naming-blk-mid">ID</div><div class="naming-blk-bot">Industrial Decoder</div></div>
                <div class="naming-blk naming-b-series" data-naming-part="series" :class="{ active: namingActive === 'series' }" @click="toggleNamingPart('series')"><div class="naming-blk-top">{{ t('namingSeries') }}</div><div class="naming-blk-mid">2023</div><div class="naming-blk-bot">{{ t('namingSeriesDesc') }}</div></div>
                <div class="naming-blk naming-b-type" data-naming-part="type" :class="{ active: namingActive === 'type' }" @click="toggleNamingPart('type')"><div class="naming-blk-top">{{ t('namingType') }}</div><div class="naming-blk-mid">XM</div><div class="naming-blk-bot">{{ t('namingTypeDesc') }}</div></div>
                <div class="naming-sep">-</div>
                <div class="naming-blk naming-b-focal" data-naming-part="focal" :class="{ active: namingActive === 'focal' }" @click="toggleNamingPart('focal')"><div class="naming-blk-top">{{ t('namingFocal') }}</div><div class="naming-blk-mid">08</div><div class="naming-blk-bot">8mm</div></div>
                <div class="naming-blk naming-b-focus" data-naming-part="focus" :class="{ active: namingActive === 'focus' }" @click="toggleNamingPart('focus')"><div class="naming-blk-top">{{ t('namingFocus') }}</div><div class="naming-blk-mid">M</div><div class="naming-blk-bot">{{ t('namingFocusDesc') }}</div></div>
                <div class="naming-sep">-</div>
                <div class="naming-blk naming-b-light" data-naming-part="light" :class="{ active: namingActive === 'light' }" @click="toggleNamingPart('light')"><div class="naming-blk-top">{{ t('namingLight') }}</div><div class="naming-blk-mid">R</div><div class="naming-blk-bot">{{ t('namingLightDesc') }}</div></div>
                <div class="naming-blk naming-b-variant" data-naming-part="variant" :class="{ active: namingActive === 'variant' }" @click="toggleNamingPart('variant')"><div class="naming-blk-top">{{ t('namingVariant') }}</div><div class="naming-blk-mid">B</div><div class="naming-blk-bot">{{ t('namingVariantDesc') }}</div></div>
                <div class="naming-blk naming-b-lens" data-naming-part="lens" :class="{ active: namingActive === 'lens' }" @click="toggleNamingPart('lens')"><div class="naming-blk-top">{{ t('namingLens') }}</div><div class="naming-blk-mid">N</div><div class="naming-blk-bot">{{ t('namingLensDesc') }}</div></div>
              </div>
              <div class="naming-struct-note" v-html="t('namingStructNote')"></div>
            </div>

            <!-- 详情区块 -->
            <div v-if="namingInfo" class="naming-detail show" id="namingDetail">
              <div class="naming-detail-header" id="namingDetailHeader">
                <span class="naming-detail-dot" :style="{ background: namingInfo.color }"></span>{{ namingInfo.title }}
              </div>
              <div class="naming-detail-body" id="namingDetailBody" v-html="namingInfo.html"></div>
            </div>

            <!-- 型号解析示例 -->
            <div class="naming-section">
              <div class="naming-section-title">{{ t('namingExamples') }}</div>
              <table class="naming-ex-table">
                <thead><tr><th style="width:32%">{{ t('namingFullModel') }}</th><th>{{ t('namingParse') }}</th></tr></thead>
                <tbody>
                  <tr><td class="naming-model">MV-ID803M-03S-WBN</td><td class="naming-parse" v-html="t('namingEx1')"></td></tr>
                  <tr><td class="naming-model">MV-ID803M-03S-WBP-R</td><td class="naming-parse" v-html="t('namingEx2')"></td></tr>
                  <tr><td class="naming-model">MV-ID2013EMI-05-RBN-U</td><td class="naming-parse" v-html="t('namingEx3')"></td></tr>
                  <tr><td class="naming-model">MV-ID2023XM-08M-RBN</td><td class="naming-parse" v-html="t('namingEx4')"></td></tr>
                  <tr><td class="naming-model">MV-ID3013PM-06M-WBN</td><td class="naming-parse" v-html="t('namingEx5')"></td></tr>
                  <tr><td class="naming-model">MV-ID3040RM-00C-NNN</td><td class="naming-parse" v-html="t('namingEx6')"></td></tr>
                  <tr><td class="naming-model">MV-ID5120RM-08L-RBN</td><td class="naming-parse" v-html="t('namingEx7')"></td></tr>
                  <tr><td class="naming-model">MV-ID5200M-00C-NNN</td><td class="naming-parse" v-html="t('namingEx8')"></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useGlobalData } from '../composables/useLegacy'
import namingData from '../data/namingData'

const { t, currentLang } = useI18n()
const mappingData = useGlobalData('MAPPING_DATA')
const dlUrls = useGlobalData('MAPPING_DOWNLOAD_URLS')
const ready = computed(() => mappingData.value !== null)

const keyword = ref('')
const cat = ref('all')
const expanded = ref({})
const showCodeColumns = ref(false)
const namingOpen = ref(false)
const namingActive = ref(null)

const colCount = computed(() => showCodeColumns.value ? 7 : 5)
const isSearching = computed(() => keyword.value.trim().length > 0)

const cats = computed(() => {
  const seen = {}
  const out = []
  ;(mappingData.value || []).forEach((r) => {
    if (r.cat && !seen[r.cat]) { seen[r.cat] = 1; out.push(r.cat) }
  })
  return out
})

function normalize(s) {
  return (s || '').toLowerCase().replace(/^[\s\-_/]*mv[-_\s]*/i, '').replace(/[\s\-_/]+/g, '')
}

const filtered = computed(() => {
  const list = mappingData.value || []
  const kw = normalize(keyword.value.trim())
  return list.filter((r) => {
    const catOK = cat.value === 'all' || r.cat === cat.value
    const kwOK = !kw || [r.baseName, r.baseCode, r.distName, r.distCode].some((v) => normalize(v).indexOf(kw) !== -1)
    return catOK && kwOK
  })
})

const groups = computed(() => {
  const map = {}
  const order = []
  filtered.value.forEach((r) => {
    if (!map[r.cat]) { map[r.cat] = []; order.push(r.cat) }
    map[r.cat].push(r)
  })
  return order.map((c) => ({ cat: c, items: map[c] }))
})

const allExpanded = computed(() => {
  const c = cats.value
  return c.length > 0 && c.every((x) => !!expanded.value[x])
})

function isCatOpen(c) { return isSearching.value ? true : !!expanded.value[c] }
function toggleCat(c) { expanded.value = { ...expanded.value, [c]: !expanded.value[c] } }
function toggleAll() {
  if (allExpanded.value) expanded.value = {}
  else {
    const next = {}
    cats.value.forEach((c) => { next[c] = true })
    expanded.value = next
  }
}

function baseUrl(r) { return dlUrls.value ? dlUrls.value.getBaseUrl(r.cat) : '' }
function distUrl(r) { return dlUrls.value ? dlUrls.value.getDistUrl(r.cat) : '' }

const namingInfo = computed(() => {
  if (!namingActive.value) return null
  const d = namingData[namingActive.value]
  if (!d) return null
  const isEn = currentLang.value === 'en'
  return { color: d.color, title: isEn ? (d.titleEn || d.title) : d.title, html: isEn ? (d.htmlEn || d.html) : d.html }
})

function toggleNamingPart(part) {
  namingActive.value = namingActive.value === part ? null : part
}
function closeNamingModal() {
  namingOpen.value = false
  namingActive.value = null
}

let tabClickCount = 0
let tabClickTimer = null
function toggleCodeColumns() {
  showCodeColumns.value = !showCodeColumns.value
  return showCodeColumns.value
}
function handleTabClick() {
  tabClickCount++
  if (tabClickTimer) clearTimeout(tabClickTimer)
  if (tabClickCount >= 4) {
    tabClickCount = 0
    toggleCodeColumns()
  } else {
    tabClickTimer = setTimeout(function () { tabClickCount = 0 }, 2000)
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && namingOpen.value) closeNamingModal()
}

onMounted(() => {
  window.MAPPING = {
    applyData: () => {},
    reset: () => {},
    getData: () => mappingData.value || [],
    rerender: () => {},
    handleTabClick: handleTabClick,
    isCodeColumnsVisible: () => showCodeColumns.value
  }
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (window.MAPPING && window.MAPPING.handleTabClick === handleTabClick) delete window.MAPPING
})
</script>
