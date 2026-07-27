# AGENTS.md

## 项目概述

海康机器人读码器选型工具 V3.7。纯前端，无需构建系统或服务器——浏览器直接打开 `index.html` 即可运行。

## 架构

- **入口**：`index.html` — 通过 `<script defer>` 加载数据和模块，脚本顺序很重要（见下文）
- **数据文件**（`js/data/*.js`）：通过 `<script>` 标签注入的全局变量，**不是 ES 模块**
- **模块文件**（`js/*.js`）：各功能模块逻辑（app.js、bom.js、mapping_module.js、statuscode_module.js）
- **Three.js**（`js/three.min.js`）：3D 拼接方案渲染，`defer` 加载
- **数据库编辑器**：`db_editor.html` — 独立数据编辑工具。隐藏入口：主页面连续点击左上角 logo 3 次（600ms 内）
- **SDK 参考**：`sdk-guide.html` — 独立 SDK 参考页面
- **独立配单页**：`peidan.html` — 独立的 ID 产品配单表页面（自包含，内联 CSS/JS）
- **机器人浮动组件**：`index.html` 中 `.floating-robot-wrap`，纯 CSS 机器人吉祥物 + 15 秒气泡提示，点击跳转 v-club 智能助手

## 关键约定

- 数据全局变量模式**不统一**，修改时需逐文件确认：
  - `peidan.js` → `window.PEIDAN_DATA`（含 `modelList` 数组，每项含 `materialCode`、`description`、`remark`、`standardAccessories`、`optionalAccessories`）
  - `mapping.js` → `window.MAPPING_DATA`
  - `cat_dist_map.js` → `window.CAT_DIST_MAP`
  - `product_db.js` → `const PRODUCT_DB`（无 `window.`，但可通过 `typeof PRODUCT_DB` 检查）
  - `status_codes.js` → `var STATUS_CODES`（无 `window.`）
  - `competitor.js` → IIFE 内部 `var competitorDB`（非 `window.*`，同时包含 UI 渲染逻辑，通过 `window.COMPETITOR` 暴露接口）
  - `download_urls.js` → IIFE 内部 `var BASE_DOWNLOAD_URLS` 等
- 国际化（i18n）：HTML 元素 `data-i18n` 属性，JS 中 `_t(key)` 函数；切换语言时 `applyLang()` 会重新渲染 BOM、产品表、竞品模块
- 暗黑模式：切换 `<html>` 元素的 `dark` class
- 搜索归一化：去除 `MV-` 前缀，大小写不敏感
- 样式规范：12px 外边距，10px 圆角卡片，38px 统一控件高度
- CSS 版本通过 `index.html` 中的查询字符串控制（`style.min.css?v=3`）
- 缓存破坏：编辑 JS/CSS 后需同步更新 `index.html` 中对应的 `?v=N` 参数

## 脚本加载顺序

浏览器加载的是 `.min.js` 文件（非源码 `.js`）。`defer` 保证按声明顺序执行：

1. `product_db.min.js` / `competitor.min.js` / `mapping.min.js` / `download_urls.min.js` — 数据文件
2. `app.min.js` — 主模块（依赖上述数据）
3. `bom.min.js` — 配单模块
4. `mapping_module.min.js` — 产品表模块
5. `status_codes.min.js` — 状态码数据
6. `statuscode_module.min.js` — 状态码模块

**按需加载（非首屏）：**
- `peidan.min.js`（2.9 MB）— 由 `bom.js` 动态加载，仅用户打开配单表时触发
- `three.min.js`（589 KB）— 由 `app.js` 动态加载，仅用户打开拼接方案 3D 时触发
- 首屏渲染完成后，`app.js` 会通过 `requestIdleCallback` 后台预加载这两个文件

**编辑源码 `.js` 后必须重新生成 `.min.js`**（见"开发命令"）。

## 开发命令

