function accessoryKey(accessory, index) {
  return `${accessory.code || 'no-code'}||${accessory.name || 'no-name'}||${index}`
}

function categoryRank(category, priority) {
  return priority.findIndex((prefix) => category.indexOf(prefix) === 0)
}

function sortedCategories(tree, priority) {
  return Object.keys(tree).sort((a, b) => {
    const left = categoryRank(a, priority)
    const right = categoryRank(b, priority)
    if (left === -1 && right === -1) return a.localeCompare(b)
    if (left === -1) return 1
    if (right === -1) return -1
    return left - right
  })
}

function toModel(item, index) {
  const mapAccessory = (accessory, accessoryIndex, fallbackCategory) => ({
    name: accessory.name || '', code: accessory.code || '', detail: accessory.detail || '',
    remark: accessory.remark || '', category: accessory.category || fallbackCategory,
    series: accessory.series || '', _key: accessoryKey(accessory, accessoryIndex)
  })
  return {
    n: item.productModel || '未知型号', c: item.materialCode || item.productModel || '未知型号',
    d: item.description || '读码器主机', remark: item.remark || '', index,
    standardAcc: (item.standardAccessories || []).map((accessory, accessoryIndex) => mapAccessory(accessory, accessoryIndex, '大类')),
    optionalAcc: (item.optionalAccessories || []).map((accessory, accessoryIndex) => mapAccessory(accessory, accessoryIndex, '其他'))
  }
}

export function buildBomCatalogIndex(modelList, { categoryPriority = [] } = {}) {
  const tree = {}
  const reverseIndex = {}

  modelList.forEach((item, index) => {
    const category = (item.productCategory || '未分类').trim()
    const series = (item.productSeries || '未分类').trim()
    const model = toModel(item, index)
    if (!tree[category]) tree[category] = {}
    if (!tree[category][series]) tree[category][series] = { mains: [] }
    if (!tree[category][series].mains.some((existing) => existing.n === model.n)) tree[category][series].mains.push(model)

    const standardAccessories = item.standardAccessories || []
    standardAccessories.concat(item.optionalAccessories || []).forEach((accessory, accessoryIndex) => {
      if (!accessory.code) return
      if (!reverseIndex[accessory.code]) {
        reverseIndex[accessory.code] = {
          name: accessory.name || '', category: accessory.category || '', series: accessory.series || '',
          detail: accessory.detail || '', remark: accessory.remark || '', models: []
        }
      }
      const linkedModels = reverseIndex[accessory.code].models
      if (!linkedModels.some((entry) => entry.name === model.n && entry.cat === category && entry.ser === series)) {
        linkedModels.push({ name: model.n, type: accessoryIndex < standardAccessories.length ? 'standard' : 'optional', cat: category, ser: series })
      }
    })
  })

  const cats = sortedCategories(tree, categoryPriority)
  const sortedTree = {}
  cats.forEach((category) => {
    sortedTree[category] = {}
    Object.keys(tree[category]).sort().forEach((series) => { sortedTree[category][series] = tree[category][series] })
  })
  return { tree: sortedTree, cats, reverseIndex }
}
