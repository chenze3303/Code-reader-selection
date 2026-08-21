<template>
  <div class="page" id="page-pda">
    <div class="pda-page-wrap">
      <div class="pda-page">

        <div class="pda-filter-bar" id="pdaFilterBar">
          <div class="pda-filter-item" v-for="f in filterDefs" :key="f.key">
            <label class="acc-filter-label">{{ t(f.label) }}</label>
            <select class="pda-filter-select" :value="filters[f.key]" @change="onFilterChange(f.key, $event.target.value)">
              <option value="">{{ t('pdaAll') }}</option>
              <template v-if="f.values">
                <option v-for="pair in f.values" :key="pair[0]" :value="pair[0]">{{ t(pair[1]) }}</option>
              </template>
              <template v-else>
                <option v-for="v in filterOptions[f.key] || []" :key="v" :value="v">{{ v }}</option>
              </template>
            </select>
          </div>
        </div>

        <div class="pda-table-wrap">
          <div class="pda-table-toolbar">
            <span class="pda-table-count">{{ t('pdaCount', filteredModels.length) }}</span>
          </div>
          <div class="pda-table-scroll" id="pdaTableScroll" ref="tableScrollRef">
            <table class="pda-table" id="pdaTable">
              <thead id="pdaTableHead">
                <tr>
                  <th class="pda-th-param">{{ t('pdaModelCol') }}</th>
                  <th v-for="m in filteredModels" :key="m.sub" :title="m.sub">{{ m.sub }}</th>
                </tr>
              </thead>
              <tbody id="pdaTableBody">
                <template v-if="pdaData === null">
                  <tr v-for="i in 8" :key="'pda-sk'+i" class="skeleton-row">
                    <td class="pda-td-param"><div class="skeleton-cell skeleton-pulse w120"></div></td>
                    <td v-for="j in 5" :key="j"><div class="skeleton-cell skeleton-pulse" style="width:60px"></div></td>
                  </tr>
                </template>
                <template v-else-if="filteredModels.length">
                  <tr v-for="p in (pdaData ? pdaData.paramOrder : [])" :key="p">
                    <td class="pda-td-param" :title="p">{{ p }}</td>
                    <td v-for="m in filteredModels" :key="m.sub + '_' + p" :title="m.params[p] || ''">{{ m.params[p] || '-' }}</td>
                  </tr>
                </template>
                <tr v-else>
                  <td class="pda-empty">{{ t('pdaEmpty') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useGlobalData } from '../composables/useLegacy'

const { currentLang, t } = useI18n()
const pdaDataRef = useGlobalData('PDA_DATA')
const pdaData = computed(() => pdaDataRef.value)
const tableScrollRef = ref(null)

function pdaIpValue(m) {
  var v = (m.params['IP防护等级'] || '').toUpperCase()
  var mch = v.match(/IP\d+/)
  return mch ? mch[0] : v
}
function pdaNfcText(m) {
  var v = m.params['工作频率'] || m.params['NFC/工作频率'] || ''
  if (!v || v.indexOf('不支持') !== -1) return 'no'
  return 'yes'
}
function pdaOsValue(m) {
  var v = (m.params['操作系统'] || '').match(/Android\s*V?(\d+(?:\.\d+)?)/i)
  return v ? 'Android ' + v[1] : (m.params['操作系统'] || '').trim()
}
function pdaScreenValue(m) {
  var v = (m.params['显示屏'] || '').match(/(\d+(?:\.\d+)?)英寸/)
  return v ? v[1] + '英寸' : ''
}
function pdaCpuValue(m) {
  var v = (m.params['处理器'] || '').match(/(\d+\.\d+)\s*GHz/)
  return v ? v[1] + 'GHz' : ''
}
function pdaOcrText(m) {
  var v = (m.params['OCR'] || '').trim()
  if (!v || v.indexOf('不支持') !== -1) return 'no'
  return 'yes'
}
function pdaBatteryValue(m) {
  var v = (m.params['电池'] || '').match(/(\d+)\s*mAh/)
  return v ? v[1] + 'mAh' : ''
}

const filterDefs = [
  { key: 'series', label: 'pdaSeries', get: function (m) { return m.main } },
  { key: 'ip', label: 'pdaIp', get: pdaIpValue },
  { key: 'nfc', label: 'pdaNfc', get: pdaNfcText, values: [['yes', 'pdaSupported'], ['no', 'pdaNotSupported']] },
  { key: 'os', label: 'pdaOs', get: pdaOsValue },
  { key: 'screen', label: 'pdaScreen', get: pdaScreenValue },
  { key: 'cpu', label: 'pdaCpu', get: pdaCpuValue },
  { key: 'ocr', label: 'pdaOcr', get: pdaOcrText, values: [['yes', 'pdaSupported'], ['no', 'pdaNotSupported']] },
  { key: 'battery', label: 'pdaBattery', get: pdaBatteryValue }
]

const filters = reactive({})

const filterOptions = computed(() => {
  var models = (pdaData.value && pdaData.value.models) || []
  var out = {}
  filterDefs.forEach(function (f) {
    var vals = []
    models.forEach(function (m) {
      var v = f.get(m)
      if (!v) return
      if (Array.isArray(v)) {
        v.forEach(function (x) { if (x && vals.indexOf(x) === -1) vals.push(x) })
      } else if (vals.indexOf(v) === -1) {
        vals.push(v)
      }
    })
    out[f.key] = vals
  })
  return out
})

const filteredModels = computed(() => {
  var data = pdaData.value
  if (!data) return []
  return data.models.filter(function (m) {
    for (var i = 0; i < filterDefs.length; i++) {
      var f = filterDefs[i]
      var val = filters[f.key]
      if (!val) continue
      var mv = f.get(m)
      if (Array.isArray(mv)) {
        if (mv.indexOf(val) === -1) return false
      } else if (mv !== val) {
        return false
      }
    }
    return true
  })
})

function onFilterChange(key, value) {
  filters[key] = value
}

watch(filteredModels, function () {
  nextTick(function () {
    var scrollEl = tableScrollRef.value
    if (scrollEl) {
      var total = 130 + filteredModels.value.length * 150
      scrollEl.classList.toggle('has-hscroll', total > scrollEl.clientWidth)
    }
  })
})

currentLang.value
</script>