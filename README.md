# HIKROBOT 读码器选型工具 V4.1

海康机器人读码器（Code Reader）智能选型 / 竞品对标 / 配单生成 / 产品对照 / 状态码查询 / SDK 参考 / 资料下载工具🤖

纯前端实现，无需服务器，双击 `index.html` 即可在浏览器中打开使用。

https://chenze3303.github.io/Code-reader-selection/

---

## 目录结构

```
├── index.html                      # 主页面：智能选型/多相机拼接/PPM/竞品/配单/产品/状态码/PDA选型/方案解决
├── db_editor.html                  # 数据库编辑器（可视化编辑全部数据文件，含配件图片管理）
├── sdk-guide.html                  # 独立 SDK 参考页面（C/C++ & C# 指南）
├── peidan.html                     # 独立配单表页面（自包含）
├── 海康读码器命名规则_副本.html      # 命名规则参考页面（独立静态文件）
├── product_data.json               # 配单原始数据源（通过脚本生成 peidan.js）
├── package.json                    # 脚本依赖与元数据（CommonJS）
├── README.md / AGENTS.md / PROJECT_DOC.md / USER_GUIDE.md   # 项目文档
├── assets/
│   ├── code-type-desc.png          # 码制类型说明图（明亮模式）
│   ├── code-type-desc-dark.png     # 码制类型说明图（暗黑模式）
│   ├── contact-wechat.jpg          # 联系方式
│   ├── contact-bilibili.jpg
│   ├── contact-douyin.jpg
│   ├── accessories/                # 配件图片（原图 PNG/JPG + manifest.json）
│   │   └── webp/                   # 配件图片 webp 压缩版（供前端展示）
│   └── products/                   # 产品型号图片（原图 PNG + webp 压缩版）
│       └── webp/                   # 产品图片 webp 压缩版
├── css/
│   ├── style.css                   # 全局样式（PC + 移动端响应式，含暗黑模式全面优化）
│   └── style.min.css               # 压缩版样式
├── js/
│   ├── app.js                      # 智能选型主逻辑：导航 + PPM/视野计算 + i18n + 拼接方案/3D
│   ├── bom.js                      # 配单表：型号树、选配件弹窗、电源联动、快速搜索、导出 CSV、配件图片显示
│   ├── mapping_module.js           # 产品表：搜索、筛选、分组折叠、资料下载、命名规则弹窗
│   ├── statuscode_module.js        # 状态码查询：搜索、筛选、点击复制
│   ├── three.min.js                # Three.js 3D 渲染（拼接方案示意图，按需加载）
│   └── data/
│       ├── product_db.js           # 选型产品数据库（PRODUCT_DB）
│       ├── competitor.js           # 竞品对标数据（IIFE，含 UI 逻辑）
│       ├── peidan.js               # 配单数据（型号 + 标配/选配配件）
│       ├── mapping.js              # 产品表数据（503 条基线 ↔ 经销对照）
│       ├── status_codes.js         # 状态码数据（257 条，10 个分类，162 条含解决方法）
│       ├── acc_imgs.js             # 配件图片映射（归一化名称 → webp 文件名，62 条）
│       ├── product_imgs.js         # 产品型号图片映射（型号 → webp 文件名，459 条）
│       ├── pda.js                  # PDA 选型数据（19 款 IDP 系列型号 × 39 项参数）
│       ├── download_urls.js        # 各系列资料下载页面 URL（自动生成，勿手改）
│       ├── cat_dist_map.js         # 系列 → 经销型号前缀映射
│       └── announcement.js         # 公告弹窗内容
├── exports/
│   └── data_export.xlsx            # 导出的 Excel 数据文件
└── scripts/
    ├── minify-js.js                # JS 压缩（源码 → .min.js）
    ├── minify-css.js               # CSS 压缩
    ├── convert_product_data.js     # product_data.json → peidan.js
    ├── excel2js.js                 # Excel 转 JS 数据文件
    ├── js2excel.js                 # JS 数据文件转 Excel
    ├── acc_compress.js             # 配件图片 webp 压缩 + manifest.json 生成
    ├── hik_compress.js             # 海康产品图片压缩
    ├── scrape_base_downloads.js    # 抓取基线型号资料下载列表
    ├── scrape_dist_downloads.js    # 抓取经销型号资料下载列表
    ├── gen_download_urls.js        # 从下载数据生成 URL 映射文件
    ├── compress-images.js          # 图片压缩脚本
    ├── replace-images.js           # 替换压缩后的图片
    ├── test-stress.js              # 压力测试（115 项自动化测试）
    ├── perf-optimize.js            # 性能优化报告
    ├── test-performance.js         # 性能对比测试
    └── test-all.js                 # 完整性能测试
```

