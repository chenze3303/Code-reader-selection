# AGENTS.md

## 项目概述

海康机器人读码器选型工具 V4.1。**Vite + Vue 3 构建**的前端 SPA，产物为纯静态文件，可部署到 GitHub Pages 任意子路径。旧版业务逻辑（`public/js/*`）保留为经典脚本，由 Vue 挂载完成后按序注入，直接操作 Vue 渲染的 DOM（id/class 与原版完全一致）。

## 架构

- **构建**：Vite（`vite build` → `dist/`）。`base: './'`，产物全部相对路径，支持子路径部署
- **入口**：`index.html` → `src/main.js`（Vue 挂载 `#app` + 按序加载 legacy 脚本）
- **页面**：`src/App.vue` 为组合根（skip-link + titlebar + 导航 + 各页面组件），已拆分为独立 SFC：
  - `src/components/PageHome.vue`、`PageSelection.vue`、`PageVerify.vue`（**嵌套在 PageSelection 内**）、`PageCompetitor.vue`、`PageBom.vue`、`PageStatuscode.vue`、`PageSdk.vue`、`PagePda.vue`、`PageSolutions.vue`、`PageMapping.vue`、`GlobalOverlays.vue`（所有弹窗/Lightbox/Toast）
  - 各组件模板由原 `index.html` body 对应区块迁移；**已用 Vue 响应式重写**的组件（`PageCompetitor`、`PageStatuscode`、`PageMapping`、`PageBom`）不再依赖 legacy 脚本：数据经 `useGlobalData` 读取、文案经 `useI18n` 的 `t()` 响应式绑定（模板内不再出现 `data-i18n`）；其余组件仍由 legacy 脚本驱动，模板内的 `@click`/`@change` 桥接函数定义在各组件自身 `<script setup>`（App.vue 仅保留 toggleLang/toggleTheme）
- **静态资源根**：`public/` 即站点根（构建时复制到 `dist/`）。含 `js/`（legacy 脚本与数据）、`assets/`（图片）、`db_editor.html`、`sdk-guide.html`、`peidan.html` 等独立页
- **数据文件**（`public/js/data/*.js`）：经典 `<script>` 注入的全局变量，**不是 ES 模块**
- **模块文件**（`public/js/*.js`）：app.js 主模块；`mapping_module.js`/`statuscode_module.js`/`competitor.js`/`bom.js` 已由 Vue 重写不再加载
- **Vue 重写数据抽取**：`src/data/competitorData.js`（竞品 39 条）、`src/data/namingData.js`（命名规则 8 部分 `title/html` + `titleEn/htmlEn`）为 ES module 导入
- **Three.js**（`public/js/three.min.js`）：3D 拼接方案渲染，由 `app.js` 动态加载
- **数据库编辑器**：`db_editor.html` — 独立数据编辑工具，含配件图片管理（图片列/选择弹窗/上传/导出 acc_imgs.js）。隐藏入口：主页面连续点击左上角 logo 3 次（600ms 内）
- **SDK 参考**：`sdk-guide.html` — 独立 SDK 参考页面
- **独立配单页**：`peidan.html` — 独立的 ID 产品配单表页面（自包含，内联 CSS/JS）
- **机器人浮动组件**：`src/App.vue` 中 `.floating-robot-wrap`，纯 CSS 机器人吉祥物 + 15 秒气泡提示（`onMounted` 隐藏），点击跳转 v-club 智能助手

## 关键约定

- 数据全局变量模式**不统一**，修改时需逐文件确认：
   - `peidan.js` → `window.PEIDAN_DATA`（含 `modelList` 数组，每项含 `materialCode`、`description`、`remark`、`standardAccessories`、`optionalAccessories`）
   - `acc_imgs.js` → `window.ACC_IMGS`（配件图片映射：归一化名称 → webp 文件名，62 条）
   - `product_imgs.js` → `window.PRODUCT_IMGS`（产品型号图片映射：型号 → webp 文件名，459 条）
   - `pda.js` → `window.PDA_DATA`（PDA 选型数据：`paramOrder` 39 项参数顺序 + `models` 19 款型号，每项含 `sub/main/name/intro/features/apps/params`）
   - `mapping.js` → `window.MAPPING_DATA`
  - `cat_dist_map.js` → `window.CAT_DIST_MAP`
  - `product_db.js` → `const PRODUCT_DB`（无 `window.`，但可通过 `typeof PRODUCT_DB` 检查）
  - `status_codes.js` → `var STATUS_CODES`（无 `window.`）
  - `competitor.js` → IIFE 内部 `var competitorDB`（非 `window.*`，同时包含 UI 渲染逻辑，通过 `window.COMPETITOR` 暴露接口）
  - `download_urls.js` → IIFE 内部 `var BASE_DOWNLOAD_URLS` 等
