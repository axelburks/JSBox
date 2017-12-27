/*
文件下载工具
1.通过 share extension 运行，直接下载链接内容
2.主程序内直接运行，自动填充剪贴板链接
3.通过 url scheme 运行，可指定 auto 自动开始下载
jsbox://run?name=File%20Downloader&downloadUrl=https://dldir1.qq.com/qqfile/qq/TIM2.1.0/22747/TIM2.1.0.exe&auto=true

作者联系：https://t.me/axel_burks
*/

$ui.render({
  props: {
    title: "File Downloader"
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
          if(content != null){
            sender.text = content
          }
          if(auto){
            // $("downloadButton").hidden = true
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
        $delay(20, function() {
          $context.close()
          $app.close()
        })
      }
    })
  } else {
    $ui.toast("请输入正确的下载地址格式！")
    $("downloadButton").hidden = false
    $("inputUrl").focus()
  }
}
