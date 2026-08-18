# 海康机器人读码器选型工具 — 技术文档

## 项目简介

海康机器人读码器（Code Reader）智能选型 / 多相机拼接 / PPM 计算 / 竞品对标 / 配单生成 / 产品对照 / 状态码查询 / 资料下载工具。纯前端实现，无需服务器，浏览器直接打开 `index.html` 即可使用。

---

## 功能模块

### 1. 智能选型（app.js → page-selection）

输入码制类型、模块尺寸、工作距离、期望视野，自动计算 PPM 并推荐最佳读码器型号。

### 2. PPM 计算（app.js → page-verify）

选定具体型号，输入工作距离和模块尺寸，计算该型号的 FOV、PPM、最大曝光时间。

- 三级筛选：产品大类 → 分辨率（以万像素显示） → 具体型号
- 工作距离范围校验（基于 PRODUCT_DB 的 workingDist 字段）
- 运动速度选填，填写后计算最大曝光时间
- 示意图实时更新

### 3. 多相机拼接（app.js → page-stitch）

复用选型页面，当单相机视野不足时计算多相机拼接方案。

- 3D 视野图（Three.js 渲染）
- 方案弹窗：系列筛选 + 排序工具栏（下拉框形式），支持按相机数量 / 分辨率正反序排序
  - `sortStitchResults()` 统一排序逻辑，排序状态存于 `window._stitchSort = { field, dir }`
  - `buildPlanList()` 复用函数：系列筛选与排序共用同一套列表渲染与点击绑定
- 拼接数据面板：2-2-2-1 网格布局（相机数量/单机视野/总覆盖/需求覆盖/PPM/安装高度/重叠区域）
- 资料下载按钮联动产品表

### 4. 竞品对标（competitor.js → page-competitor）

39 条友商型号与海康对应型号的对标信息，覆盖 7 个品牌：Cognex、Keyence、Datalogic、思谋、华睿、视界、新大陆。

### 5. 配单表（bom.js → page-bom）

三级联动选型：产品大类 → 产品系列 → 具体型号，自动生成 BOM。

#### 配件图片显示

- `getAccImg(name)` 函数：对配件名称做长度归一化后查找 `ACC_IMGS` 映射表
- 归一化规则：`([,_-])(\d+(?:\.\d+)?)m\b` → `$1{LEN}m`（仅匹配小写 m+分隔符，避免误伤 `060M` 等型号）
- 同一型号不同长度（2m/3m/5m）共用一张图（key 中 `{LEN}m` 为占位符）
- 图片文件位于 `assets/accessories/webp/`，映射关系在 `js/data/acc_imgs.js`

#### 数据结构

```javascript
PEIDAN_DATA = {
  modelList: [
    {
      productCategory: "ID800系列",      // 产品大类
      productSeries: "ID803系列U口",     // 产品系列
      productModel: "MV-ID803M-03S-WBN-SR-U(国内标配)",
      materialCode: "313201715",          // 相机自身物料代码
      description: "0.3MP，3.1m镜头...",  // 相机描述
      remark: "支持U口/串口线缆互换",     // 备注
      standardAccessories: [              // 标配配件
        { category: "一体线", series: "2m普通", name: "...", code: "...", detail: "..." }
      ],
      optionalAccessories: [              // 选配配件
        { category: "电源", series: "电源适配器", name: "...", code: "...", detail: "..." }
      ]
    }
  ]
}
```

#### 配件分类体系

| 分类 | 图标 | 说明 |
|------|------|------|
| 一体线 | 🔌 | 相机一体线缆（USB/串口/网口） |
| IO线 | 🔗 | IO 电源线 |
| 网线 | 🌐 | RJ45 网线 |
| 电源 | ⚡ | 电源适配器、开关电源、电源线 |
| 安装板 | 📐 | 安装支架 |
| 灯板 | 💎 | 外置灯板 |
| 镜头罩 | 🛡 | 镜头保护罩 |
| FA镜头 | 🔭 | FA 工业镜头 |
| 扩展配件 | 📦 | 其他扩展配件 |

