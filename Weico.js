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
  var link = content.match(/https?:\/\/.*?weico\.cc[^\s]+?weibo_id=(\d+)/i);
  if (link) {
    var url = link[0];
    var id = link[1];
    var mid = id2mid(id);
    var uid = "";
    $http.request({
      method: "GET",
      url: url,
      handler: function(resp) {
        var data = resp.data;
        uid = data.match(/\u7528\u6237\u4fe1\u606f[\s\S]+?<a.+?onclick="forward\((\d{4,}),0\)/)[1];
        link = "https://weibo.com/" + uid + "/" + mid;
        $clipboard.set({
            "type": "public.plain-text",
            "value": content.replace(url, link)
          })
        $ui.toast("Copied Success!")
        delayClose(0.8)
      }
    })
    
  }
  else {
    $ui.error("Not Weico URL!")
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
