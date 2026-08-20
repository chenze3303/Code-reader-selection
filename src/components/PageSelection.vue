<template>
  <div class="page" id="page-selection">
    <div class="main-content" v-show="!verifyOpen">
      <div class="left-panel">
        <div class="card">
          <div class="card-header"><UiIcon name="clipboard" /> <span>{{ t('card1') }}</span></div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="tag" /> <span>{{ t('sec1') }}</span></div>
            <div class="compact-grid">
              <div>
                <label for="selCodeType">{{ t('codeType') }}</label>
                <select id="selCodeType" v-model="form.codeType">
                  <option value="" disabled>{{ t('codeTypePh') }}</option>
                  <option value="QR">{{ t('codeType2D') }}</option>
                  <option value="Code39">{{ t('codeType1D') }}</option>
                </select>
              </div>
              <div>
                <label for="inpModuleSize">{{ t('moduleSize') }}</label>
                <div class="input-row">
                  <input name="moduleSize" id="inpModuleSize" type="number" v-model="form.moduleSize" :placeholder="t('placeholder')" autocomplete="off">
                  <select id="selModuleUnit" v-model="form.moduleUnit"><option value="mil">mil</option><option value="mm">mm</option></select>
                </div>
              </div>
            </div>
            <div class="code-img-container" id="codeImgContainer" v-show="!stitchMode">
              <img :src="'assets/code-type-desc.png'" data-dark-src="assets/code-type-desc-dark.png" width="575" height="241" :alt="t('imgCaption')" class="code-type-img" loading="lazy" decoding="async" @error="imgFallback">
              <div class="img-caption">{{ t('imgCaption') }}</div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title"><UiIcon name="ruler" /> <span>{{ t('sec2') }}</span></div>
            <div class="compact-grid compact-grid-1">
              <div>
                <label for="inpWorkingDistance">{{ t('workDist') }}</label>
                <div class="input-row">
                  <input name="workingDistance" id="inpWorkingDistance" type="number" v-model="form.workingDistance" :placeholder="t('placeholder')" autocomplete="off">
                  <select id="selDistanceUnit" v-model="form.distanceUnit"><option value="mm">mm</option><option value="cm">cm</option></select>
                </div>
              </div>
              <div>
                <label for="inpFovW">{{ t('fovW') }}</label>
                <div class="input-row">
                  <input name="fovWidth" id="inpFovW" type="number" v-model="form.fovWidth" :placeholder="t('placeholder')" autocomplete="off">
                  <select id="selFovUnit" v-model="form.fovUnit"><option value="mm">mm</option><option value="cm">cm</option></select>
                </div>
              </div>
              <div>
                <label for="inpFovH">{{ t('fovH') }}</label>
                <div class="input-row">
                  <input name="fovHeight" id="inpFovH" type="number" v-model="form.fovHeight" :placeholder="t('placeholder')" autocomplete="off">
                  <select id="selFovHUnit" v-model="form.fovHeightUnit"><option value="mm">mm</option><option value="cm">cm</option></select>
                </div>
              </div>
            </div>
          </div>

          <button class="btn-primary" id="runBtn" :class="{loading: running}" style="width:100%;" v-show="!stitchMode" @click="runSelection"><span v-if="!running"><UiIcon name="zap" /> {{ t('runBtn') }}</span></button>
          <button class="btn-primary" id="verifyBtn" @click="showVerifyPage" style="width:100%;margin-top:8px;background:linear-gradient(135deg,#2a4a8c,#1a3366);" v-show="!stitchMode"><UiIcon name="chart" /> {{ t('verifyTitle') }}</button>

          <div class="form-section" id="stitchCard" v-show="stitchMode">
            <div class="form-section-title" style="display:flex;justify-content:space-between;align-items:center;">
              <span><UiIcon name="link" /> {{ t('stitchTitle') }}</span>
              <button class="stitch-back-btn" id="stitchBackBtn" @click="goBackSingle"><UiIcon name="back" /> {{ t('stitchBack') }}</button>
            </div>
            <div class="compact-grid compact-grid-1">
              <div>
                <label for="inpOverlap">{{ t('overlapMM') }}</label>
                <div class="input-row">
                  <input name="overlapMM" id="inpOverlap" type="number" v-model="form.overlapMM" min="0" max="500" step="1" autocomplete="off">
                  <select><option value="mm">mm</option></select>
                </div>
              </div>
            </div>
            <button class="btn-primary" id="stitchBtn" :class="{loading: stitchRunning}" @click="runStitchCalculation"><span v-if="!stitchRunning"><UiIcon name="zap" /> {{ t('stitchBtn') }}</span></button>
            <button class="stitch-plan-switch-btn" id="stitchPlanSwitchBtn" v-show="hasStitchResults" style="margin-top:10px;" @click="planModalOpen = true">{{ t('stViewAll') }} ({{ planDisplayList.length }})</button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="card">
          <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
            <span><UiIcon name="ruler" /> {{ t('card2') }}</span>
            <button class="stitch-download-btn" id="stitchDownloadBtn" v-show="stitchMode && hasStitchResults" title="" @click="downloadStitchImage">{{ t('stitchDownloadBtn') }}</button>
          </div>
          <div id="calcContent">
            <div class="schematic-wrap" v-show="!stitchMode">
              <svg id="schematicSvg" viewBox="0 0 580 300" xmlns="http://www.w3.org/2000/svg" style="width:100%; display:block; background:#F5F7FA; border-radius:8px;">
                <rect class="svg-bg" width="580" height="300" fill="#F5F7FA" rx="8"/>
                <rect class="svg-fov-box" x="380" y="95" width="140" height="112" fill="#FFE8D6" stroke="#f76504" stroke-width="2.2" rx="6"/>
                <line x1="380" y1="120" x2="410" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="150" x2="460" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="180" x2="500" y2="95"  stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="200" x2="520" y2="110" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="400" y1="207" x2="520" y2="150" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="440" y1="207" x2="520" y2="190" stroke="#f76504" stroke-width="0.8" opacity="0.35"/>
                <line x1="380" y1="80" x2="520" y2="80" stroke="#f76504" stroke-width="1.2" marker-start="url(#arrowLeftRed)" marker-end="url(#arrowRightRed)"/>
                <text x="450" y="70" fill="#f76504" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgEstW') }}</text>
                <text class="svg-label-value" id="lblFovW" x="450" y="58" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ lblFovW }}</text>
                <line x1="366" y1="95" x2="366" y2="207" stroke="#f76504" stroke-width="1.2" marker-start="url(#arrowUpRed)" marker-end="url(#arrowDownRed)"/>
                <text x="325" y="156" fill="#f76504" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgEstH') }}</text>
                <text class="svg-label-value" id="lblFovH" x="325" y="169" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ lblFovH }}</text>
                <rect x="42" y="122" width="56" height="56" fill="#1A2B4A" rx="8"/>
                <rect x="50" y="130" width="40" height="40" fill="#243556" rx="6"/>
                <circle cx="70" cy="150" r="14" fill="#0A1628" stroke="#f76504" stroke-width="2"/>
                <circle cx="70" cy="150" r="7" fill="#f76504" opacity="0.7"/>
                <circle cx="70" cy="150" r="3" fill="#ffffff"/>
                <circle cx="88" cy="168" r="4" fill="#f76504"/>
                <polygon points="70,150 380,95 380,207" fill="#f76504" opacity="0.08"/>
                <line x1="70" y1="150" x2="380" y2="95"  stroke="#f76504" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"/>
                <line x1="70" y1="150" x2="380" y2="207" stroke="#f76504" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.6"/>
                <line x1="70" y1="265" x2="380" y2="265" stroke="#4A5A6A" stroke-width="1.2" marker-start="url(#arrowLeftGray)" marker-end="url(#arrowRightGray)"/>
                <text x="225" y="282" fill="#4A5A6A" font-size="10" font-family="sans-serif" text-anchor="middle">{{ t('svgWd') }}</text>
                <text class="svg-label-value" id="lblWd" x="225" y="260" fill="#1A2332" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ lblWd }}</text>
                <text x="155" y="148" fill="#8A9BAC" font-size="9.5" font-family="sans-serif" text-anchor="middle">{{ t('svgFovAngle') }}</text>
                <text class="svg-label-value" id="lblFovAngle" x="155" y="162" fill="#1A2332" font-size="10.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">{{ lblFovAngle }}</text>
                <defs>
                  <marker id="arrowUpRed"    markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M3,0 L0,6 L6,6 Z" fill="#f76504"/></marker>
                  <marker id="arrowDownRed"  markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="#f76504"/></marker>
                  <marker id="arrowLeftRed"  markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#f76504"/></marker>
                  <marker id="arrowRightRed" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f76504"/></marker>
                  <marker id="arrowLeftGray"  markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#4A5A6A"/></marker>
                  <marker id="arrowRightGray" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4A5A6A"/></marker>
                </defs>
              </svg>
            </div>
            <div id="stitchSvgArea" class="stitch-svg-area" v-show="stitchMode && hasStitchResults">
              <div ref="stitch3dContainerRef" id="stitch3dContainer" class="stitch-3d-container"></div>
            </div>
          </div>
        </div>

        <div class="card" v-show="!stitchMode">
          <div class="card-header"><UiIcon name="trophy" /> <span>{{ t('card3') }}</span></div>
          <div id="top1Content" v-html="top1Html" aria-live="polite" @click="onTop1ContentClick"></div>
          <button class="btn-outline" id="showModalBtn" :disabled="!modalEnabled" @click="openModal">{{ t('showModal') }}</button>
        </div>

    </div>
    </div>

    <div class="modal-overlay" id="modelModal" :class="{active: modalOpen}" @click.self="modalOpen = false">
      <div class="modal">
        <div class="modal-header">
          <h2><UiIcon name="pin" /> {{ t('modalTitle') }}</h2>
          <button class="modal-close" @click="modalOpen = false">&times;</button>
        </div>
        <div class="series-filter-bar">
          <span class="filter-label"><UiIcon name="search" /> {{ t('filterLabel') }}</span>
          <div class="filter-check-group" id="seriesCheckGroup">
            <label class="series-check" v-for="s in modalSeriesList" :key="s">
              <input type="checkbox" :value="s" v-model="modalSeriesSelected"> <span class="check-dot"></span> {{ s }}
            </label>
          </div>
          <button class="filter-reset-btn" id="resetSeriesFilterBtn" @click="modalSeriesSelected = modalSeriesList.slice()">{{ t('filterReset') }}</button>
        </div>
        <div id="modalModelList" class="modal-model-list" v-html="modalListHtml"></div>
      </div>
    </div>

    <div class="stitch-plan-modal-overlay" id="stitchPlanModal" :class="{active: planModalOpen}" @click.self="planModalOpen = false">
      <div class="stitch-plan-modal">
        <div class="stitch-plan-modal-header">
          <span>{{ t('stSelectPlan') }}</span>
          <button class="stitch-plan-modal-close" @click="planModalOpen = false">&times;</button>
        </div>
        <div class="stitch-toolbar">
          <label class="stitch-toolbar-field">{{ t('stSeriesLabel') }} <select class="stitch-select" v-model="planSeriesFilter">
            <option value="all">{{ t('stAll') }} ({{ stitchResults.length }})</option>
            <option v-for="(count, s) in planSeriesOptions" :key="s" :value="s">{{ s }} ({{ count }})</option>
          </select></label>
          <label class="stitch-toolbar-field">{{ t('stSortLabel') }} <select class="stitch-select" v-model="planSortKey">
            <option value=":">{{ t('stSortDefault') }}</option>
            <option value="count:1">{{ t('stSortCountAsc') }}</option>
            <option value="count:-1">{{ t('stSortCountDesc') }}</option>
            <option value="res:1">{{ t('stSortResAsc') }}</option>
            <option value="res:-1">{{ t('stSortResDesc') }}</option>
          </select></label>
        </div>
        <div class="stitch-plan-list" id="stitchPlanList">
          <div class="stitch-plan-item" :class="{active: i === stitchActiveIdx}" v-for="(r, i) in planDisplayList" :key="r.model.model + '_' + i" role="button" tabindex="0" @click="selectPlan(i)" @keydown.enter.prevent="selectPlan(i)" @keydown.space.prevent="selectPlan(i)">
            <div class="stitch-plan-left">
              <span class="stitch-plan-model">{{ r.model.model }}</span>
              <span class="stitch-plan-spec">{{ r.model.resolution.w }}×{{ r.model.resolution.h }}</span>
            </div>
            <div class="stitch-plan-right">
              <span class="stitch-plan-count">{{ r.grid.cols }}×{{ r.grid.rows }} = {{ r.grid.total }}{{ t('stUnits') }}</span>
              <span class="stitch-plan-ppm">PPM {{ r.ppm.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PageVerify v-show="verifyOpen" @close="verifyOpen = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import PageVerify from './PageVerify.vue'
import { useI18n } from '../composables/useI18n'
import UiIcon from './UiIcon.vue'

const { currentLang, t } = useI18n()

const imgFallbackSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22120%22%3E%3Crect width=%22400%22 height=%22120%22 fill=%22%23fef3e8%22 rx=%2212%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%23f76504%22 font-size=%2214%22%3E码制示意：QR / Code39%3C/text%3E%3C/svg%3E'
const imgFallback = (e) => { if (e && e.target) e.target.src = imgFallbackSvg }

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  })
}

