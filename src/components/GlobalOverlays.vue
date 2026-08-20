<template>
<!-- MORE NAV POPUP (mobile) -->
<div class="more-popup-overlay" id="morePopup">
  <div class="more-popup">
    <div class="more-popup-header">
      <span class="more-popup-title" data-i18n="moreTitle">更多功能</span>
      <button class="more-popup-close" id="morePopupClose">✕</button>
    </div>
    <div class="more-popup-list">
      <button class="more-popup-item" data-page="page-stitch">
        <span class="more-popup-icon">🔗</span>
        <span class="more-popup-label" data-i18n="tabStitch">多相机拼接</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-competitor">
        <span class="more-popup-icon">🔬</span>
        <span class="more-popup-label" data-i18n="tab2">竞品对标</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-bom">
        <span class="more-popup-icon">📋</span>
        <span class="more-popup-label" data-i18n="tab3">配单表</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-mapping">
        <span class="more-popup-icon">🔄</span>
        <span class="more-popup-label" data-i18n="tab4">产品表</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-statuscode">
        <span class="more-popup-icon">🔍</span>
        <span class="more-popup-label" data-i18n="tab5">状态码查询</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-pda">
        <span class="more-popup-icon">📱</span>
        <span class="more-popup-label" data-i18n="tabPDA">PDA 选型</span>
        <span class="more-popup-arrow">›</span>
      </button>
      <button class="more-popup-item" data-page="page-solutions">
        <span class="more-popup-icon">📦</span>
        <span class="more-popup-label" data-i18n="tab6">方案解决</span>
        <span class="more-popup-arrow">›</span>
      </button>
    </div>
  </div>
</div>

  <!-- 联系我们 Modal -->
  <div class="contact-modal-overlay" id="contactModal">
    <div class="contact-modal">
      <div class="contact-modal-header">
        <span class="contact-modal-title" data-i18n="contactTitle">📱 关注我们</span>
        <button class="contact-modal-close" id="contactModalClose">✕</button>
      </div>
      <div class="contact-modal-body">
        <div class="contact-card">
          <div class="contact-card-img-wrap" data-src="assets/contact-wechat.jpg">
            <img :src="'assets/contact-wechat.jpg'" width="160" height="160" alt="微信视频号" class="contact-card-img" data-i18n-alt="contactWechatAlt" loading="lazy" decoding="async">
          </div>
          <div class="contact-card-label" data-i18n="contactWechat">微信视频号</div>
        </div>
        <div class="contact-card">
          <div class="contact-card-img-wrap" data-src="assets/contact-douyin.jpg">
            <img :src="'assets/contact-douyin.jpg'" width="160" height="160" alt="抖音视频号" class="contact-card-img" data-i18n-alt="contactDouyinAlt" loading="lazy" decoding="async">
          </div>
          <div class="contact-card-label" data-i18n="contactDouyin">抖音视频号</div>
        </div>
        <div class="contact-card">
          <div class="contact-card-img-wrap" data-src="assets/contact-bilibili.jpg">
            <img :src="'assets/contact-bilibili.jpg'" width="160" height="160" alt="B站视频号" class="contact-card-img" data-i18n-alt="contactBiliAlt" loading="lazy" decoding="async">
          </div>
          <div class="contact-card-label" data-i18n="contactBili">B站视频号</div>
        </div>
      </div>
      <div class="contact-modal-footer">
        <span class="contact-modal-hint" data-i18n="contactHint">💡 扫码关注，获取最新资讯 </span>
      </div>
    </div>
  </div>

  <!-- 图片预览 Lightbox -->
  <!-- 拼接示意图放大 Lightbox -->
  <div class="stitch-lightbox-overlay" id="stitchLightbox">
    <div class="stitch-lightbox-inner" id="stitchLightboxInner"></div>
    <div class="stitch-lightbox-hint" data-i18n="lightboxCloseHint">点击任意位置关闭</div>
  </div>

  <div class="contact-lightbox-overlay" id="contactLightbox">
    <img src="" width="480" height="480" alt="预览" data-i18n-alt="previewAlt" id="contactLightboxImg">
    <div class="contact-lightbox-hint" data-i18n="lightboxCloseHint">点击任意位置关闭</div>
  </div>

  <!-- 公告弹窗 -->
  <div class="announcement-overlay" id="announcementOverlay">
    <div class="announcement-modal">
      <div class="announcement-header">
        <span data-i18n="announcementTitle">📢 公告</span>
        <button class="announcement-close" id="announcementClose">✕</button>
      </div>
      <div class="announcement-body">
        <div class="announcement-latest" id="announcementLatest"></div>
        <div class="announcement-history">
          <button class="announcement-history-toggle" id="announcementHistoryToggle" data-i18n="announcementHistory">历史公告 ▾</button>
          <div class="announcement-history-list" id="announcementHistoryList"></div>
        </div>
      </div>
      <div class="announcement-footer">
        <button class="announcement-btn" id="announcementDismiss" data-i18n="announcementDismiss">好的</button>
      </div>
    </div>
  </div>

  <!-- Toast 通知容器 -->
  <div class="toast-container" id="toastContainer"></div>
</template>
