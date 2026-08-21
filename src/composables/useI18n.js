import { ref } from 'vue'

const currentLang = ref(null)

if (typeof window !== 'undefined') {
  if (window._i18n && window._i18n.getLang) currentLang.value = window._i18n.getLang()
  window.__onLangChange = function () {
    if (window._i18n && window._i18n.getLang) currentLang.value = window._i18n.getLang()
  }
  // 监听 legacy-ready 事件，确保 i18n 加载后更新
  window.addEventListener('legacy-ready', function () {
    if (window._i18n && window._i18n.getLang) currentLang.value = window._i18n.getLang()
  })
}

export function useI18n() {
  function t(key, n) {
    currentLang.value
    if (window._i18n && window._i18n.t) return window._i18n.t(key, n)
    return key
  }
  return { currentLang, t }
}