---

## 功能说明

### ⚡ 智能选型

输入码制类型（QR / Code39）、模块尺寸、工作距离、视野宽高，自动计算 PPM（Pixels Per Module），从产品库中推荐最佳型号。

- 2D 码 PPM 4-8 为优秀，1D 码 PPM 1.4-2 为优秀
- 综合评分：分辨率 + PPM + 工作距离 + 视野
- 支持查看所有满足条件的型号清单（可按系列筛选）
- SVG 示意图实时展示工作距离、视野、焦距
- 点击「开始智能选型」按钮带有 loading 动画反馈
- **多相机拼接方案**：单相机无法满足时，自动提示并提供拼接方案计算
  - 显示提示卡片，说明单相机无法满足的原因（视野/分辨率/距离）
  - 支持输入条码尺寸和安全余量，计算最优拼接方案
  - SVG 示意图展示拼接布局、重叠区域、需求覆盖范围
  - 支持暗色模式，切换主题时自动重渲染
  - **查看全部方案**：可按相机数量或分辨率正反序排序，并与系列筛选组合使用

### 🔬 竞品对标

39 条友商型号与海康对应型号的对标信息，覆盖 7 个品牌：

| 品牌 | 对标型号 |
|---|---|
| Cognex | DM70/80、DM150/260、DM280/290、DM370、DM470、DM380/390 |
| Keyence | SR-700/750、SR-1000、SR-2000、SR-X300/X100/X80、SR-5000 |
| Datalogic | Matrix 100/120/220/320、AV500/900 |
| 思谋 | VS600、VS800P/900、VS1000P、VS2000P |
| 华睿 | R3000、R4000、R5000、R7000 |
| 视界 | ICW 61/62/64E/72/74EP/76P |
| 新大陆 | FM415、NVF200/230/800、Soldier100/160/180/300 |

支持关键词搜索（自动忽略 `MV-` 前缀及大小写）、品牌筛选、卡片展开/收起。

### 📋 配单表

三级联动选型：**产品大类 → 产品系列 → 具体型号**

- 选定型号后自动生成 BOM（主机 + 全部标配）
- 选配配件按类别分组（线缆、电源、安装、光源等 16 类），点击弹窗勾选
- 配件图片：配件弹窗和 BOM 表格自动显示配件缩略图（99 个配件、33 张图）
- 支持导出 CSV、重置、删除单行
- 数据自动持久化到 localStorage，刷新页面不丢失
- **快速搜索**：支持按型号名称或物料代码搜索；搜索配件时显示其适配的产品系列标签，点击跳转选中该系列并自动把配件加入配单
- **重置**：清除选配后自动恢复被替换掉的标配配件

### 🔄 产品表

424 条基线型号 ↔ 经销型号的物料代码对照，按系列分组折叠显示。

- 基线 = 直销物料，经销 = 渠道物料
- 支持按型号名称、物料代码混合搜索
- 搜索时自动展开有结果的系列
- **资料下载**：每行提供基线/经销两个下载按钮（📥），点击直接跳转海康官网对应产品的资料下载页面
- 下载 URL 涵盖 41 个系列（40 个基线 + 22 个经销，共 62 条）

### 🔍 状态码查询

257 条海康读码器 SDK 状态码定义，按 10 个分类组织：

| 分类 | 数量 | 说明 |
|---|---|---|
| 正确码 | 1 | 成功状态 |
| 通用错误码 | 94 | 句柄、参数、资源、版本、GenICam、USB、升级、网络等 |
| IDMVS自定义 | 25 | IDMVS 软件特有错误 |
| 读码器控制 | 14 | 读码器对象操作错误 |
| GenICam相关 | 10 | GenICam 协议相关 |
| 网口读码器 | 8 | 以太网通信相关 |
| U口读码器 | 7 | USB 通信相关 |
| 升级组件 | 5 | 固件升级操作 |
| 底层组件 | 83 | 底层 SDK 各模块错误 |
| 网络组件 | 10 | Socket 网络通信 |