const form = reactive({
  codeType: '',
  moduleSize: '',
  moduleUnit: 'mm',
  fovWidth: '',
  fovUnit: 'mm',
  fovHeight: '',
  fovHeightUnit: 'mm',
  workingDistance: '',
  distanceUnit: 'mm',
  overlapMM: '20'
})

const running = ref(false)
const stitchRunning = ref(false)
const stitchMode = ref(false)
const verifyOpen = ref(false)

const lblWd = ref('— mm')
const lblFovW = ref('— mm')
const lblFovH = ref('— mm')
const lblFovAngle = ref('—')

function updateSchematic(wdMM, estW, estH) {
  lblWd.value = wdMM + ' mm'
  lblFovW.value = (estW !== null && estW !== undefined) ? estW + ' mm' : '— mm'
  lblFovH.value = (estH !== null && estH !== undefined) ? estH + ' mm' : '— mm'
  if (estW !== null && estW !== undefined && estH !== null && estH !== undefined && wdMM > 0) {
    var hAngle = 2 * Math.atan(estW / (2 * wdMM)) * (180 / Math.PI)
    var vAngle = 2 * Math.atan(estH / (2 * wdMM)) * (180 / Math.PI)
    lblFovAngle.value = 'H:V=' + hAngle.toFixed(1) + '°×' + vAngle.toFixed(1) + '°'
  } else {
    lblFovAngle.value = '—'
  }
}
function resetSchematic() {
  lblWd.value = '— mm'
  lblFovW.value = '— mm'
  lblFovH.value = '— mm'
  lblFovAngle.value = '—'
}

