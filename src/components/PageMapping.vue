<template>
  <div class="page" id="page-mapping">
    <div class="id-series-page-wrap">
      <div class="id-series-page">
        <div class="id-series-toolbar">
          <div>
            <div class="id-series-kicker">{{ labels.kicker }}</div>
            <h2 class="id-series-title">{{ labels.title }}</h2>
          </div>
          <label class="id-series-search">
            <UiIcon name="search" aria-hidden="true" />
            <input id="idSeriesSearch" v-model="keyword" type="search" :placeholder="labels.searchPlaceholder" :aria-label="labels.searchPlaceholder" autocomplete="off">
            <button v-if="keyword" type="button" class="id-series-search-clear" :aria-label="labels.clearSearch" @click="keyword = ''">×</button>
          </label>
        </div>

        <div class="id-series-layout">
          <aside class="id-series-sidebar" :aria-label="labels.sidebarTitle">
            <div class="id-series-sidebar-title"><span aria-hidden="true">📦</span>{{ labels.sidebarTitle }}</div>
            <div v-if="!ready" class="id-series-sidebar-empty">{{ labels.loading }}</div>
            <button v-for="group in groups" :key="group.name" type="button" class="id-series-item" :class="{ active: !keyword && group.name === activeSeries }" @click="selectSeries(group.name)">
              <span>{{ group.name }}</span><small>{{ group.rows.length }}</small>
            </button>
          </aside>

          <main class="id-series-main">
            <div class="id-series-main-header">
              <div>
                <div class="id-series-main-kicker">{{ keyword ? labels.searchResults : labels.currentSeries }}</div>
                <h3>{{ keyword ? labels.searchResults : (activeGroup ? activeGroup.name : labels.noSeries) }}</h3>
              </div>
              <span class="id-series-count">{{ labels.totalCount(visibleRows.length) }}</span>
            </div>

            <div v-if="error" class="id-series-state error" role="alert"><UiIcon name="alert" /> {{ labels.loadError }}</div>
            <div v-else-if="ready && visibleRows.length === 0" class="id-series-state"><UiIcon name="frown" /> {{ labels.noMatch }}</div>
            <div v-else class="id-series-results">
              <div class="id-series-table-scroll">
                <table class="id-series-table">
                  <thead><tr><th class="id-series-col-index">{{ labels.index }}</th><th class="id-series-col-type">{{ labels.type }}</th><th class="id-series-col-name">{{ labels.name }}</th><th class="id-series-col-code">{{ labels.code }}</th><th class="id-series-col-description">{{ labels.description }}</th><th class="id-series-col-remark">{{ labels.remark }}</th></tr></thead>
                  <tbody>
                    <template v-for="group in visibleGroups" :key="group.name">
                      <tr v-if="keyword && visibleGroups.length > 1" class="id-series-group-row"><th colspan="6">{{ group.name }} <span>{{ labels.totalCount(group.rows.length) }}</span></th></tr>
                      <tr v-for="(row, index) in group.rows" :key="`${group.name}-${row.kind}-${row.code}-${index}`" class="id-series-data-row" :class="{ clickable: row.kind === 'model' }" :tabindex="row.kind === 'model' ? 0 : undefined" :role="row.kind === 'model' ? 'button' : undefined" :aria-label="row.kind === 'model' ? labels.openBom(row.name) : undefined" @dblclick="row.kind === 'model' && jumpToBom(row)" @keydown.enter.prevent="row.kind === 'model' && jumpToBom(row)" @keydown.space.prevent="row.kind === 'model' && jumpToBom(row)">
                        <td class="id-series-index">{{ index + 1 }}</td>
                        <td><span class="id-series-type" :class="row.kind" :title="row.kind === 'model' ? labels.host : row.type">{{ row.kind === 'model' ? labels.host : row.type }}</span></td>
                        <td class="id-series-name"><span :title="row.name">{{ row.name }}</span><small v-if="row.kind === 'model'">{{ labels.openBomHint }}</small></td>
                        <td class="id-series-code" :title="row.code || '—'">{{ row.code || '—' }}</td>
                        <td class="id-series-description" :title="row.description || '—'">{{ row.description || '—' }}</td>
                        <td class="id-series-remark" :title="row.remark || '—'">{{ row.remark || '—' }}</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>

              <div class="id-series-card-list" :aria-label="labels.cardsLabel">
                <template v-for="group in visibleGroups" :key="`cards-${group.name}`">
                  <div v-if="keyword && visibleGroups.length > 1" class="id-series-card-group">
                    <strong>{{ group.name }}</strong><span>{{ labels.totalCount(group.rows.length) }}</span>
                  </div>
                  <article v-for="(row, index) in group.rows" :key="`card-${group.name}-${row.kind}-${row.code}-${index}`" class="id-series-card" :class="{ clickable: row.kind === 'model' }" :tabindex="row.kind === 'model' ? 0 : undefined" :role="row.kind === 'model' ? 'button' : undefined" :aria-label="row.kind === 'model' ? labels.openBom(row.name) : undefined" @dblclick="row.kind === 'model' && jumpToBom(row)" @keydown.enter.prevent="row.kind === 'model' && jumpToBom(row)" @keydown.space.prevent="row.kind === 'model' && jumpToBom(row)">
                    <div class="id-series-card-top">
                      <span class="id-series-card-index">{{ index + 1 }}</span>
                      <span class="id-series-type" :class="row.kind">{{ row.kind === 'model' ? labels.host : row.type }}</span>
                      <span class="id-series-card-kind">{{ row.kind === 'model' ? labels.host : labels.accessory }}</span>
                    </div>
                    <h4 class="id-series-card-name" :title="row.name">{{ row.name }}</h4>
                    <div class="id-series-card-code"><span>{{ labels.code }}</span>{{ row.code || '—' }}</div>
                    <p v-if="row.description" class="id-series-card-description">{{ row.description }}</p>
                    <p v-if="row.remark" class="id-series-card-remark">{{ row.remark }}</p>
                    <div v-if="row.kind === 'model'" class="id-series-card-action">{{ labels.openBomAction }} <span aria-hidden="true">→</span></div>
                  </article>
                </template>
              </div>
            </div>
            <div class="id-series-footer"><span>{{ labels.totalCount(visibleRows.length) }}</span><span>{{ labels.footerHint }}</span></div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '../composables/useI18n'
