<template>
  <div id="page-verify" style="height:100%;">
    <div class="main-content" style="height:100%;">
      <div class="left-panel" style="overflow-y:auto;">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <button class="stitch-back-btn" @click="emit('close')">{{ t('verifyBack') }}</button>
            <span style="font-size:15px;font-weight:700;"><UiIcon name="chart" /> {{ t('verifyTitle') }}</span>
          </div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="camera" /> {{ t('verifyModelSel') }}</div>
            <div style="margin-bottom:6px;">
              <label for="verifySeriesSel" style="font-size:12px;color:#666;">{{ t('verifySeriesLabel') }}</label>
              <select id="verifySeriesSel" style="width:100%;" v-model="series">
                <option value="">{{ t('verifySeriesPh') }}</option>
                <option v-for="s in seriesOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div style="margin-bottom:6px;">
              <label for="verifyResSel" style="font-size:12px;color:#666;">{{ t('verifyResLabel') }}</label>
              <select id="verifyResSel" style="width:100%;" v-model="res" :disabled="!series">
                <option value="">{{ t('verifyResPh') }}</option>
                <option v-for="r in resOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div>
              <label for="verifyModelSel" style="font-size:12px;color:#666;">{{ t('verifyModelLabel') }}</label>
              <select id="verifyModelSel" style="width:100%;" v-model="modelIdx" :disabled="!series">
                <option value="">{{ t('verifyModelPh') }}</option>
                <option v-for="opt in modelOptions" :key="opt.idx" :value="opt.idx">{{ opt.model.model }} ({{ opt.model.focal ? opt.model.focal + 'mm' : 'C-Mount' }})</option>
              </select>
            </div>
            <div id="verifyModelInfo" style="margin-top:6px;font-size:12px;color:#666;" v-html="modelInfo"></div>
          </div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="ruler" /> {{ t('verifyDist') }}</div>
            <div class="input-row">
              <input name="verifyWD" id="inpVerifyWD" type="number" v-model="wd" :placeholder="t('verifyWDPh')" style="flex:1;" autocomplete="off" :aria-label="t('verifyDist')">
              <select v-model="wdUnit"><option value="mm">mm</option><option value="cm">cm</option></select>
            </div>
            <div id="verifyWDRange" style="margin-top:4px;font-size:11px;color:#f76504;" v-html="wdRangeHtml"></div>
          </div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="tag" /> {{ t('verifyBarcode') }}</div>
            <div style="margin-bottom:6px;">
              <label for="selVerifyCodeType" style="font-size:12px;color:#666;">{{ t('verifyCodeTypeLabel') }}</label>
              <select id="selVerifyCodeType" style="width:100%;" v-model="codeType">
                <option value="QR">{{ t('codeType2D') }}</option>
                <option value="Code39">{{ t('codeType1D') }}</option>
              </select>
            </div>
            <div>
              <label for="inpVerifyModuleSize" style="font-size:12px;color:#666;">{{ t('moduleSize') }}</label>
              <div class="input-row">
                <input name="verifyModuleSize" id="inpVerifyModuleSize" type="number" v-model="moduleSize" :placeholder="t('verifyModuleSizePh')" autocomplete="off">
                <select v-model="moduleUnit"><option value="mm">mm</option><option value="mil">mil</option></select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="timer" /> {{ t('verifySpeedTitle') }}</div>
            <div class="input-row">
              <input name="verifySpeed" type="number" v-model="speed" :placeholder="t('verifySpeedPh')" style="flex:1;" autocomplete="off">
              <select v-model="speedUnit"><option value="mm/s">mm/s</option><option value="m/s">m/s</option><option value="cm/s">cm/s</option></select>
            </div>
            <div style="font-size:11px;color:#888;margin-top:2px;">{{ t('verifySpeedHint') }}</div>
          </div>

          <button class="btn-primary" id="verifyRunBtn" @click="runVerify" style="width:100%;"><UiIcon name="zap" /> {{ t('verifyRunBtn') }}</button>
        </div>
      </div>

      <div class="right-panel" style="overflow-y:auto;">
        <div class="card">
          <div class="card-header"><UiIcon name="ruler" /> {{ t('verifySchematicTitle') }}</div>
          <div id="verifyCalcContent">
            <div class="schematic-wrap">
              <svg id="verifySchematicSvg" viewBox="0 0 580 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;background:#F5F7FA;border-radius:8px;">
                <rect class="svg-bg" width="580" height="300" fill="#F5F7FA" rx="8"/>
                <rect class="svg-fov-box" x="380" y="95" width="140" height="112" fill="#FFE8D6" stroke="#f76504" stroke-width="2.2" rx="6"/>
                <line x1="380" y1="120" x2="410" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="150" x2="460" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="180" x2="500" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="200" x2="520" y2="110" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="400" y1="207" x2="520" y2="150" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="440" y1="207" x2="520" y2="190" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="80" x2="520" y2="80" stroke="#f76504" stroke-width="1.2" marker-start="url(#vArrowLeftRed)" marker-end="url(#vArrowRightRed)"/>
                <text x="450" y="70" fill="#f76504" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgEstW') }}</text>
                <text class="svg-label-value" id="vLblFovW" x="450" y="58" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ vLblFovW }}</text>
                <line x1="366" y1="95" x2="366" y2="207" stroke="#f76504" stroke-width="1.2" marker-start="url(#vArrowUpRed)" marker-end="url(#vArrowDownRed)"/>
                <text x="325" y="156" fill="#f76504" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgEstH') }}</text>
                <text class="svg-label-value" id="vLblFovH" x="325" y="169" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ vLblFovH }}</text>
                <rect x="42" y="122" width="56" height="56" fill="#1A2B4A" rx="8"/>
                <rect x="50" y="130" width="40" height="40" fill="#243556" rx="6"/>
                <circle cx="70" cy="150" r="14" fill="#0A1628" stroke="#f76504" stroke-width="2"/>
                <circle cx="70" cy="150" r="7" fill="#f76504" opacity="0.7"/>
                <circle cx="70" cy="150" r="3" fill="#ffffff"/>
                <circle cx="88" cy="168" r="4" fill="#f76504"/>
                <polygon points="70,150 380,95 380,207" fill="#f76504" opacity="0.08"/>
                <line x1="70" y1="150" x2="380" y2="95"  stroke="#f76504" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"/>
                <line x1="70" y1="150" x2="380" y2="207" stroke="#f76504" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"/>
                <line x1="70" y1="265" x2="380" y2="265" stroke="#4A5A6A" stroke-width="1.2" marker-start="url(#vArrowLeftGray)" marker-end="url(#vArrowRightGray)"/>
                <text x="225" y="282" fill="#4A5A6A" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgWd') }}</text>
                <text class="svg-label-value" id="vLblWd" x="225" y="260" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ vLblWd }}</text>
                <text x="155" y="148" fill="#8A9BAC" font-size="9.5" font-family="sans-serif" text-anchor="middle">{{ t('svgFovAngle') }}</text>
                <text class="svg-label-value" id="vLblFovAngle" x="155" y="162" fill="#1A2332" font-size="10.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ vLblFovAngle }}</text>
                <defs>
                  <marker id="vArrowUpRed"    markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M3,0 L0,6 L6,6 Z" fill="#f76504"/></marker>
                  <marker id="vArrowDownRed"  markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="#f76504"/></marker>
                  <marker id="vArrowLeftRed"  markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#f76504"/></marker>
                  <marker id="vArrowRightRed" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f76504"/></marker>
                  <marker id="vArrowLeftGray"  markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#4A5A6A"/></marker>
                  <marker id="vArrowRightGray" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4A5A6A"/></marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><UiIcon name="trophy" /> {{ t('verifyResultTitle') }}</div>
          <div id="verifyResult">
            <div class="empty-state" style="padding:30px;text-align:center;color:#999;" v-if="!resultHtml">{{ t('verifyEmpty') }}</div>
            <div v-else v-html="resultHtml"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useLegacyReady } from '../composables/useLegacy'