**合计：257 条状态码**

功能特性：
- **模糊搜索**：支持按名称、十六进制值、描述、解决方法搜索
- **分类筛选**：按错误类型分类过滤
- **解决方法**：162 条状态码附带解决方法，多行内容正确换行显示
- **点击复制**：点击表格行自动复制状态码名称到剪贴板
- **深色模式**：完整支持暗黑主题
- **中英文**：支持语言切换

### 📱 PDA 选型

IDP 系列智能移动终端（PDA）型号参数对比工具，支持多条件组合筛选，快速锁定合适机型。

- **19 款型号对比**：MV-IDP3204 / 3304 / 4104 / 5006 / 5102 / 5104 / 5114 / 5204 等 8 大系列全部在售型号，含变体（内存、AI、5G、工业版等）
- **39 项参数**：条码类别、OCR、处理器、内存、操作系统、显示屏、NFC、Wi-Fi、蓝牙、定位、防护等级、电池容量等
- **8 维筛选**：系列、防护等级（IP65/66/67/68）、NFC（支持/不支持）、操作系统（Android 10/11/13/14）、屏幕尺寸（4.0~6.2 英寸）、处理器主频（2.0/2.2/2.6GHz）、OCR（支持/不支持）、电池容量（4500~5200mAh）
- **自适应表格**：型号少时列宽自适应填满视口；型号多时每列保持 150px 可读宽度，自动横向滚动，左侧参数列冻结吸附
- **变体参数继承**：Excel 稀疏数据中的变体型号（如 `/64G`、`/A/4&64`）自动继承同系列基准型号参数并覆盖差异项，保证对比完整
- **中英双语**：完整支持语言切换

### 📖 SDK 参考

新增「📖 SDK 参考」导航页，提供 MvCodeReader SDK C/C# 版学习指南，支持：

- **左侧目录导航**（TOC）：支持 SDK 概述、开发环境配置、编程流程、SDK 参考等章节
- **语言版本切换**：支持 C/C++ 和 C# 两种语言版本
- **深色模式适配**：目录文字、卡片正文、代码块、警告提示等全面增强对比度
- **完整文档**：支持「查看完整文档」跳转至独立 SDK 参考页面（sdk-guide.html）

---

## 数据库编辑器

`db_editor.html` 是一个独立的可视化编辑工具，支持编辑全部五种数据。

**打开方式**：双击直接打开，或在主页面 **连续点击左上角 logo 图标 3 次** 跳转。

| 标签 | 编辑内容 | 导出格式 |
|---|---|---|
| 📋 配单数据 | 产品大类/系列/型号、标配/选配配件、**配件图片管理** | `peidan.js` + `acc_imgs.js` |
| 🔄 产品表 | 系列分类、基线/经销型号及代码 | `mapping.js` |
| 🔬 竞品对标 | 品牌、型号、友商特点、海康优势 | `competitor_data.js` |
| ⚡ 选型产品库 | 分辨率、焦距、像素尺寸、工作距离 | `product_db.js` |

功能：
- **自动加载**：打开即自动读取 `js/data/` 下全部数据文件，无需手动导入
- **配件图片管理**：配单 tab 新增"图片"列，显示缩略图预览、图片选择弹窗（33 张 webp）、本地上传（自动压缩 webp）、清除图片
- 导入 JS/JSON 文件、导出标准格式（含导出 `acc_imgs.js`）
- 新建/复制/删除条目、搜索筛选
- Ctrl+S 快捷保存
- 左上角「← 返回」按钮回到主页面

---

## 数据更新方式

### 方式一：使用编辑器（推荐）

1. 双击打开 `db_editor.html`（数据自动加载）
2. 在界面中编辑数据
3. 点击「导出」生成新的 `.js` 文件
4. 替换 `js/data/` 下的对应文件
5. 刷新 `index.html` 查看效果

### 方式二：直接编辑 JS 文件

所有数据文件通过 `<script>` 标签以全局变量形式加载，直接用文本编辑器修改后刷新 `index.html` 即可生效（兼容 `file://` 本地打开）。

### 方式三：配件图片管理

```bash
# 压缩配件图片为 webp（quality 82）并生成 manifest.json
node scripts/acc_compress.js
```

