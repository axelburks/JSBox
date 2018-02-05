/*
解析二维码，自动打开到相应的 App 并保存到剪贴板
1.通过 share extension 运行，避免保存图片 或 直接相册运行
2.主程序内直接运行，自动解析剪贴板图片 或 开启扫描
3.无法识别时点击取消打开微信扫描
支持的 App：
支付宝、淘宝、口碑、京东、Safari、迅雷、磁力、OFO扫车码
微博、微信；需要跳转到 App 内再次扫描

可添加至 Launch Center Pro 等应用快速启动：jsbox://run?name=XQRcode
欢迎提供更多相关 url scheme

问题：QQ 扫一扫 url scheme 未知，因此 QQ 登录或支付只能打开 QQ 而无法自动打开扫一扫

作者联系：https://t.me/axel_burks
*/
var version = 0.9

$app.strings = {
  "en": {
    "ALERT": "Open Wechat?",
    "SCANMORE": "Which has more accurate recognition effect",
    "OK": "OK",
    "CANCEL": "Cancel",
  },
  "zh-Hans": {
    "ALERT": "是否打开微信？",
    "SCANMORE": "具有更佳的识别率",
    "OK": "好的",
    "CANCEL": "取消",
  }
}

var autoUpdate = $context.image ? false : true
Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
if (autoUpdate == true && Object.size($context.query) > 0) {
  autoUpdate = false
}

var qr = $context.image || ($clipboard.image ? $clipboard.image.image : null)
if (qr == null) {
  $qrcode.scan({
    handler(string) {
      showResult(string, false)
    },
    cancelled() {
      cancelAction()
    }
  })
} else {
  var text = $qrcode.decode(qr)
  if (text) {
    showResult(text, true)
  } else {
    showWarning("run through Share Extension", true)
  }
}

if (autoUpdate == true) {
  $thread.background({
    handler: function() {
      checkVersion()
    }
  })
}

function isContains(str, regxstr) {
  return new RegExp(regxstr).test(str)
}

function cancelAction() {
  $ui.alert({
    title: $l10n("ALERT"),
    message: $l10n("SCANMORE"),
    actions: [{
      title: $l10n("CANCEL"),
      style: "Cancel",
      handler: function() {
        $system.home()
        $app.close()
      }
    },
    {
      title: $l10n("OK"),
      handler: function() {
        $app.openURL("weixin://scanqrcode")
        $app.close()
      }
    }]
  })
}

function showResult(text, runningExt) {
//$clipboard.text = text
//$clipboard.save(text)
  $clipboard.set({
    "type": "public.plain-text",
    "value": text
  })
  var scheme = text.match(/^(?!ssr?:\/\/)\w+:\/\/[^\s]*/i)
  if (scheme) {
    scheme = scheme[0]
    var url = text.match(/^(https?|weixin|wxp):\/\/[^\s]+/i)
    if (url) {
      url = url[0]
      if (isContains(url,/weibo\.cn/i)) {
        scheme = "weibo://qrcode"
      } else if (isContains(url,/(weixin|wxp):\/\/|weixin\.qq|tenpay\.com/i)) {
        scheme = "weixin://scanqrcode"
      } else if (isContains(url,/(wsk|txz|unipay)\.qq\.com/i)) {
        scheme = "mqq://"
      } else if (isContains(url,/zhihu\.com.*question/i)) {
        scheme = url.toString().replace(/https?/i,"zhihu")
      } else if (isContains(url,/ofo\.so\/plate/i)) {
        scheme = "ofoapp://useBike?carno=" + url
      } else if (isContains(url,/taobao\.com|tb\.cn|tmall\.com|qazdsa\.com/i)) {
        scheme = url.toString().replace(/https?/i,"taobao")
      } else if (isContains(url,/qr\.shouqianba\.com|qr\.alipay\.com.*PAI_LOGIN/i)) {
          scheme = "alipays://platformapi/startapp?saId=10000007"
      } else if (isContains(url,/(qr|d)\.alipay\.com\/(kox|sux)/i)) {
        scheme = "koubei://platformapi/startapp?saId=10000007&qrcode=" + url
      } else if (isContains(url,/(qr|d|m)\.alipay\.com|spay3\.swiftpass\.cn|tlt\.allinpay\.com|v\.ubox\.cn\/qr|i\.55tuan\.com\/rq/i)) {
        if (!isContains(url,/^[0-9A-Z\:\/\/]+$/)) {
          url = $text.URLEncode(url)
        }
        scheme = "alipays://platformapi/startapp?saId=10000007&qrcode=" + url
      } else if (isContains(url,/item\.(m\.)?jd\.com/i)) {
        var skuId = url.toString().match(/item.*?jd\.com\/.*?(\d+)(?=\.html)/i)[1]
        scheme = "openapp.jdmobile://virtual?params=" + encodeURIComponent("{\"sourceValue\":\"0_productDetail_97\",\"des\":\"productDetail\",\"skuId\":\"" + skuId + "\",\"category\":\"jump\",\"sourceType\":\"PCUBE_CHANNEL\"}")
      } else if (isContains(url,/qr\.m\.jd\.com/i)) {
        var key = url.toString().match(/qr\.m\.jd\.com\/p\?k=([^\s]+)/i)[1]
        scheme = "openApp.jdMobile://virtual?params=" + encodeURIComponent("{\"category\":\"jump\",\"des\":\"ScanLogin\",\"key\":\"" + key + "\"}")
      }
    }
    $app.openURL(scheme)
    if (runningExt)
      $context.close()
    $app.close()
  } else if (text.match(/^magnet:[^\s]+/i)) {
    var magnet_link = text.match(/^magnet:[^\s]+/i)[0]
    $app.openURL("thunder://" + $text.base64Encode(magnet_link))
    if (runningExt)
      $context.close()
    $app.close()
  } else {
    $ui.alert({
      title: "Clipboard Saved",
      message: text,
      actions: [{
        title: "OK",
        style: "Cancel",
        handler: function() {
          if (runningExt)
            $context.close()
          $system.home()
          $app.close()
        }
      }]
    })
  }
}

function showWarning(text, runningExt) {
$ui.alert({
  title: "QR Code Error",
  message: "The image you " + text + " should be a QR Code.\n\nPlease try again.",
  actions: [{
    title: "OK",
    style: "Cancel",
    handler: function() {
      if (runningExt)
        $context.close()
    }
  }]
})
}

function checkVersion() {
  $http.get({
    url: "https://raw.githubusercontent.com/axelburks/JSBox/master/updateInfo",
    handler: function(resp) {
      var afterVersion = resp.data["XQRcode"]["version"];
      var msg = resp.data["XQRcode"]["msg"];
      if (afterVersion > version) {
        $ui.alert({
          title: "检测到新的版本！V" + afterVersion,
          message: "更新说明：\n" + msg,
          actions: [{
            title: "更新",
            handler: function() {
              var url = "jsbox://install?url=https://raw.githubusercontent.com/axelburks/JSBox/master/XQRcode.js&name=" + $addin.current.name.split(".js")[0] + "&icon=" + $addin.current.icon;
              $app.openURL(encodeURI(url));
              $app.close()
            }
          }, {
            title: "取消"
          }]
        })
      }
    }
  })
}