import UiIcon from './UiIcon.vue'

const { currentLang, t } = useI18n()
const emit = defineEmits(['close'])
const legacyReady = useLegacyReady()

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  })
}

const series = ref('')
const res = ref('')
const modelIdx = ref('')
const modelInfo = ref('')
const wdRangeHtml = ref('')
const wd = ref('')
const wdUnit = ref('mm')
const codeType = ref('QR')
const moduleSize = ref('')
const moduleUnit = ref('mm')
const speed = ref('')
const speedUnit = ref('mm/s')
const resultHtml = ref('')

const vLblWd = ref('— mm')
const vLblFovW = ref('— mm')
const vLblFovH = ref('— mm')
const vLblFovAngle = ref('—')

function db() {
  legacyReady.value
  return (typeof PRODUCT_DB !== 'undefined') ? PRODUCT_DB : []
}

const seriesOptions = computed(() => {
  var map = {}
  db().forEach(function (m) {
    if (m.series && !map[m.series]) map[m.series] = true
  })
  return Object.keys(map).sort()
})
const filteredBySeries = computed(() => {
  if (!series.value) return []
  var out = []
  db().forEach(function (m, idx) {
    if (m.series === series.value) out.push({ model: m, idx: idx })
  })
  return out
})
const resOptions = computed(() => {
  var map = {}
  filteredBySeries.value.forEach(function (i) {
    if (i.model.resolution) {
      var key = i.model.resolution.w + '×' + i.model.resolution.h
      map[key] = true
    }
  })
  return Object.keys(map).sort(function (a, b) {
    var pa = parseInt(a.split('×')[0]) * parseInt(a.split('×')[1])
    var pb = parseInt(b.split('×')[0]) * parseInt(b.split('×')[1])
    return pa - pb
  })
})
const modelOptions = computed(() => {
  if (series.value && !res.value) return filteredBySeries.value
  return filteredBySeries.value.filter(function (i) {
    return i.model.resolution && (i.model.resolution.w + '×' + i.model.resolution.h) === res.value
  })
})