#### 电源联动逻辑

选中电源适配器时自动勾选对应电源线缆，反之亦然（取消时同步取消）：

| 选中项 series | 自动勾选 series |
|---|---|
| `电源适配器` / `电源适配器DC` | `电源适配器线缆` |
| `电源适配器线缆` | `电源适配器` / `电源适配器DC` |
| `开关电源1` / `开关电源2` | `开关电源线缆` |
| `开关电源线缆` | `开关电源1` / `开关电源2` |

#### 标配替换逻辑

当某个分类有选配件被选中时，该分类的标配配件自动从配单中移除。

#### 线缆筛选

弹窗中支持按长度和材质筛选：
- **长度**：2m, 3m, 3.5m, 5m, 7m, 10m, 15m, 20m, 30m
- **材质**：普通, 高柔, 超柔, 弯头（支持中英文 HF=高柔, ST=普通）

#### 资料下载

配单明细底部自动匹配主机型号在 mapping 数据中的下载链接，跳转海康官网资料下载页面。

匹配策略（6 级）：
1. baseName 精确包含 BOM 型号
2. distName 精确包含 BOM 型号
3. BOM 型号反向包含 baseName（去括号后）
4. BOM 型号反向包含 distName（去括号后）
5. 去括号后互相包含
6. 系列前缀 fallback（如 ID5120RM）

命中率 72.8%，有下载 URL 覆盖 66.9%。未命中主要是手持式读码器等无产品表条目的型号。

#### 快速搜索

选型页面提供快速搜索框，支持型号名称或物料代码模糊搜索，快速定位并选中型号。

**配件反查展示适配系列：**
- `reverseIndex[code]` 由 `buildReverseIndex()` 构建，每件配件记录 `models: [{ name, type, cat, ser }]`（含所属大类/系列，跳转免二次遍历）
- 搜索配件时按 `(大类, 系列)` 分组去重，只展示系列标签（系列名 + 适配型号数），避免型号过多卡顿
- 点击系列标签 → `selectProductByMatch(m, extraAccCode)`：自动选中该系列第一个型号生成配单，并把搜索的配件一并加入清单（若已在该型号标配中则不重复）
- 点击配件项主体 → 直接加入配单

**重置逻辑（clearBOM）：**
- 清除选配勾选并把标配标记回 `accCodes`，随后重新调用 `autoGenerateBOM()` 重建配单
- 这样被选配替换掉的标配（如线缆）会在重置后自动恢复，而不仅是 filter 掉选配

### 6. 产品表（mapping_module.js → page-mapping）

503 条基线型号 ↔ 经销型号的物料代码对照，按系列分组折叠显示。支持资料下载直达海康官网。

### 7. 状态码查询（statuscode_module.js → page-statuscode）

257 条海康读码器 SDK 状态码定义，按 10 个分类组织。162 条附带解决方法，支持模糊搜索、分类筛选、点击复制。

### 8. 方案解决（page-solutions）

固件下载、SDK 参考文档、STEP/DXF 在线查看器、技术方案等常用资源快速入口。

### 9. PDA 选型（app.js → page-pda）

IDP 系列智能移动终端型号参数对比，数据来自机器人 PDA 在售设备参数梳理 Excel。

