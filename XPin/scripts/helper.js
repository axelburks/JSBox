let ui = require("./ui");

function runLongAction(action) {
  let isToday = $app.env == 2,
  pattern = action.pattern,
  stext = isToday ? $("i2clip").text : "",
  clipText = $clipboard.text || stext,
  hasPlaceholder = pattern.indexOf("%@") != -1,
  replacement = action.noenc ? clipText : encodeURIComponent(clipText);

  pattern = pattern.replace("%@", replacement);

  if (_hasPrefix(pattern, "pushbullet")) {
    let tgpmbot_url = "";
    $file.exists("tgpmbot.txt") && $file.read("tgpmbot.txt").string && (tgpmbot_url = $file.read("tgpmbot.txt").string.replace(/(\r|\n)/gi, ""));
    if (tgpmbot_url) {
      ui.toast({text: "Sending...", time:5})
      $http.post({
        header: {
          "Content-Type": "text/plain"
        },
        url: tgpmbot_url,
        body: clipText,
        handler: function(resp) {
          if(resp.data == "OK"){
            ui.toast({text: "Send Success"})
          } else $ui.error(resp.data);;
        }
      })
    } else ui.toast({ text: "None Bot Webhook", icon: "225", inset: 7 });
    return;
  }

  if (_hasPrefix(pattern, "download")) {
    let thunder = require("./plugins/thunder");
    thunder.run();
    return;
  }

  if (_hasPrefix(pattern, "delete_photo")) {
    let dp = require("./plugins/delete-photo");
    dp.run();
    return;
  }

  if (_hasPrefix(pattern, "search_image")) {
    var up = require("./plugins/search-image");
    up.run(search=false);
    return;
  }

  if (_hasPrefix(pattern, "eudic://dict")) {
    $app.openURL("http://fanyi.baidu.com/#en/zh/" + replacement);
    return;
  }

  if (_hasPrefix(pattern, "taobao://s.taobao.com")) {
    $app.openURL("openapp.jdmobile://virtual?params=" + encodeURIComponent("{\"des\":\"productList\",\"keyWord\":\"" + clipText + "\",\"category\":\"jump\",\"from\":\"search\"}"));
    return;
  }

  if (_hasPrefix(pattern, "opener://")) {
    ($detector.link(clipText) != "") ? $app.openURL("opener://x-callback-url/show-options?allow-auto-open=true&url=" + replacement) : ui.toast({ text: "No URL", icon: "225", inset: 7 });
    return;
  }

  if (_hasPrefix(pattern, "https://www.baidu.com/s?wd=")) {
    $app.openURL("pin://xsearch");
    return;
  }

  if (_hasPrefix(pattern, "url_convert")) {
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) webCapture(stext);
      else return;
    } else if (clipText != "") webCapture(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "dencode")) {
    let dc = require("./plugins/data-convert");
    dc.show();
    return;
  }

  $app.openURL(pattern);
}

