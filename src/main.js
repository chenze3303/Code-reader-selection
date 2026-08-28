import { createApp } from 'vue'
import '../css/style.css'
import App from './App.vue'
import { legacyDataBridge } from './services/legacyDataBridge'

const app = createApp(App)
app.mount('#app')

// ─── Legacy 业务脚本加载（保持原有依赖顺序） ───
// 数据脚本 → 业务模块。这些脚本直接操作已由 Vue 渲染的 DOM（id/class 保持一致）。
// 注意：public/ 为站点根目录，故 URL 为 /js/... 而非 /public/js/...
const legacyScripts = ['js/app.min.js']

function loadScripts(list, index) {
  if (index >= list.length) {
    window.__legacyReadyDone = true
    window.dispatchEvent(new CustomEvent('legacy-ready'))
    return
  }
  var s = document.createElement('script')
  s.src = list[index]
  s.async = false
  s.onload = function () { loadScripts(list, index + 1) }
  s.onerror = function () {
    console.error('Legacy script load failed:', list[index])
    loadScripts(list, index + 1)
  }
  document.body.appendChild(s)
}

// 保证在 DOM 就绪后注入（Vue 已完成挂载）
function bootLegacy() {
  legacyDataBridge.load()
    .then(() => loadScripts(legacyScripts, 0))
    .catch((error) => { console.error('Legacy data bridge failed:', error); loadScripts(legacyScripts, 0) })
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootLegacy)
else bootLegacy()