操作步骤：
1. 将配件原图（PNG/JPG）放入 `assets/accessories/`
2. 运行 `node scripts/acc_compress.js`，自动生成 `assets/accessories/webp/` 下的 webp 文件和 `manifest.json`
3. 在 `db_editor.html` 的配单 tab 中通过图片选择弹窗应用到对应配件
4. 或直接编辑 `js/data/acc_imgs.js` 添加映射条目
5. 导出 acc_imgs.js 保存映射关系

### 方式四：自动抓取资料下载数据

`scripts/` 目录下提供三个自动化脚本，用于从海康官网批量抓取各系列的资料下载信息：

```bash
# 前置依赖
npm i -g agent-browser

# 1. 抓取 40 个基线系列的下载列表 → js/data/downloads.js
node scripts/scrape_base_downloads.js

# 2. 抓取 22 个经销系列的下载列表 → js/data/dist_downloads.js
node scripts/scrape_dist_downloads.js

# 3. 从下载数据生成 URL 映射 → js/data/download_urls.js
node scripts/gen_download_urls.js
```

> ⚠️ 抓取脚本依赖 agent-browser（Playwright 封装），需要安装 Chromium。每个系列约耗时 10 秒，全部完成约 5-10 分钟。

---

## 数据文件格式

**产品表** `js/data/mapping.js`

```js
window.MAPPING_DATA = [
  {
    cat: "ID803M系列",       // 系列名称（相同 cat 自动分组折叠）
    seq: 1,                   // 序号
    baseName: "MV-ID803M-03S-WBN-SR-U(国内标配)",   // 基线型号名称
    baseCode: "313201715",    // 基线物料代码
    distName: "MV-IDA02X-03WSU(国内标配)",           // 经销型号名称
    distCode: "328500153"     // 经销物料代码
  }
];
```

**资料下载 URL** `js/data/download_urls.js`（自动生成，勿手动编辑）

```js
(function() {
  var BASE_DOWNLOAD_URLS = {
    "ID803M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13058",
    ...
  };
  var DIST_DOWNLOAD_URLS = {
    "ID803M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13434",
    ...
  };
  window.MAPPING_DOWNLOAD_URLS = {
    base: BASE_DOWNLOAD_URLS,
    dist: DIST_DOWNLOAD_URLS,
    getBaseUrl: function(cat) { return BASE_DOWNLOAD_URLS[cat] || ''; },
    getDistUrl: function(cat) { return DIST_DOWNLOAD_URLS[cat] || ''; }
  };
})();
```

**配单数据** `js/data/peidan.js`

```js
window.PEIDAN_DATA = {
  modelList: [
    {
      productCategory: "ID800 工业读码器",
      productSeries: "ID800",
      productModel: "MV-ID803M-U(基线)",
      standardAccessories: [
        { category: "大类", name: "U 口线缆", code: "101523961", detail: "10P10C转OPEN+USB-AM,2m" }
      ],
      optionalAccessories: [
        { category: "线缆", name: "串口线缆", code: "101523962", detail: "10P10C转OPEN+DB9F,1.5m" }
      ]
    }
  ]
};
```

- `standardAccessories`：标配，自动包含在配单中
- `optionalAccessories`：选配，用户手动勾选
- `category` 决定选配页的分组显示，支持 16 类：线缆、网线、电源线、电源、安装、安装板、镜头、测试镜头、镜头罩、光源、微码光源、爆闪光源、灯板、外置配件、大类、其他

**竞品数据** `js/data/competitor.js`

```js
var competitorDB = [
  {
    brand: "Cognex",
    model: "DM70 / DM80",
    competitorDesc: "DM70:0.36/1.2MP 算法分为S/QL/Q；DM80:1.6MP液态对焦",
    hikModel: "ID2013EMI",
    advantageDesc: "超高性价比，IO接口更丰富，算法性能无差别对标Q系列"
  }
];
```

**配件图片映射** `js/data/acc_imgs.js`

```js
// key 使用"长度归一化后的配件名称"，同一根线缆不同长度共用一张图
window.ACC_IMGS = {
  "MV-IDA-P-M12A12pF-open-ST-{LEN}m": "MV-IDA-P-M12A12pF-open-ST-3m.webp",
  "MV-IDA-P-M12A12pF-open-HF-{LEN}m": "MV-IDA-P-M12A12pF-open-ST-3m.webp",
  "ID2000M隔离支架": "ID2000M隔离支架.webp",
  "MV-IDA-C-Y-62-62-HP(国内中性)": "MV-IDA-C-Y-62-62-Y.webp"
};
```