function runAction(action) {
  let isToday = $app.env == 2,
    pattern = action.pattern,
    stext = isToday ? $("i2clip").text : "",
    clipText = $clipboard.text || stext,
    hasPlaceholder = pattern.indexOf("%@") != -1,
    replacement = action.noenc ? clipText : encodeURIComponent(clipText);

  pattern = pattern.replace("%@", replacement);

  if (_hasPrefix(pattern, "pushbullet")) {
    var pb = require("./plugins/pushbullet");
    pb.run();
    return;
  }

  if (_hasPrefix(pattern, "download")) {
    ($detector.link(clipText) != "") ? $app.openURL("x-icabmobile://x-callback-url/download?url=" + replacement) : ui.toast({ text: "No URL", icon: "225", inset: 7 });
    return;
  }

  if (_hasPrefix(pattern, "delete_photo")) {
    $photo.delete({
      count: 1,
      handler: function(success) {}
    });
    return;
  }

  if (_hasPrefix(pattern, "search_image")) {
    var searchimage = require("./plugins/search-image");
    searchimage.run();
    return;
  }

  if (_hasPrefix(pattern, "opener://")) {
    ($detector.link(clipText) != "") ? $app.openURL("opener://x-callback-url/show-options?allow-auto-open=false&url=" + replacement) : ui.toast({ text: "No URL", icon: "225", inset: 7 });
    return;
  }

  if (_hasPrefix(pattern, "10010")) {
    let cn10010 = require("./plugins/10010");
    cn10010.show();
    return;
  }

  if (_hasPrefix(pattern, "cord")) {
    let cord = require("./plugins/cordcloud");
    cord.show();
    return;
  }

  if (_hasPrefix(pattern, "dice")) {
    let dice = require("./plugins/dice");
    dice.show();
    return;
  }

  if (_hasPrefix(pattern, "bili_cover")) {
    let picker = require("./plugins/bili-cover");
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) picker.detect(stext);
      else return;
    } else if (clipText != "") picker.detect(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "url_convert")) {
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) urlConvert(stext);
      else return;
    } else if (clipText != "") urlConvert(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "dencode")) {
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) dencode(stext);
      else return;
    } else if (clipText != "") dencode(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "web_capture")) {
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) webCapture(stext);
      else return;
    } else if (clipText != "") webCapture(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "weibco")) {
    let weibco = require("./plugins/weibco");
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) weibco.show(stext);
      else return;
    } else if (clipText != "") weibco.show(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "word_art")) {
    let wa = require("./plugins/word-art");
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) wa.start(stext);
      else return;
    } else if (clipText != "") wa.start(clipText);
    else return;
  }

  if (_hasPrefix(pattern, "bdmap")) {
    let bdmap = "baidumap://map/geocoder?address=";
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext) $app.openURL(bdmap + encodeURIComponent(stext));
      else return;
    } else if (clipText != "") $app.openURL(bdmap + encodeURI(clipText));
    else return;
  }

  if (_hasPrefix(pattern, "zhihu")) {
    if (isToday) {
      if (stext == "") $("i2clip").focus();
      else if (stext)
        $app.openURL("zhihu://search?q=" + encodeURIComponent(stext));
      else return;
    } else if (clipText != "")
      $app.openURL("zhihu://search?q=" + encodeURI(clipText));
    else return;
  }

  if (_hasPrefix(pattern, "exchange_rate")) {
    let er = require("./plugins/exchange-rate");
    er.show();
    return;
  }

  if (_hasPrefix(pattern, "data_convert")) {
    let dc = require("./plugins/data-convert");
    dc.show();
    return;
  }

  if (_hasPrefix(pattern, "appstore_shift")) {
    const regions = [
      { name: "🇨🇳 中国", code: "cn" },
      { name: "🇭🇰 香港", code: "hk" },
      { name: "🇨🇳 台湾", code: "tw" },
      { name: "🇺🇸 美国", code: "us" },
      { name: "🇬🇧 英国", code: "uk" },
      { name: "🇯🇵 日本", code: "jp" }
    ];
    $ui.menu(regions.map(i => i.name)).then(resp => {
      if ('index' in resp) {
        let ver = parseInt($device.info.version.split(".")[0]);
        let pre = ver >= 13 ? "itms-apps://apps" : "https://itunes";
        let code = regions[resp.index].code;
        $app.openURL(`${pre}.apple.com/${code}/app/`);
      }
    });
    return;
  }

  if (_hasPrefix(pattern, "open-url:")) {
    $app.openURL($clipboard.link);
    return;
  }

  if (_hasPrefix(pattern, "share-sheet://")) {
    let text = $clipboard.text;
    let image = $clipboard.image;
    if (text) $share.sheet(text);
    else if (image) $share.sheet(image);
    return;
  }

  if (_hasPrefix(pattern, "compose://")) {
    let identifier = pattern.substring("compose://?id=".length);
    let extension = $objc("NSExtension").invoke(
      "extensionWithIdentifier:error:",
      identifier,
      null
    );
    let composer = $objc("SLComposeViewController").invoke(
      "composeViewControllerForExtension",
      extension
    );

    let text = $clipboard.text;
    if (text) {
      composer.invoke("setInitialText", text);
    }

    let image = $clipboard.image;
    if (image) {
      composer.invoke("addImage", image);
    }

    let link = $clipboard.link;
    if (link) {
      let url = $objc("NSURL").invoke("URLWithString", link);
      composer.invoke("addURL", url);
    }

    composer.invoke("setModalPresentationStyle", 1);

    let fromVC = $ui.vc.runtimeValue();
    fromVC.invoke(
      "presentViewController:animated:completion:",
      composer,
      true,
      null
    );

    return;
  }

  if (hasPlaceholder && _hasPrefix(pattern, "tel:")) {
    $app.openURL("tel:" + $clipboard.phoneNumber || "");
    return;
  }

  if (hasPlaceholder && _hasPrefix(pattern, "sms:")) {
    $app.openURL("sms:" + $clipboard.phoneNumber || "");
    return;
  }

  if (hasPlaceholder && _hasPrefix(pattern, "facetime:")) {
    $app.openURL("facetime:" + $clipboard.phoneNumber || "");
    return;
  }

  if (hasPlaceholder && _hasPrefix(pattern, "mailto:")) {
    $app.openURL("mailto:" + $clipboard.email || "");
    return;
  }

  $app.openURL(pattern);
}

function _hasPrefix(string, prefix) {
  return string.lastIndexOf(prefix, 0) === 0;
}

function urlConvert(content) {
  if ($detector.link(content) != "") {
    let url = $detector.link(content)[0];
    let shortLink = /^https?:\/\/(ift\.tt|t\.co|t\.cn|tinyurl\.com|dwz\.cn|u\.nu|bit\.ly)\/\w{2,}$/i;
    if (shortLink.test(url))
      $http.lengthen(url).then(res => {
        if (res) {
          let dataManager = require("./data-manager");
          dataManager.copyAndSaveText(res);
          ui.toast({ text: "短链接已还原", inset: 7 });
        }
      });
    else shortenUrl(url);
  } else ui.toast({ text: "URL 输入有误", icon: "225", inset: 7 });
}

