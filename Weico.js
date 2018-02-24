/*
Weico 链接转换
转换微博国际版链接为官方微博链接，复制到剪贴板

作者联系：https://t.me/axel_burks
*/

var content = $context.link || $context.text || ($clipboard.text ? $clipboard.text : null)

if(content != null){
  var weico_link = content.match(/https?:\/\/.*?weico\.cc[^\s]+?weibo_id=(\d+)/i);
  var weibo_link = content.match(/https?:\/\/m\.weibo\.cn\/[^\/]+?\/(\d+)/i);
  if (weico_link) {
    var id = weico_link[1];
    var link = "https://m.weibo.cn/status/" + id;
    $clipboard.set({
        "type": "public.plain-text",
        "value": content.replace(url, link)
      })
    $ui.toast("Copied Success!")
    delayClose(0.8)    
  } else if (weibo_link) {
    var id = weibo_link[1];
    var link = "weibointernational://detail?weiboid=" + id;
    var preResult = $app.openURL(link);
    if (preResult) {
      delayClose(0.6) 
    } else {
      $ui.error("Weico NOT installed!")
      delayClose(1.4)
    }
  } else {
    $ui.error("Not Weico OR Weibo URL!")
    delayClose(1.4)
  }
} else {
    $ui.error("Nothing on Clipboard!")
    delayClose(1.4)
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
