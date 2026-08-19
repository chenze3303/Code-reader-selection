import { ref, watch, onUnmounted } from 'vue'

export function useLegacyReady() {
  const ready = ref(typeof window !== 'undefined' && !!window.__legacyReadyDone)
  if (!ready.value && typeof window !== 'undefined') {
    const onReady = () => { ready.value = true }
    window.addEventListener('legacy-ready', onReady, { once: true })
    onUnmounted(() => window.removeEventListener('legacy-ready', onReady))
  }
  return ready
}

export function useGlobalData(name) {
  const data = ref(null)
  const ready = useLegacyReady()
  const read = () => {
    if (data.value === null && typeof window !== 'undefined' && window[name] !== undefined && window[name] !== null) {
      data.value = window[name]
    }
  }
  read()
  watch(ready, (r) => { if (r) read() })
  return data
}