function shortenUrl(url) {
  const service = [
    {
      name: "tinyurl.com",
      pattern: "https://tinyurl.com/create.php?source=indexpage&url="
    },
    {
      name: "u.nu",
      pattern: "https://u.nu/api.php?action=shorturl&format=json&url="
    },
    {
      name: "t.cn",
      pattern: "https://v1.alapi.cn/api/url?type=1&url="
//      pattern: "https://img.chkaja.com/weibo_url.php?url="
    }
  ];
  $ui.menu(service.map(i => i.name)).then(resp => {
    if ('index' in resp) {
    let i = resp.index;
    url = encodeURIComponent(url);
    let pre = service[i].pattern;
    $http.get(`${pre}${url}`).then(res => {
      if (res) {
        let code = res.response.statusCode;
        let falseTip = { text: "短链接生成失败", icon: "225", inset: 7 };
        if (i == 0) {
          url = res.data.match(/<div.*?indent.*?<b>(.*?)<\/b>/)[1];
          code == 200 && url ? shortened(url) : ui.toast(falseTip);
        } else if (i == 1) {
          code == 200 && typeof res.data == "object"
            ? shortened(res.data.shorturl)
            : ui.toast(falseTip);
        } else {
//          code == 200 && /t\.cn/.test(res.data)
//           ? shortened(res.data)
          code == 200 && res.data.code == 200
            ? shortened(res.data.data.short_url)
            : ui.toast(falseTip);
        }
      }
    });
    }
  });

  function shortened(link) {
    let dataManager = require("./data-manager");
    dataManager.copyAndSaveText(link);
    ui.toast({ text: "短链接已复制", inset: 7 });
  }
}

function dencode(t) {
  const menu = [
    "Base64 Encode",
    "Base64 Decode",
    "URL Encode",
    "URL Decode",
    "HTML Escape",
    "HTML Unescape",
    "ToLowerCase",
    "ToUpperCase",
    "MD5",
    "SHA1",
    "SHA256",
    "转换为拼音"
  ];
  $ui.menu(menu).then(resp => {
    if ('index' in resp) {
      let i = resp.index,
        x;
      if (i == 0) x = $text.base64Encode(t);
      else if (i == 1) x = $text.base64Decode(t);
      else if (i == 2) x = $text.URLEncode(t);
      else if (i == 3) x = $text.URLDecode(t);
      else if (i == 4) x = $text.HTMLEscape(t);
      else if (i == 5) x = $text.HTMLUnescape(t);
      else if (i == 6) x = t.toLowerCase();
      else if (i == 7) x = t.toUpperCase();
      else if (i == 8) x = $text.MD5(t);
      else if (i == 9) x = $text.SHA1(t);
      else if (i == 10) x = $text.SHA256(t);
      else x = $text.convertToPinYin(t);
      let dataManager = require("./data-manager");
      dataManager.copyAndSaveText(x);
      ui.toast({ text: "Done", inset: 7 });
    }
  });
}

function webCapture(content) {
  if ($detector.link(content) != "") {
    let surl = $detector.link(content)[0],
      eurl = encodeURI(surl),
      idArray = [],
      items = [
        {
          name: "Internet Archive",
          link: "https://web.archive.org/web/*/" + surl
        },
        {
          name: "Archive.today",
          link: "http://archive.today/search/?q=" + eurl
        },
        {
          name: "Archive.today(Save)",
          link: "http://archive.today/?run=1&url=" + eurl
        }
      ];
    $http.get({
      url: "https://2tool.top/kuaizhao.php?k=" + eurl,
      handler: resp => {
        let reg = /doLoadKz\('(.*?)',"(.*?)",\d\);/g,
          result = resp.data.match(reg);
        result.map(preId => {
          let idReg = /doLoadKz\('(.*?)',/g,
            idp = idReg.exec(preId)[1];
          idArray.push(idp);
        });
        let id = [
          { id: idArray[0] + "&num=1", name: "百度" },
          { id: idArray[1] + "&num=2", name: "搜狗" },
          { id: idArray[2] + "&num=3", name: "360" },
          { id: idArray[3] + "&num=4", name: "Bing" },
          { id: idArray[4] + "&num=5", name: "Google" }
        ];
        id.map(async obj => {
          let url = "https://2tool.top/kz.php?s=" + obj.id,
            resp = await $http.get(url),
            result = $detector.link(resp.data);
          if (result.length > 0)
            items.push({ name: obj.name, link: result[0] });
        });
        $delay(1.5, () => {
          $ui.menu({
            items: items.map(item => {
              return item.name;
            }),
            handler: (t, idx) => $app.openURL(items[idx].link)
          });
        });
      }
    });
  } else ui.toast({ text: "URL 输入有误", icon: "225", inset: 7 });
}

module.exports = { 
  runAction: runAction,
  runLongAction: runLongAction
};