function toMM(value, unit) {
  if (unit === 'mil') return value * 0.0254
  if (unit === 'cm') return value * 10
  return parseFloat(value)
}
function estimateFOV(model, wdMM) {
  if (!model.focal || !model.pixelSize) return null
  var sensorWidth = (model.resolution.w * model.pixelSize) / 1000
  var fovWidth = (sensorWidth * wdMM) / model.focal
  var sensorHeight = (model.resolution.h * model.pixelSize) / 1000
  var fovHeight = (sensorHeight * wdMM) / model.focal
  return { width: Math.round(fovWidth), height: Math.round(fovHeight) }
}
function isCodeType2D(codeType) { return codeType === 'QR' }
function getPPMFilterRange(codeType) {
  return isCodeType2D(codeType) ? { min: 3, max: 20 } : { min: 1.15, max: 4 }
}
function getPPMScoreAndLevel(ppm, codeType) {
  var is2D = isCodeType2D(codeType)
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

const cachedFilteredList = ref([])
const modalEnabled = ref(false)

const top1State = ref({ type: 'empty' })
const top1Html = computed(() => {
  var s = top1State.value
  if (s.type === 'empty') {
    return '<div class="empty-state">' + t(s.wait ? 'verifyEmptyWait' : 'emptyState') + '</div>'
  }
  if (s.type === 'result') {
    var best = s.model
    var ppmDisplay = s.ppm !== null ? s.ppm.toFixed(2) : '—'
    var ppmLevelDisplay = s.ppmLevel ? ' (' + s.ppmLevel + ')' : ''
    return '<div class="result-main">' +
      '<div class="result-card"><strong>' + t('showModal') + '</strong><span>' + best.model + '</span></div>' +
      '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
    '</div>' +
    '<div class="model-preview">' +
      '<span>' + best.series + ' · ' + best.resolution.w + '×' + best.resolution.h + ' · ' + best.interface + '</span>' +
      '<span class="tag">' + best.protection + '</span>' +
    '</div>'
  }
  var reasonTags = ''
  if (s.failReasons.indexOf('fov') !== -1) reasonTags += '<span class="stitch-hint-reason">' + t('stReasonFov') + '</span>'
  if (s.failReasons.indexOf('dist') !== -1) reasonTags += '<span class="stitch-hint-reason">' + t('stReasonDist') + '</span>'
  if (s.failReasons.indexOf('ppm') !== -1) reasonTags += '<span class="stitch-hint-reason">' + t('stReasonPpm') + '</span>'
  if (!reasonTags) reasonTags = '<span class="stitch-hint-reason">' + t('stReasonFov') + '</span>'
  var stitchBtnHtml = s.canStitch ? '<button class="stitch-hint-btn" id="showStitchBtn">' + t('stViewPlan') + '</button>' : ''
  return '<div class="stitch-hint-card">' +
    '<div class="stitch-hint-icon">' + window.uiIcon('camera') + '</div>' +
    '<div class="stitch-hint-title">' + t('stHintTitle') + '</div>' +
    '<div class="stitch-hint-desc">' + (s.canStitch ? t('stHintDescCan') : t('stHintDescNo')) + '</div>' +
    stitchBtnHtml +
    '<div class="stitch-hint-reasons">' + reasonTags + '</div>' +
  '</div>'
})
function onTop1ContentClick(e) {
  if (e.target && e.target.closest && e.target.closest('#showStitchBtn')) {
    stitchMode.value = true
    verifyOpen.value = false
  }
}

function runSelection() {
  var codeType = form.codeType
  var mSize = parseFloat(form.moduleSize)
  var mUnit = form.moduleUnit
  var fovW = parseFloat(form.fovWidth)
  var fovWUnit = form.fovUnit
  var fovH = parseFloat(form.fovHeight)
  var fovHUnit = form.fovHeightUnit
  var wd = parseFloat(form.workingDistance)
  var dUnit = form.distanceUnit

  if (!codeType || isNaN(mSize) || isNaN(fovW) || isNaN(fovH) || isNaN(wd) ||
      mSize <= 0 || fovW <= 0 || fovH <= 0 || wd <= 0) {
    alert(t('alertFillAll'))
    resetSchematic()
    top1State.value = { type: 'empty', wait: true }
    modalEnabled.value = false
    cachedFilteredList.value = []
    return
  }

  running.value = true

  requestAnimationFrame(function () {
    setTimeout(function () {
      var moduleMM = toMM(mSize, mUnit)
      var fovReqW_mm = toMM(fovW, fovWUnit)
      var fovReqH_mm = toMM(fovH, fovHUnit)
      var wdMM = toMM(wd, dUnit)
      var is2D = isCodeType2D(codeType)
      var divisor = is2D ? 5 : 1.5
      var requiredPrecision = moduleMM / divisor
      var requiredPixelsW = Math.ceil(fovReqW_mm / requiredPrecision)
      var requiredPixelsH = Math.ceil(fovReqH_mm / requiredPrecision)
      var ppmRange = getPPMFilterRange(codeType)

      if (typeof PRODUCT_DB === 'undefined') {
        alert(t('alertNoDB'))
        running.value = false
        return
      }

      var allScored = PRODUCT_DB.map(function (model) {
        var score = 0, reasons = []
        var sensorWidthPx = model.resolution.w
        var sensorHeightPx = model.resolution.h
        var fovEst = estimateFOV(model, wdMM)
        var ppm = null, ppmLevel = '', ppmScore = 0

        if (model.focal && fovEst) {
          ppm = (sensorWidthPx / fovEst.width) * moduleMM
          var ppmResult = getPPMScoreAndLevel(ppm, codeType)
          ppmScore = ppmResult.score
          ppmLevel = ppmResult.level
        }

        if (sensorWidthPx >= requiredPixelsW && sensorHeightPx >= requiredPixelsH) {
          score += 30
          reasons.push(t('reasonResOk'))
        } else if (sensorWidthPx >= requiredPixelsW * 0.8 && sensorHeightPx >= requiredPixelsH * 0.8) {
          score += 15
          reasons.push(t('reasonResNear'))
        } else {
          score -= 20
          reasons.push(t('reasonResLow'))
        }

        if (ppm !== null) {
          score += ppmScore
          reasons.push('PPM' + ppmLevel + '(' + ppm.toFixed(2) + ')')
        } else {
          score += 5
          reasons.push(t('reasonCMount'))
        }

        if (wdMM >= model.workingDist.min && wdMM <= model.workingDist.max) {
          score += 15
          reasons.push(t('reasonDistOk'))
        } else {
          score -= 5
          reasons.push(t('reasonDistFail'))
        }

        if (model.focal && fovEst) {
          if (fovEst.width >= fovReqW_mm && fovEst.height >= fovReqH_mm) {
            score += 15
            reasons.push(t('reasonFovOk'))
          } else {
            score -= 20
            reasons.push(t('reasonFovFail'))
          }
        }

        return { model: model, score: score, ppm: ppm, ppmLevel: ppmLevel, reasons: reasons, fovEst: fovEst }
      })

      allScored.sort(function (a, b) { return b.score - a.score })

      var filtered = allScored.filter(function (item) {
        var wdOK = (wdMM >= item.model.workingDist.min && wdMM <= item.model.workingDist.max)
        var ppmOK = true
        if (item.model.focal && item.ppm !== null) {
          ppmOK = (item.ppm >= ppmRange.min && item.ppm <= ppmRange.max)
        }
        var fovOK = true
        if (item.model.focal && item.fovEst) {
          fovOK = (item.fovEst.width >= fovReqW_mm && item.fovEst.height >= fovReqH_mm)
        }
        return wdOK && ppmOK && fovOK
      })

      cachedFilteredList.value = filtered
      modalEnabled.value = filtered.length > 0

      if (filtered.length > 0) {
        var best = filtered[0]
        top1State.value = { type: 'result', model: best.model, ppm: best.ppm, ppmLevel: best.ppmLevel }
        var estW = best.fovEst ? best.fovEst.width : null
        var estH = best.fovEst ? best.fovEst.height : null
        updateSchematic(wdMM, estW, estH)
        stitchMode.value = false
        verifyOpen.value = false
      } else {
        updateSchematic(wdMM, null, null)
        var failReasons = []
        allScored.forEach(function (item) {
          if (item.fovEst && (item.fovEst.width < fovReqW_mm || item.fovEst.height < fovReqH_mm)) {
            if (failReasons.indexOf('fov') === -1) failReasons.push('fov')
          }
          if (wdMM < item.model.workingDist.min || wdMM > item.model.workingDist.max) {
            if (failReasons.indexOf('dist') === -1) failReasons.push('dist')
          }
          if (item.model.focal && item.ppm !== null && item.ppm > ppmRange.max) {
            if (failReasons.indexOf('ppm') === -1) failReasons.push('ppm')
          }
        })
        var canStitch = failReasons.indexOf('ppm') === -1 && failReasons.indexOf('fov') !== -1
        top1State.value = { type: 'noResult', canStitch: canStitch, failReasons: failReasons }
      }

      running.value = false
    }, 80)
  })
}

// ─── 选型结果 Modal ───
const modalOpen = ref(false)
const modalSeriesList = computed(() => {
  var seen = []
  cachedFilteredList.value.forEach(function (i) {
    if (seen.indexOf(i.model.series) === -1) seen.push(i.model.series)
  })
  return seen
})
const modalSeriesSelected = ref([])
const modalListHtml = ref('')

function renderModalWithSeriesFilter() {
  if (!cachedFilteredList.value || cachedFilteredList.value.length === 0) {
    modalListHtml.value = '<div class="empty-state">' + t('resultModalEmpty') + '</div>'
    return
  }
  var selectedSeries = modalSeriesSelected.value
  var filteredBySeries = cachedFilteredList.value.filter(function (item) {
    return selectedSeries.indexOf(item.model.series) !== -1
  })
  if (filteredBySeries.length === 0) {
    modalListHtml.value = '<div class="warning-badge">' + (window.uiIcon ? window.uiIcon('warn') : '') + ' ' + t('resultNoMatchShort') + '</div>'
    return
  }
  var html = ''
  filteredBySeries.forEach(function (item, idx) {
    var m = item.model
    var fovEst = item.fovEst
    var ppmDisplay = item.ppm !== null ? item.ppm.toFixed(2) : '— (C-Mount)'
    var ppmLevelDisplay = item.ppmLevel ? ' (' + item.ppmLevel + ')' : ''
    var fovStatus = fovEst ? t('resultFovStatus', { w: fovEst.width, h: fovEst.height }) : window.uiIcon('wrench') + ' C-Mount'
    html += '<div class="modal-model-entry ' + (idx === 0 ? 'recommended' : '') + '">' +
      '<div class="modal-entry-header">' +
        '<span class="modal-model-name">' + m.model + '</span>' +
        '<span class="modal-model-series">' + m.series + '</span>' +
      '</div>' +
      '<div class="modal-spec-grid">' +
        '<div class="spec-item">' + window.uiIcon('dot') + ' ' + m.resolution.w + '×' + m.resolution.h + '</div>' +
        '<div class="spec-item">' + window.uiIcon('cable') + ' ' + m.interface + '</div>' +
        '<div class="spec-item">' + window.uiIcon('shield') + ' ' + m.protection + '</div>' +
        '<div class="spec-item">' + (m.focal ? window.uiIcon('search') + ' ' + m.focal + 'mm' : window.uiIcon('wrench') + ' C-Mount') + '</div>' +
      '</div>' +
      '<div class="ppm-value-row"><span>' + (window.uiIcon ? window.uiIcon('chart') : '') + ' ' + t('resultPPM') + '：<span class="ppm-value-highlight">' + ppmDisplay + '</span>' + ppmLevelDisplay + '</span></div>' +
      '<div class="info-row">' +
        '<span class="info-tag">' + t('resultDist', { min: m.workingDist.min, max: m.workingDist.max }) + '</span>' +
        '<span class="info-tag">' + fovStatus + '</span>' +
      '</div>' +
      '<div class="reasons-row">' + item.reasons.map(function (r) { return '<span class="reason-badge">' + window.uiIcon('sparkles') + ' ' + esc(r) + '</span>'; }).join('') + '</div>' +
    '</div>'
  })
  modalListHtml.value = html
}
watch(modalSeriesSelected, function () {
  if (modalOpen.value) renderModalWithSeriesFilter()
}, { deep: true })

function openModal() {
  modalSeriesSelected.value = modalSeriesList.value.slice()
  renderModalWithSeriesFilter()
  modalOpen.value = true
}

// ─── 多相机拼接计算 ───
const stitchResults = ref([])
const stitchTotalW = ref(0)
const stitchTotalH = ref(0)
const stitchBarcodeW = ref(0)
const stitchBarcodeH = ref(0)
const stitchActiveIdx = ref(0)
const planModalOpen = ref(false)
const planSeriesFilter = ref('all')
const planSortKey = ref(':')
const planAreaHtml = ref('')
const hasStitchResults = computed(() => stitchResults.value.length > 0)

const planSeriesOptions = computed(() => {
  var counts = {}
  stitchResults.value.forEach(function (r) {
    counts[r.model.series] = (counts[r.model.series] || 0) + 1
  })
  return counts
})
const planDisplayList = computed(() => {
  var list = stitchResults.value
  if (planSeriesFilter.value && planSeriesFilter.value !== 'all') {
    list = list.filter(function (r) { return r.model.series === planSeriesFilter.value })
  }
  if (list.length === 0) list = stitchResults.value
  var parts = planSortKey.value.split(':')
  var field = parts[0]
  var dir = parseInt(parts[1], 10) || 1
  if (field) {
    var arr = list.slice()
    arr.sort(function (a, b) {
      var va, vb
      if (field === 'count') {
        va = a.grid.total
        vb = b.grid.total
      } else if (field === 'res') {
        va = a.model.resolution.w * a.model.resolution.h
        vb = b.model.resolution.w * b.model.resolution.h
      } else {
        return 0
      }
      if (va === vb) return 0
      return (va - vb) * dir
    })
    list = arr
  }
  return list
})

function getCameraFOV(model, wdMM, rotation, moduleMM) {
  if (!model.focal || !model.pixelSize) return null
  var sensorW = (model.resolution.w * model.pixelSize) / 1000
  var sensorH = (model.resolution.h * model.pixelSize) / 1000
  var fovW, fovH, resW, resH
  if (rotation === 90) {
    fovW = (sensorH * wdMM) / model.focal
    fovH = (sensorW * wdMM) / model.focal
    resW = model.resolution.h
    resH = model.resolution.w
  } else {
    fovW = (sensorW * wdMM) / model.focal
    fovH = (sensorH * wdMM) / model.focal
    resW = model.resolution.w
    resH = model.resolution.h
  }
  var ppm = resW / fovW * moduleMM
  return { width: Math.round(fovW), height: Math.round(fovH), ppm: ppm, resW: resW, resH: resH }
}
function calcGrid(totalW, totalH, fovW, fovH, overlapW, overlapH) {
  var maxOverlapW = fovW * 0.8
  var maxOverlapH = fovH * 0.8
  overlapW = Math.max(0, Math.min(overlapW, maxOverlapW))
  overlapH = Math.max(0, Math.min(overlapH, maxOverlapH))
  var cols = totalW <= fovW ? 1 : Math.ceil((totalW - fovW) / (fovW - overlapW)) + 1
  var rows = totalH <= fovH ? 1 : Math.ceil((totalH - fovH) / (fovH - overlapH)) + 1
  return {
    cols: cols, rows: rows, total: cols * rows,
    actualW: Math.round(fovW + (cols - 1) * (fovW - overlapW)),
    actualH: Math.round(fovH + (rows - 1) * (fovH - overlapH)),
    overlapW: Math.round(overlapW),
    overlapH: Math.round(overlapH)
  }
}

function runStitchCalculation() {
  var codeType = form.codeType
  var mSize = parseFloat(form.moduleSize)
  var mUnit = form.moduleUnit
  var fovReqW = parseFloat(form.fovWidth)
  var fovWUnit = form.fovUnit
  var fovReqH = parseFloat(form.fovHeight)
  var fovHUnit = form.fovHeightUnit
  var wd = parseFloat(form.workingDistance)
  var dUnit = form.distanceUnit

  if (!codeType || isNaN(mSize) || isNaN(fovReqW) || isNaN(fovReqH) || isNaN(wd) ||
      mSize <= 0 || fovReqW <= 0 || fovReqH <= 0 || wd <= 0) {
    alert(t('stitchAlertBase'))
    return
  }
  var overlapInput = parseFloat(form.overlapMM)
  if (isNaN(overlapInput) || overlapInput < 0) overlapInput = 0

  stitchRunning.value = true

  requestAnimationFrame(function () {
    setTimeout(function () {
      var moduleMM = toMM(mSize, mUnit)
      var totalW = toMM(fovReqW, fovWUnit)
      var totalH = toMM(fovReqH, fovHUnit)
      var wdMM = toMM(wd, dUnit)
      var ppmRange = getPPMFilterRange(codeType)
      var effW = totalW
      var effH = totalH
      var results = []

      if (typeof PRODUCT_DB !== 'undefined') {
        PRODUCT_DB.forEach(function (model) {
          if (!model.focal) return
          if (wdMM < model.workingDist.min || wdMM > model.workingDist.max) return
          ;[0, 90].forEach(function (rot) {
            var fov = getCameraFOV(model, wdMM, rot, moduleMM)
            if (!fov) return
            if (fov.ppm < ppmRange.min || fov.ppm > ppmRange.max) return
            var overlapW = overlapInput
            var overlapH = overlapInput
            var grid
            if (fov.width >= effW && fov.height >= effH) {
              grid = { cols: 1, rows: 1, total: 1, actualW: fov.width, actualH: fov.height, overlapW: 0, overlapH: 0 }
            } else {
              grid = calcGrid(effW, effH, fov.width, fov.height, overlapW, overlapH)
            }
            if (grid.total >= 33) return
            results.push({
              model: model, rotation: rot, fov: fov, grid: grid,
              overlapW: grid.total > 1 ? grid.overlapW : 0,
              overlapH: grid.total > 1 ? grid.overlapH : 0,
              ppm: fov.ppm,
              workingDist: wdMM
            })
          })
        })
      }

      results.sort(function (a, b) {
        if (a.grid.total !== b.grid.total) return a.grid.total - b.grid.total
        var aWaste = a.grid.actualW * a.grid.actualH - effW * effH
        var bWaste = b.grid.actualW * b.grid.actualH - effW * effH
        if (Math.abs(aWaste - bWaste) > 100) return aWaste - bWaste
        return b.ppm - a.ppm
      })

      var seen = {}
      var deduped = []
      results.forEach(function (r) {
        var key = r.model.model
        if (!seen[key]) {
          seen[key] = true
          deduped.push(r)
        }
      })

      stitchResults.value = deduped
      stitchTotalW.value = totalW
      stitchTotalH.value = totalH
      stitchActiveIdx.value = 0
      stitchBarcodeW.value = 0
      stitchBarcodeH.value = 0
      planSeriesFilter.value = 'all'
      planAreaHtml.value = ''
      renderCurrentPlan()
      stitchRunning.value = false
    }, 80)
  })
}

function renderCurrentPlan(themeOnly) {
  var results = stitchResults.value
  if (!results || results.length === 0) {
    planAreaHtml.value = '<div class="stitch-warning">' + window.uiIcon('frown') + ' ' + t('stNoPlan') + '<br>' + t('stNoPlanHint') + '</div>'
    return
  }
  var display = planDisplayList.value
  if (stitchActiveIdx.value >= display.length) stitchActiveIdx.value = 0
  var best = display[stitchActiveIdx.value]
  if (!best) return

  if (themeOnly && !stitchMode.value) return
  if (themeOnly && !hasStitchResults.value) return

  nextTick(function () {
    setTimeout(function () {
      renderStitch3D(best, stitchBarcodeW.value, stitchBarcodeH.value, 'auto', stitchTotalW.value, stitchTotalH.value)
    }, 100)
  })
}

function selectPlan(i) {
  stitchActiveIdx.value = i
  planModalOpen.value = false
  renderCurrentPlan()
}

function goBackSingle() {
  stitchMode.value = false
  verifyOpen.value = false
}
function showVerifyPage() {
  verifyOpen.value = true
  stitchMode.value = false
}

// ─── 3D 拼接可视化 ───
var stitch3dContainerRef = ref(null)
var _stitch3dState = null

function renderStitch3D(plan, barcodeW, barcodeH, orient, reqW, reqH) {
  var container = stitch3dContainerRef.value
  if (!container) { console.warn('[Stitch] stitch3dContainer not found'); return '' }
  if (_stitch3dState) {
    if (_stitch3dState.animId) cancelAnimationFrame(_stitch3dState.animId)
    if (_stitch3dState.renderer) {
      _stitch3dState.renderer.dispose()
      var oldCanvas = container.querySelector('canvas')
      if (oldCanvas) oldCanvas.remove()
    }
    _stitch3dState = null
  }
  container.innerHTML = ''

  if (typeof THREE === 'undefined') {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#888">Three.js loading, please wait…</div>'
    if (!container._3dLoading) {
      container._3dLoading = true
      var s = document.createElement('script')
      s.src = 'js/three.min.js'
      s.onload = function () { renderStitch3D(plan, barcodeW, barcodeH, orient, reqW, reqH) }
      s.onerror = function () { container.innerHTML = '<div style="padding:40px;text-align:center;color:#c00">' + t('threeJsLoadErr') + '</div>' }
      document.head.appendChild(s)
    }
    return ''
  }

  try {
    _doRender3D(container, plan, barcodeW, barcodeH, orient, reqW, reqH)
  } catch (e) {
    console.error('3D render error:', e)
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#c00">3D render failed: ' + e.message + '</div>'
  }
  return ''
}

function _doRender3D(container, plan, barcodeW, barcodeH, orient, reqW, reqH) {
  var isDark = document.documentElement.classList.contains('dark')
  var cols = plan.grid.cols, rows = plan.grid.rows
  var fovW = plan.fov.width, fovH = plan.fov.height
  var actualW = plan.grid.actualW, actualH = plan.grid.actualH
  var overlapW = plan.overlapW, overlapH = plan.overlapH

  var camDepth = 200
  var sceneW = Math.max(actualW, 300)
  var sceneD = Math.max(actualH, 300)
  var sceneH = camDepth + 60

  var scene = new THREE.Scene()
  scene.background = new THREE.Color(isDark ? 0x161b22 : 0xf5f7fa)
  scene.fog = new THREE.Fog(isDark ? 0x161b22 : 0xf5f7fa, sceneW * 3, sceneW * 6)

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  var renderW = container.clientWidth || 600
  var renderH = container.clientHeight || 450
  renderer.setSize(renderW, renderH)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  var aspect = renderW / renderH
  var camera = new THREE.PerspectiveCamera(45, aspect, 1, sceneW * 10)
  camera.position.set(sceneW * 0.6, sceneH * 1.2, sceneD * 1.4)
  camera.lookAt(0, 0, 0)

  var isDragging = false, prevMouse = { x: 0, y: 0 }
  var spherical = { radius: camera.position.length(), theta: Math.atan2(camera.position.x, camera.position.z), phi: Math.acos(camera.position.y / camera.position.length()) }
  var target = new THREE.Vector3(0, 0, 0)

  function updateCamera() {
    camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi)
    camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    camera.lookAt(target)
  }
  updateCamera()

  var canvasEl = renderer.domElement
  canvasEl.addEventListener('mousedown', function (e) {
    isDragging = true
    prevMouse.x = e.clientX; prevMouse.y = e.clientY
  })
  canvasEl.addEventListener('mousemove', function (e) {
    if (!isDragging) return
    spherical.theta -= (e.clientX - prevMouse.x) * 0.005
    spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi + (e.clientY - prevMouse.y) * 0.005))
    prevMouse.x = e.clientX; prevMouse.y = e.clientY
    updateCamera()
  })
  window.addEventListener('mouseup', function () { isDragging = false })
  canvasEl.addEventListener('wheel', function (e) {
    e.preventDefault()
    spherical.radius = Math.max(sceneW * 0.3, Math.min(sceneW * 4, spherical.radius * (1 + e.deltaY * 0.001)))
    updateCamera()
  }, { passive: false })

  var touchStartDist = 0
  canvasEl.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      isDragging = true
      prevMouse.x = e.touches[0].clientX; prevMouse.y = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX
      var dy = e.touches[0].clientY - e.touches[1].clientY
      touchStartDist = Math.sqrt(dx * dx + dy * dy)
    }
  })
  canvasEl.addEventListener('touchmove', function (e) {
    e.preventDefault()
    if (e.touches.length === 1 && isDragging) {
      spherical.theta -= (e.touches[0].clientX - prevMouse.x) * 0.005
      spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, spherical.phi + (e.touches[0].clientY - prevMouse.y) * 0.005))
      prevMouse.x = e.touches[0].clientX; prevMouse.y = e.touches[0].clientY
      updateCamera()
    } else if (e.touches.length === 2) {
      var dx2 = e.touches[0].clientX - e.touches[1].clientX
      var dy2 = e.touches[0].clientY - e.touches[1].clientY
      var dist = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      if (touchStartDist > 0) {
        spherical.radius = Math.max(sceneW * 0.3, Math.min(sceneW * 4, spherical.radius * (touchStartDist / dist)))
        updateCamera()
      }
      touchStartDist = dist
    }
  }, { passive: false })
  canvasEl.addEventListener('touchend', function () { isDragging = false; touchStartDist = 0 })

  var ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.5 : 0.7)
  scene.add(ambient)
  var dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.6 : 0.8)
  dirLight.position.set(sceneW, sceneH * 2, sceneD)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  var groundSize = Math.max(sceneW, sceneD) * 2.5
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    new THREE.MeshStandardMaterial({ color: isDark ? 0x1e2430 : 0xe8ecf1, roughness: 0.9, metalness: 0.0 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  ground.receiveShadow = true
  scene.add(ground)

  var gridCol = isDark ? 0x222933 : 0xd8dde5
  var gridHelper = new THREE.GridHelper(groundSize, Math.round(groundSize / 50), gridCol, gridCol)
  gridHelper.position.y = -0.3
  scene.add(gridHelper)

  if (reqW && reqH) {
    var reqColor = 0x0A1628
    var reqShape = new THREE.Shape()
    reqShape.moveTo(-reqW / 2, -reqH / 2); reqShape.lineTo(reqW / 2, -reqH / 2)
    reqShape.lineTo(reqW / 2, reqH / 2); reqShape.lineTo(-reqW / 2, reqH / 2)
    reqShape.lineTo(-reqW / 2, -reqH / 2)
    var reqDashedMat = new THREE.LineDashedMaterial({ color: reqColor, dashSize: 8, gapSize: 5, linewidth: 1 })
    var reqCorners = [
      [-reqW / 2, -reqH / 2], [reqW / 2, -reqH / 2],
      [reqW / 2, reqH / 2], [-reqW / 2, reqH / 2]
    ]
    for (var ri = 0; ri < 4; ri++) {
      var p1 = reqCorners[ri], p2 = reqCorners[(ri + 1) % 4]
      var reqLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1[0], 0.5, p1[1]),
        new THREE.Vector3(p2[0], 0.5, p2[1])
      ])
      var reqLine = new THREE.Line(reqLineGeo, reqDashedMat)
      reqLine.computeLineDistances()
      scene.add(reqLine)
    }
    var reqFace = new THREE.Mesh(new THREE.ShapeGeometry(reqShape), new THREE.MeshBasicMaterial({ color: reqColor, transparent: true, opacity: 0.06, side: THREE.DoubleSide }))
    reqFace.rotation.x = -Math.PI / 2; reqFace.position.y = 0.3
    scene.add(reqFace)
  }

  var camNum = 0
  var stepX = fovW - overlapW, stepZ = fovH - overlapH
  var startX = -(cols - 1) * stepX / 2, startZ = -(rows - 1) * stepZ / 2
  var totalCams = rows * cols
  var heavyMode = totalCams > 12, midMode = totalCams > 4
  var coneFillOp = heavyMode ? 0 : (midMode ? 0.02 : 0.04)
  var rectFillOp = heavyMode || midMode ? 0 : 0.03

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var cx = startX + c * stepX, cz = startZ + r * stepZ
      var body = new THREE.Mesh(new THREE.BoxGeometry(30, 25, 25), new THREE.MeshStandardMaterial({ color: 0x1a2b4a, roughness: 0.3, metalness: 0.7 }))
      body.position.set(cx, camDepth, cz); body.castShadow = true; scene.add(body)
      var lens = new THREE.Mesh(new THREE.CylinderGeometry(6, 8, 10, 16), new THREE.MeshStandardMaterial({ color: 0xf76504, roughness: 0.2, metalness: 0.8 }))
      lens.rotation.x = Math.PI / 2; lens.position.set(cx, camDepth - 5, cz); scene.add(lens)
      var led = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }))
      led.position.set(cx + 10, camDepth + 8, cz); scene.add(led)
      var pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, camDepth, 8), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.4, transparent: true, opacity: 0.3 }))
      pillar.position.set(cx, camDepth / 2, cz); scene.add(pillar)
      var fovHalfW = fovW / 2, fovHalfH = fovH / 2
      var isSingle = (camNum === 0)
      var coneColor = isSingle ? 0x4a90d9 : 0xf76504
      var fovGeo = createFrustumGeometry(cx, camDepth, cz, fovHalfW, fovHalfH)
      if (coneFillOp > 0) {
        scene.add(new THREE.Mesh(fovGeo, new THREE.MeshBasicMaterial({ color: coneColor, transparent: true, opacity: coneFillOp, side: THREE.DoubleSide, depthWrite: false })))
      }
      scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(fovGeo), new THREE.LineBasicMaterial({ color: coneColor, transparent: true, opacity: 0.75 })))
      var rectS = new THREE.Shape()
      rectS.moveTo(cx - fovHalfW, cz - fovHalfH); rectS.lineTo(cx + fovHalfW, cz - fovHalfH)
      rectS.lineTo(cx + fovHalfW, cz + fovHalfH); rectS.lineTo(cx - fovHalfW, cz + fovHalfH)
      rectS.lineTo(cx - fovHalfW, cz - fovHalfH)
      if (rectFillOp > 0) {
        var rectFace = new THREE.Mesh(new THREE.ShapeGeometry(rectS), new THREE.MeshBasicMaterial({ color: coneColor, transparent: true, opacity: rectFillOp, side: THREE.DoubleSide }))
        rectFace.rotation.x = -Math.PI / 2; rectFace.position.y = 0.2; scene.add(rectFace)
      }
      var label = makeTextSprite('#' + (camNum + 1), coneColor, isSingle ? 1.0 : 0.8)
      label.position.set(cx, camDepth + 18, cz); scene.add(label)
      if (isSingle) {
        var dimLabel = makeTextSprite(fovW + 'mm x ' + fovH + 'mm', 0x4a90d9, 0.65)
        dimLabel.position.set(cx, camDepth - 20, cz); scene.add(dimLabel)
      }
      camNum++
    }
  }

  var olFillOp = heavyMode ? 0 : (midMode ? 0.05 : 0.07)
  if (overlapW > 0) {
    for (var r2 = 0; r2 < rows; r2++) {
      for (var c2 = 0; c2 < cols - 1; c2++) {
        var ox = startX + c2 * stepX + fovW / 2 - overlapW / 2
        var oz = startZ + r2 * stepZ
        var olS = new THREE.Shape()
        olS.moveTo(ox - overlapW / 2, oz - fovH / 2); olS.lineTo(ox + overlapW / 2, oz - fovH / 2)
        olS.lineTo(ox + overlapW / 2, oz + fovH / 2); olS.lineTo(ox - overlapW / 2, oz + fovH / 2)
        olS.lineTo(ox - overlapW / 2, oz - fovH / 2)
        if (olFillOp > 0) {
          var olM = new THREE.Mesh(new THREE.ShapeGeometry(olS), new THREE.MeshBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: olFillOp, side: THREE.DoubleSide }))
          olM.rotation.x = -Math.PI / 2; olM.position.y = 0.8; scene.add(olM)
        }
        var olE = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(olS)), new THREE.LineBasicMaterial({ color: 0xe74c3c, transparent: true, opacity: 0.5 }))
        olE.rotation.x = -Math.PI / 2; olE.position.set(ox, 1.0, oz); scene.add(olE)
      }
    }
  }
  if (overlapH > 0) {
    for (var r3 = 0; r3 < rows - 1; r3++) {
      for (var c3 = 0; c3 < cols; c3++) {
        var ox2 = startX + c3 * stepX
        var oz2 = startZ + r3 * stepZ + fovH / 2 - overlapH / 2
        var olS2 = new THREE.Shape()
        olS2.moveTo(ox2 - fovW / 2, oz2 - overlapH / 2); olS2.lineTo(ox2 + fovW / 2, oz2 - overlapH / 2)
        olS2.lineTo(ox2 + fovW / 2, oz2 + overlapH / 2); olS2.lineTo(ox2 - fovW / 2, oz2 + overlapH / 2)
        olS2.lineTo(ox2 - fovW / 2, oz2 - overlapH / 2)
        if (olFillOp > 0) {
          var olM2 = new THREE.Mesh(new THREE.ShapeGeometry(olS2), new THREE.MeshBasicMaterial({ color: 0x3884f4, transparent: true, opacity: olFillOp, side: THREE.DoubleSide }))
          olM2.rotation.x = -Math.PI / 2; olM2.position.y = 0.8; scene.add(olM2)
        }
        var olE2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(olS2)), new THREE.LineBasicMaterial({ color: 0x3884f4, transparent: true, opacity: 0.5 }))
        olE2.rotation.x = -Math.PI / 2; olE2.position.set(ox2, 1.0, oz2); scene.add(olE2)
      }
    }
  }

  var dimMat = new THREE.LineBasicMaterial({ color: 0xf76504 })
  var dimOff = 20
  var topZ = -(rows - 1) * stepZ / 2 - fovH / 2 - dimOff
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-actualW / 2, 1, topZ), new THREE.Vector3(actualW / 2, 1, topZ)]), dimMat))
  var endDotGeo = new THREE.SphereGeometry(1.5, 8, 8)
  var endDotMat = new THREE.MeshBasicMaterial({ color: 0xf76504 })
  var d1 = new THREE.Mesh(endDotGeo, endDotMat); d1.position.set(-actualW / 2, 1, topZ); scene.add(d1)
  var d2 = new THREE.Mesh(endDotGeo, endDotMat); d2.position.set(actualW / 2, 1, topZ); scene.add(d2)
  var wLbl = makeTextSprite(Math.round(actualW) + 'mm', 0xf76504, 0.75); wLbl.position.set(0, 8, topZ); scene.add(wLbl)

  var sideX = -(cols - 1) * stepX / 2 - fovW / 2 - dimOff
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sideX, 1, -actualH / 2), new THREE.Vector3(sideX, 1, actualH / 2)]), dimMat))
  var d3 = new THREE.Mesh(endDotGeo, endDotMat); d3.position.set(sideX, 1, -actualH / 2); scene.add(d3)
  var d4 = new THREE.Mesh(endDotGeo, endDotMat); d4.position.set(sideX, 1, actualH / 2); scene.add(d4)
  var hLbl = makeTextSprite(Math.round(actualH) + 'mm', 0xf76504, 0.75); hLbl.position.set(sideX - 25, 8, 0); scene.add(hLbl)

  var infoHtml = '<div class="stitch-3d-info">'
  infoHtml += '<div class="stitch-3d-info-title">' + plan.model.model + '</div>'
  infoHtml += '<div class="stitch-3d-info-row">' + cols + 'x' + rows + ' = ' + (cols * rows) + t('stUnits') + '</div>'
  infoHtml += '</div>'
  infoHtml += '<div class="stitch-3d-controls">'
  infoHtml += '<button class="stitch-3d-ctrl-btn" id="stitch3dReset" title="' + t('stResetView') + '">&#x27F2;</button>'
  infoHtml += '<button class="stitch-3d-ctrl-btn" id="stitch3dTop" title="' + t('stTopView') + '">&#x2B07;</button>'
  infoHtml += '</div>'
  container.insertAdjacentHTML('afterbegin', infoHtml)

  var annHtml = '<div class="stitch-3d-annotation">'
  annHtml += '<div class="stitch-3d-ann-grid">'
  annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#f76504"></span><span class="stitch-3d-ann-label">' + t('stCamCount') + '</span><span class="stitch-3d-ann-val">' + (cols * rows) + ' ' + t('stUnits') + ' (' + cols + 'x' + rows + ')</span></div>'
  annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#4a90d9"></span><span class="stitch-3d-ann-label">' + t('stSingleFov') + '</span><span class="stitch-3d-ann-val">' + fovW + ' x ' + fovH + ' mm</span></div>'
  annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#f76504"></span><span class="stitch-3d-ann-label">' + t('stTotalCover') + '</span><span class="stitch-3d-ann-val">' + Math.round(actualW) + ' x ' + Math.round(actualH) + ' mm</span></div>'
  if (reqW && reqH) {
    annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#0A1628"></span><span class="stitch-3d-ann-label">' + t('stReqCover') + '</span><span class="stitch-3d-ann-val">' + Math.round(reqW) + ' x ' + Math.round(reqH) + ' mm</span></div>'
  } else {
    annHtml += '<div class="stitch-3d-ann-cell"></div>'
  }
  annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#888"></span><span class="stitch-3d-ann-label">PPM</span><span class="stitch-3d-ann-val">' + plan.ppm.toFixed(2) + '</span></div>'
  annHtml += '<div class="stitch-3d-ann-cell"><span class="stitch-3d-ann-dot" style="background:#888"></span><span class="stitch-3d-ann-label">' + t('stMountHeight') + '</span><span class="stitch-3d-ann-val">' + Math.round(plan.workingDist || 200) + ' mm</span></div>'
  if (overlapW > 0 || overlapH > 0) {
    var overlapParts = []
    if (overlapW > 0) overlapParts.push(overlapW + 'mm(' + t('stHrz') + ')')
    if (overlapH > 0) overlapParts.push(overlapH + 'mm(' + t('stVrt') + ')')
    annHtml += '<div class="stitch-3d-ann-cell stitch-3d-ann-cell-full"><span class="stitch-3d-ann-dot" style="background:#e74c3c"></span><span class="stitch-3d-ann-label">' + t('stOverlap') + '</span><span class="stitch-3d-ann-val">' + overlapParts.join(' / ') + '</span></div>'
  }
  if (cols > 1 || rows > 1) {
    var gapParts = []
    if (cols > 1) gapParts.push(Math.round(stepX) + 'mm(' + t('stHrz') + ')')
    if (rows > 1) gapParts.push(Math.round(stepZ) + 'mm(' + t('stVrt') + ')')
    annHtml += '<div class="stitch-3d-ann-cell stitch-3d-ann-cell-full"><span class="stitch-3d-ann-dot" style="background:#3884f4"></span><span class="stitch-3d-ann-label">' + t('stCamGap') + '</span><span class="stitch-3d-ann-val">' + gapParts.join(' / ') + '</span></div>'
  }
  annHtml += '</div></div>'
  var existing = container.parentNode.querySelector('.stitch-3d-annotation')
  if (existing) existing.remove()
  container.insertAdjacentHTML('afterend', annHtml)

  setTimeout(function () {
    var rb = document.getElementById('stitch3dReset')
    if (rb) rb.onclick = function () { spherical.radius = sceneW * 1.2; spherical.theta = Math.atan2(sceneW * 0.6, sceneD * 1.4); spherical.phi = Math.acos((sceneH * 1.2) / (sceneW * 1.2)); updateCamera() }
    var tb = document.getElementById('stitch3dTop')
    if (tb) tb.onclick = function () { spherical.radius = Math.max(sceneW, sceneD) * 1.3; spherical.theta = 0; spherical.phi = 0.15; updateCamera() }
  }, 50)

  function onResize() { var w = container.clientWidth, h = container.clientHeight || 450; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h) }
  window.addEventListener('resize', onResize)

  _stitch3dState = { scene: scene, camera: camera, renderer: renderer, animId: null, onResize: onResize }

  function animate() { _stitch3dState.animId = requestAnimationFrame(animate); renderer.render(scene, camera) }
  animate()
  return ''
}

