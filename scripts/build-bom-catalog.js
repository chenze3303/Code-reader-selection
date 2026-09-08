#!/usr/bin/env node
/**
 * 将兼容用 PEIDAN_DATA 转为归一化的静态配单目录。
 * 网站运行时只读取 public/data/bom-catalog.json；peidan.js 保留给 db_editor.html 使用。
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.join(__dirname, '..')
const INPUT = path.join(ROOT, 'public/js/data/peidan.js')
const OUTPUT = path.join(ROOT, 'public/data/bom-catalog.json')
const SOURCE_DATA = path.join(ROOT, 'product_data.json')

function loadPeidanData() {
  const context = { window: {} }
  vm.runInNewContext(fs.readFileSync(INPUT, 'utf8'), context, { filename: INPUT })
  const data = context.window.PEIDAN_DATA
  if (!data || !Array.isArray(data.modelList)) throw new Error('PEIDAN_DATA.modelList 不存在')
  return data.modelList
}

function accessoryKey(item) {
  return [item.category, item.series, item.name, item.code, item.detail, item.remark]
    .map((value) => value || '')
    .join('\u0001')
}

function loadSourceAccessories() {
  if (!fs.existsSync(SOURCE_DATA)) return []
  const raw = JSON.parse(fs.readFileSync(SOURCE_DATA, 'utf8').replace(/^\uFEFF/, ''))
  return raw.map((item) => item.value || item)
    .filter((row) => row[0] && String(row[0]).trim() === '配件')
    .map((row) => ({
      category: String(row[1] || '').trim(), series: String(row[2] || '').trim(),
      name: String(row[3] || '').trim(), code: String(row[4] || '').trim(),
      detail: String(row[5] || '').trim(), remark: String(row[6] || '').trim()
    }))
    .filter((item) => item.name && item.code)
}

function main() {
  const accessoryIds = new Map()
  const accessories = []
  const getAccessoryId = (item) => {
    const key = accessoryKey(item)
    if (!accessoryIds.has(key)) {
      accessoryIds.set(key, accessories.length)
      accessories.push({
        category: item.category || '', series: item.series || '', name: item.name || '',
        code: item.code || '', detail: item.detail || '', remark: item.remark || ''
      })
    }
    return accessoryIds.get(key)
  }

  // 先注册完整配件主数据：部分配件暂未被型号引用，但仍需在配件检索和目录中保留。
  loadSourceAccessories().forEach(getAccessoryId)

  const models = loadPeidanData().map((item) => ({
    productCategory: item.productCategory || '', productSeries: item.productSeries || '',
    productModel: item.productModel || '', materialCode: item.materialCode || '',
    description: item.description || '', remark: item.remark || '',
    standardAccessoryIds: (item.standardAccessories || []).map(getAccessoryId),
    optionalAccessoryIds: (item.optionalAccessories || []).map(getAccessoryId)
  }))
  const catalog = { schemaVersion: 1, generatedAt: new Date().toISOString(), accessories, models }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(catalog), 'utf8')

  const sourceBytes = fs.statSync(INPUT).size
  const outputBytes = fs.statSync(OUTPUT).size
  console.log(`✓ ${models.length} 个型号，${accessories.length} 个唯一配件`)
  console.log(`✓ ${path.relative(ROOT, OUTPUT)} ${(outputBytes / 1024).toFixed(1)} KB（兼容数据文件 ${(sourceBytes / 1024).toFixed(1)} KB）`)
}

main()
