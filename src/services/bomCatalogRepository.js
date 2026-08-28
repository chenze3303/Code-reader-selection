const BASE_URL = typeof import.meta.env === 'object' && import.meta.env.BASE_URL ? import.meta.env.BASE_URL : '/'
const DEFAULT_CATALOG_URL = `${BASE_URL}data/bom-catalog.json`

function text(value) {
  return typeof value === 'string' ? value : ''
}

function normalizeAccessory(item) {
  return {
    category: text(item.category),
    series: text(item.series),
    name: text(item.name),
    code: text(item.code),
    detail: text(item.detail),
    remark: text(item.remark)
  }
}

function normalizeModel(item, accessories) {
  const hydrateRefs = (refs) => (Array.isArray(refs) ? refs : [])
    .map((id) => accessories[id])
    .filter(Boolean)
    .map((accessory) => ({ ...accessory }))

  return {
    productCategory: text(item.productCategory),
    productSeries: text(item.productSeries),
    productModel: text(item.productModel),
    materialCode: text(item.materialCode),
    description: text(item.description),
    remark: text(item.remark),
    standardAccessories: hydrateRefs(item.standardAccessoryIds),
    optionalAccessories: hydrateRefs(item.optionalAccessoryIds)
  }
}

export function validateBomCatalog(catalog) {
  if (!catalog || catalog.schemaVersion !== 1) throw new Error('配单数据版本不受支持')
  if (!Array.isArray(catalog.accessories) || !Array.isArray(catalog.models)) throw new Error('配单数据结构不完整')
  return catalog
}

export function hydrateBomCatalog(catalog) {
  validateBomCatalog(catalog)
  const accessories = catalog.accessories.map(normalizeAccessory)
  return {
    modelList: catalog.models.map((item) => normalizeModel(item, accessories))
  }
}

export function createBomCatalogRepository({ fetchImpl = fetch, url = DEFAULT_CATALOG_URL } = {}) {
  let cache = null
  let pending = null

  async function load({ force = false } = {}) {
    if (cache && !force) return cache
    if (pending && !force) return pending

    pending = fetchImpl(url, { headers: { Accept: 'application/json' } })
      .then((response) => {
        if (!response.ok) throw new Error(`配单数据加载失败（${response.status}）`)
        return response.json()
      })
      .then(hydrateBomCatalog)
      .then((data) => {
        cache = data
        return data
      })
      .finally(() => { pending = null })

    return pending
  }

  return {
    load,
    clearCache: () => { cache = null }
  }
}

export const bomCatalogRepository = createBomCatalogRepository()
