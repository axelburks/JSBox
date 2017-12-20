function isContains(str, regxstr) {
    return new RegExp(regxstr).test(str);
}

function showResult(text, runningExt) {
  //$clipboard.text = text;
  //$clipboard.save(text);
  $clipboard.set({
    "type": "public.plain-text",
    "value": text
  })
  var scheme = text.match(/^\w+:\/\/[^\s]*/i);
  if (scheme) {
  	var url = text.match(/^https?:\/\/[^\s]+/i);
  	if (url) {
  		if (isContains(url,/weibo\.cn/i)) {
  			scheme = "weibo://qrcode";
  		} else if (isContains(url,/weixin\.qq|tenpay\.com/i)) {
        scheme = "weixin://scanqrcode";
      } else if (isContains(url,/qq\.com/i)) {
        scheme = "mqq://";
      } else if (isContains(url,/zhihu\.com.*question/i)) {
        scheme = url.toString().replace(/https?/i,"zhihu");
      } else if (isContains(url,/ofo\.so\/plate/i)) {
        scheme = "ofoapp://useBike?carno=" + url;
  		} else if (isContains(url,/taobao\.com|tb\.cn|tmall\.com|qazdsa\.com/i)) {
        scheme = url.toString().replace(/https?/i,"taobao");
      } else if (isContains(url,/qr\.shouqianba\.com|qr\.alipay\.com.*PAI_LOGIN/i)) {
          scheme = "alipays://platformapi/startapp?saId=10000007";
      } else if (isContains(url,/(qr|d)\.alipay\.com\/kox/i)) {
        scheme = "koubei://platformapi/startapp?saId=10000007&qrcode=" + url;
  		} else if (isContains(url,/(qr|d)\.alipay\.com|spay3\.swiftpass\.cn|tlt\.allinpay\.com|v\.ubox\.cn\/qr|i\.55tuan\.com\/rq/i)) {
        scheme = "alipays://platformapi/startapp?saId=10000007&qrcode=" + url;
  		} else if (isContains(url,/item\.jd\.com/i)) {
  			var skuId = url.toString().match(/item\.jd\.com\/(\d+)(?=\.html)/i)[1];
  			scheme = "openapp.jdmobile://virtual?params=" + encodeURIComponent("{\"sourceValue\":\"0_productDetail_97\",\"des\":\"productDetail\",\"skuId\":\"" + skuId + "\",\"category\":\"jump\",\"sourceType\":\"PCUBE_CHANNEL\"}");
  		} else if (isContains(url,/qr\.m\.jd\.com/i)) {
  			var key = url.toString().match(/qr\.m\.jd\.com\/p\?k=([^\s]+)/i)[1];
  			scheme = "openApp.jdMobile://virtual?params=" + encodeURIComponent("{\"category\":\"jump\",\"des\":\"ScanLogin\",\"key\":\"" + key + "\"}");
  		}
  	}
    $app.openURL(scheme);
		if (runningExt)
			$context.close();
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

/* Main */

var qr = $context.image || ($clipboard.image ? $clipboard.image.image : null)
if (qr == null) {
  $qrcode.scan({
    handler(string) {
      showResult(string, false);
    },
    cancelled() {
      $app.openURL("weixin://scanqrcode");
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
