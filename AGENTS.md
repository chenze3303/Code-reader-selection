# AGENTS.md

## 项目概述

海康机器人读码器选型工具 V4.1。纯前端，无需构建系统或服务器——浏览器直接打开 `index.html` 即可运行。

## 架构

- **入口**：`index.html` — 通过 `<script defer>` 加载数据和模块，脚本顺序很重要（见下文）
- **数据文件**（`js/data/*.js`）：通过 `<script>` 标签注入的全局变量，**不是 ES 模块**
- **模块文件**（`js/*.js`）：各功能模块逻辑（app.js、bom.js、mapping_module.js、statuscode_module.js）
- **Three.js**（`js/three.min.js`）：3D 拼接方案渲染，`defer` 加载
- **数据库编辑器**：`db_editor.html` — 独立数据编辑工具，含配件图片管理（图片列/选择弹窗/上传/导出 acc_imgs.js）。隐藏入口：主页面连续点击左上角 logo 3 次（600ms 内）
- **SDK 参考**：`sdk-guide.html` — 独立 SDK 参考页面
- **独立配单页**：`peidan.html` — 独立的 ID 产品配单表页面（自包含，内联 CSS/JS）
- **机器人浮动组件**：`index.html` 中 `.floating-robot-wrap`，纯 CSS 机器人吉祥物 + 15 秒气泡提示，点击跳转 v-club 智能助手

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
- 命名规则弹窗 `NAMING_DATA`（mapping_module.js）含 `title/html` 与 `titleEn/htmlEn` 双版本，渲染时按当前语言选择
- 暗黑模式：切换 `<html>` 元素的 `dark` class
- 搜索归一化：去除 `MV-` 前缀，大小写不敏感
- 样式规范：12px 外边距，10px 圆角卡片，38px 统一控件高度
- CSS 版本通过 `index.html` 中的查询字符串控制（当前 `style.min.css?v=43`）
- 缓存破坏：编辑 JS/CSS 后需同步更新 `index.html` 中对应的 `?v=N` 参数（CSS/JS 与数据模块均带版本号）

## 脚本加载顺序

浏览器加载的是 `.min.js` 文件（非源码 `.js`）。`defer` 保证按声明顺序执行：

1. `product_db.min.js` / `competitor.min.js` / `mapping.min.js` / `download_urls.min.js` / `acc_imgs.js` / `product_imgs.js` / `pda.js` — 数据文件
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

# 配件图片压缩（原图放 assets/accessories/ 后运行）
node scripts/acc_compress.js

# 压力测试（115 项自动化测试）
node scripts/test-stress.js

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
3. **配件图片**：原图放 `assets/accessories/` → 运行 `node scripts/acc_compress.js`（压缩 webp + 生成 manifest）→ 在 `db_editor.html` 配单 tab 中应用图片 → 导出 acc_imgs.js
4. **配单数据**：修改 `product_data.json` → 运行 `node scripts/convert_product_data.js` → 运行 `node scripts/minify-js.js`

注意：`db_editor.html` 导出竞品数据时文件名为 `competitor_data.js`，但实际数据文件是 `competitor.js`——导出后需手动重命名。

## 文件速查

| 文件 | 说明 |
|------|------|
| `js/data/product_db.js` | 选型产品数据库（`const PRODUCT_DB`） |
| `js/data/mapping.js` | 产品表数据（`window.MAPPING_DATA`） |
| `js/data/peidan.js` | 配单数据（`window.PEIDAN_DATA`，含 707 个型号） |
| `js/data/acc_imgs.js` | 配件图片映射（`window.ACC_IMGS`，62 条，归一化名称 → webp） |
| `js/data/product_imgs.js` | 产品型号图片映射（`window.PRODUCT_IMGS`，459 条，型号 → webp） |
| `js/data/pda.js` | PDA 选型数据（`window.PDA_DATA`，19 款 IDP 型号 × 39 项参数，未压缩直接加载） |
| `js/data/competitor.js` | 竞品对标模块（IIFE 内 `var competitorDB` + UI 逻辑） |
| `js/data/status_codes.js` | 状态码数据（`var STATUS_CODES`，257 条，162 条含解决方法） |
| `js/data/download_urls.js` | 各系列下载 URL（IIFE），**自动生成，勿手动编辑** |
| `js/data/cat_dist_map.js` | 系列→经销型号前缀映射（`window.CAT_DIST_MAP`） |
| `product_data.json` | 配单原始数据源（24 列扁平格式，通过转换脚本生成 peidan.js） |
| `js/app.js` | 智能选型主逻辑（PPM/视野计算、i18n、Toast、导航、PPM计算器、拼接方案含排序工具栏、PDA 选型模块 PDA_FILTERS/initPda） |
| `js/bom.js` | 配单表（型号树、选配件弹窗、电源联动、标配替换、CSV 导出、资料下载、快速搜索配件反查/系列标签跳转、配件图片显示） |
| `js/mapping_module.js` | 产品表（搜索、筛选、分组、资料下载、命名规则弹窗） |
| `js/statuscode_module.js` | 状态码查询（搜索、筛选、复制） |
| `scripts/test-stress.js` | 压力测试脚本（115 项自动化测试） |
| `scripts/acc_compress.js` | 配件图片 webp 压缩 + manifest.json 生成 |
| `js/three.min.js` | Three.js 3D 渲染（拼接方案示意图） |
| `css/style.css` | 全局样式（PC + 移动端响应式 + 暗黑模式） |
| `index.html` 内 `.floating-robot-wrap` | 机器人浮动吉祥物组件（纯 CSS + 内联 JS 气泡） |
| `assets/accessories/` | 配件图片（原图 PNG/JPG + webp 压缩版 + manifest.json） |
| `assets/products/` | 产品型号图片（原图 PNG + webp 压缩版） |
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
- 配单表状态持久化使用 `localStorage` 键 `hikrob…tate`（含大类/系列/型号/配件勾选/bomList）
- `db_editor.html` 打开时自动加载数据，无需手动导入
- `peidan.html` 是独立自包含页面，不依赖 `index.html` 或共享模块