import { idSeriesRepository } from '../services/idSeriesRepository'
import UiIcon from './UiIcon.vue'

const { currentLang } = useI18n()
const catalog = ref(null)
const error = ref(false)
const keyword = ref('')
const activeSeries = ref('')

const labels = computed(() => {
  const en = currentLang.value === 'en'
  return en ? {
    kicker: 'ID PRODUCT CATALOG', title: 'ID Series', sidebarTitle: 'ID Product Series', searchPlaceholder: 'Search model, material code or description…', clearSearch: 'Clear search', loading: 'Loading series data…', searchResults: 'Search results', currentSeries: 'Current series', noSeries: 'Select a series', index: '#', type: 'Type', name: 'Material name', code: 'Material code', description: 'Description', remark: 'Remark', host: 'Host', accessory: 'Accessory', cardsLabel: 'Product card list', openBomAction: 'View BOM', noMatch: 'No matching products found. Try another keyword.', loadError: 'Series data failed to load. Please refresh and try again.', openBom: (name) => `Open BOM for ${name}`, openBomHint: 'Double-click to open BOM', footerHint: 'Double-click a host row to open its BOM configuration.', totalCount: (n) => `${n} items`
  } : {
    kicker: 'ID PRODUCT CATALOG', title: 'ID 产品系列', sidebarTitle: 'ID 产品系列', searchPlaceholder: '搜索型号、物料代码或描述…', clearSearch: '清空搜索', loading: '正在加载系列数据…', searchResults: '搜索结果', currentSeries: '当前系列', noSeries: '请选择系列', index: '序号', type: '类型', name: '物料名称', code: '物料代码', description: '描述', remark: '备注', host: '主机', accessory: '配件', cardsLabel: '产品卡片列表', openBomAction: '查看配单', noMatch: '未找到匹配产品，请调整搜索条件。', loadError: '系列数据加载失败，请刷新后重试。', openBom: (name) => `打开 ${name} 的配单表`, openBomHint: '双击打开配单表', footerHint: '双击主机型号可直接进入对应配单表。', totalCount: (n) => `共 ${n} 项`
  }
})

const ready = computed(() => !!catalog.value)
const groups = computed(() => catalog.value ? catalog.value.series : [])
const activeGroup = computed(() => groups.value.find((group) => group.name === activeSeries.value) || groups.value[0] || null)
const normalizedKeyword = computed(() => normalize(keyword.value))
const visibleGroups = computed(() => {
  if (!normalizedKeyword.value) return activeGroup.value ? [activeGroup.value] : []
  return groups.value.map((group) => ({ ...group, rows: group.rows.filter((row) => [row.name, row.code, row.description, row.remark, row.type, row.series].some((value) => normalize(value).includes(normalizedKeyword.value))) })).filter((group) => group.rows.length)
})
const visibleRows = computed(() => visibleGroups.value.flatMap((group) => group.rows))

function normalize(value) { return String(value || '').toLowerCase().replace(/[\s\-_/]+/g, '') }
function selectSeries(name) { activeSeries.value = name; keyword.value = '' }
function showMessage(message, type) { if (typeof window.showToast === 'function') window.showToast(message, type) }

function jumpToBom(row) {
  const pageTab = document.querySelector('.nav-tab[data-page="page-bom"]')
  if (pageTab) pageTab.click()
  const payload = { category: row.category, series: row.series, model: row.name, code: row.code }
  if (window.BOM && typeof window.BOM.openModel === 'function') {
    const result = window.BOM.openModel(payload)
    if (result === false) showMessage(currentLang.value === 'en' ? 'This model is not available in the BOM catalog.' : '当前型号未找到对应配单数据。', 'warning')
  } else {
    window.dispatchEvent(new CustomEvent('bom:open-model', { detail: payload }))
  }
}

async function loadData() {
  try {
    catalog.value = await idSeriesRepository.load()
    activeSeries.value = catalog.value.series[0] ? catalog.value.series[0].name : ''
  } catch (e) {
    error.value = true
    console.error('ID series catalog load failed:', e)
  }
}

function onKeydown(event) { if (event.key === 'Escape' && keyword.value) keyword.value = '' }

onMounted(() => {
  window.MAPPING = { applyData: () => {}, reset: () => { keyword.value = ''; activeSeries.value = groups.value[0] ? groups.value[0].name : '' }, getData: () => catalog.value, rerender: () => {}, handleTabClick: () => {} }
  document.addEventListener('keydown', onKeydown)
  loadData()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  if (window.MAPPING && window.MAPPING.getData) delete window.MAPPING
})
</script>