- **数据**：`js/data/pda.js` → `window.PDA_DATA`（`paramOrder` 39 项参数 + `models` 19 款型号，直接加载不压缩）
- **变体继承**：Excel 稀疏表中变体型号（`/64G`、`/A/4&64`、`/5G`、`/07ER`、`/DP`）只记录差异参数，构建时自动继承同系列基准型号参数并覆盖差异项（`main` 字段归一化：去掉 `/机器人`、`/海康机器人` 后缀）
- **筛选**：`PDA_FILTERS` 配置数组驱动，8 个维度（系列/防护等级/NFC/操作系统/屏幕尺寸/处理器/OCR/电池容量），`buildPdaFilters()` 动态生成下拉、`pdaFilterMatch()` 统一过滤、`renderPdaTable()` 渲染表头+39 行参数
- **取值函数**：`pdaIpValue`（正则 `/IP\d+/`）、`pdaOsValue`（归一化 Android 版本）、`pdaScreenValue`（英寸）、`pdaCpuValue`（GHz）、`pdaOcrText`（不支持→no）、`pdaBatteryValue`（mAh）
- **表格**：`table-layout: auto` + 型号列 `min-width:150px`，型号多时自动横向滚动（`#pdaTableScroll` 加 `has-hscroll` 类提示），型号少时填满视口；参数列 130px 固定 + `position: sticky` 冻结吸附
- **布局**：页面仅含筛选栏 + 型号统计 + 表格；筛选栏 3 列 grid 下拉（label 3.4rem 固定宽、select 等宽 268px、`margin:0` 保证垂直居中）
- **移动端**：`@media (max-width:768px)` 下顶栏隐藏 PDA tab，入口移入「更多」弹窗（`more-popup-item[data-page="page-pda"]`）；首页卡片保留

### 10. 机器人智能助手 · 小V（浮动组件）

右下角浮动的纯 CSS 机器人吉祥物，点击跳转海康机器视觉 v-club 智能助手。

- **结构**：`index.html` 中 `.floating-robot-wrap` 容器，包含 `<a>` 链接和气泡两部分
- **定位**：`position: absolute`，`top: 80%; right: 100px`，悬浮在所有页面内容上方
- **气泡**：页面加载时显示提示语，15 秒后通过内联 `<script>` 自动隐藏
- **样式**：纯 CSS 绘制天线、LED 眼睛（左右扫视动画）、蓝色呼吸灯心脏
- **悬停**：机器人上浮摇摆 + 眼睛变好奇 + 心脏变橙加速跳动
- **移动端**：`@media (max-width: 768px)` 下 `display: none`
- **暗黑模式**：`.dark .robot-head`、`.dark .robot-body` 覆盖背景和边框色

相关 CSS 类：`.floating-robot-wrap`、`.floating-robot`、`.robot`、`.robot-antenna`、`.robot-head`、`.robot-face`、`.robot-eye`、`.robot-body`、`.robot-heart`、`.robot-label`、`.robot-bubble`、`.robot-bubble-text`

### 11. SDK 参考（page-sdk）

页面内嵌的二次开发学习指南，提供 C / C# 两套语言的开发文档（MvCodeReader SDK v1.0）。

- **侧边目录**：快速导航 + 完整文档外链 + C/C# 语言切换
- **章节**：开发环境配置、编程流程（连接→运行→释放）、参数设置（节点类型映射）、触发模式、常见错误排查、API 速查
- **代码块**：带复制按钮与语法高亮，注释随语言切换翻译
- **全量双语**：约 160 个 i18n 词条，覆盖 TOC、横幅、路径卡片、章节标题、表格、代码注释
- 独立完整版：`sdk-guide.html`（72KB 静态页，含全部章节与代码示例）

### 12. 配件图片系统

#### 数据结构

`js/data/acc_imgs.js` — 配件名称→webp 文件名映射（归一化名称为 key）：

```javascript
window.ACC_IMGS = {
  "MV-IDA-P-M12A12pF-open-ST-{LEN}m": "MV-IDA-P-M12A12pF-open-ST-3m.webp",
  "MV-IDA-P-M12A12pF-open-HF-{LEN}m": "MV-IDA-P-M12A12pF-open-ST-3m.webp",
  "ID2000M隔离支架": "ID2000M隔离支架.webp",
  "MV-IDA-C-Y-62-62-HP(国内中性)": "MV-IDA-C-Y-62-62-Y.webp"
};
```

