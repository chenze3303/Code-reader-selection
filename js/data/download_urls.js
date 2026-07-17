/**
 * 各系列资料下载页面 URL
 * 基线型号和经销型号各自对应海康官网产品详情页
 * 点击下载按钮可直接跳转到对应页面的"资料下载"tab
 */
(function() {
  'use strict';

  // cat → 基线产品页 URL
  var BASE_DOWNLOAD_URLS = {
    "ID803M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13058",
    "ID813M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12995",
    "ID2013EMI 基础SR V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13319",
    "ID2013EM 近焦NR V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13319",
    "ID2013EM 高密HD V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13319",
    "ID2013EM 侧出S V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13319",
    "ID2013EM 金属壳V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13319",
    "ID2013EM 基础SR V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11373",
    "ID2013EM 近焦NR V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11373",
    "ID2013EM 高密HD V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11373",
    "ID2013EM 侧出S V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11373",
    "ID2013EM 金属壳V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11373",
    "ID2013EPI 基础SR V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13378",
    "ID2004M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7364",
    "ID2013M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=8370",
    "ID2013M长焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=8370",
    "ID2016M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12510",
    "ID2016M调焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12510",
    "ID2016M长焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12510",
    "ID2023XM系列 IDBX008X系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13590",
    "ID3013PM 14颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=8509",
    "ID3013PM 8颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=8509",
    "ID3016PM 8颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7315",
    "ID3050PM 14颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7964",
    "ID3016XM系列 V2.0": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=10500",
    "ID3030XM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=10422",
    "ID3050XM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11315",
    "ID3040RM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13412",
    "ID3060RM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13408",
    "ID5050XM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12244",
    "ID5050系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=12244",
    "ID5060 V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7377",
    "ID5060 V3.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7377",
    "ID5120RM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=14181",
    "ID5120XM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13926",
    "ID5120系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=5515",
    "ID5200P系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11350",
    "ID5200系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7379",
    "ID5250P系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=11766",
    "IDBX007X系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13944"
  };

  // cat → 经销产品页 URL
  var DIST_DOWNLOAD_URLS = {
    "ID803M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13434",
    "ID813M系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13436",
    "ID2013EMI 基础SR V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13223",
    "ID2013EM 近焦NR V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13223",
    "ID2013EM 高密HD V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13223",
    "ID2013EM 侧出S V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13223",
    "ID2013EM 金属壳V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13241",
    "ID2013EM 基础SR V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9052",
    "ID2013EM 近焦NR V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9052",
    "ID2013EM 高密HD V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9052",
    "ID2013EM 侧出S V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9052",
    "ID2013EM 金属壳V1.5系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=10122",
    "ID2004M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7848",
    "ID2013M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9124",
    "ID2013M长焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9124",
    "ID2016M基础系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7849",
    "ID2016M调焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7849",
    "ID2016M长焦系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=7849",
    "IDBX007X系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13944",
    "ID2023XM系列 IDBX008X系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13398",
    "ID3013PM 14颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=10145",
    "ID3013PM 8颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=10145",
    "ID3016PM 8颗灯珠": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9855",
    "ID3060RM系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=13505",
    "ID5060 V2.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9067",
    "ID5060 V3.0系列": "https://www.hikrobotics.com/cn/machinevision/productdetail/?id=9067"
  };

  window.MAPPING_DOWNLOAD_URLS = {
    base: BASE_DOWNLOAD_URLS,
    dist: DIST_DOWNLOAD_URLS,
    getBaseUrl: function(cat) { return BASE_DOWNLOAD_URLS[cat] || ''; },
    getDistUrl: function(cat) { return DIST_DOWNLOAD_URLS[cat] || ''; }
  };
})();