```bash
# JS 压缩（编辑任意 js/ 下的 .js 后运行）
node scripts/minify-js.js
node scripts/minify-js.js --check   # 仅验证已有 .min.js 的语法正确性

# CSS 压缩（编辑 css/style.css 后运行）
node scripts/minify-css.js

# 配单数据转换（product_data.json → peidan.js）
node scripts/convert_product_data.js

# Excel ↔ JS 数据互转
node scripts/excel2js.js data_export.xlsx          # Excel → js/data/
node scripts/js2excel.js                           # js/data/ → data_export.xlsx

# 资料下载数据抓取（需 agent-browser + Chromium，约 5-10 分钟）
npm i -g agent-browser
node scripts/scrape_base_downloads.js              # → js/data/downloads.js
node scripts/scrape_dist_downloads.js              # → js/data/dist_downloads.js
node scripts/gen_download_urls.js                  # → js/data/download_urls.js
```

## 数据更新流程

1. **推荐**：打开 `db_editor.html` → 编辑 → 导出 → 替换 `js/data/` 下的对应文件 → 运行 `node scripts/minify-js.js`
2. **直接编辑**：修改 `js/data/` 下的 `.js` 文件 → 运行 `node scripts/minify-js.js` → 刷新 `index.html`
3. **配单数据**：修改 `product_data.json` → 运行 `node scripts/convert_product_data.js` → 运行 `node scripts/minify-js.js`

注意：`db_editor.html` 导出竞品数据时文件名为 `competitor_data.js`，但实际数据文件是 `competitor.js`——导出后需手动重命名。

## 文件速查

| 文件 | 说明 |
|------|------|
| `js/data/product_db.js` | 选型产品数据库（`const PRODUCT_DB`） |
| `js/data/mapping.js` | 产品表数据（`window.MAPPING_DATA`） |
| `js/data/peidan.js` | 配单数据（`window.PEIDAN_DATA`，含 503 个型号） |
| `js/data/competitor.js` | 竞品对标模块（IIFE 内 `var competitorDB` + UI 逻辑） |
| `js/data/status_codes.js` | 状态码数据（`var STATUS_CODES`） |
| `js/data/download_urls.js` | 各系列下载 URL（IIFE），**自动生成，勿手动编辑** |
| `js/data/cat_dist_map.js` | 系列→经销型号前缀映射（`window.CAT_DIST_MAP`） |
| `product_data.json` | 配单原始数据源（24 列扁平格式，通过转换脚本生成 peidan.js） |
| `js/app.js` | 智能选型主逻辑（PPM/视野计算、i18n、Toast、导航、PPM计算器、拼接方案） |
| `js/bom.js` | 配单表（型号树、选配件弹窗、电源联动、标配替换、CSV 导出、资料下载） |
| `js/mapping_module.js` | 产品表（搜索、筛选、分组、资料下载、命名规则弹窗） |
| `js/statuscode_module.js` | 状态码查询（搜索、筛选、复制） |
| `js/three.min.js` | Three.js 3D 渲染（拼接方案示意图） |
| `css/style.css` | 全局样式（PC + 移动端响应式 + 暗黑模式） |
| `index.html` 内 `.floating-robot-wrap` | 机器人浮动吉祥物组件（纯 CSS + 内联 JS 气泡） |
| `assets/` | 图片资源（联系方式、码制说明图） |
| `exports/` | 导出的 Excel 数据文件 |
| `sdk-guide.html` | 独立 SDK 参考完整文档页（72KB） |
| `peidan.html` | 独立配单表页面（自包含，内联所有 CSS/JS） |
| `海康读码器命名规则_副本.html` | 命名规则参考页面（独立静态文件） |

## 注意事项

- **无测试框架**：`package.json` 的 test 脚本是占位符；`package.json` type 为 `commonjs`（脚本用 `require`）
- `download_urls.js` 由脚本生成，手动编辑会在下次抓取时被覆盖
- `cat_dist_map.js` 被 `minify-js.js` 压缩为 `.min.js`，但不在 `index.html` 中直接加载（由模块运行时引用）
- `competitor.js` 是 IIFE，包含竞品数据 + UI 渲染逻辑，不是纯数据文件
- CSS 必须同步加载（不能 defer），否则弹窗会闪烁（CSS 未加载前弹窗短暂可见）
- 主题/语言持久化使用 `localStorage` 键 `theme` / `lang`
- `db_editor.html` 打开时自动加载数据，无需手动导入
- `peidan.html` 是独立自包含页面，不依赖 `index.html` 或共享模块