- key 为归一化名称（长度替换为 `{LEN}m`），value 为 webp 文件名
- 同一 key 共享一张图（不同颜色/材质的同型号配件共用）
- 当前 62 条映射，覆盖 99 个配件、33 张图

`js/data/product_imgs.js` — 产品型号→webp 文件名映射：

```javascript
window.PRODUCT_IMGS = {
  "MV-ID2013EM-05-RBN(国内标配)V1.5": "20260728060115043.webp",
  "MV-ID803M-03S-WBN(国内标配)": "20260811120020440.webp"
};
```

- key 为完整产品型号名称，value 为 webp 文件名
- 当前 459 条映射

#### 图片文件管理

- 原图：`assets/accessories/`（PNG/JPG）
- webp 压缩版：`assets/accessories/webp/`（sharp quality 82）
- 清单：`assets/accessories/manifest.json`（由 `scripts/acc_compress.js` 生成）
- 压缩脚本：`node scripts/acc_compress.js`（扫描原图→压缩 webp→生成 manifest）

#### 配件图片归一化算法

```javascript
function getAccImg(name) {
  if (!name || !window.ACC_IMGS) return '';
  var n = name
    .replace(/([,_-])(\d+(?:\.\d+)?)m\b/g, '$1{LEN}m')     // 2m → {LEN}m
    .replace(/([,_-])(\d+(?:\.\d+)?)米/g, '$1{LEN}米')      // 2米 → {LEN}米
    .replace(/(\d+(?:\.\d+)?)米/g, '{LEN}米');               // 2米 → {LEN}米（无分隔符）
  return window.ACC_IMGS[n] || '';
}
```

- 仅匹配小写 m + 前置分隔符（`_-` 或 `,`），避免误伤 `060M` 等型号中的大写 M
- db_editor.html 中有同名 `accImgKey()` 函数保持一致

### 13. 数据库编辑器图片管理（db_editor.html）

配单 tab 新增图片列，支持：
- 缩略图预览（44×44，已配图）或"＋ 图"按钮（未配图）
- 图片选择弹窗：浏览全部 webp 图片，搜索过滤，点击即应用
- 本地上传：浏览器端 canvas 压缩 webp（quality 0.82），File System Access API 写入目录
- 清除图片：行内 ✕ 按钮 + 弹窗内清除
- 导出 acc_imgs.js：header 按钮，生成与现有格式一致的映射文件
- ESC 快捷键关闭弹窗

---

## 导航结构

桌面端显示全部 9 个导航项：首页、智能选型、多相机拼接、竞品对标、配单表、产品表、状态码查询、PDA 选型、方案解决。

手机端只显示 3 个：首页、智能选型、更多（其余 7 个放入更多弹窗：多相机拼接、竞品对标、配单表、产品表、状态码查询、PDA 选型、方案解决）。

多相机拼接复用选型页面，点击后自动展开拼接卡片并隐藏选型 UI。

### 首页布局（.home-page）

首页为纵向滚动容器（`height: 100%` + `overflow-y: auto`），包含 hero 区、功能卡片网格、页脚三部分：

- **hero 区**（`.home-hero`）：桌面端图文并排（文字区 `flex: 1 1 280px` 保底宽度，装饰图可收缩换行）；移动端改为纵向居中并压缩高度（`.home-hero-text { flex: none }` 防止 flex-basis 撑高）
- **功能卡片**（`.home-grid`）：桌面端 4 列；移动端 2 列（`≤380px` 回退 1 列），描述超 2 行截断
- **防挤压**：`.home-hero`、`.home-section` 均设置 `flex-shrink: 0`，页面高度不足时内容滚动而非压缩

---

## 数据流转

```
product_data.json (24列扁平格式)
    ↓  node scripts/convert_product_data.js
js/data/peidan.js (window.PEIDAN_DATA)
    ↓  <script> 标签加载
bom.js → buildTree() → 树结构
    ↓  用户选择
autoGenerateBOM() → bomList → renderTable()
```

### 配单数据转换