- key 为归一化名称（长度替换为 `{LEN}m`），前端 `getAccImg()` 会自动归一化查找
- value 为 `assets/accessories/webp/` 下的 webp 文件名
- 同一 key 共享一张图（不同颜色/材质的同型号配件共用）

**产品型号图片映射** `js/data/product_imgs.js`

```js
window.PRODUCT_IMGS = {
  "MV-ID2013EM-05-RBN(国内标配)V1.5": "20260728060115043.webp",
  "MV-ID803M-03S-WBN(国内标配)": "20260811120020440.webp"
};
```

- key 为完整产品型号名称
- value 为 `assets/products/webp/` 下的 webp 文件名
- 产品图片在配单表 BOM 显示时自动匹配

**选型产品库** `js/data/product_db.js`

```js
const PRODUCT_DB = [
  {
    model: "ID803M-03M",
    series: "ID800",
    resolution: { w: 640, h: 480 },
    pixelSize: 3.7,
    focal: 3.1,
    interface: "USB2.0、RS232、RJ45",
    protection: "IP54",
    workingDist: { min: 120, max: 120 }
  }
];
```

- `focal` / `pixelSize`：C-Mount 型号可省略，仅按分辨率和工作距离打分
- `workingDist`：工作距离范围（mm）

---

## 功能特点

- **暗黑模式**：点击 🌙 按钮切换，自动持久化到 localStorage
- **中英文切换**：点击 EN/中 按钮切换界面语言，全部 UI 文本均支持双语
- **方案示意图暗黑适配**：SVG 示意图在暗黑模式下自动切换深色背景 + 浅色文字
- **码制说明图主题适配**：明亮/暗黑模式各有一张专属配色的码制说明图

---

## 技术特点

- **纯前端、零依赖**：不需要 Node / 构建工具 / 服务器，所有数据通过 `<script>` 标签注入
- **响应式适配**：桌面端左右分栏，移动端底部 Tab 栏 + 统一滚动
- **搜索归一化**：统一 `MV-` 前缀剥离 + 大小写不敏感
- **样式一致**：12px 外边距 + 10px 圆角卡片 + 38px 统一控件高度
- **性能优化**：CSS/JS/图片压缩，总体积从 1.14MB 降至 0.75MB（节省 33.6%）

---

## 性能优化

本项目已进行性能优化，总体积减少 33.6%：

| 类别 | 优化前 | 优化后 | 节省 |
|------|--------|--------|------|
| CSS | 121.2KB | 99.7KB | 17.7% |
| JS | 586.3KB | 461.8KB | 21.2% |
| 图片 | 436.0KB | 197.3KB | 54.8% |
| **总计** | **1143.5KB** | **758.8KB** | **33.6%** |

### 优化内容

- **CSS 压缩**：移除注释、空格、换行
- **JS 压缩**：移除注释、简化代码
- **图片压缩**：使用 sharp 库压缩 JPG/PNG，节省 54.8%

### 性能测试脚本

```bash
# 压缩 CSS
node scripts/minify-css.js

# 压缩 JS
node scripts/minify-js.js

# 压缩图片
node scripts/compress-images.js

# 查看性能报告
node scripts/test-all.js
```

---

## 更新日志

### V4.1 · 2026-08-18

**PDA 选型（新增功能模块）**
- 新增「📱 PDA 选型」首页卡片与导航页（07，方案解决之前），基于机器人 PDA 在售设备参数梳理 Excel 构建
- 数据覆盖 8 大系列 19 款型号 × 39 项参数（`js/data/pda.js`，`window.PDA_DATA`）
- 变体型号参数自动继承基准型号并覆盖差异项（/64G、/A/4&64、/5G、/07ER、/DP 等）
- 8 维组合筛选：系列、防护等级、NFC、操作系统、屏幕尺寸、处理器、OCR、电池容量
- 自适应表格：型号少时填满视口、型号多时每列 150px 横向滚动 + 参数列冻结吸附
- 移动端适配：PDA 入口移入「更多」弹窗（首页卡片保留），筛选栏 3 列网格

