#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const ROOT = path.join(__dirname, '..')
const DATA = path.join(ROOT, 'public/js/data')
const OUTPUT = path.join(ROOT, 'public/data/runtime')

function evaluate(file, capture) {
  const context = { window: {} }
  let source = fs.readFileSync(path.join(DATA, file), 'utf8')
  if (capture) source += `\nwindow.__CAPTURE__ = ${capture};`
  vm.runInNewContext(source, context, { filename: file })
  return context.window.__CAPTURE__
}

function captureDownloads() {
  const file = path.join(DATA, 'download_urls.js')
  const context = { window: {} }
  const source = fs.readFileSync(file, 'utf8').replace(/\}\)\(\);\s*$/, 'window.__CAPTURE__ = { base: BASE_DOWNLOAD_URLS, dist: DIST_DOWNLOAD_URLS, spec: MODEL_DOWNLOAD_URLS };\n})();')
  vm.runInNewContext(source, context, { filename: file })
  return context.window.__CAPTURE__
}

const entries = {
  'product-db': () => evaluate('product_db.js', 'PRODUCT_DB'),
  mapping: () => evaluate('mapping.js', 'window.MAPPING_DATA'),
  announcements: () => evaluate('announcement.js', 'window.ANNOUNCEMENTS'),
  pda: () => evaluate('pda.js', 'window.PDA_DATA'),
  'status-codes': () => evaluate('status_codes.js', 'STATUS_CODES'),
  'product-images': () => evaluate('product_imgs.js', 'window.PRODUCT_IMGS'),
  'accessory-images': () => evaluate('acc_imgs.js', 'window.ACC_IMGS'),
  downloads: captureDownloads
}

fs.mkdirSync(OUTPUT, { recursive: true })
for (const [name, getData] of Object.entries(entries)) {
  const output = path.join(OUTPUT, `${name}.json`)
  fs.writeFileSync(output, JSON.stringify({ schemaVersion: 1, data: getData() }), 'utf8')
  console.log(`✓ data/runtime/${name}.json`)
}