`product_data.json` 的 24 列结构：

| 列号 | 字段 | 说明 |
|------|------|------|
| 0 | 数据分类 | 相机 / 配件 |
| 1 | 产品大类 | ID800系列、ID2013EM系列 等 |
| 2 | 产品系列 | ID803系列U口、电源适配器 等 |
| 3 | 具体型号 | MV-ID803M-03S-WBN-SR-U(国内标配) |
| 4 | 物料代码 | 313201715 |
| 5 | 物料描述 | 0.3MP，3.1m镜头... |
| 6 | 备注 | 支持U口/串口线缆互换 |
| 7 | 电源 | 电源适配器参考标签 |
| 8-9 | 安装板 | 参考标签 + 标识(1=标配) |
| 10-11 | 一体线 | 参考标签 + 标识 |
| 12-13 | IO线 | 参考标签 + 标识 |
| 14-15 | 网线 | 参考标签 + 标识 |
| 16-17 | 灯板 | 参考标签 + 标识 |
| 18-19 | 镜头罩 | 参考标签 + 标识 |
| 20-21 | FA镜头 | 参考标签 + 标识 |
| 22-23 | 扩展配件 | 参考标签 + 标识 |

配件匹配逻辑：
- 标配配件：flag=1 时，通过 refTag 匹配配件行中同名列的值
- 选配配件：匹配所有可用配件（排除已作为标配的）

---

## 关键算法

### PPM 评分（高斯衰减）

```javascript
function ppmScore(ppm, target) {
  var sigma = target * 0.3;  // 30% 容差
  return Math.exp(-0.5 * Math.pow((ppm - target) / sigma, 2));
}
```

### 视野覆盖评分

```javascript
function fovScore(actualFOV, requiredFOV) {
  if (actualFOV >= requiredFOV) return 1.0;
  return actualFOV / requiredFOV;  // 线性衰减
}
```

### 搜索归一化

```javascript
function normalize(s) {
  return (s || '').toLowerCase().replace(/^[\s\-_\/]*mv[-_\s]*/i, '').replace(/[\s\-_\/]+/g, '');
}
```

### 配件唯一 Key

```javascript
function getAccKey(acc, index) {
  return acc.code + '||' + acc.name + '||' + index;
}
```

### 最大曝光时间

```
最大曝光时间(μs) = (模块尺寸(mm) / PPM) / 运动速度(mm/s) × 1,000,000
```

---

## 开发规范

### 编辑后必须执行

```bash
node scripts/minify-js.js          # 编辑任意 js/ 下的 .js 后
node scripts/minify-css.js         # 编辑 css/style.css 后
node scripts/convert_product_data.js  # 修改 product_data.json 后
```

### i18n 规范

- HTML 元素：`data-i18n="key"` 属性（textContent）
- JS 中：`_t('key')` 或 `window._i18n.t('key')`，支持 `{n}` 占位符
- 占位符：`data-i18n-ph="key"` 属性（placeholder）
- 其他属性：`data-i18n-alt="key"`（alt）、`data-i18n-title="key"`（title）、`data-i18n-html="key"`（innerHTML，可含 HTML 标签）
- 翻译文件：`js/app.js` 中的 `zh` 和 `en` 对象（zh 约 497 条 / en 约 507 条，两侧需对应）
- 切换语言时 `applyLang()` 会重新渲染 BOM、产品表、竞品模块
- 命名规则弹窗 `NAMING_DATA`（mapping_module.js）含 `title/html` 与 `titleEn/htmlEn` 双版本，渲染时按当前语言选择
- 数据文件（`js/data/*`）与品牌名（思谋/华睿/视界/新大陆）保持不翻译

### CSS 规范

- 暗黑模式：所有颜色使用 CSS 变量，暗黑模式通过 `.dark` class 覆盖
- 响应式：桌面端左右分栏，移动端底部 Tab 栏
- 统一尺寸：12px 外边距，10px 圆角卡片，38px 统一控件高度
