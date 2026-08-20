<template>
    <div class="page" id="page-statuscode">
      <div class="sc-page-wrap">
        <div class="sc-page">

          <!-- 工具栏 -->
          <div class="sc-toolbar">
            <div class="sc-search-wrap">
              <span class="sc-search-icon"><UiIcon name="search" /></span>
              <input type="text" id="scSearchInput" class="sc-search-input" v-model="keyword" :placeholder="t('scSearch')" autocomplete="off">
              <button class="sc-search-clear" id="scSearchClear" :title="t('scClear')" @click="onClearSearch"><UiIcon name="x" /></button>
            </div>
            <div class="sc-filter-wrap">
              <span class="sc-filter-label">{{ t('scCatLabel') }}</span>
              <select id="scCatSelect" class="sc-cat-select" v-model="cat">
                <option value="all">{{ t('scCatAll') }}</option>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <!-- 统计栏 -->
          <div class="sc-statsbar">
            <span id="scStats">{{ statsText }}</span>
            <span class="sc-statsbar-hint"><UiIcon name="lightbulb" /> {{ t('scStatsHint') }}</span>
          </div>

          <!-- 结果表格 -->
          <div class="sc-table-scroll">
            <table class="sc-table">
              <thead>
                <tr>
                  <th style="width:40px;text-align:center">#</th>
                  <th style="width:12%;text-align:center">{{ t('scThCategory') }}</th>
                  <th style="width:28%;text-align:center">{{ t('scThName') }}</th>
                  <th style="width:13%;text-align:center">{{ t('scThValue') }}</th>
                  <th style="width:20%;text-align:center">{{ t('scThDesc') }}</th>
                  <th style="text-align:center">{{ t('scThSolution') }}</th>
                </tr>
              </thead>
              <tbody id="scTableBody">
                <tr v-if="!ready"><td colspan="6" class="sc-empty">{{ t('scLoading') }}</td></tr>
                <tr v-else-if="filtered.length === 0"><td colspan="6" class="sc-empty"><UiIcon name="frown" /> {{ t('scNoMatch') }}</td></tr>
                <tr v-else v-for="(item, index) in filtered" :key="item.name" :class="rowClass(item)" @click="copyName(item.name)">
                  <td style="text-align:center">{{ index + 1 }}</td>
                  <td><span class="sc-cat-tag" :class="catClass(item.category)">{{ item.category }}</span></td>
                  <td class="sc-code-name">{{ item.name }}</td>
                  <td class="sc-code-value">{{ item.value }}</td>
                  <td>{{ item.description }}</td>
                  <td class="sc-solution" v-html="solutionHtml(item)"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="sc-footer">
            <span id="scFooterCount">{{ countText }}</span>
            <span class="sc-footer-hint"><UiIcon name="lightbulb" /> {{ t('scFooterHint') }}</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useGlobalData } from '../composables/useLegacy'
import UiIcon from './UiIcon.vue'

const { t } = useI18n()
const codes = useGlobalData('STATUS_CODES')
const ready = computed(() => codes.value !== null)

const keyword = ref('')
const cat = ref('all')

const categories = computed(() => {
  const list = codes.value || []
  const set = []
  list.forEach((item) => { if (set.indexOf(item.category) === -1) set.push(item.category) })
  return set
})

const filtered = computed(() => {
  const list = codes.value || []
  const kw = keyword.value.trim().toLowerCase()
  return list.filter((item) => {
    if (cat.value !== 'all' && item.category !== cat.value) return false
    if (kw) {
      return (item.name || '').toLowerCase().indexOf(kw) !== -1 ||
        (item.value || '').toLowerCase().indexOf(kw) !== -1 ||
        (item.description || '').toLowerCase().indexOf(kw) !== -1 ||
        (item.solution || '').toLowerCase().indexOf(kw) !== -1
    }
    return true
  })
})

const statsText = computed(() => t('scStats', filtered.value.length))
const countText = computed(() => t('scCount', filtered.value.length))

function catClass(category) {
  if (category.indexOf('正确') !== -1) return 'sc-cat-success'
  if (category.indexOf('通用') !== -1) return 'sc-cat-general'
  if (category.indexOf('GenICam') !== -1) return 'sc-cat-genicam'
  if (category.indexOf('设备') !== -1) return 'sc-cat-device'
  if (category.indexOf('USB') !== -1 || category.indexOf('U口') !== -1) return 'sc-cat-usb'
  if (category.indexOf('升级') !== -1) return 'sc-cat-upgrade'
  if (category.indexOf('网络') !== -1) return 'sc-cat-network'
  if (category.indexOf('IDMVS') !== -1) return 'sc-cat-idmvs'
  if (category.indexOf('读码器控制') !== -1) return 'sc-cat-control'
  if (category.indexOf('网口') !== -1) return 'sc-cat-ethernet'
  if (category.indexOf('底层') !== -1) return 'sc-cat-底层'
  return 'sc-cat-default'
}

function rowClass(item) {
  return item.value === '0x00000000' ? 'sc-row-success' : 'sc-row-error'
}

function solutionHtml(item) {
  return (item.solution || '').replace(/\n/g, '<br>')
}

function fallbackCopy(name, done) {
  const textarea = document.createElement('textarea')
  textarea.value = name
  document.body.appendChild(textarea)
  textarea.select()
  try { document.execCommand('copy') } catch (e) {}
  document.body.removeChild(textarea)
  done()
}

function copyName(name) {
  function done() { if (window.showToast) window.showToast(t('scCopied') + name) }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(name).then(done).catch(() => fallbackCopy(name, done))
  } else {
    fallbackCopy(name, done)
  }
}

function onClearSearch() {
  keyword.value = ''
  const input = document.getElementById('scSearchInput')
  if (input) input.focus()
}
</script>