watch(series, function () { res.value = ''; modelIdx.value = ''; modelInfo.value = ''; wdRangeHtml.value = '' })
watch(res, function () { modelIdx.value = ''; modelInfo.value = ''; wdRangeHtml.value = '' })
watch(modelIdx, function () { updateModelInfo() })

function updateModelInfo() {
  if (modelIdx.value === '') { modelInfo.value = ''; wdRangeHtml.value = ''; return }
  var m = db()[+modelIdx.value]
  if (!m) return
  modelInfo.value = '<span style="color:#f76504;">' + esc(m.model) + '</span> · ' +
    (m.resolution ? m.resolution.w + '×' + m.resolution.h + 'px' : '') + ' · ' +
    (m.pixelSize ? m.pixelSize + 'μm' : '') + ' · ' +
    (m.focal ? m.focal + 'mm' : 'C-Mount')
  if (m.workingDist && m.workingDist.min != null) {
    var minV = m.workingDist.min
    var maxV = m.workingDist.max
    if (minV === maxV) {
      wdRangeHtml.value = t('verifyWdRec') + '<strong>' + minV + 'mm</strong>'
    } else {
      wdRangeHtml.value = t('verifyWdRange') + '<strong>' + minV + ' ~ ' + maxV + 'mm</strong>'
    }
  } else {
    wdRangeHtml.value = ''
  }
}

function toMM_v(val, unit) {
  val = parseFloat(val)
  if (isNaN(val)) return 0
  if (unit === 'mil') return val * 0.0254
  if (unit === 'cm') return val * 10
  return val
}
function estimateFOV(model, wdMM) {
  if (!model.focal || !model.pixelSize) return null
  var sensorWidth = (model.resolution.w * model.pixelSize) / 1000
  var fovWidth = (sensorWidth * wdMM) / model.focal
  var sensorHeight = (model.resolution.h * model.pixelSize) / 1000
  var fovHeight = (sensorHeight * wdMM) / model.focal
  return { width: Math.round(fovWidth), height: Math.round(fovHeight) }
}
function getPPMScoreAndLevel(ppm, codeType) {
  var is2D = codeType === 'QR'
  if (is2D) {
    if (ppm >= 4 && ppm <= 8)  return { score: 30, level: t('ppmExcellent') }
    if (ppm > 8 && ppm <= 12)  return { score: 25, level: t('ppmGood') }
    if (ppm >= 12 || (ppm >= 3 && ppm < 4)) return { score: 15, level: t('ppmPass') }
    if (ppm < 3) return { score: -15, level: t('ppmLow') }
    return { score: 0, level: t('ppmUnknown') }
  } else {
    if (ppm >= 1.4 && ppm <= 2) return { score: 30, level: t('ppmExcellent') }
    if (ppm >= 2 && ppm <= 3)   return { score: 25, level: t('ppmGood') }
    if ((ppm >= 1 && ppm < 1.4) || ppm >= 3) return { score: 15, level: t('ppmPass') }
    if (ppm < 1) return { score: -15, level: t('ppmLow') }
    return { score: 0, level: t('ppmUnknown') }
  }
}

