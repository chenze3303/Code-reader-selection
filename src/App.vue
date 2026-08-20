<template>
<a href="#page-home" class="skip-link" data-i18n="skipLink">跳到主要内容</a>
<div class="app-window">

  <!-- TITLEBAR -->
  <div class="titlebar">
    <div class="logo-area">
      <h1>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0" aria-hidden="true">
          <rect x="2" y="2" width="9" height="9" rx="1" fill="#f76504"/>
          <rect x="13" y="2" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/>
          <rect x="2" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/>
          <rect x="13" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.15)"/>
        </svg>
        <span translate="no">HIKROBOT</span> · 读码器工具箱
        <span class="contact-link" id="contactLink" data-i18n="contactUs">联系我们</span>
      </h1>
    </div>
    <div class="titlebar-actions">
      <button class="titlebar-btn" id="langBtnMobile" @click="toggleLang" data-i18n="langBtn" aria-label="切换语言">EN</button>
      <button class="titlebar-btn" id="themeBtnMobile" @click="toggleTheme" aria-label="切换到暗色模式"><UiIcon name="moon" /></button>
    </div>
    <div class="status-badge" data-i18n="status">计算结果仅供参考，建议实测验证</div>
  </div>

  <!-- 机器人吉祥物（全局悬浮） -->
  <div class="floating-robot-wrap">
    <a href="https://www.v-club.com/vAssistant" target="_blank" class="floating-robot" title="智能助手" data-i18n-title="robotTitle">
      <div class="robot">
        <div class="robot-antenna">
          <span></span>
          <span></span>
        </div>
        <div class="robot-head">
          <div class="robot-face">
            <div class="robot-eye"></div>
            <div class="robot-eye"></div>
          </div>
        </div>
        <div class="robot-body">
          <div class="robot-heart"></div>
        </div>
      </div>
    </a>
    <div class="robot-bubble" id="robotBubble">
      <div class="robot-bubble-text" data-i18n-html="robotBubble">您好！我是海康机器人机器视觉助手「小V」。无论您正在安装工业相机、调试读码器、使用3D产品，还是搭建 VisionMaster，只需一句话：<br><b>“产品信息 + 问题/需求”</b>，我即刻为您输出专业、可落地的解决方案。</div>
    </div>
    
  </div>

  <!-- BODY -->
  <div class="app-body">

    <!-- NAV SIDEBAR -->
    <nav class="nav-tabs" role="tablist">
      <button class="nav-tab active" data-page="page-home" role="tab">
        <span class="nav-tab-icon"><UiIcon name="home" /></span><span data-i18n="tab0">首页</span>
      </button>
      <button class="nav-tab" data-page="page-selection" role="tab">
        <span class="nav-tab-icon"><UiIcon name="zap" /></span><span data-i18n="tab1">智能选型</span>
      </button>
      <button class="nav-tab" data-page="page-stitch" role="tab">
        <span class="nav-tab-icon"><UiIcon name="link" /></span><span data-i18n="tabStitch">多相机拼接</span>
      </button>
      <button class="nav-tab" data-page="page-competitor" role="tab">
        <span class="nav-tab-icon"><UiIcon name="microscope" /></span><span data-i18n="tab2">竞品对标</span>
      </button>
      <button class="nav-tab" data-page="page-bom" role="tab">
        <span class="nav-tab-icon"><UiIcon name="clipboard" /></span><span data-i18n="tab3">配单表</span>
      </button>
      <button class="nav-tab" data-page="page-mapping" role="tab">
        <span class="nav-tab-icon"><UiIcon name="refresh" /></span><span data-i18n="tab4">产品表</span>
      </button>
      <button class="nav-tab" data-page="page-statuscode" role="tab">
        <span class="nav-tab-icon"><UiIcon name="search" /></span><span data-i18n="tab5">状态码查询</span>
      </button>
      <button class="nav-tab" data-page="page-pda" role="tab">
        <span class="nav-tab-icon"><UiIcon name="phone" /></span><span data-i18n="tabPDA">PDA 选型</span>
      </button>
      <button class="nav-tab" data-page="page-solutions" role="tab">
        <span class="nav-tab-icon"><UiIcon name="package" /></span><span data-i18n="tab6">方案解决</span>
      </button>
      <!-- 移动端：更多按钮 -->
      <button class="nav-tab nav-tab-more" id="navMoreBtn" role="tab">
        <UiIcon name="more" /><span data-i18n="tabMore">更多</span>
      </button>
      <div class="nav-footer">
        <button class="nav-footer-btn" id="langBtn" @click="toggleLang" data-i18n="langBtn" aria-label="切换语言">EN</button>
        <button class="nav-footer-btn" id="themeBtn" @click="toggleTheme" aria-label="切换到暗色模式"><UiIcon name="moon" /></button>
      </div>
    </nav>

    <!-- PAGE: 首页 -->
    <PageHome />

    <!-- PAGE: 智能选型 -->
    <PageSelection />

    <!-- PAGE: 竞品分析 -->
    <PageCompetitor />

    <!-- PAGE: 配单表 -->
    <PageBom />

    <!-- PAGE: 状态码查询 -->
    <PageStatuscode />

    <!-- PAGE: 二次开发 -->
    <PageSdk />

    <!-- PAGE: PDA 选型 -->
    <PagePda />

    <!-- PAGE: 方案解决 -->
    <PageSolutions />

    <!-- PAGE: 对照表 -->
    <PageMapping />

  </div>
</div>

  <!-- 全局弹窗 / Lightbox / Toast -->
  <GlobalOverlays />
</template>

<script setup>

import { onMounted } from 'vue'
import PageHome from './components/PageHome.vue'
import PageSelection from './components/PageSelection.vue'
import PageCompetitor from './components/PageCompetitor.vue'
import PageBom from './components/PageBom.vue'
import PageStatuscode from './components/PageStatuscode.vue'
import PageSdk from './components/PageSdk.vue'
import PagePda from './components/PagePda.vue'
import PageSolutions from './components/PageSolutions.vue'
import PageMapping from './components/PageMapping.vue'
import GlobalOverlays from './components/GlobalOverlays.vue'
import UiIcon from './components/UiIcon.vue'

const toggleLang = () => { if (window.toggleLang) window.toggleLang() }
const toggleTheme = () => { if (window.toggleTheme) window.toggleTheme() }

onMounted(() => {
  var bubble = document.getElementById('robotBubble')
  if (!bubble) return
  setTimeout(function () { bubble.style.display = 'none' }, 15000)
})

</script>

<style>
.bom-reverse-info{background:var(--warning-bg,#fffbeb);border:1px solid var(--warning-border,#fde68a);border-radius:6px;padding:10px;margin-top:8px}
    .bom-reverse-name{font-size:13px;font-weight:700;color:var(--text,#1e293b);margin-bottom:4px}
    .bom-reverse-meta{font-size:11px;color:var(--text-muted,#64748b);line-height:1.6}
    .bom-reverse-meta b{color:var(--text,#334155)}
    .bom-reverse-title{font-size:12px;font-weight:600;color:var(--text,#1e293b);margin:8px 0 4px}
    .bom-reverse-model{display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border:1px solid var(--border,#e2e8f0);border-radius:4px;margin-bottom:3px;font-size:11px}
    .bom-reverse-model:hover{border-color:var(--primary,#f97316);background:var(--warning-bg,#fffbeb)}
    .bom-tag-std{padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;background:#dbeafe;color:#1d4ed8}
    .bom-tag-opt{padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;background:#fef3c7;color:#b45309}
</style>