- 国际化（i18n）：HTML 元素 `data-i18n` 属性（文本）、`data-i18n-ph`（placeholder）、`data-i18n-alt`（alt）、`data-i18n-title`（title）、`data-i18n-html`（innerHTML），JS 中 `_t(key)` 函数；词典位于 `app.js` 的 `i18n = { zh: {...}, en: {...} }`；切换语言时 `applyLang()` 会重新渲染 BOM、产品表、竞品模块
- 命名规则弹窗：原 `NAMING_DATA`（mapping_module.js）已移入 `src/data/namingData.js`（ES module），弹窗本体从 GlobalOverlays 移入 PageMapping.vue（仅产品表页使用），部分高亮/详情均为 Vue 响应式渲染
- 暗黑模式：切换 `<html>` 元素的 `dark` class
- 搜索归一化：去除 `MV-` 前缀，大小写不敏感
- 样式规范：12px 外边距，10px 圆角卡片，38px 统一控件高度
- CSS 由 Vite 打包（`src/main.js` import `css/style.css`），产物自动内容哈希，**无需手动 `?v=N` 缓存破坏**
- 缓存破坏：编辑 `public/js/*.js` / `public/js/data/*.js` 源码后需运行 `node scripts/minify-js.js` 重新生成 `.min.js`（legacy 加载无版本号，靠文件名变化 + 部署刷新）
- **Vue 模板内联事件桥接**：各组件（`src/components/*.vue`）将原 `onclick="toggleLang()"` 等改为 `@click="toggleLang"`，`<script setup>` 中定义桥接函数转发到 `window.*`（`copySdkCode` 转发 `e.currentTarget`）；改动某组件模板事件时需同时检查该组件的 setup 桥接。桥接分布：`toggleLang/toggleTheme`→App.vue；`showVerifyPage/imgFallback`→PageSelection.vue；`hideVerifyPage/runVerify/onVerifySeriesChange/onVerifyResChange`→PageVerify.vue；`copySdkCode`→PageSdk.vue
- **Vue 重写机制**（PageCompetitor/PageStatuscode/PageMapping 模式）：`useLegacy.js` 的 `useGlobalData(name)` 在 `legacy-ready` 事件（main.js 全部脚本加载完成后 dispatch）后读取 `window[name]`；`useI18n.js` 的 `currentLang` ref 初始为 null 保证首次 `applyLang` 也触发重渲染，`__onLangChange`（app.js applyLang 第 8 步调用）驱动语言切换。注意 legacy 脚本在 Vue 挂载后加载，setup 内不可同步读全局数据

## 脚本加载顺序

浏览器加载的是 `public/js/` 下的 `.min.js` 文件（非源码 `.js`）。Vue 挂载完成后，`src/main.js` 的 `legacyScripts` 数组按序注入，保证执行顺序（等价原 `defer` 语义）：

1. `js/data/product_db.min.js` / `mapping.min.js` / `download_urls.min.js` / `announcement.min.js` / `product_imgs.js` / `acc_imgs.js` / `pda.js` — 数据文件
2. `js/app.min.js` — 主模块（依赖上述数据）
3. `js/data/status_codes.min.js` — 状态码数据（由 PageStatuscode.vue 经 `useGlobalData('STATUS_CODES')` 读取）

> 已重写组件不再加载对应 legacy 模块：`mapping_module.min.js`、`statuscode_module.min.js`、`competitor.min.js`、`bom.min.js` 已从 `legacyScripts` 移除。PageMapping.vue 在 `onMounted` 注册 `window.MAPPING`（含 `handleTabClick` 4 连击切代码列、`rerender` 空实现）；PageBom.vue 注册 `window.BOM`（`rerender` 空实现 + `exportCSV`/`clearBOM` 等），保证 `app.js` 的 applyLang/导航 tab 引用仍然可用。PEIDAN 数据（2.9MB）由 PageBom.vue 在挂载时按需注入 `js/data/peidan.min.js`（不随首屏加载）。

