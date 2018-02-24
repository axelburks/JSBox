/*
Weico 链接转换
转换微博国际版链接为官方微博链接，复制到剪贴板

作者联系：https://t.me/axel_burks
*/

var content = $context.link || $context.text || ($clipboard.text ? $clipboard.text : null)

/** 
 * 62进制字典 
 */  
var str62keys = [  
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",  
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",  
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"  
];  

/** 
 * 62进制值转换为10进制 
 * @param {String} str62 62进制值 
 * @return {String} 10进制值 
 */  
function str62to10(str62) {  
  var i10 = 0;  
  for (var i = 0; i < str62.length; i++)  
  {  
      var n = str62.length - i - 1;  
      var s = str62[i];  
      i10 += str62keys.indexOf(s) * Math.pow(62, n);  
  }  
  return i10;  
};  


/** 
* 10进制值转换为62进制 
* @param {String} int10 10进制值 
* @return {String} 62进制值 
*/  
function int10to62(int10) {  
  var s62 = '';  
  var r = 0;  
  while (int10 != 0)  
  {  
      r = int10 % 62;  
      s62 = str62keys[r] + s62;  
      int10 = Math.floor(int10 / 62);  
  }  
  return s62;  
};

/** 
 * mid字符转换为id 
 * @param {String} mid 微博URL字符，如 "wr4mOFqpbO" 
 * @return {String} 微博id，如 "201110410216293360" 
 */  
function mid2id(mid) {  
  var id = '';  
    
  for (var i = mid.length - 4; i > -4; i = i - 4)  //从最后往前以4字节为一组读取URL字符  
  {  
      var offset1 = i < 0 ? 0 : i;  
      var offset2 = i + 4;  
      var str = mid.substring(offset1, offset2);  

      str = str62to10(str).toString();  
      if (offset1 > 0) //若不是第一组，则不足7位补0  
      {  
          while (str.length < 7)  
          {  
              str = '0' + str;  
          }  
      }  

      id = str + id;  
  }  
    
  return id;  
};  


/** 
* id转换为mid字符 
* @param {String} id 微博id，如 "201110410216293360" 
* @return {String} 微博mid字符，如 "wr4mOFqpbO" 
*/  
function id2mid(id) {        
  var mid = '';  
    
  for (var i = id.length - 7; i > -7; i = i - 7)  //从最后往前以7字节为一组读取id  
  {  
      var offset1 = i < 0 ? 0 : i;  
      var offset2 = i + 7;  
      var num = id.substring(offset1, offset2);  
        
      num = int10to62(num);  
      mid = num + mid;  
  }  
    
  return mid;  
};  

// Main
if(content != null){
  var weico_link = content.match(/https?:\/\/.*?weico\.cc[^\s]+?weibo_id=(\d+)/i);
  var weibo_link = content.match(/https?:\/\/(m\.weibo\.cn|weibo\.com)\/[^\/]+?\/(\w+)/i);
  if (weico_link) {
    var url = weico_link[0];
    var id = weico_link[1];
    var link = "https://m.weibo.cn/status/" + id;
    var scheme = "sinaweibo://detail?mblogid=" + id;
    $ui.alert({
      title: "Copy or Open it?",
      message: content.replace(url, link),
      actions: [{
        title: "Open",
        style: "Cancel",
        handler: function() {
          var preResult = $app.openURL(scheme);
          if (preResult) {
            delayClose(0.6) 
          } else {
            $ui.error("Weibo NOT installed! Copied Success!")
            $clipboard.set({
              "type": "public.plain-text",
              "value": content.replace(url, link)
            })
            delayClose(1.4)
          }
        }
      },
      {
        title: "Copy",
        handler: function() {
          $clipboard.set({
            "type": "public.plain-text",
            "value": content.replace(url, link)
          })
          $ui.toast("Copied Success!")
          delayClose(0.8)
        }
      }]
    })

  } else if (weibo_link) {
    var id = weibo_link[2];
    if (!/^\d+$/.test(id)) {
      id = mid2id(id);
    }
    var link = "weibointernational://detail?weiboid=" + id;
    var preResult = $app.openURL(link);
    if (preResult) {
      delayClose(0.6) 
    } else {
      $ui.error("Weico NOT installed! Copied Success!")
      $clipboard.set({
        "type": "public.plain-text",
        "value": link
      })
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