function createFrustumGeometry(cx, cy, cz, halfW, halfH) {
  var geo = new THREE.BufferGeometry()
  var bL = new THREE.Vector3(cx - halfW, 0, cz - halfH)
  var bR = new THREE.Vector3(cx + halfW, 0, cz - halfH)
  var tR = new THREE.Vector3(cx + halfW, 0, cz + halfH)
  var tL = new THREE.Vector3(cx - halfW, 0, cz + halfH)
  var top = new THREE.Vector3(cx, cy, cz)
  var v = new Float32Array([
    top.x, top.y, top.z, bL.x, bL.y, bL.z, bR.x, bR.y, bR.z,
    top.x, top.y, top.z, bR.x, bR.y, bR.z, tR.x, tR.y, tR.z,
    top.x, top.y, top.z, tR.x, tR.y, tR.z, tL.x, tL.y, tL.z,
    top.x, top.y, top.z, tL.x, tL.y, tL.z, bL.x, bL.y, bL.z,
    bL.x, bL.y, bL.z, tL.x, tL.y, tL.z, tR.x, tR.y, tR.z,
    bL.x, bL.y, bL.z, tR.x, tR.y, tR.z, bR.x, bR.y, bR.z
  ])
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3))
  return geo
}

function makeTextSprite(text, color, scale) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')
  canvas.width = 256; canvas.height = 64
  ctx.font = 'bold 28px sans-serif'
  ctx.fillStyle = '#' + (color.toString(16).padStart(6, '0'))
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 32)
  var texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  var s = (scale || 1) * 60
  sprite.scale.set(s, s * 0.25, 1)
  return sprite
}