**按需加载（非首屏）：**
- `peidan.min.js`（2.9 MB）— 由 `app.js` 动态加载，仅用户打开配单表时触发
- `three.min.js`（589 KB）— 由 `app.js` 动态加载，仅用户打开拼接方案 3D 时触发
- 首屏渲染完成后，`app.js` 会通过 `requestIdleCallback` 后台预加载这两个文件

**编辑源码 `.js` 后必须重新生成 `.min.js`**（见"开发命令"）。legacy 脚本路径以站点根相对（`public/` 即根，URL 为 `js/...`、`assets/...`）。

## 开发命令

```bash
# 安装依赖（首次 / package.json 变更后）
npm install

# 开发服务器
npm run dev

# 生产构建（输出 dist/）
npm run build

# 预览构建产物
npm run preview

# JS 压缩（编辑任意 public/js/ 下的 .js 后运行）
node scripts/minify-js.js
node scripts/minify-js.js --check   # 仅验证已有 .min.js 的语法正确性

# CSS 压缩（编辑 css/style.css 后运行；Vite 构建会自动打包源文件）
node scripts/minify-css.js

# 配件图片压缩（原图放 public/assets/accessories/ 后运行）
node scripts/acc_compress.js

# 压力测试（115 项自动化测试）
node scripts/test-stress.js

# 配单数据转换（product_data.json → peidan.js）
node scripts/convert_product_data.js

# Excel ↔ JS 数据互转
node scripts/excel2js.js data_export.xlsx          # Excel → public/js/data/
node scripts/js2excel.js                           # public/js/data/ → data_export.xlsx

# 资料下载数据抓取（需 agent-browser + Chromium，约 5-10 分钟）
npm i -g agent-browser
node scripts/scrape_base_downloads.js              # → public/js/data/downloads.js
node scripts/scrape_dist_downloads.js              # → public/js/data/dist_downloads.js
node scripts/gen_download_urls.js                  # → public/js/data/download_urls.js
```

## 数据更新流程

1. **推荐**：打开 `db_editor.html` → 编辑 → 导出 → 替换 `public/js/data/` 下的对应文件 → 运行 `node scripts/minify-js.js`
2. **直接编辑**：修改 `public/js/data/` 下的 `.js` 文件 → 运行 `node scripts/minify-js.js` → 重新 `npm run build` / 刷新开发页
3. **配件图片**：原图放 `public/assets/accessories/` → 运行 `node scripts/acc_compress.js`（压缩 webp + 生成 manifest）→ 在 `db_editor.html` 配单 tab 中应用图片 → 导出 acc_imgs.js
4. **配单数据**：修改 `product_data.json` → 运行 `node scripts/convert_product_data.js` → 运行 `node scripts/minify-js.js`

注意：`db_editor.html` 导出竞品数据时文件名为 `competitor_data.js`，但实际数据文件是 `competitor.js`——导出后需手动重命名。

## 文件速查

