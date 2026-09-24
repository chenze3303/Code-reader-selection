const BASE_URL = typeof import.meta.env === 'object' && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/'
const DEFAULT_URL = `${BASE_URL}data/runtime/id-series.json`

function text(value) { return typeof value === 'string' ? value : '' }

function normalizeRow(row) {
  return {
    kind: row && row.kind === 'model' ? 'model' : 'accessory',
    type: text(row && row.type) || '配件',
    category: text(row && row.category),
    series: text(row && row.series),
    name: text(row && row.name),
    code: text(row && row.code),
    description: text(row && row.description),
    remark: text(row && row.remark)
  }
}

export function validateIdSeriesCatalog(catalog) {
  if (!catalog || catalog.schemaVersion !== 1) throw new Error('ID 系列数据版本不受支持')
  if (!Array.isArray(catalog.series)) throw new Error('ID 系列数据结构不完整')
  return catalog
}

export function normalizeIdSeriesCatalog(catalog) {
  validateIdSeriesCatalog(catalog)
  return {
    ...catalog,
    series: catalog.series.map((group) => ({
      name: text(group.name) || '未分类',
      rows: Array.isArray(group.rows) ? group.rows.map(normalizeRow).filter((row) => row.name || row.code) : []
    }))
  }
}

export function createIdSeriesRepository({ fetchImpl = fetch, url = DEFAULT_URL } = {}) {
  let cache = null
  let pending = null

  async function load({ force = false } = {}) {
    if (cache && !force) return cache
    if (pending && !force) return pending
    pending = fetchImpl(url, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`ID 系列数据加载失败（${response.status}）`)
        return response.json()
      })
      .then(normalizeIdSeriesCatalog)
      .then((data) => {
        cache = data
        return data
      })
      .finally(() => { pending = null })
    return pending
  }

  return { load, clearCache: () => { cache = null } }
}

export const idSeriesRepository = createIdSeriesRepository()