**配单表修复与优化**
- 修复配单筛选长度误匹配（15m 误识别 5m、1.2m 误识别 2m），改为提取 `Nm` 标记精确匹配
- 新增 IO 电源线类别（CABLE_CATS）与 1m 长度选项（CABLE_LENGTHS）
- 配单明细描述列完整显示，取消 80 字符截断

**其他更新**
- 公告支持附件文档查看（`file` 字段 + 新标签打开）
- 新增公告「固定式读码器料号归一市场通知」（含附件 PDF）
- 删除方案解决中「读码器固件下载」「手持巴枪固件下载」两个卡片
- lightbox 图片放大背景改白、固定 480×480 尺寸，移动端自适应

**无障碍（Web 设计规范）修复**
- 移除 `user-scalable=no` / `maximum-scale=1`（恢复缩放，符合 WCAG 1.4.4）
- 新增 `<meta name="theme-color">`（随暗黑模式联动更新）
- 全局 `:focus-visible` 焦点指示 + `prefers-reduced-motion` 减弱动画支持
- 主题切换等图标按钮补 `aria-label`，装饰性 SVG 补 `aria-hidden`
- `transition: all` 全部替换为具体属性列表（动画性能）
- 弹窗/搜索框补 `overscroll-behavior`、控件补 `touch-action: manipulation`
- 数据表格数字列 `tabular-nums`、表单输入框补 `name`/`autocomplete`
- 新增 skip link（跳到主要内容）、Escape 键关闭全部弹窗
- 品牌名 `HIKROBOT` 加 `translate="no"`，加载占位 `...` 改为 `…`
- db_editor 动态图片补 `alt`

### V3.11 · 2026-08-12

**配件图片系统**
- 新增配件图片映射：99 个配件、33 张 webp 图，通过 `acc_imgs.js` 归一化名称映射
- 配件弹窗（选配件）和 BOM 表格自动显示配件缩略图
- 配件图片按长度归一化：同一型号不同长度（2m/3m/5m）共用一张图
- 新增 `assets/accessories/` 目录：原图 PNG + webp 压缩版 + manifest.json

**产品型号图片系统**
- 新增产品型号图片映射：459 个型号、459 张 webp 缩略图，通过 `product_imgs.js` 映射
- 产品图片在配单表 BOM 显示时自动匹配
- 新增 `assets/products/` 目录：原图 PNG + webp 压缩版

**数据库编辑器图片管理**
- 配单 tab 新增"图片"列：显示配件缩略图预览
- 图片选择弹窗：浏览全部 webp 图片，搜索过滤，点击即应用
- 本地上传：浏览器端自动压缩 webp（canvas quality 0.82），支持 File System Access API 直接写入目录
- 导出 acc_imgs.js：一键导出配件图片映射文件
- ESC 快捷键关闭弹窗

**新增脚本**
- `scripts/acc_compress.js`：配件图片 webp 压缩（sharp quality 82）+ manifest.json 生成
- `scripts/hik_compress.js`：海康产品图片压缩

### V3.10 · 2026-08-05

**配单表快速搜索升级**
- 搜索配件时展示其适配的**产品系列**（去重、含适配型号数量），点击系列标签自动跳转选中该系列
- 跳转后当前搜索的配件自动加入配单清单（若为该型号标配则不重复）
- 重置按钮优化：清除选配后自动恢复被替换掉的标配配件（如标配线缆）

**多相机拼接方案排序**
- 「查看全部方案」弹窗新增排序功能：按相机数量（正/反序）、按相机分辨率（正/反序）
- 排序与系列筛选可组合使用
- 系列筛选与排序合并为一行下拉框工具栏，样式与项目全局 select 统一

### V3.9 · 2026-08-04

**全站中英双语（i18n）**

- 补齐英文模式下的翻译覆盖：PPM 计算页、SDK 参考页（C/C# 全章节）、命名规则弹窗、公告弹窗、联系我们卡片、方案解决页卡片、首页页脚/机器人气泡/资料下载按钮、命名规则示例表
- SDK 页新增约 160 个词条（TOC、横幅、路径卡片、开发环境、编程流程、参数、触发、排错、API 速查、代码注释）
- 命名规则弹窗 NAMING_DATA 增加英文版，随语言切换展示
- 产品表/状态码/BOM/竞品模块的 JS 动态渲染文案全部接入 i18n（下载按钮 title、表头、错误提示、CSV 导出表头等）
- 新增 `data-i18n-title` 处理（title 属性翻译）
- 品牌名（思谋、华睿、视界、新大陆）与数据库数据保持不翻译