| 文件 | 说明 |
|------|------|
| `index.html` | Vite 入口（`#app` + `/src/main.js`，保留 meta/theme-color） |
| `src/main.js` | Vue 挂载 + legacy 脚本按序注入 |
| `src/App.vue` | 组合根（titlebar + 导航 + 页面组件 + 内联样式） |
| `src/components/*.vue` | 各页面/弹窗 SFC（模板静态化，逻辑由 legacy 脚本驱动） |
| `src/data/competitorData.js` | 竞品数据（ES module，PageCompetitor.vue 导入） |
| `src/data/namingData.js` | 命名规则数据（ES module，PageMapping.vue 导入） |
| `src/composables/useI18n.js` | 响应式 i18n（`currentLang` ref + `t()`） |
| `src/composables/useLegacy.js` | `legacy-ready` 事件 + `useGlobalData(name)` 读取全局数据 |
| `vite.config.js` | Vite 配置（`base:'./'`，outDir `dist`） |
| `public/js/data/product_db.js` | 选型产品数据库（`const PRODUCT_DB`） |
| `public/js/data/mapping.js` | 产品表数据（`window.MAPPING_DATA`） |
| `public/js/data/peidan.js` | 配单数据（`window.PEIDAN_DATA`，含 707 个型号） |
| `public/js/data/acc_imgs.js` | 配件图片映射（`window.ACC_IMGS`，62 条，归一化名称 → webp） |
| `public/js/data/product_imgs.js` | 产品型号图片映射（`window.PRODUCT_IMGS`，459 条，型号 → webp） |
| `public/js/data/pda.js` | PDA 选型数据（`window.PDA_DATA`，19 款 IDP 型号 × 39 项参数，未压缩直接加载） |
| `public/js/data/competitor.js` | 竞品对标模块（IIFE 内 `var competitorDB` + UI 逻辑） |
| `public/js/data/status_codes.js` | 状态码数据（`var STATUS_CODES`，257 条，162 条含解决方法） |
| `public/js/data/download_urls.js` | 各系列下载 URL（IIFE），**自动生成，勿手动编辑** |
| `public/js/data/cat_dist_map.js` | 系列→经销型号前缀映射（`window.CAT_DIST_MAP`） |
| `product_data.json` | 配单原始数据源（24 列扁平格式，通过转换脚本生成 peidan.js） |
| `public/js/app.js` | 智能选型主逻辑（PPM/视野计算、i18n、Toast、导航、PPM计算器、拼接方案含排序工具栏、PDA 选型模块 PDA_FILTERS/initPda） |
| `public/js/bom.js` | 配单表逻辑（已由 PageBom.vue 重写，**不再加载**，仅留作参考；型号树/配件弹窗/电源联动/CSV 导出/资料下载/快速搜索反查均已 Vue 化） |
| `public/js/mapping_module.js` | 产品表逻辑（已由 PageMapping.vue 重写，**不再加载**，仅留作参考） |
| `public/js/statuscode_module.js` | 状态码查询逻辑（已由 PageStatuscode.vue 重写，**不再加载**） |
| `scripts/test-stress.js` | 压力测试脚本（115 项自动化测试） |
| `scripts/acc_compress.js` | 配件图片 webp 压缩 + manifest.json 生成 |
| `public/js/three.min.js` | Three.js 3D 渲染（拼接方案示意图） |
| `css/style.css` | 全局样式（PC + 移动端响应式 + 暗黑模式），Vite 打包入口 |
| `src/App.vue` 内 `.floating-robot-wrap` | 机器人浮动吉祥物组件（纯 CSS + 气泡提示） |
| `public/assets/accessories/` | 配件图片（原图 PNG/JPG + webp 压缩版 + manifest.json） |
| `public/assets/products/` | 产品型号图片（原图 PNG + webp 压缩版） |
| `public/exports/` | 导出的 Excel 数据文件 |
| `public/sdk-guide.html` | 独立 SDK 参考完整文档页（72KB） |
| `public/peidan.html` | 独立配单表页面（自包含，内联所有 CSS/JS） |
| `public/海康读码器命名规则_副本.html` | 命名规则参考页面（独立静态文件） |
| `index.legacy.html` | 迁移前的原始 `index.html` 完整备份（模板回退参考，勿部署） |

## 注意事项

- **无测试框架**：`scripts/test-stress.js` 是独立 Node 脚本；`package.json` type 为 `module`（Vite 项目，脚本若用 `require` 需 `.cjs` 后缀）
- 部署：构建产物为 `dist/`，整体上传至 GitHub Pages（`base:'./'` 支持子路径）
- `download_urls.js` 由脚本生成，手动编辑会在下次抓取时被覆盖
- `cat_dist_map.js` 被 `minify-js.js` 压缩为 `.min.js`，但不在 legacy 脚本列表直接加载（由模块运行时引用）
- `competitor.js` 是 IIFE，包含竞品数据 + UI 渲染逻辑，不是纯数据文件
- CSS 由 Vite 同步打包进 JS/HTML（非 defer），无弹窗闪烁问题
- 主题/语言持久化使用 `localStorage` 键 `theme` / `lang`
- 配单表状态持久化使用 `localStorage` 键 `hikrob…tate`（含大类/系列/型号/配件勾选/bomList）
- `db_editor.html` 打开时自动加载数据，无需手动导入
- `peidan.html` 是独立自包含页面，不依赖 `index.html` 或共享模块
- **迁移注意**：Vue 模板为静态（无响应式绑定），legacy 脚本直接改 DOM 不会触发 Vue 重渲染；不要给模板元素添加 `v-for`/响应式绑定，否则会与 legacy DOM 操作冲突
