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
- 方案弹窗：按系列筛选，支持切换方案
- 拼接数据面板：2-2-2-1 网格布局（相机数量/单机视野/总覆盖/需求覆盖/PPM/安装高度/重叠区域）
- 资料下载按钮联动产品表

### 4. 竞品对标（competitor.js → page-competitor）

39 条友商型号与海康对应型号的对标信息，覆盖 7 个品牌：Cognex、Keyence、Datalogic、思谋、华睿、视界、新大陆。

### 5. 配单表（bom.js → page-bom）

三级联动选型：产品大类 → 产品系列 → 具体型号，自动生成 BOM。

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

#### 快速搜索

选型页面提供快速搜索框，支持型号名称或物料代码模糊搜索，快速定位并选中型号。

### 6. 产品表（mapping_module.js → page-mapping）

503 条基线型号 ↔ 经销型号的物料代码对照，按系列分组折叠显示。支持资料下载直达海康官网。

### 7. 状态码查询（statuscode_module.js → page-statuscode）

224 条海康读码器 SDK 状态码定义，按 10 个分类组织。支持模糊搜索、分类筛选、点击复制。

### 8. 方案解决（page-solutions）

固件下载、SDK 参考文档、STEP/DXF 在线查看器、技术方案等常用资源快速入口。

### 9. 机器人智能助手 · 小V（浮动组件）

右下角浮动的纯 CSS 机器人吉祥物，点击跳转海康机器视觉 v-club 智能助手。

- **结构**：`index.html` 中 `.floating-robot-wrap` 容器，包含 `<a>` 链接和气泡两部分
- **定位**：`position: absolute`，`top: 80%; right: 100px`，悬浮在所有页面内容上方
- **气泡**：页面加载时显示提示语，15 秒后通过内联 `<script>` 自动隐藏
- **样式**：纯 CSS 绘制天线、LED 眼睛（左右扫视动画）、蓝色呼吸灯心脏
- **悬停**：机器人上浮摇摆 + 眼睛变好奇 + 心脏变橙加速跳动
- **移动端**：`@media (max-width: 768px)` 下 `display: none`
- **暗黑模式**：`.dark .robot-head`、`.dark .robot-body` 覆盖背景和边框色

相关 CSS 类：`.floating-robot-wrap`、`.floating-robot`、`.robot`、`.robot-antenna`、`.robot-head`、`.robot-face`、`.robot-eye`、`.robot-body`、`.robot-heart`、`.robot-label`、`.robot-bubble`、`.robot-bubble-text`

---

## 导航结构

桌面端显示全部 8 个导航项：首页、智能选型、多相机拼接、竞品对标、配单表、产品表、状态码查询、方案解决。

手机端只显示 3 个：首页、智能选型、更多（其余 6 个放入更多弹窗）。

多相机拼接复用选型页面，点击后自动展开拼接卡片并隐藏选型 UI。

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
  return s.toLowerCase().replace(/mv-/i, '').replace(/[\s\-_\/]+/g, '');
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

- HTML 元素：`data-i18n="key"` 属性
- JS 中：`_t('key')` 或 `window._i18n.t('key')`
- 占位符：`data-i18n-ph="key"` 属性
- 翻译文件：`js/app.js` 中的 `zh` 和 `en` 对象
- 切换语言时 `applyLang()` 会重新渲染 BOM、产品表、竞品模块

### CSS 规范

- 暗黑模式：所有颜色使用 CSS 变量，暗黑模式通过 `.dark` class 覆盖
- 响应式：桌面端左右分栏，移动端底部 Tab 栏
- 统一尺寸：12px 外边距，10px 圆角卡片，38px 统一控件高度