**首页布局修复与移动端优化**

**修复页面放大后首页被挤压**
- `.home-page` 改为 `height: 100%`，内容超高时由自身滚动而非被裁剪压缩
- `.home-hero`、`.home-section` 添加 `flex-shrink: 0`，防止空间不足时被压缩高度
- 修复 `.home-hero-text` 的 `flex-basis` 在移动端纵向布局下撑高 hero 区的问题
- hero 装饰图支持收缩与换行，文字区保证最小宽度

**移动端首页显示优化**
- 压缩 hero 区高度（padding、标题、描述字号、间距整体缩小）
- 功能卡片改为 2 列网格布局（≤380px 回退 1 列），描述超 2 行截断
- 缩小卡片内边距、图标、标题字号，页脚改为纵向排列

**联系我们弹窗与选型页优化**
- 联系我们卡片点击放大图片；移动端卡片横向布局、图片固定尺寸、弹窗可滚动
- 选型页新增「PPM 计算」入口（验算页：型号选择、运动速度、验算结果与示意图）

### V3.8 · 2026-08-03

**状态码数据大幅扩展**
- 状态码从 224 条扩展至 257 条（来自 Excel 源数据）
- 162 条状态码新增解决方法（IDMVS自定义、读码器控制、GenICam、网口/U口读码器、升级组件、底层组件、网络组件）
- 修复多行解决方法显示为 `\n` 文本的问题（改为 `<br>` 正确换行）
- 补充底层组件分类 CSS 标签样式（亮色 + 暗色模式）

**配单表优化**
- 实现 localStorage 持久化：选型状态（大类/系列/型号/配件勾选）刷新后自动恢复
- 下载链接匹配逻辑升级：6 级匹配策略（精确→反向→去括号→系列前缀 fallback），命中率从 59.7% 提升至 72.8%
- CSV 导出日期格式统一为 YYYY-MM-DD，避免跨浏览器文件名兼容问题

**代码质量**
- 修复 mapping_module.js 和 competitor.js 中 normalize 函数的无效代码
- 状态码模块和产品表模块增加错误边界（try-catch），加载失败时显示友好提示
- 新增 `scripts/test-stress.js` 压力测试脚本（115 项自动化测试）
- 同步所有 `.min.js` 压缩文件

### V3.7 · 2026-07-27

**新增机器人智能助手（小V）**
- 右下角浮动机器人吉祥物，纯 CSS 绘制（天线 + LED 眼睛 + 呼吸灯心脏）
- 点击跳转海康机器视觉 v-club 智能助手（https://www.v-club.com/vAssistant）
- 页面加载时显示 15 秒气泡提示语，自动消失
- 所有页面同步显示，移动端自动隐藏
- 悬停动画：机器人上浮摇摆、眼睛变好奇、心脏变橙加速跳动
- 暗黑模式完整适配

**代码质量修复**
- 修复 CSS 注释语法错误（`./*` → `/*`）
- 修复 `.antenna` 选择器为 `.robot-antenna`（天线 hover 动画失效问题）
- 补充未定义 CSS 变量（`--border-main`、`--text-main`、`--bg-hover`）
- 补充 `sol-icon-sdk`、`sol-icon-viewer` 图标样式

### V3.5.1 · 2026-07-18

**项目结构优化**
- 图片资源（联系方式、码制说明图）移入 `assets/` 目录
- 导出文件移入 `exports/` 目录
- 清理 `.bak` 备份文件和 `test/` 参考数据目录
- 更新所有脚本和 HTML 中的文件引用路径

### V3.5 · 2026-07-17

**新增多相机拼接方案功能**
- 单相机无法满足时，显示提示卡片说明失败原因（视野/分辨率/距离）
- 点击「查看拼接方案」展开多相机参数表单（条码宽度/高度/方向/安全余量）
- 计算最优拼接方案，显示推荐型号、相机数量、排列方式
- SVG 示意图展示拼接布局、重叠区域、需求覆盖范围（蓝色虚线框）
- 支持按系列筛选方案，点击切换不同方案
- 拼接模式下隐藏「开始智能选型」按钮，添加「返回单相机」按钮
- SVG 下载文件名跟随当前选中方案的型号

