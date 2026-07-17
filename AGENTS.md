# AGENTS.md

## 项目概述

海康机器人读码器选型工具 V3.5，纯前端实现。无需构建系统，无需服务器，直接在浏览器中打开 `index.html` 即可使用。

## 架构

- **入口文件**：`index.html` — 先加载数据文件，再加载模块（脚本顺序很重要，参见 index.html:1583-1592）
- **数据文件**（`js/data/*.js`）：通过 `<script>` 标签加载的全局变量，不是 ES 模块
- **模块文件**（`js/*.js`）：各功能模块的逻辑（app.js、bom.js、mapping_module.js、statuscode_module.js）
- **数据库编辑器**：`db_editor.html` — 独立的数据编辑工具。隐藏入口：从主页面连续点击左上角 logo 3 次（600ms 内）
- **SDK 参考**：`sdk-guide.html` — 独立的 SDK 参考页面

## 关键约定

- 所有数据使用 `window.GLOBAL_VAR` 模式：`window.PRODUCT_DB`、`window.MAPPING_DATA`、`window.PEIDAN_DATA`。例外：`competitor.js` 使用 `var competitorDB`
- 国际化（i18n）通过 HTML 元素的 `data-i18n` 属性实现
- 暗黑模式：切换 `<html>` 元素的 `dark` class
- 搜索归一化：去除 `MV-` 前缀，大小写不敏感
- 样式规范：12px 外边距，10px 圆角卡片，38px 统一控件高度
- CSS 版本通过 `index.html` 中的查询字符串控制（`style.css?v=4`）

## 数据更新流程

1. **推荐方式**：打开 `db_editor.html` → 编辑 → 导出 → 替换 `js/data/` 下的对应文件
2. **直接编辑**：修改 `js/data/` 下的 `.js` 文件 → 刷新 `index.html`

## 抓取脚本

位于 `scripts/` 目录，依赖 `agent-browser`（Playwright 封装）：
```bash
npm i -g agent-browser
node scripts/scrape_base_downloads.js  # → js/data/downloads.js
node scripts/scrape_dist_downloads.js  # → js/data/dist_downloads.js
node scripts/gen_download_urls.js      # → js/data/download_urls.js
```
⚠️ 每个脚本约耗时 10 秒/系列，全部完成约 5-10 分钟。需要安装 Chromium。

## 文件结构速查

- `js/data/product_db.js` — 选型产品数据库（`window.PRODUCT_DB`）
- `js/data/mapping.js` — 产品表数据（`window.MAPPING_DATA`，424 条）
- `js/data/peidan.js` — 配单数据（`window.PEIDAN_DATA`）
- `js/data/competitor.js` — 竞品对标数据（`var competitorDB`，39 条）
- `js/data/status_codes.js` — 状态码数据（224 条）
- `js/data/download_urls.js` — 自动生成，勿手动编辑
- `js/data/cat_dist_map.js` — 系列 → 经销型号前缀映射

## 注意事项

- 数据文件不是 ES 模块，必须使用全局变量
- `download_urls.js` 由 `scripts/gen_download_urls.js` 自动生成
- 编辑器（`db_editor.html`）打开时自动加载数据，无需手动导入
- 主题持久化使用 `localStorage` 键 `theme`
- 语言持久化使用 `localStorage` 键 `lang`
- `index.html` 中脚本加载顺序：数据 JS 文件优先（第 1583-1589 行），模块 JS 文件在后（第 1590-1592 行）— 模块依赖数据全局变量
- `competitor.js` 使用 `var` 而非 `window.` 赋值 — 这是唯一一个与 `window.*` 模式不同的数据文件

## 性能优化

### 已应用的优化

1. **脚本 defer 加载**：所有 `<script>` 标签添加 `defer` 属性，不阻塞 HTML 解析
2. **预加载关键资源**：预加载最大的数据文件（peidan.js 296KB、mapping.js 78KB、status_codes.js 52KB）
3. **版本号控制**：更新 CSS 和 app.js 版本号（v=5, v=6）强制刷新缓存
4. **DNS 预解析**：添加 `<link rel="dns-prefetch">` 预解析外部域名
5. **Meta 标签优化**：添加 description 和 X-UA-Compatible
6. **CSS 压缩**：使用 `scripts/minify-css.js` 生成压缩版 `style.min.css`，节省 21.5KB (17.7%)
7. **图片懒加载**：为联系方式图片添加 `loading="lazy"` 和 `decoding="async"`
8. **图片压缩**：使用 sharp 压缩图片，节省 238.7KB (54.7%)

### 注意事项

- CSS 必须同步加载，否则会导致弹窗闪烁问题（弹窗在 CSS 加载前短暂可见）

### 文件大小统计

| 类别 | 文件 | 大小 |
|------|------|------|
| JS 数据 | peidan.js | 296KB |
| JS 数据 | mapping.js | 78KB |
| JS 数据 | status_codes.js | 52KB |
| JS 数据 | product_db.js | 28KB |
| JS 数据 | competitor.js | 16KB |
| JS 数据 | download_urls.js | 7KB |
| JS 数据 | cat_dist_map.js | 1KB |
| JS 模块 | app.js | 79KB |
| JS 模块 | bom.js | 23KB |
| JS 模块 | mapping_module.js | 9KB |
| JS 模块 | statuscode_module.js | 5KB |
| CSS | style.css | 124KB |
| CSS | style.min.css | 100KB |
| 图片 | 联系方式 JPG x3 | 338KB |
| 图片 | 码制说明 PNG x2 | 108KB |
| **总计** | | **~1.18MB** |

### 进一步优化建议

1. **图片压缩**：安装图片压缩工具（如 sharp、imagemin）压缩 JPG/PNG，可节省约 150KB
2. **CSS 压缩脚本**：修改 CSS 后运行 `node scripts/minify-css.js` 重新生成压缩版
