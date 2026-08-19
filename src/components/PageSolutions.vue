<template>
  <div class="page" id="page-solutions">
    <div class="sol-page-wrap">
      <div class="sol-page">

        <!-- 顶部说明 -->
        <div class="sol-header">
          <div class="sol-header-icon">📦</div>
          <div class="sol-header-info">
            <div class="sol-header-title">{{ t('solTitle') }}</div>
            <div class="sol-header-desc">{{ t('solDesc') }}</div>
          </div>
        </div>

        <!-- 链接卡片区 -->
        <div class="sol-cards">

          <a class="sol-card sol-card-hero" href="https://www.v-club.com/vAssistant" target="_blank" rel="noopener">
            <div class="sol-card-icon-wrap sol-icon-v">
              <span class="sol-card-icon">🤖</span>
            </div>
            <div class="sol-card-body">
              <div class="sol-card-title">{{ t('solVTitle') }}</div>
              <div class="sol-card-desc">{{ t('solVDesc') }}</div>
              <div class="sol-card-link">
                <span class="sol-card-url">v-club.com</span>
                <span class="sol-card-arrow">→</span>
              </div>
            </div>
          </a>

          <a class="sol-card" href="https://docs.qq.com/aio/DVXBrVm9QaURLRGZC" target="_blank" rel="noopener">
            <div class="sol-card-icon-wrap sol-icon-doc">
              <span class="sol-card-icon">📄</span>
            </div>
            <div class="sol-card-body">
              <div class="sol-card-title">{{ t('solDocTitle') }}</div>
              <div class="sol-card-desc">{{ t('solDocDesc') }}</div>
              <div class="sol-card-link">
                <span class="sol-card-url">docs.qq.com</span>
                <span class="sol-card-arrow">→</span>
              </div>
            </div>
          </a>

          <a class="sol-card" href="https://www.hikrobotics.com/cn/service/aftersale/repair/?module=1AUZFRERGRkxER0ZERjYm" target="_blank" rel="noopener">
            <div class="sol-card-icon-wrap sol-icon-repair">
              <span class="sol-card-icon">🔧</span>
            </div>
            <div class="sol-card-body">
              <div class="sol-card-title">{{ t('solRepairTitle') }}</div>
              <div class="sol-card-desc">{{ t('solRepairDesc') }}</div>
              <div class="sol-card-link">
                <span class="sol-card-url">hikrobotics.com</span>
                <span class="sol-card-arrow">→</span>
              </div>
            </div>
          </a>

          <a class="sol-card" href="sdk-guide.html" target="_blank" rel="noopener">
            <div class="sol-card-icon-wrap sol-icon-sdk">
              <span class="sol-card-icon">💻</span>
            </div>
            <div class="sol-card-body">
              <div class="sol-card-title">{{ t('solSdkTitle') }}</div>
              <div class="sol-card-desc">{{ t('solSdkDesc') }}</div>
              <div class="sol-card-link">
                <span class="sol-card-url">sdk-guide.html</span>
                <span class="sol-card-arrow">→</span>
              </div>
            </div>
          </a>

          <a class="sol-card" href="https://jiaze3303.github.io/Viewer/" target="_blank" rel="noopener">
            <div class="sol-card-icon-wrap sol-icon-viewer">
              <span class="sol-card-icon">📐</span>
            </div>
            <div class="sol-card-body">
              <div class="sol-card-title">{{ t('solViewerTitle') }}</div>
              <div class="sol-card-desc">{{ t('solViewerDesc') }}</div>
              <div class="sol-card-link">
                <span class="sol-card-url">jiaze3303.github.io</span>
                <span class="sol-card-arrow">→</span>
              </div>
            </div>
          </a>

        </div>

        <!-- 底部提示 -->
        <div class="sol-footer">
          <span class="sol-footer-hint">{{ t('solHint') }}</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../composables/useI18n'
const { currentLang, t } = useI18n()
currentLang.value
</script>