**SVG 暗色模式适配**
- SVG 背景、文字、刻度线、标注等颜色完整适配暗色模式
- 切换主题时自动重新渲染 SVG，确保颜色与当前主题一致
- 修复暗色模式检测问题（改为检测 `<html>` 元素的 `dark` class）

**SVG 标注优化**
- 去掉刻度尺，改为实际覆盖区域的尺寸标注（顶部+左侧）
- 整体覆盖标注与单机视野标注分层显示，避免重叠
- 单机视野标注改为蓝色虚线样式，与整体覆盖标注区分
- 增大 SVG 内边距，防止标注截断

**UI 优化**
- 拼接方案右侧排版与单相机风格统一（result-main 卡片 + model-preview 标签）
- 详情卡片去掉旋转角度和 PPM 显示
- 方案列表去掉旋转状态文字
- 输入框与文字的上下间距优化

### V3.4 · 2026-07-16

**新增二次开发（SDK 参考）页面**
- 新增「📖  SDK 参考」导航页，提供 MvCodeReader SDK C/C# 版学习指南
- 左侧目录导航（TOC），支持 SDK 概述、开发环境配置、编程流程、SDK 参考等章节
- C/C++ 和 C# 两种语言版本切换
- 深色模式完整适配：目录文字、卡片正文、代码块、警告提示等全面增强对比度
- 支持「查看完整文档」跳转至独立 SDK 参考页面（sdk-guide.html）

**功能优化与改进**
- **暗黑模式全面优化**：竞品卡片、二次开发卡片、联系我们弹出卡片等区域文字对比度提升，增强可读性
- **搜索输入优化**：所有搜索输入框（竞品、状态码、映射、BOM 配单）添加 200ms 防抖处理，减少重复搜索
- **竞品卡片布局**：使用 CSS Grid 布局，桌面端和移动端均 1 列排列，提升阅读体验
- **空状态样式**：竞品搜索无结果时显示友好的空状态提示（🔍 图标）
- **Toast 通知系统**：新增全局 Toast 通知组件，操作反馈更友好
- **联系我们遮罩**：修复弹出卡片遮罩不可见问题，亮色/深色模式遮罩均正常显示
- **开发环境配置标题**：增强二次开发页面标题文字对比度（`#ffffff` 纯白）
- **左侧目录导航**：SDK TOC 非激活项文字颜色从 `#8899aa` 改为 `#c9d1d9`，提升可读性

**新增文件**
- `sdk_module.js`：SDK 页面核心逻辑（目录导航、语言切换、章节渲染）
- `sdk-guide.html`：独立 SDK 参考完整文档页面（72KB）

### V3.3 · 2026-07-14

**产品表资料下载**
- 产品表每行新增「基线资料」「经销资料」两列下载按钮
- 点击 📥 按钮直接跳转海康官网对应产品的资料下载页面
- 涵盖 41 个系列（40 个基线 + 22 个经销，共 62 条）的下载 URL
- 新增 `scripts/` 目录，提供自动化抓取脚本，方便后续更新下载数据
- 导航栏「对照表」更名为「产品表」

### V3.2 · 2026-07-02

**新增状态码查询功能**
- 新增「🔍 状态码查询」导航页
- 支持 257 条海康读码器 SDK 状态码的查询（162 条含解决方法）
- 支持按名称、十六进制值、描述模糊搜索
- 支持按分类筛选（正确码、通用错误码、IDMVS自定义、读码器控制、GenICam相关、网口读码器、U口读码器、升级组件、底层组件、网络组件）
- 点击表格行可复制状态码名称到剪贴板
- 完整支持深色模式和中英文切换

### V3.1

**加载速度优化**
- 移除 `Cache-Control: no-cache`，允许浏览器缓存静态资源
- 添加 `<link rel="preload">` 预加载关键数据文件
- 调整 script 加载顺序：数据文件优先，模块在后

**过渡动画**
- 页面切换渐入 + 上滑动画、Tab 指示器弹性动画、Modal 回弹动画
- 按钮涟漪效果、卡片延迟渐入、配件弹窗毛玻璃背景

**全量中英文国际化**
- 基于 `data-i18n` 属性机制，覆盖全部 UI 文本

**数据库编辑器增强**
- 打开即自动加载全部数据文件，无需手动导入
- 左上角新增「← 返回」按钮

**快捷入口**
- 主页面连续点击左上角 logo 图标 3 次（600ms 内）跳转到数据库编辑器