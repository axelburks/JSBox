/*
文件下载工具
1.通过 share extension 运行，直接下载链接内容
2.主程序内直接运行，自动填充剪贴板链接
3.通过 url scheme 运行，可指定 auto 自动开始下载
jsbox://run?name=Downloader&downloadUrl=https://domain.com/A.exe&auto=true

作者联系：https://t.me/axel_burks
*/
var file = null
var context_content = $context.query.downloadUrl || $context.link || $context.text
var content = context_content || ($clipboard.text ? $clipboard.text : null)
var auto = $context.query.auto || (context_content ? true : false)

if ($app.env == $env.safari) {
  content = $context.safari.items.baseURI
  auto = true
}

$ui.render({
  props: {
    title: "Downloader"
  },
  views: [
    {
      type: "label",
      props: {
        text: "Input URL：",
        align: $align.left
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
        title: "Download"
      },
      layout: function(make) {
        make.top.inset(265)
        make.right.inset(25)
        make.size.equalTo($size(111, 32))
      },
      events: {
        tapped: function(sender) {
          download()
        }
      }
    },
    {
      type: "button",
      props: {
        id: "shareButton",
        title: "Share"
      },
      layout: function(make) {
        make.top.inset(265)
        make.right.equalTo($("downloadButton").left).inset(10)
        make.size.equalTo($size(0, 0))
      },
      events: {
        tapped: function(sender) {
          share(file)
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
          if (content != null) {
            sender.text = content
          }
          if (auto) {
            download()
          } else {
            sender.focus()
          }
        }
      }
    }
  ]
})

function download() {
  if ($("inputUrl").text.match(/^(https?|ftp):\/\/[^\s]+\/[^\s]+\.\w+/i)) {
    var url = $("inputUrl").text.match(/^https?:\/\/[^\s]+\/[^\s]+\.\w+/i)[0]
    $ui.toast("Downloading...")
    $ui.loading(true)
    $http.download({
      url: url,
      progress: function (bytesWritten, totalBytes) {
        var percentage = bytesWritten * 1.0 / totalBytes
      },
      handler: function(resp) {
        $ui.loading(false)
        file = resp.data
        $("shareButton").updateLayout(function(make) {
          make.size.equalTo($size(100, 32))
        })
        share(file)
      }
    })
  } else {
    $ui.error("Please Input Correct URL!", 1)
    $("inputUrl").focus()
  }
}

function share(data) {
  $share.sheet({
    item: [data.fileName, data],
    handler: function(success) {
      if (success) {
        $cache.clear()
        delayClose(0.5)
      }
    }
  })
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
        $app.close()
      }
    }
  })
}