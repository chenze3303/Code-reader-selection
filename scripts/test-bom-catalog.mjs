import assert from 'node:assert/strict'
import fs from 'node:fs'

const serviceSource = fs.readFileSync(new URL('../src/services/bomCatalogRepository.js', import.meta.url), 'utf8')
const service = await import(`data:text/javascript;base64,${Buffer.from(serviceSource).toString('base64')}`)
const { createBomCatalogRepository, hydrateBomCatalog, validateBomCatalog } = service
const indexSource = fs.readFileSync(new URL('../src/services/bomCatalogIndex.js', import.meta.url), 'utf8')
const { buildBomCatalogIndex } = await import(`data:text/javascript;base64,${Buffer.from(indexSource).toString('base64')}`)

const catalog = {
  schemaVersion: 1,
  accessories: [{ category: '线缆', series: '2m', name: '测试线缆', code: '1001', detail: '测试', remark: '' }],
  models: [{ productCategory: 'ID800', productSeries: 'ID803', productModel: 'MV-ID803', materialCode: '2001', description: '测试型号', remark: '', standardAccessoryIds: [0], optionalAccessoryIds: [] }]
}

assert.equal(validateBomCatalog(catalog), catalog)
assert.throws(() => validateBomCatalog({}), /配单数据/)

const hydrated = hydrateBomCatalog(catalog)
assert.equal(hydrated.modelList.length, 1)
assert.deepEqual(hydrated.modelList[0].standardAccessories[0], catalog.accessories[0])
assert.notEqual(hydrated.modelList[0].standardAccessories[0], catalog.accessories[0])

const index = buildBomCatalogIndex(hydrated.modelList, { categoryPriority: ['ID800'] })
assert.deepEqual(index.cats, ['ID800'])
assert.equal(index.tree.ID800.ID803.mains[0].standardAcc[0].code, '1001')
assert.equal(index.reverseIndex['1001'].models[0].type, 'standard')

const productionCatalog = JSON.parse(fs.readFileSync(new URL('../public/data/bom-catalog.json', import.meta.url), 'utf8'))
const productionData = hydrateBomCatalog(productionCatalog)
assert.equal(productionCatalog.schemaVersion, 1)
assert.equal(productionData.modelList.length, 686)
assert.equal(productionCatalog.accessories.length, 341)
assert.ok(productionData.modelList.some((model) => model.productCategory === 'ID800系列'))

let calls = 0
const repository = createBomCatalogRepository({
  url: '/fixture.json',
  fetchImpl: async () => ({ ok: true, json: async () => { calls += 1; return catalog } })
})
await Promise.all([repository.load(), repository.load()])
assert.equal(calls, 1, '并发读取应共享同一请求')
await repository.load()
assert.equal(calls, 1, '缓存读取不应重复请求')

console.log('✓ BOM catalog repository tests passed')
