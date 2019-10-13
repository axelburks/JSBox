/*
跳转迅雷 App下载 Http(s)、Magnet、thunder 协议链接
1.通过 share extension 运行，直接下载链接内容
2.主程序内直接运行，自动填充剪贴板链接
3.通过 url scheme 运行

作者联系：https://t.me/axel_burks
*/
function run(){
  var content =
    $context.query.downloadUrl ||
    $context.link ||
    $context.text ||
    ($clipboard.text ? $clipboard.text : null);
  if (content != null) {
    var url = content.match(/((https?|ftp):\/\/|magnet:)[^\s]+/i);
    var thunder_url = content.match(/thunder:\/\/[^\s]+/i);
    if (url) {
      url = url[0];
      $clipboard.clear();
      var scheme = "thunder://" + $text.base64Encode(url);
      $app.openURL(scheme);
      if ($context.link || $context.text) {
        $context.close();
      }
    } else if (thunder_url) {
      thunder_url = thunder_url[0];
      $app.openURL(thunder_url);
    } else {
      let ui = require("../ui");
      ui.toast({ text: "No URL", icon: "225", inset: 7 })
    }
  }
}

module.exports={
  run:run
}
