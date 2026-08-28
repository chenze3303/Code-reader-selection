import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../src/services/legacyDataBridge.js', import.meta.url), 'utf8')
const { createLegacyDataBridge } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const names = ['product-db', 'mapping', 'announcements', 'pda', 'status-codes', 'product-images', 'accessory-images', 'downloads']
const fixtures = Object.fromEntries(names.map((name) => [name, JSON.parse(fs.readFileSync(new URL(`../public/data/runtime/${name}.json`, import.meta.url), 'utf8'))]))
const target = {}
const bridge = createLegacyDataBridge({
  target,
  fetchImpl: async (url) => {
    const name = names.find((item) => url.endsWith(`${item}.json`))
    return { ok: Boolean(name), status: name ? 200 : 404, json: async () => fixtures[name] }
  }
})
await bridge.load()
assert.ok(Array.isArray(target.PRODUCT_DB) && target.PRODUCT_DB.length > 0)
assert.ok(Array.isArray(target.MAPPING_DATA) && target.MAPPING_DATA.length > 0)
assert.ok(Array.isArray(target.PDA_DATA.models) && target.PDA_DATA.models.length > 0)
assert.ok(Array.isArray(target.STATUS_CODES) && target.STATUS_CODES.length > 0)
assert.equal(typeof target.MAPPING_DOWNLOAD_URLS.getSpecUrl, 'function')
assert.ok(target.MAPPING_DOWNLOAD_URLS.getSpecUrl('MV-IDP3204/64G'))
console.log('✓ Runtime data bridge tests passed')
