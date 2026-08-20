<template>
    <div class="page" id="page-competitor">
      <div class="cp-page">

        <!-- 工具栏 -->
        <div class="cp-toolbar">
          <div class="cp-search-wrap">
            <input type="text" id="cpSearchInput" class="cp-search-input" v-model="keyword" :placeholder="t('cpSearch')" autocomplete="off">
          </div>
          <div class="cp-filter-wrap">
            <span class="cp-filter-label">{{ t('cpBrandLabel') }}</span>
            <select id="cpBrandSelect" class="cp-brand-select" v-model="brand">
              <option value="all">{{ t('cpBrandAll') }}</option>
              <option value="Cognex">Cognex</option>
              <option value="Keyence">Keyence</option>
              <option value="Datalogic">Datalogic</option>
              <option value="思谋">思谋</option>
              <option value="华睿">华睿</option>
              <option value="视界">视界</option>
              <option value="新大陆">新大陆</option>
            </select>
          </div>
          <button class="cp-btn-expand" id="cpExpandAllBtn" @click="toggleExpandAll">{{ allOpen ? t('cpCollapse') : t('cpExpand') }}</button>
        </div>

        <!-- 状态栏 -->
        <div class="cp-statsbar">
          <span id="cpStatsMsg">{{ t('cpStats', filtered.length) }}</span>
          <span class="cp-statsbar-hint">{{ t('cpStatsHint') }}</span>
        </div>

        <!-- 结果区 -->
        <div class="cp-result-area" id="cpResultArea">
          <div v-if="filtered.length === 0" class="cp-empty cp-empty-state">
            <span class="cp-empty-icon">🔍</span>
            <p>{{ t('cpNoMatch') }}<br><span>{{ t('cpNoMatchHint') }}</span></p>
          </div>
          <div v-else class="cp-grid">
            <div v-for="(item, idx) in filtered" :key="idx" class="cp-card">
              <div class="cp-card-header" role="button" tabindex="0" @click="toggleCard(idx)" @keydown.enter.prevent="toggleCard(idx)" @keydown.space.prevent="toggleCard(idx)">
                <div class="cp-card-left">
                  <span class="cp-brand-tag">{{ item.brand }}</span>
                  <span class="cp-model-name">{{ item.model }}</span>
                  <span class="cp-hik-badge">🔗 {{ item.hikModel }}</span>
                </div>
                <span class="cp-expand-icon">{{ isOpen(idx) ? '▼' : '▶' }}</span>
              </div>
              <div class="cp-card-detail" :class="{ open: isOpen(idx) }">
                <div class="cp-detail-row">
                  <div class="cp-detail-label competitor">📌 {{ t('cpFeatLabel') }}</div>
                  <div class="cp-detail-value competitor-desc">{{ item.competitorDesc }}</div>
                </div>
                <div class="cp-detail-row">
                  <div class="cp-detail-label advantage">✨ {{ t('cpAdvLabel') }}</div>
                  <div class="cp-detail-value advantage-text">{{ item.advantageDesc }}</div>
                </div>
                <div class="cp-detail-row last">
                  <div class="cp-detail-label">🎯 {{ t('cpRecLabel') }}</div>
                  <div class="cp-detail-value"><strong class="cp-hik-model">{{ item.hikModel }}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../composables/useI18n'
import competitorDB from '../data/competitorData'

const { t } = useI18n()

const keyword = ref('')
const brand = ref('all')
const openIds = ref(new Set())

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^mv-?/i, '')
    .replace(/[\s\-_/]+/g, '')
}

const filtered = computed(() => {
  const kw = normalize(keyword.value.trim())
  return competitorDB.filter((item) => {
    const brandOK = brand.value === 'all' || item.brand === brand.value
    const kwOK = !kw ||
      normalize(item.brand + ' ' + item.model + ' ' + item.competitorDesc).indexOf(kw) !== -1 ||
      normalize(item.hikModel).indexOf(kw) !== -1
    return brandOK && kwOK
  })
})

const allOpen = computed(() => filtered.value.length > 0 && openIds.value.size === filtered.value.length)

watch(filtered, () => { openIds.value = new Set() })

function isOpen(idx) { return openIds.value.has(idx) }
function toggleCard(idx) {
  const next = new Set(openIds.value)
  if (next.has(idx)) next.delete(idx)
  else next.add(idx)
  openIds.value = next
}
function toggleExpandAll() {
  if (allOpen.value) openIds.value = new Set()
  else openIds.value = new Set(filtered.value.map((_, i) => i))
}
</script>
