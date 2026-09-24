#!/usr/bin/env node

/**
 * Build the local ID series snapshot from the public ID-BOM reference site.
 * The generated file is intentionally static so GitHub Pages never depends on
 * the reference site at runtime.
 */
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const REFERENCE_BASE = 'https://cai0707-kiki.github.io/ID-BOM/'
const CAMERA_URL = `${REFERENCE_BASE}scripts/id_camera_data.js`
const ACCESSORY_URL = `${REFERENCE_BASE}scripts/id_accessory_data.js`
const OUTPUT = path.resolve(__dirname, '../public/data/runtime/id-series.json')

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const https = require('node:https')
    https.get(url, { headers: { 'User-Agent': 'Code-reader-selection-data-sync/1.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume()
        reject(new Error(`参考站数据请求失败（${res.statusCode}）：${url}`))
        return
      }
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve(body))
    }).on('error', reject)
  })
}

function evaluateData(source, variableName) {
  const context = {}
  vm.runInNewContext(`${source}\n;globalThis.__value = ${variableName}`, context, { timeout: 10_000 })
  if (!Array.isArray(context.__value)) throw new Error(`${variableName} 不是数组`)
  return context.__value
}

function text(value) { return typeof value === 'string' ? value.trim() : '' }

function normalizeCamera(row) {
  const v = Array.isArray(row && row.value) ? row.value : []
  return {
    kind: 'model',
    type: '主机',
    category: text(v[1]),
    series: text(v[2]),
    name: text(v[3]),
    code: text(v[4]),
    description: text(v[5]),
    remark: text(v[6]),
    accessoryTags: Array.from(new Set(
      [7, 9, 11, 13, 15, 17, 19, 21, 23]
        .flatMap((index) => text(v[index]).split(';').map((tag) => tag.trim().toLowerCase()))
        .filter(Boolean)
    ))
  }
}

function normalizeAccessory(row) {
  const v = Array.isArray(row && row.value) ? row.value : []
  const rawType = text(v[1]) || '配件'
  return {
    kind: 'accessory',
    type: rawType === '扩展配件' ? (text(v[2]) || rawType) : rawType,
    category: rawType,
    series: text(v[2]),
    name: text(v[3]),
    code: text(v[4]),
    description: text(v[5]),
    remark: text(v[6]),
    accessoryTags: Array.from(new Set(text(v[7]).split(';').map((tag) => tag.trim().toLowerCase()).filter(Boolean)))
  }
}

function buildSnapshot(cameraRows, accessoryRows) {
  const cameras = cameraRows.map(normalizeCamera).filter((row) => row.category && row.name && row.code)
  const accessories = accessoryRows.map(normalizeAccessory).filter((row) => row.name && row.code)
  const order = []
  const grouped = new Map()

  cameras.forEach((camera) => {
    if (!grouped.has(camera.category)) {
      grouped.set(camera.category, [])
      order.push(camera.category)
    }
    grouped.get(camera.category).push(camera)
  })

  const series = order.map((category) => {
    const models = grouped.get(category)
    const referencedTags = new Set(models.flatMap((model) => model.accessoryTags))
    const seenCodes = new Set()
    const linkedAccessories = accessories.filter((accessory) => {
      if (!accessory.accessoryTags.some((tag) => referencedTags.has(tag))) return false
      if (seenCodes.has(accessory.code)) return false
      seenCodes.add(accessory.code)
      return true
    })
    return {
      name: category,
      count: models.length + linkedAccessories.length,
      rows: models.concat(linkedAccessories).map(({ accessoryTags, ...row }) => row)
    }
  })

  return {
    schemaVersion: 1,
    source: {
      url: REFERENCE_BASE,
      cameraDataUrl: CAMERA_URL,
      accessoryDataUrl: ACCESSORY_URL,
      generatedAt: new Date().toISOString()
    },
    totals: {
      series: series.length,
      models: cameras.length,
      accessories: accessories.length
    },
    series
  }
}

async function main() {
  const [cameraSource, accessorySource] = await Promise.all([loadScript(CAMERA_URL), loadScript(ACCESSORY_URL)])
  const snapshot = buildSnapshot(
    evaluateData(cameraSource, 'IDBOM_CAMERA_DATA'),
    evaluateData(accessorySource, 'IDBOM_ACCESSORY_DATA')
  )
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`ID 系列数据已生成：${snapshot.totals.series} 个系列、${snapshot.totals.models} 个主机、${snapshot.totals.accessories} 个配件`)
  console.log(`输出：${path.relative(process.cwd(), OUTPUT)}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
