<template>
  <div class="page" id="page-sdk" ref="sdkPageRef">
    <div class="sdk-layout">
      <!-- 侧边目录 -->
      <aside class="sdk-toc" id="sdkToc">
        <div class="sdk-toc-title"><UiIcon name="bookmark" /> {{ t('sdkTocTitle') }}</div>
        <a href="sdk-guide.html" class="sdk-full-link" target="_blank"><UiIcon name="book" /> {{ t('sdkFullDoc') }}</a>
        <div class="sdk-toc-lang">
          <button class="sdk-toc-lang-btn" :class="{active: sdkLang === 'c'}" @click="sdkLang = 'c'">C</button>
          <button class="sdk-toc-lang-btn" :class="{active: sdkLang === 'csharp'}" @click="sdkLang = 'csharp'">C#</button>
        </div>
        <nav class="sdk-toc-nav" id="sdkTocNav">
          <!-- C 语言目录 -->
          <div class="sdk-toc-section" :class="{active: sdkLang === 'c'}">
            <a href="#sdk-c-overview" class="sdk-toc-link"><UiIcon name="clipboard" /> {{ t('sdkTocOverview') }}</a>
            <a href="#sdk-c-env" class="sdk-toc-link"><UiIcon name="wrench" /> {{ t('sdkTocEnv') }}</a>
            <a href="#sdk-c-flow" class="sdk-toc-link"><UiIcon name="star" /> {{ t('sdkTocFlow') }}</a>
            <a href="#sdk-c-param" class="sdk-toc-link"><UiIcon name="settings" /> {{ t('sdkTocParam') }}</a>
            <a href="#sdk-c-grab" class="sdk-toc-link"><UiIcon name="camera" /> {{ t('sdkTocGrab') }}</a>
            <a href="#sdk-c-trigger" class="sdk-toc-link"><UiIcon name="target" /> {{ t('sdkTocTrigger') }}</a>
            <a href="#sdk-c-error" class="sdk-toc-link"><UiIcon name="search" /> {{ t('sdkTocError') }}</a>
            <a href="#sdk-c-api" class="sdk-toc-link"><UiIcon name="library" /> {{ t('sdkTocApi') }}</a>
          </div>
          <!-- C# 语言目录 -->
          <div class="sdk-toc-section" :class="{active: sdkLang === 'csharp'}">
            <a href="#sdk-cs-overview" class="sdk-toc-link"><UiIcon name="clipboard" /> {{ t('sdkTocOverview') }}</a>
            <a href="#sdk-cs-env" class="sdk-toc-link"><UiIcon name="wrench" /> {{ t('sdkTocEnv') }}</a>
            <a href="#sdk-cs-flow" class="sdk-toc-link"><UiIcon name="star" /> {{ t('sdkTocFlow') }}</a>
            <a href="#sdk-cs-param" class="sdk-toc-link"><UiIcon name="settings" /> {{ t('sdkTocParam') }}</a>
            <a href="#sdk-cs-grab" class="sdk-toc-link"><UiIcon name="camera" /> {{ t('sdkTocGrab') }}</a>
            <a href="#sdk-cs-trigger" class="sdk-toc-link"><UiIcon name="target" /> {{ t('sdkTocTrigger') }}</a>
            <a href="#sdk-cs-advanced" class="sdk-toc-link"><UiIcon name="link" /> {{ t('sdkTocAdvanced') }}</a>
            <a href="#sdk-cs-error" class="sdk-toc-link"><UiIcon name="search" /> {{ t('sdkTocError') }}</a>
            <a href="#sdk-cs-api" class="sdk-toc-link"><UiIcon name="library" /> {{ t('sdkTocApi') }}</a>
          </div>
        </nav>
        <div class="sdk-toc-progress">
          <div class="sdk-toc-progress-bar" id="sdkProgressBar"></div>
        </div>
        <div class="sdk-toc-percent" id="sdkPercent">0%</div>
      </aside>

      <div class="sdk-page">
      <!-- 完整文档横幅 -->
      <div class="sdk-banner">
        <div class="sdk-banner-text">
          <h2><UiIcon name="book" /> {{ t('sdkBannerTitle') }}</h2>
          <p>{{ t('sdkBannerDesc') }}</p>
        </div>
        <a href="sdk-guide.html" class="sdk-banner-btn" target="_blank">{{ t('sdkBannerBtn') }}</a>
      </div>

      <!-- 顶部 -->
      <div class="sdk-hero">
        <div class="sdk-hero-badge">MvCodeReader SDK</div>
        <h1 class="sdk-hero-title">{{ t('sdkHeroTitle') }}</h1>
        <p class="sdk-hero-desc">{{ t('sdkHeroDesc') }}</p>
      </div>

      <!-- 语言切换 -->
      <div class="sdk-lang-bar">
        <button class="sdk-lang-btn" :class="{active: sdkLang === 'c'}" @click="sdkLang = 'c'">{{ t('sdkLangC') }}</button>
        <button class="sdk-lang-btn" :class="{active: sdkLang === 'csharp'}" @click="sdkLang = 'csharp'">{{ t('sdkLangCS') }}</button>
      </div>

      <!-- C 语言内容 -->
      <div class="sdk-content" :class="{active: sdkLang === 'c'}" id="sdk-c">
        <!-- 学习路径 -->
        <div class="sdk-path">
          <a class="sdk-path-card" href="#sdk-c-env">
            <div class="sdk-path-step">Step 1</div>
            <div class="sdk-path-title">{{ t('sdkPathEnvT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathEnvD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-c-flow">
            <div class="sdk-path-step">Step 2</div>
            <div class="sdk-path-title">{{ t('sdkPathFlowT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathFlowD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-c-param">
            <div class="sdk-path-step">Step 3</div>
            <div class="sdk-path-title">{{ t('sdkPathParamT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathParamD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-c-api">
            <div class="sdk-path-step">Step 4</div>
            <div class="sdk-path-title">{{ t('sdkPathApiT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathApiD') }}</div>
          </a>
        </div>

        <!-- 开发环境 -->
        <div class="sdk-section" id="sdk-c-env">
          <h2 class="sdk-section-title">{{ t('sdkEnvTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkPrereq') }}</h3>
            <ul class="sdk-list">
              <li>{{ t('sdkPrereq1') }}</li>
              <li>{{ t('sdkPrereq2') }}</li>
              <li>{{ t('sdkPrereq3') }}</li>
            </ul>
            <div class="sdk-warning">
              <span class="sdk-warning-icon"><UiIcon name="warn" /></span>
              <span>{{ t('sdkBitnessWarn') }}</span>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkHeaders') }}</h3>
            <div class="sdk-table">
              <div class="sdk-table-row">
                <code>MvCodeReaderCtrl.h</code>
                <span>{{ t('sdkHdr1') }}</span>
              </div>
              <div class="sdk-table-row">
                <code>MvCodeReaderParams.h</code>
                <span>{{ t('sdkHdr2') }}</span>
              </div>
              <div class="sdk-table-row">
                <code>MvCodeReaderErrorDefine.h</code>
                <span>{{ t('sdkHdr3') }}</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkGige') }}</h3>
            <ul class="sdk-list">
              <li>{{ t('sdkGige1') }}</li>
              <li>{{ t('sdkGige2') }}</li>
              <li>{{ t('sdkGige3') }}</li>
            </ul>
          </div>
        </div>

        <!-- 编程流程 -->
        <div class="sdk-section" id="sdk-c-flow">
          <h2 class="sdk-section-title">{{ t('sdkFlowTitle') }}</h2>
          <div class="sdk-flow">
            <div class="sdk-flow-group">
              <div class="sdk-flow-label">{{ t('sdkConnPhase') }}</div>
              <div class="sdk-flow-steps">
                <div class="sdk-flow-step highlight">{{ t('sdkEnumDev') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step highlight">{{ t('sdkCreateHandle') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step highlight">{{ t('sdkSetArea') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step highlight">{{ t('sdkOpenDev') }}</div>
              </div>
            </div>
            <div class="sdk-flow-group">
              <div class="sdk-flow-label">{{ t('sdkRunPhase') }}</div>
              <div class="sdk-flow-steps">
                <div class="sdk-flow-step">{{ t('sdkSetParam') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step">{{ t('sdkStartGrab') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step">{{ t('sdkGetResult') }}</div>
              </div>
            </div>
            <div class="sdk-flow-group">
              <div class="sdk-flow-label">{{ t('sdkRelPhase') }}</div>
              <div class="sdk-flow-steps">
                <div class="sdk-flow-step">{{ t('sdkStopGrab') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step">{{ t('sdkCloseDev') }}</div>
                <div class="sdk-flow-arrow">→</div>
                <div class="sdk-flow-step">{{ t('sdkDestroyHandle') }}</div>
              </div>
            </div>
          </div>

          <div class="sdk-card">
            <h3>{{ t('sdkCodeConn') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeEnumC') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="cm">{{ t('sdkC1') }}</span>
<span class="tp">MV_CODEREADER_DEVICE_INFO_LIST</span> <span class="fn">stDevList</span>;
<span class="fn">memset</span>(&stDevList, <span class="nm">0</span>, <span class="kw">sizeof</span>(stDevList));
<span class="tp">int</span> <span class="fn">nRet</span> = <span class="fn">MV_CODEREADER_EnumDevices</span>(&stDevList, <span class="nm">MV_CODEREADER_GIGE_DEVICE</span>);

<span class="cm">{{ t('sdkC2') }}</span>
<span class="tp">void</span>* <span class="fn">handle</span> = <span class="kw">NULL</span>;
<span class="fn">MV_CODEREADER_CreateHandle</span>(&handle, stDevList.<span class="fn">pDeviceInfo</span>[<span class="nm">0</span>]);

<span class="cm">{{ t('sdkC3') }}</span>
<span class="fn">MV_CODEREADER_SetAreaInfoConfig</span>(handle, <span class="nm">0xa80</span>, <span class="nm">0x10000</span>);

<span class="cm">{{ t('sdkC4') }}</span>
<span class="fn">MV_CODEREADER_OpenDevice</span>(handle);</code></pre>
            </div>
            <div class="sdk-tip">
              <span class="sdk-tip-icon"><UiIcon name="lightbulb" /></span>
              <span>{{ t('sdkAreaTip') }}</span>
            </div>
          </div>

          <div class="sdk-card">
            <h3>{{ t('sdkCodeRun') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeRunC') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="cm">{{ t('sdkC5') }}</span>
<span class="fn">MV_CODEREADER_SetEnumValue</span>(handle, <span class="st">"TriggerMode"</span>, <span class="nm">MV_CODEREADER_TRIGGER_MODE_OFF</span>);
<span class="fn">MV_CODEREADER_SetFloatValue</span>(handle, <span class="st">"ExposureTime"</span>, <span class="nm">120.0f</span>);

<span class="cm">{{ t('sdkC6') }}</span>
<span class="fn">MV_CODEREADER_StartGrabbing</span>(handle);

<span class="cm">{{ t('sdkC7') }}</span>
<span class="tp">unsigned</span> <span class="tp">char</span>* <span class="fn">pData</span> = <span class="kw">NULL</span>;
<span class="tp">MV_CODEREADER_IMAGE_OUT_INFO_EX2</span> <span class="fn">stFrameInfo</span>;
<span class="fn">MV_CODEREADER_GetOneFrameTimeoutEx2</span>(handle, &pData, &stFrameInfo, <span class="nm">1000</span>);</code></pre>
            </div>
          </div>

          <div class="sdk-card">
            <h3>{{ t('sdkCodeRel') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeRelC') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="fn">MV_CODEREADER_StopGrabbing</span>(handle);
<span class="fn">MV_CODEREADER_CloseDevice</span>(handle);
<span class="fn">MV_CODEREADER_DestroyHandle</span>(handle);</code></pre>
            </div>
          </div>
        </div>

        <!-- 参数设置 -->
        <div class="sdk-section" id="sdk-c-param">
          <h2 class="sdk-section-title">{{ t('sdkParamTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkNodeMap') }}</h3>
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkType') }}</span>
                <span>{{ t('sdkGet') }}</span>
                <span>{{ t('sdkSet') }}</span>
                <span>{{ t('sdkTypical') }}</span>
              </div>
              <div class="sdk-table-row">
                <span>Integer</span>
                <code>GetIntValue</code>
                <code>SetIntValue</code>
                <span>AcquisitionBurstFrameCount</span>
              </div>
              <div class="sdk-table-row">
                <span>Float</span>
                <code>GetFloatValue</code>
                <code>SetFloatValue</code>
                <span>ExposureTime, Gain</span>
              </div>
              <div class="sdk-table-row">
                <span>Enumeration</span>
                <code>GetEnumValue</code>
                <code>SetEnumValue</code>
                <span>TriggerMode, TriggerSource</span>
              </div>
              <div class="sdk-table-row">
                <span>Boolean</span>
                <code>GetBoolValue</code>
                <code>SetBoolValue</code>
                <span>TriggerCache</span>
              </div>
              <div class="sdk-table-row">
                <span>String</span>
                <code>GetStringValue</code>
                <code>SetStringValue</code>
                <span>DeviceUserID</span>
              </div>
              <div class="sdk-table-row">
                <span>Command</span>
                <span>—</span>
                <code>SetCommandValue</code>
                <span>TriggerSoftware</span>
              </div>
            </div>
          </div>
          <div class="sdk-warning">
            <span class="sdk-warning-icon"><UiIcon name="warn" /></span>
            <span>{{ t('sdkEnumWarn') }}</span>
          </div>
        </div>

        <!-- 触发模式 -->
        <div class="sdk-section" id="sdk-c-trigger">
          <h2 class="sdk-section-title">{{ t('sdkTriggerTitle') }}</h2>
          <div class="sdk-card">
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkMode') }}</span>
                <span>TriggerMode</span>
                <span>TriggerSource</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkCont') }}</strong>
                <span>Off</span>
                <span>—</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkSoftTrig') }}</strong>
                <span>On</span>
                <span>Software</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkHardTrig') }}</strong>
                <span>On</span>
                <span>LineIn0/1/2</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkSoftExample') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeSoftC') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="fn">MV_CODEREADER_SetEnumValue</span>(handle, <span class="st">"TriggerMode"</span>, <span class="nm">MV_CODEREADER_TRIGGER_MODE_ON</span>);
<span class="fn">MV_CODEREADER_SetEnumValue</span>(handle, <span class="st">"TriggerSource"</span>, <span class="nm">MV_CODEREADER_TRIGGER_SOURCE_SOFTWARE</span>);
<span class="fn">MV_CODEREADER_StartGrabbing</span>(handle);
<span class="fn">MV_CODEREADER_SetCommandValue</span>(handle, <span class="st">"TriggerSoftware"</span>);
<span class="cm">{{ t('sdkSoftComment') }}</span></code></pre>
            </div>
          </div>
        </div>

        <!-- 错误排查 -->
        <div class="sdk-section" id="sdk-c-error">
          <h2 class="sdk-section-title">{{ t('sdkErrTitle') }}</h2>
          <div class="sdk-card">
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkSymptom') }}</span>
                <span>{{ t('sdkCheck') }}</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkErr1') }}</strong>
                <span>{{ t('sdkErr1D') }}</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkErr2') }}</strong>
                <span>{{ t('sdkErr2D') }}</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkErr3') }}</strong>
                <span>{{ t('sdkErr3D') }}</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkErr4') }}</strong>
                <span>{{ t('sdkErr4D') }}</span>
              </div>
              <div class="sdk-table-row">
                <strong>{{ t('sdkErr5') }}</strong>
                <span>{{ t('sdkErr5D') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- API 速查 -->
        <div class="sdk-section" id="sdk-c-api">
          <h2 class="sdk-section-title">{{ t('sdkApiTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkApiDev') }}</h3>
            <div class="sdk-api-list">
              <div class="sdk-api-item">
                <code>MV_CODEREADER_EnumDevices(MV_CODEREADER_DEVICE_INFO_LIST*, uint nTLayerType)</code>
                <span>{{ t('sdkEnumDev') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_CreateHandle(void**, MV_CODEREADER_DEVICE_INFO*)</code>
                <span>{{ t('sdkCreateHandle') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetAreaInfoConfig(void*, int64_t, int64_t)</code>
                <span>{{ t('sdkApiArea') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_OpenDevice / CloseDevice</code>
                <span>{{ t('sdkOpenClose') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_DestroyHandle</code>
                <span>{{ t('sdkDestroyHandle') }}</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkApiParamRW') }}</h3>
            <div class="sdk-api-list">
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetIntValue / GetIntValue</code>
                <span>{{ t('sdkIntNode') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetFloatValue / GetFloatValue</code>
                <span>{{ t('sdkFloatNode') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetEnumValue / GetEnumValue</code>
                <span>{{ t('sdkEnumNode') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetBoolValue / GetBoolValue</code>
                <span>{{ t('sdkBoolNode') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetStringValue / GetStringValue</code>
                <span>{{ t('sdkStringNode') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_SetCommandValue</code>
                <span>{{ t('sdkCmdNode') }}</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkApiGrab') }}</h3>
            <div class="sdk-api-list">
              <div class="sdk-api-item">
                <code>MV_CODEREADER_StartGrabbing / StopGrabbing</code>
                <span>{{ t('sdkStartStop') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_GetOneFrameTimeoutEx2</code>
                <span>{{ t('sdkPoll') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_RegisterImageCallBackEx2</code>
                <span>{{ t('sdkRegCb') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- C# 语言内容 -->
      <div class="sdk-content" :class="{active: sdkLang === 'csharp'}" id="sdk-csharp">
        <div class="sdk-path">
          <a class="sdk-path-card" href="#sdk-cs-env">
            <div class="sdk-path-step">Step 1</div>
            <div class="sdk-path-title">{{ t('sdkPathEnvT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathCsEnvD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-cs-flow">
            <div class="sdk-path-step">Step 2</div>
            <div class="sdk-path-title">{{ t('sdkPathFlowT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathFlowD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-cs-param">
            <div class="sdk-path-step">Step 3</div>
            <div class="sdk-path-title">{{ t('sdkPathParamT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathCsParamD') }}</div>
          </a>
          <a class="sdk-path-card" href="#sdk-cs-api">
            <div class="sdk-path-step">Step 4</div>
            <div class="sdk-path-title">{{ t('sdkPathApiT') }}</div>
            <div class="sdk-path-desc">{{ t('sdkPathCsApiD') }}</div>
          </a>
        </div>

        <div class="sdk-section" id="sdk-cs-env">
          <h2 class="sdk-section-title">{{ t('sdkEnvTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkPrereq') }}</h3>
            <ul class="sdk-list">
              <li>{{ t('sdkPrereq1') }}</li>
              <li>{{ t('sdkCsRef') }}</li>
              <li>{{ t('sdkPrereq3') }}</li>
            </ul>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkCsRefs') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>C#</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="kw">using</span> <span class="tp">System</span>;
<span class="kw">using</span> <span class="tp">MvCodeReaderSDKNet</span>;
<span class="kw">using</span> <span class="tp">System.Runtime.InteropServices</span>;  <span class="cm">// Marshal</span>
<span class="kw">using</span> <span class="tp">System.Threading</span>;              <span class="cm">{{ t('sdkCsRecvThread') }}</span></code></pre>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkCsConst') }}</h3>
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkConst') }}</span>
                <span>{{ t('sdkValue') }}</span>
                <span>{{ t('sdkDesc') }}</span>
              </div>
              <div class="sdk-table-row">
                <code>MV_CODEREADER_GIGE_DEVICE</code>
                <span>1</span>
                <span>{{ t('sdkGigeDev') }}</span>
              </div>
              <div class="sdk-table-row">
                <code>MV_CODEREADER_USB_DEVICE</code>
                <span>4</span>
                <span>{{ t('sdkUsbDev') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sdk-section" id="sdk-cs-flow">
          <h2 class="sdk-section-title">{{ t('sdkFlowTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkConnPhase') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeEnumCS') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="kw">var</span> <span class="fn">deviceList</span> = <span class="kw">new</span> <span class="tp">MvCodeReader</span>.<span class="tp">MV_CODEREADER_DEVICE_INFO_LIST</span>();
<span class="tp">int</span> <span class="fn">nRet</span> = <span class="tp">MvCodeReader</span>.<span class="fn">MV_CODEREADER_EnumDevices_NET</span>(
    <span class="kw">ref</span> deviceList, <span class="tp">MvCodeReader</span>.<span class="nm">MV_CODEREADER_GIGE_DEVICE</span>);

<span class="cm">{{ t('sdkCsMarshal') }}</span>
<span class="kw">var</span> <span class="fn">stDevInfo</span> = (<span class="tp">MvCodeReader</span>.<span class="tp">MV_CODEREADER_DEVICE_INFO</span>)
    <span class="tp">Marshal</span>.<span class="fn">PtrToStructure</span>(deviceList.<span class="fn">pDeviceInfo</span>[<span class="nm">0</span>],
        <span class="kw">typeof</span>(<span class="tp">MvCodeReader</span>.<span class="tp">MV_CODEREADER_DEVICE_INFO</span>));

<span class="tp">MvCodeReader</span> <span class="fn">device</span> = <span class="kw">new</span> <span class="tp">MvCodeReader</span>();
nRet = device.<span class="fn">MV_CODEREADER_CreateHandle_NET</span>(<span class="kw">ref</span> stDevInfo);

<span class="cm">{{ t('sdkC3') }}</span>
<span class="tp">IntPtr</span> <span class="fn">handle</span> = device.<span class="fn">GetCameraHandle</span>();
<span class="fn">MV_CODEREADER_SetAreaInfoConfig</span>(handle, <span class="nm">0xa80</span>, <span class="nm">0x10000</span>);

<span class="cm">{{ t('sdkC4') }}</span>
nRet = device.<span class="fn">MV_CODEREADER_OpenDevice_NET</span>();</code></pre>
            </div>
            <div class="sdk-warning">
              <span class="sdk-warning-icon"><UiIcon name="warn" /></span>
              <span>{{ t('sdkCsDllImport') }}</span>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkRelCode') }}</h3>
            <div class="sdk-code">
              <div class="sdk-code-header">
                <span>{{ t('sdkCodeRelCS') }}</span>
                <button class="sdk-copy-btn" @click="copySdkCode">{{ t('sdkCopy') }}</button>
              </div>
              <pre><code><span class="kw">finally</span>
{
    <span class="kw">if</span> (device != <span class="kw">null</span>)
    {
        <span class="kw">if</span> (grabbing)  <span class="kw">try</span> { device.<span class="fn">MV_CODEREADER_StopGrabbing_NET</span>(); } <span class="kw">catch</span> { }
        <span class="kw">if</span> (opened)    <span class="kw">try</span> { device.<span class="fn">MV_CODEREADER_CloseDevice_NET</span>(); } <span class="kw">catch</span> { }
        <span class="kw">if</span> (handleOK)  <span class="kw">try</span> { device.<span class="fn">MV_CODEREADER_DestroyHandle_NET</span>(); } <span class="kw">catch</span> { }
    }
}</code></pre>
            </div>
            <div class="sdk-tip">
              <span class="sdk-tip-icon"><UiIcon name="lightbulb" /></span>
              <span>{{ t('sdkCsGC') }}</span>
            </div>
          </div>
        </div>

        <div class="sdk-section" id="sdk-cs-param">
          <h2 class="sdk-section-title">{{ t('sdkParamTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkNodeMapCS') }}</h3>
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkType') }}</span>
                <span>{{ t('sdkGet') }}</span>
                <span>{{ t('sdkSet') }}</span>
                <span>{{ t('sdkValType') }}</span>
              </div>
              <div class="sdk-table-row">
                <span>Integer</span>
                <code>GetIntValue_NET</code>
                <code>SetIntValue_NET</code>
                <span>Int64</span>
              </div>
              <div class="sdk-table-row">
                <span>Float</span>
                <code>GetFloatValue_NET</code>
                <code>SetFloatValue_NET</code>
                <span>Single</span>
              </div>
              <div class="sdk-table-row">
                <span>Enumeration</span>
                <code>GetEnumValue_NET</code>
                <code>SetEnumValue_NET</code>
                <span>UInt32</span>
              </div>
              <div class="sdk-table-row">
                <span>Boolean</span>
                <code>GetBoolValue_NET</code>
                <code>SetBoolValue_NET</code>
                <span>Boolean</span>
              </div>
              <div class="sdk-table-row">
                <span>String</span>
                <code>GetStringValue_NET</code>
                <code>SetStringValue_NET</code>
                <span>String</span>
              </div>
              <div class="sdk-table-row">
                <span>Command</span>
                <span>—</span>
                <code>SetCommandValue_NET</code>
                <span>—</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkCommonParams') }}</h3>
            <div class="sdk-table">
              <div class="sdk-table-header">
                <span>{{ t('sdkParam') }}</span>
                <span>{{ t('sdkNodeName') }}</span>
                <span>{{ t('sdkType') }}</span>
              </div>
              <div class="sdk-table-row">
                <span>{{ t('sdkExposure') }}</span>
                <code>ExposureTime</code>
                <span>Float</span>
              </div>
              <div class="sdk-table-row">
                <span>{{ t('sdkGain') }}</span>
                <code>Gain</code>
                <span>Float</span>
              </div>
              <div class="sdk-table-row">
                <span>{{ t('sdkTrigMode') }}</span>
                <code>TriggerMode</code>
                <span>Enum</span>
              </div>
              <div class="sdk-table-row">
                <span>{{ t('sdkTrigSrc') }}</span>
                <code>TriggerSource</code>
                <span>Enum</span>
              </div>
              <div class="sdk-table-row">
                <span>{{ t('sdkSoftTrig') }}</span>
                <code>TriggerSoftware</code>
                <span>Command</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sdk-section" id="sdk-cs-api">
          <h2 class="sdk-section-title">{{ t('sdkApiTitle') }}</h2>
          <div class="sdk-card">
            <h3>{{ t('sdkApiDev') }}</h3>
            <div class="sdk-api-list">
              <div class="sdk-api-item">
                <code>MV_CODEREADER_EnumDevices_NET</code>
                <span>{{ t('sdkEnumDev') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_CreateHandle_NET</code>
                <span>{{ t('sdkCreateHandle') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_OpenDevice_NET / CloseDevice_NET</code>
                <span>{{ t('sdkOpenClose') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_DestroyHandle_NET</code>
                <span>{{ t('sdkDestroyHandle') }}</span>
              </div>
            </div>
          </div>
          <div class="sdk-card">
            <h3>{{ t('sdkApiGrab') }}</h3>
            <div class="sdk-api-list">
              <div class="sdk-api-item">
                <code>MV_CODEREADER_StartGrabbing_NET / StopGrabbing_NET</code>
                <span>{{ t('sdkStartStop') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_GetOneFrameTimeoutEx2_NET</code>
                <span>{{ t('sdkPollShort') }}</span>
              </div>
              <div class="sdk-api-item">
                <code>MV_CODEREADER_RegisterImageCallBackEx2_NET</code>
                <span>{{ t('sdkRegCb') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sdk-footer-ver">MvCodeReader SDK v1.0</div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from '../composables/useI18n'
import UiIcon from './UiIcon.vue'

const { currentLang, t } = useI18n()
const sdkLang = ref('c')
const sdkPageRef = ref(null)

function fallbackCopy(text) {
  var textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

function copySdkCode(e) {
  var btn = e.currentTarget || e.target
  var codeBlock = btn.closest('.sdk-code')
  if (!codeBlock) return
  var codeEl = codeBlock.querySelector('code')
  var text = (codeEl && (codeEl.textContent || codeEl.innerText)) || ''
  var done = function () {
    var original = btn.textContent
    btn.textContent = t('copiedShort')
    btn.style.background = '#27ae60'
    setTimeout(function () {
      btn.textContent = original
      btn.style.background = ''
    }, 2000)
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done() })
  } else {
    fallbackCopy(text)
    done()
  }
}

onMounted(function () {
  var sdkPage = sdkPageRef.value
  if (!sdkPage) return

  function smoothScroll(e) {
    var href = e.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      e.preventDefault()
      var target = document.querySelector(href)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  sdkPage.querySelectorAll('.sdk-path-card').forEach(function (link) { link.addEventListener('click', smoothScroll) })
  sdkPage.querySelectorAll('.sdk-toc-link').forEach(function (link) { link.addEventListener('click', smoothScroll) })

  var progressBar = sdkPage.querySelector('#sdkProgressBar')
  var percentText = sdkPage.querySelector('#sdkPercent')
  var tocLinks = sdkPage.querySelectorAll('.sdk-toc-link')

  function updateTocHighlight() {
    var scrollTop = sdkPage.scrollTop
    var scrollHeight = sdkPage.scrollHeight - sdkPage.clientHeight
    var percent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
    if (progressBar) progressBar.style.width = percent + '%'
    if (percentText) percentText.textContent = percent + '%'
    var sections = sdkPage.querySelectorAll('.sdk-section')
    var currentSection = null
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect()
      if (rect.top <= 100) currentSection = section
    })
    tocLinks.forEach(function (link) { link.classList.remove('active') })
    if (currentSection) {
      var id = currentSection.id
      var activeLink = sdkPage.querySelector('.sdk-toc-link[href="#' + id + '"]')
      if (activeLink) activeLink.classList.add('active')
    }
  }
  sdkPage.addEventListener('scroll', updateTocHighlight)
  setTimeout(updateTocHighlight, 100)
})

currentLang.value
</script>