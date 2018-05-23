let content = $context.link || $context.text || $app.env == $env.safari ? $context.safari.items.baseURI : $clipboard.text
let url_content = IsURL(content)
if (url_content) {
  if (!url_content.match(/https?:\/\//i)) {
    url_content = "http://" + url_content
  }
  $http.shorten({
    url: url_content,
    handler: function(url) {
      if (url) {
        $clipboard.set({
          "type": "public.plain-text",
          "value": url
        })
        $ui.toast("Copid Success!", 1)
      } else {
        $clipboard.set({
          "type": "public.plain-text",
          "value": "Original Content:" + url_content
        })
        $ui.error("Shorten Failed!", 1)
      }
      delayClose(0.8)
    }
  })
} else {
  $ui.error("Please Input Correct URL!", 1)
  delayClose(0.8)
}



function IsURL(str_url) {
  var strRegex = "^((https|http)?://)" 
  + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@ 
  + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184 
  + "|" // 允许IP和DOMAIN（域名）
  + "([0-9a-z_!~*'()-]+\.)*" // 域名- www. 
  + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名 
  + "[a-z]{2,6})" // first level domain- .com or .museum 
  + "(:[0-9]{1,4})?" // 端口- :80 
  + "((/?)|" // a slash isn't required if there is no file name 
  + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"; 
  var re = new RegExp(strRegex, "i"); 
  if (re.test(str_url)) {
    return (str_url.match(re)[0]); 
  } else { 
    return (false); 
  }
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function () {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else if ($app.env != $env.app) {
        $app.close()
      }
    }
  })
}