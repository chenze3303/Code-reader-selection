<template>
  <div class="page active" id="page-home">
    <div class="home-page">

      <!-- Hero Banner -->
      <div class="home-hero">
        <div class="home-hero-inner">
          <div class="home-hero-text">
            <div class="home-hero-eyebrow" translate="no">HIKROBOT Code Reader Toolkit</div>
            <div class="home-hero-title">{{ t('homeTitle') }}</div>
            <div class="home-hero-desc">{{ t('homeDesc') }}</div>
            <div class="home-hero-badge">V4.1</div>
          </div>
          <div class="home-hero-visual">
            <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="40" y="15" width="120" height="80" rx="8" stroke="#f76504" stroke-width="3" fill="rgba(247,101,4,0.04)"/>
              <circle cx="100" cy="55" r="25" stroke="#f76504" stroke-width="2.5" fill="rgba(247,101,4,0.06)"/>
              <circle cx="100" cy="55" r="14" stroke="#f76504" stroke-width="2" fill="rgba(247,101,4,0.08)"/>
              <circle cx="100" cy="55" r="5" fill="#f76504" opacity=".4"/>
              <line x1="75" y1="55" x2="88" y2="55" stroke="#f76504" stroke-width="1.5" opacity=".6"/>
              <line x1="112" y1="55" x2="125" y2="55" stroke="#f76504" stroke-width="1.5" opacity=".6"/>
              <line x1="100" y1="30" x2="100" y2="43" stroke="#f76504" stroke-width="1.5" opacity=".6"/>
              <line x1="100" y1="67" x2="100" y2="80" stroke="#f76504" stroke-width="1.5" opacity=".6"/>
              <circle cx="55" cy="28" r="3" fill="#f76504" opacity=".5"/>
              <circle cx="65" cy="28" r="3" fill="#f76504" opacity=".3"/>
              <rect x="60" y="100" width="80" height="10" rx="3" fill="#f76504" opacity=".15"/>
              <rect x="75" y="114" width="50" height="6" rx="2" fill="#f76504" opacity=".08"/>
              <rect x="70" y="125" width="3" height="8" fill="#f76504" opacity=".12"/>
              <rect x="76" y="125" width="2" height="8" fill="#f76504" opacity=".12"/>
              <rect x="81" y="125" width="4" height="8" fill="#f76504" opacity=".12"/>
              <rect x="88" y="125" width="2" height="8" fill="#f76504" opacity=".12"/>
              <rect x="93" y="125" width="3" height="8" fill="#f76504" opacity=".12"/>
              <rect x="99" y="125" width="2" height="8" fill="#f76504" opacity=".12"/>
              <rect x="104" y="125" width="4" height="8" fill="#f76504" opacity=".12"/>
              <rect x="111" y="125" width="2" height="8" fill="#f76504" opacity=".12"/>
              <rect x="116" y="125" width="3" height="8" fill="#f76504" opacity=".12"/>
              <rect x="122" y="125" width="2" height="8" fill="#f76504" opacity=".12"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="home-section">
        <div class="home-section-head">
          <span class="home-section-label">{{ t('homeFeatures') }}</span>
          <span class="home-section-sub">FEATURES</span>
          <span class="home-section-line"></span>
        </div>
        <div class="home-grid">
          <button class="home-card" data-goto="page-selection">
            <div class="home-card-top">
              <div class="home-card-icon">⚡</div>
              <div class="home-card-title">{{ t('tab1') }}</div>
              <div class="home-card-num">01</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc1') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct1') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-stitch">
            <div class="home-card-top">
              <div class="home-card-icon">🔗</div>
              <div class="home-card-title">{{ t('tabStitch') }}</div>
              <div class="home-card-num">02</div>
            </div>
            <div class="home-card-desc">{{ t('homeDescStitch') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeActStitch') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-competitor">
            <div class="home-card-top">
              <div class="home-card-icon">🔬</div>
              <div class="home-card-title">{{ t('tab2') }}</div>
              <div class="home-card-num">03</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc2') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct2') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-bom">
            <div class="home-card-top">
              <div class="home-card-icon">📋</div>
              <div class="home-card-title">{{ t('tab3') }}</div>
              <div class="home-card-num">04</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc3') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct3') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-mapping">
            <div class="home-card-top">
              <div class="home-card-icon">🔄</div>
              <div class="home-card-title">{{ t('tab4') }}</div>
              <div class="home-card-num">05</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc4') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct4') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-statuscode">
            <div class="home-card-top">
              <div class="home-card-icon">🔍</div>
              <div class="home-card-title">{{ t('tab5') }}</div>
              <div class="home-card-num">06</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc5') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct5') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-pda">
            <div class="home-card-top">
              <div class="home-card-icon">📱</div>
              <div class="home-card-title">{{ t('tabPDA') }}</div>
              <div class="home-card-num">07</div>
            </div>
            <div class="home-card-desc">{{ t('homeDescPDA') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeActPDA') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
          <button class="home-card" data-goto="page-solutions">
            <div class="home-card-top">
              <div class="home-card-icon">📦</div>
              <div class="home-card-title">{{ t('tab6') }}</div>
              <div class="home-card-num">08</div>
            </div>
            <div class="home-card-desc">{{ t('homeDesc6') }}</div>
            <div class="home-card-footer">
              <span class="home-card-link">{{ t('homeAct6') }} <span class="home-card-link-arrow">→</span></span>
            </div>
          </button>
        </div>
      </div>

      <!-- 底部 -->
      <div class="home-footer">
        <div class="home-footer-links">
          <a href="https://www.hikrobotics.com" target="_blank">{{ t('footerSite') }}</a>
        </div>
        <button class="home-footer-ver" id="announcementBtn">{{ t('announcementBtn') }}</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../composables/useI18n'
const { currentLang, t } = useI18n()
currentLang.value
</script>