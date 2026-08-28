const BASE_URL = typeof import.meta.env === 'object' && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/'
const runtimeUrl = (name) => `${BASE_URL}data/runtime/${name}.json`

async function readJson(fetchImpl, name) {
  const response = await fetchImpl(runtimeUrl(name), { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`${name} 数据加载失败（${response.status}）`)
  const payload = await response.json()
  if (!payload || payload.schemaVersion !== 1 || payload.data === undefined) throw new Error(`${name} 数据格式不受支持`)
  return payload.data
}

function createDownloadUrls({ base = {}, dist = {}, spec = {} }) {
  const clean = (name) => (name || '').replace(/\([^)]*\)/g, '').replace(/\s*V?\d+(\.\d+)?\s*$/, '').replace(/\)$/, '').trim()
  const getSpecUrl = (name) => {
    const normalized = clean(name)
    if (spec[normalized]) return spec[normalized]
    return Object.keys(spec).find((key) => normalized.includes(key) || key.includes(normalized)) ? spec[Object.keys(spec).find((key) => normalized.includes(key) || key.includes(normalized))] : ''
  }
  return { base, dist, spec, getBaseUrl: (category) => base[category] || '', getDistUrl: (category) => dist[category] || '', getSpecUrl }
}

export function createLegacyDataBridge({ fetchImpl = fetch, target = typeof window !== 'undefined' ? window : {} } = {}) {
  let loading = null
  async function load() {
    if (loading) return loading
    loading = Promise.all(['product-db', 'mapping', 'announcements', 'pda', 'status-codes', 'product-images', 'accessory-images', 'downloads'].map((name) => readJson(fetchImpl, name)))
      .then(([productDb, mapping, announcements, pda, statusCodes, productImages, accessoryImages, downloads]) => {
        target.PRODUCT_DB = productDb
        target.MAPPING_DATA = mapping
        target.ANNOUNCEMENTS = announcements
        target.PDA_DATA = pda
        target.STATUS_CODES = statusCodes
        target.PRODUCT_IMGS = productImages
        target.ACC_IMGS = accessoryImages
        target.MAPPING_DOWNLOAD_URLS = createDownloadUrls(downloads)
      })
    return loading
  }
  return { load }
}

export const legacyDataBridge = createLegacyDataBridge()
