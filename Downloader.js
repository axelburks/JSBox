/*
文件下载工具
1.通过 share extension 运行，直接下载链接内容
2.主程序内直接运行，自动填充剪贴板链接
3.通过 url scheme 运行，可指定 auto 自动开始下载
jsbox://run?name=Downloader&downloadUrl=https://domain.com/A.exe&auto=true

作者联系：https://t.me/axel_burks
*/
var version = 1.1

var autoUpdate = $context.text ? false : true
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

$ui.render({
  props: {
    title: "Downloader"
  },
  views: [
    {
      type: "label",
      props: {
        text: "下载地址：",
        align: $align.lefts
      },
      layout: function(make, view) {
        make.left.inset(25)
        make.top.right.inset(20)
        make.size.equalTo($size(64, 32))
      }
    },
    {
      type: "button",
      props: {
        id: "downloadButton",
        title: "下载"
      },
      layout: function(make) {
        make.top.inset(265)
        make.right.inset(25)
        make.size.equalTo($size(64, 32))
      },
      events: {
        tapped: function(sender) {
          download()
        }
      }
    },
    {
      type: "text",
      props: {
        id: "inputUrl",
        type: $kbType.url,
        bgcolor: $rgba(100, 100, 100, 0.2),
        radius: 12
      },
      layout: function(make) {
        make.top.equalTo($("label").bottom).offset(5)
        make.right.left.inset(20)
        make.size.equalTo($size(64, 192))
      },
      events: {
        ready: function(sender) {
          var auto = $context.query.auto || ($context.text ? true : false)
          var content = $context.query.downloadUrl || $context.text || ($clipboard.text ? $clipboard.text : null)
          if (content != null) {
            sender.text = content
          }
          if (auto) {
            // $("downloadButton").hidden = true
            download(true)
          } else {
            sender.focus()
          }
        }
      }
    }
  ]
})

if (autoUpdate == true) {
  $thread.background({
    handler: function() {
      checkVersion()
    }
  })
}

function download(ext) {
  var url = $("inputUrl").text.match(/^https?:\/\/[^\s]+/i)
  if (url) {
    $ui.toast("开始下载: " + url)
    $ui.loading(true)
    $http.download({
      url: url,
      progress: function (bytesWritten, totalBytes) {
        var percentage = bytesWritten * 1.0 / totalBytes
      },
      handler: function(resp) {
        $ui.loading(false)
        $share.sheet(resp.data)
        if (ext) {
          $delay(25, function() {
            $context.close()
            $app.close()
          })
        }
      }
    })
  } else {
    $ui.toast("请输入正确的下载地址格式！")
    $("downloadButton").hidden = false
    $("inputUrl").focus()
  }
}

function checkVersion() {
  $http.get({
    url: "https://raw.githubusercontent.com/axelburks/JSBox/master/updateInfo",
    handler: function(resp) {
      var afterVersion = resp.data["Downloader"]["version"];
      var msg = resp.data["Downloader"]["msg"];
      if (afterVersion > version) {
        $ui.alert({
          title: "检测到新的版本！V" + afterVersion,
          message: "更新说明：\n" + msg,
          actions: [{
            title: "更新",
            handler: function() {
              var url = "jsbox://install?url=https://raw.githubusercontent.com/axelburks/JSBox/master/Downloader.js&name=" + $addin.current.name.split(".js")[0] + "&icon=" + $addin.current.icon;
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