// ─── 拼接示意图下载（高清合成） ───
function downloadStitchImage() {
  var container = stitch3dContainerRef.value
  if (!container) return
  var srcCanvas = container.querySelector('canvas')
  if (!srcCanvas) return
  var plan = planDisplayList.value[stitchActiveIdx.value]
  if (!plan) return
  var state = _stitch3dState
  if (!state || !state.renderer || !state.scene || !state.camera) return

  var origW = srcCanvas.width, origH = srcCanvas.height
  var hiScale = 3
  var hiW = origW * hiScale, hiH = origH * hiScale

  state.renderer.setSize(hiW, hiH)
  state.renderer.setPixelRatio(1)
  state.camera.aspect = hiW / hiH
  state.camera.updateProjectionMatrix()
  state.renderer.render(state.scene, state.camera)

  var hiDataURL = srcCanvas.toDataURL('image/png')

  state.renderer.setSize(origW / (window.devicePixelRatio || 1), origH / (window.devicePixelRatio || 1))
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  state.camera.aspect = origW / origH
  state.camera.updateProjectionMatrix()
  state.renderer.render(state.scene, state.camera)

  var legendH = 175
  var outW = hiW, outH = hiH + legendH

  var exportCanvas = document.createElement('canvas')
  exportCanvas.width = outW
  exportCanvas.height = outH
  var ctx = exportCanvas.getContext('2d')

  var isDark = document.documentElement.classList.contains('dark')
  ctx.fillStyle = isDark ? '#161b22' : '#f5f7fa'
  ctx.fillRect(0, 0, outW, outH)

  var hiImg = new Image()
  hiImg.onload = function () {
    ctx.drawImage(hiImg, 0, 0, hiW, hiH)
    var ly = hiH
    ctx.fillStyle = isDark ? '#1e2430' : '#ffffff'
    ctx.fillRect(0, ly, outW, legendH)
    ctx.strokeStyle = isDark ? '#30363d' : '#dde5ef'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(outW, ly); ctx.stroke()

    var dotR = 7
    var lx = 36, lyy = ly + 28
    var textColor = isDark ? '#e6edf3' : '#333333'
    var mutedColor = isDark ? '#8b949e' : '#888888'

    ctx.font = 'bold 16px sans-serif'
    ctx.fillStyle = '#f76504'
    ctx.fillText(plan.model.model + '  ·  ' + plan.grid.cols + 'x' + plan.grid.rows + ' = ' + plan.grid.total + '台', lx, lyy)
    lyy += 24
    ctx.font = '13px sans-serif'
    ctx.fillStyle = mutedColor
    ctx.fillText('PPM ' + plan.ppm.toFixed(2) + '  ·  安装高度 ' + Math.round(plan.workingDist || 200) + 'mm', lx, lyy)
    lyy += 24
    if (plan.grid.cols > 1 || plan.grid.rows > 1) {
      var gapPartsDl = []
      var stepXDl = plan.fov.width - plan.overlapW
      var stepZDl = plan.fov.height - plan.overlapH
      if (plan.grid.cols > 1) gapPartsDl.push(t('stHrz') + ' ' + Math.round(stepXDl) + 'mm')
      if (plan.grid.rows > 1) gapPartsDl.push(t('stVrt') + ' ' + Math.round(stepZDl) + 'mm')
      ctx.fillText(t('stCamGap') + ' ' + gapPartsDl.join('  /  '), lx, lyy)
      lyy += 24
    }
    lyy += 4

    ctx.font = '14px sans-serif'
    var items = [
      { color: '#4a90d9', label: t('stSingleFov') + ' ' + plan.fov.width + 'x' + plan.fov.height + 'mm' },
      { color: '#f76504', label: t('stTotalCover') + ' ' + Math.round(plan.grid.actualW) + 'x' + Math.round(plan.grid.actualH) + 'mm' }
    ]
    if (plan.overlapW > 0) items.push({ color: '#e74c3c', label: t('stOverlapH') + ' ' + plan.overlapW + 'mm' })
    if (plan.overlapH > 0) items.push({ color: '#3884f4', label: t('stOverlapV') + ' ' + plan.overlapH + 'mm' })
    items.push({ color: '#0A1628', label: t('stReqCover') + ' ' + Math.round(stitchTotalW.value) + 'x' + Math.round(stitchTotalH.value) + 'mm' })

    var colX = lx
    items.forEach(function (item, i) {
      if (i === 3) { colX = lx; lyy += 24 }
      ctx.fillStyle = item.color
      ctx.beginPath(); ctx.arc(colX + dotR, lyy - 4, dotR, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = textColor
      ctx.fillText(item.label, colX + dotR * 2 + 8, lyy)
      colX += ctx.measureText(item.label).width + dotR * 2 + 36
    })

    var url = exportCanvas.toDataURL('image/png')
    var a = document.createElement('a')
    a.href = url
    a.download = 'stitch_3d_' + plan.model.model + '.png'
    a.click()
    URL.revokeObjectURL(url)
  }
  hiImg.src = hiDataURL
}

// ─── 注册全局拼接控制桥（供 app.js switchToPage / toggleTheme 调用） ───
onMounted(function () {
  window._stitch = {
    show: function () { stitchMode.value = true; verifyOpen.value = false },
    hide: function () { stitchMode.value = false; verifyOpen.value = false },
    rerenderTheme: function () { renderCurrentPlan(true) }
  }
})

currentLang.value
</script>