function runVerify() {
  var modelIdxV = modelIdx.value
  var wdV = parseFloat(wd.value)
  var moduleV = parseFloat(moduleSize.value)

  if (modelIdxV === '' || isNaN(wdV) || wdV <= 0 || isNaN(moduleV) || moduleV <= 0) {
    window.showToast('请填写完整参数（型号、工作距离、模块尺寸）', 'error')
    return
  }

  var model = db()[+modelIdxV]
  var wdMM = toMM_v(wdV, wdUnit.value)
  var moduleMM = toMM_v(moduleV, moduleUnit.value)

  if (model.workingDist && model.workingDist.min != null) {
    var minV = model.workingDist.min
    var maxV = model.workingDist.max
    if (wdMM < minV || wdMM > maxV) {
      window.showToast('工作距离 ' + wdMM + 'mm 超出范围（' + minV + '~' + maxV + 'mm）', 'error')
      return
    }
  }

  var fovEst = estimateFOV(model, wdMM)
  if (!fovEst) {
    window.showToast('该型号缺少焦距/像素尺寸信息，无法计算', 'error')
    return
  }

  var sensorWidthPx = model.resolution ? model.resolution.w : 0
  var ppm = (sensorWidthPx / fovEst.width) * moduleMM
  var ppmResult = getPPMScoreAndLevel(ppm, codeType.value)

  var hAngle = 2 * Math.atan(fovEst.width / (2 * wdMM)) * (180 / Math.PI)
  var vAngle = 2 * Math.atan(fovEst.height / (2 * wdMM)) * (180 / Math.PI)

  vLblWd.value = wdMM + ' mm'
  vLblFovW.value = fovEst.width + ' mm'
  vLblFovH.value = fovEst.height + ' mm'
  vLblFovAngle.value = 'H:V=' + hAngle.toFixed(1) + '°×' + vAngle.toFixed(1) + '°'

  var exposureHtml = ''
  var speedVal = parseFloat(speed.value)
  if (!isNaN(speedVal) && speedVal > 0) {
    var speedMmS = speedUnit.value === 'm/s' ? speedVal * 1000 : (speedUnit.value === 'cm/s' ? speedVal * 10 : speedVal)
    var maxExposureUs = (moduleMM / ppm) / speedMmS * 1000000
    exposureHtml = '<div class="result-card"><strong>' + t('verifyMaxExposure') + '</strong><span>' + maxExposureUs.toFixed(0) + ' μs</span></div>'
  }

  var ppmDisplay = ppm.toFixed(2)
  var ppmLevelDisplay = ppmResult.level ? ' (' + ppmResult.level + ')' : ''

  var html
  if (exposureHtml) {
    html = '<div class="result-main" style="grid-template-columns:1fr 1fr 1fr;">' +
      '<div class="result-card"><strong>' + t('verifyModelLabel') + '</strong><span>' + esc(model.model) + '</span></div>' +
      '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
      exposureHtml +
    '</div>'
  } else {
    html = '<div class="result-main">' +
      '<div class="result-card"><strong>' + t('verifyModelLabel') + '</strong><span>' + esc(model.model) + '</span></div>' +
      '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
    '</div>'
  }
  html += '<div class="model-preview">' +
    '<span>' + (model.series || '') + ' · ' + (model.resolution ? model.resolution.w + '×' + model.resolution.h : '') + ' · ' + (model.interface || '') + '</span>' +
    '<span class="tag">' + (model.protection || '') + '</span>' +
  '</div>'

  resultHtml.value = html
}

currentLang.value
</script>