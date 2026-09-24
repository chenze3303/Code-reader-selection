import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/services/idSeriesRepository.js', import.meta.url), 'utf8')
const { validateIdSeriesCatalog, normalizeIdSeriesCatalog } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const catalog = JSON.parse(fs.readFileSync(new URL('../public/data/runtime/id-series.json', import.meta.url), 'utf8'))

assert.equal(validateIdSeriesCatalog(catalog), catalog)
assert.equal(catalog.schemaVersion, 1)
assert.equal(catalog.totals.series, 13)
assert.equal(catalog.totals.models, 688)
assert.equal(catalog.totals.accessories, 395)
assert.deepEqual(catalog.series.map((group) => group.name), [
  'ID800系列', 'ID2013EM系列', 'ID2000M系列', 'ID2000XM系列', 'ID3000PM系列',
  'ID3000XM系列', 'ID5000M系列', 'ID5000XM系列', '行业型号', '物流读码器',
  'IDH手持读码器', 'IDP智能移动终端', 'ID1000系列读码模组'
])

const id800 = catalog.series.find((group) => group.name === 'ID800系列')
assert.equal(id800.count, 68)
assert.equal(id800.rows.filter((row) => row.kind === 'model').length, 36)
assert.equal(id800.rows[0].code, '313201715')
assert.equal(id800.rows[0].kind, 'model')
assert.ok(id800.rows.some((row) => row.kind === 'accessory' && row.code === '310101855'))

const allRows = catalog.series.flatMap((group) => group.rows)
assert.ok(allRows.every((row) => row.name && row.code))
assert.equal(allRows.filter((row) => row.kind === 'model').length, 688)
assert.deepEqual(normalizeIdSeriesCatalog(catalog).series[0].rows[0], id800.rows[0])

console.log('✓ ID series data tests passed')
