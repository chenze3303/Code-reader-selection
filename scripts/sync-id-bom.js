#!/usr/bin/env node
/**
 * 从公开参考站（ID-BOM）同步 ID 智能配单数据，生成项目内的 product_data.json。
 *
 * 参考站数据结构（26 列相机行 / 10 列配件行）与项目 product_data.json 完全同构，
 * 差异只在两处约定：
 *   - 第 0 列：参考站为「ID系列」，项目为「相机」
 *   - 第 25 列：项目沿用「CAM/」前缀（历史约定，无运行时消费方）
 *
 * 用法：
 *   node scripts/sync-id-bom.js            # 拉取参考站最新数据并覆盖 product_data.json
 *   node scripts/sync-id-bom.js --dry-run  # 只统计差异，不写文件
 *   node scripts/sync-id-bom.js --local ../bom-refdata   # 用本地已下载的参考数据离线运行
 */
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const ROOT = path.join(__dirname, '..')
const OUTPUT = path.join(ROOT, 'product_data.json')
const REFERENCE_BASE = 'https://cai0707-kiki.github.io/ID-BOM/'
const CAMERA_URL = `${REFERENCE_BASE}scripts/id_camera_data.js`
const ACCESSORY_URL = `${REFERENCE_BASE}scripts/id_accessory_data.js`

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

function dataRows(items) {
  return items.map((item) => (Array.isArray(item.value) ? item.value : item))
}

function text(value) {
  return typeof value === 'string' ? value.trim() : value
}

/** 参考站相机行 → 项目相机行 */
function toProjectCamera(row) {
  const v = row.map((cell) => (typeof cell === 'string' ? cell.replace(/\r/g, '') : cell))
  v[0] = '相机'
  // 参考站相机行第 25 列是系列族；项目历史数据统一带 CAM/ 前缀
  if (v[25] && !v[25].startsWith('CAM/')) v[25] = `CAM/${v[25]}`
  return v
}

/** 参考站配件行 → 项目配件行 */
function toProjectAccessory(row) {
  const v = row.map((cell) => (typeof cell === 'string' ? cell.replace(/\r/g, '') : cell))
  v[0] = '配件'
  // 参考站配件行第 9 列是图片组；项目历史数据统一带 ACC/ 前缀
  if (v[9] && !v[9].startsWith('ACC/')) v[9] = `ACC/${v[9]}`
  return v
}

function toEntries(rows) {
  return rows.map((value) => ({ Count: value.length, value }))
}

function readCurrent() {
  if (!fs.existsSync(OUTPUT)) return []
  const raw = JSON.parse(fs.readFileSync(OUTPUT, 'utf8').replace(/^\uFEFF/, ''))
  return dataRows(raw)
}

function summarize(rows) {
  const cameras = rows.filter((row) => String(row[0] || '').trim() === '相机')
  const accessories = rows.filter((row) => String(row[0] || '').trim() === '配件')
  return { cameras, accessories }
}

function diffRows(before, after, label, keyIndex = 3) {
  const keyOf = (row) => String(row[keyIndex] ?? '').trim()
  const byKey = (rows) => new Map(rows.map((row) => [keyOf(row), row]))
  const a = byKey(before)
  const b = byKey(after)
  const added = [...b.keys()].filter((key) => !a.has(key))
  const removed = [...a.keys()].filter((key) => !b.has(key))
  const changed = []
  for (const key of b.keys()) {
    if (!a.has(key)) continue
    const oldRow = a.get(key)
    const newRow = b.get(key)
    const width = Math.max(oldRow.length, newRow.length)
    const fields = []
    for (let i = 0; i < width; i += 1) {
      if (String(oldRow[i] ?? '') !== String(newRow[i] ?? '')) fields.push(i)
    }
    if (fields.length) changed.push({ key, fields })
  }
  console.log(`\n[${label}] 新增 ${added.length}，删除 ${removed.length}，字段变化 ${changed.length}`)
  if (added.length) console.log(`  新增示例：${added.slice(0, 5).join(' | ')}`)
  if (removed.length) console.log(`  删除示例：${removed.slice(0, 5).join(' | ')}`)
  if (changed.length) {
    const counter = new Map()
    changed.forEach(({ fields }) => fields.forEach((i) => counter.set(i, (counter.get(i) || 0) + 1)))
    console.log(`  变化列分布：${[...counter.entries()].sort((x, y) => x[0] - y[0]).map(([i, n]) => `col${i}×${n}`).join(' ')}`)
  }
  return { added, removed, changed }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const localIndex = args.indexOf('--local')
  const localDir = localIndex >= 0 ? path.resolve(args[localIndex + 1] || '') : ''

  const readSource = async (url, filename, variableName) => {
    const source = localDir
      ? fs.readFileSync(path.join(localDir, filename), 'utf8')
      : await loadScript(url)
    return evaluateData(source, variableName)
  }

  const [cameraItems, accessoryItems] = await Promise.all([
    readSource(CAMERA_URL, 'id_camera_data.js', 'IDBOM_CAMERA_DATA'),
    readSource(ACCESSORY_URL, 'id_accessory_data.js', 'IDBOM_ACCESSORY_DATA')
  ])

  const cameras = dataRows(cameraItems).map(toProjectCamera)
  const accessories = dataRows(accessoryItems).map(toProjectAccessory)

  const before = readCurrent()
  const beforeParts = summarize(before)
  const afterParts = summarize([...cameras, ...accessories])

  console.log(`参考站：${afterParts.cameras.length} 个主机型号、${afterParts.accessories.length} 条配件记录`)
  console.log(`当前数据：${beforeParts.cameras.length} 个主机型号、${beforeParts.accessories.length} 条配件记录`)

  diffRows(beforeParts.cameras, afterParts.cameras, '相机')
  diffRows(beforeParts.accessories, afterParts.accessories, '配件', 4)

  if (dryRun) {
    console.log('\n--dry-run：未写入 product_data.json')
    return
  }

  const payload = toEntries([...cameras, ...accessories])
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`\n✓ 已写入 ${path.relative(ROOT, OUTPUT)}（${payload.length} 行）`)
  console.log('下一步：node scripts/convert_product_data.js && node scripts/build-bom-catalog.js')
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
