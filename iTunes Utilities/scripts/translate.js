function init(item) {
  let appname = item.trackName.match(/^.+(?=\s[-—－–])|^.+(?=[-—－–])|^.+/)[0]
  if (!item.releaseNotes && cnTest(item.description)) {
    renderHtml(appname, "None", item.description)
  } else if (item.releaseNotes && cnTest(item.description) && cnTest(item.releaseNotes)) {
    renderHtml(appname, item.releaseNotes, item.description)
  } else {
    let origLg = "auto"
    let transLg = "zh-CN"
    let origTextbg = ["# App Introduction:\n\n" + item.description]
    if (item.releaseNotes) {
      origTextbg.splice(0, 0, "# Update Recently:\n\n" + item.releaseNotes + "\n\n\n--------------------------------------------------\n\n")
    }
    translate(appname, origTextbg, origLg, transLg)
  }
}

async function translate(appname, origTextbg, origLg, transLg) {
  let transOutput = []
  for ( let i=0; i<origTextbg.length; i++ ) {
    await requestGTAPI(origTextbg[i], origLg, transLg).then(function(data) {
      transOutput.push(data)
      if (i == origTextbg.length - 1) {
        renderHtml(appname, transOutput.join("\n\n"), origTextbg.join(""), "translate")
      }
    })
  }
}

function cnTest(origTextbg) {
  var cn = new RegExp("[\u4e00-\u9fa5]+")
  var slang = cn.test(origTextbg)
  return slang
}

function requestGTAPI(origTextbg, origLg, transLg) {
  // Modify from Neurogram's Google Translate.js
  $ui.loading("Translating...")
  var p = new Promise(function(resolve, reject) {
    $http.request({
        method: "POST",
        url: "http://translate.google.cn/translate_a/single",
        header: {
          "User-Agent": "iOSTranslate",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: {
          "dt": "t",
          "q": origTextbg,
          "tl": transLg,
          "ie": "UTF-8",
          "sl": origLg,
          "client": "ia",
          "dj": "1"
        },
        handler: function(resp) {
          $ui.loading(false)
          var data = resp.data.sentences
          var trans = ""
          for (let i = 0; i < data.length; i++) {
            trans = trans + data[i].trans
          }
          resolve(trans)
        }
    })
  })
  return p
}

function renderHtml(name, first, last, status) {
  first = first.replaceAll("\n", "</br>").replaceAll(/(https?:\/\/[^"\(\)\[\]\{\}<>\s]+)/, "<a href=\"$1\">$1</a>")
  last = last.replaceAll("\n", "</br>").replaceAll(/(https?:\/\/[^"\(\)\[\]\{\}<>\s]+)/, "<a href=\"$1\">$1</a>")
  let title_first = "Whats New"
  let title_last = "Description"
  if (status == "translate") {
    title_first = "Translation"
    title_last = "Original"
  }
  let detail = `<div class="container" name="Detail">
  <div class="box">
  <div class="detail">
  <p>${title_first}：</p>
  </div>
  <div class="content">
  <p>${first}</p>
  </div>
  </div>
  <div class="border">
  </div>
  </div>
  
  <div class="container" name="Detail">
  <div class="box">
  <div class="detail">
  <p>${title_last}：</p>
  </div>
  <div class="content">
  <p>${last}</p>
  </div>
  </div>
  <div class="border">
  </div>
  </div>`

  let html = `<html>
  <head>
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
  <title>Detail</title>
  <style>
  h1 {padding: 0.5em 0 0.5em 0;text-align: center;font-size: 40pt;font-weight: 400;margin: 0;}
  body {font-family: sans-serif;}
  p {margin: 1rem 0;}
  .main {padding: 0 2%;}
  .box {padding: 1% 5%;}
  .detail {font-size: 30pt;margin-top: 2rem;margin-bottom: 3rem;padding-left: 0.8rem;border-left: 0.3rem solid #999;color: #1FBD80;}
  .content {font-size: 25pt;padding-left: 1.1rem;}
  .border {height: 3px;width: 95%;margin-left: auto;margin-right: auto;background-color: #ddd;background-image: repeating-linear-gradient(-45deg, #fff, #fff 4px, transparent 4px, transparent 10px);}
  .container:last-of-type .border {display: none;}
  .link {border-radius: 6px;height: 77px;line-height: 80px;display: inline-block;font-size: 20pt;border-bottom: 3px solid rgba(233,233,233,1);padding-left: 32px;padding-right: 32px;margin: 0.5em 1em;background: rgba(233,233,233,1);background-size: 40px 39px;box-shadow: 0px 2px 8px 0px rgba(158, 158, 158, 0.5);transition: border-color 0.5s;-webkit-transition: border-color 0.5s;-moz-transition: border-color 0.5s;-ms-transition: border-color 0.5s;-o-transition: border-color 0.5s;}
  .footer {margin: 5em 0}
  </style>
  </head>
  
  <body>
  <h1>${name}</h1>
  <div class="main">
  ${detail}
  </div>

  <div class="footer">
  </div>`

  $ui.loading(false)
  $ui.push({
    props: {
      title: "Detail"
    },
    views: [{
      type: "web",
      props: {
        html: html
      },
      layout: $layout.fill,
    }]
  })
  $app.listen({
    exit: function() {
      $context.close()
    }
  })
}

String.prototype.replaceAll = function(FindText, RepText) {
  regExp = new RegExp(FindText, "g");
  return this.replace(regExp, RepText);
}

module.exports = {
  init: init
}