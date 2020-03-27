let bakStamp = $context.query.bak;
if (bakStamp) {
  let src = `shared://${bakStamp}-items.json`;
  let x = $file.move({ src, dst: "assets/text-items.json" });
  await $wait(1);
  x && $file.delete(src);
}

let initClipText = JSON.stringify($clipboard.items).indexOf('org.nspasteboard.ConcealedType') < 0 && $clipboard.text ? $clipboard.text : "";
let m = ["app", "today", "keyboard"];
let n = $app.env.toString().slice(0, 1) - 1;

$cache.get("color") === undefined && $cache.set("color", "#403F68");
$cache.get("dark") === undefined && $cache.set("dark", "#0A85FF");
$cache.get("sync") === undefined && $cache.set("sync", 0);
$cache.get("list") === undefined && $cache.set("list", 0);
$cache.get("actions") === undefined &&
  $cache.set("actions", [
    [
      {
        "pattern": "delete_photo",
        "noenc": false,
        "icon": "icon_027.png",
        "name": "图片删除/多删"
      },
      {
        "pattern": "search_image",
        "noenc": false,
        "icon": "icon_014.png",
        "name": "图片检索/上传"
      },
      {
        "pattern": "download",
        "noenc": false,
        "icon": "icon_165.png",
        "name": "iCab下载/Thunder"
      },
      {
        "pattern": "opener://",
        "noenc": false,
        "icon": "icon_055.png",
        "name": "Opener/Auto"
      },
      {
        "pattern": "pushbullet",
        "noenc": false,
        "icon": "Pushbullet.PNG",
        "name": "Pushbullet/Pushmore"
      },
      {
        "pattern": "taobao://s.taobao.com/?q=%@",
        "noenc": false,
        "icon": "icon_072.png",
        "name": "淘宝/京东"
      },
      {
        "pattern": "dencode",
        "noenc": false,
        "icon": "icon_156.png",
        "name": "编码解码/数据转换"
      },
      {
        "pattern": "url_convert",
        "noenc": false,
        "icon": "icon_171.png",
        "name": "链接转换/网页快照"
      },
      {
        "pattern": "https://www.baidu.com/s?wd=%@",
        "noenc": false,
        "icon": "icon_023.png",
        "name": "百度/XSearch"
      },
      {
        "pattern": "word_art",
        "icon": "icon_212.png",
        "name": "花式字体"
      },
      {
        "name": "汇率查询",
        "pattern": "exchange_rate",
        "icon": "icon_144.png"
      },
      {
        "pattern": "dice",
        "icon": "icon_153.png",
        "name": "掷骰子"
      },
      {
        "pattern": "eudic://dict/%@",
        "noenc": false,
        "icon": "icon_057.png",
        "name": "欧路词典/百度翻译"
      },
      {
        "pattern": "weibco",
        "noenc": false,
        "icon": "icon_041.png",
        "name": "Weib(c)o"
      }
    ],
    [
      {
        "name": "百度",
        "pattern": "https://www.baidu.com/s?wd=%@"
      },
      {
        "name": "谷歌",
        "pattern": "https://www.google.com/search?safe=off&q=%@"
      },
      {
        "name": "百度翻译",
        "pattern": "http://fanyi.baidu.com/#en/zh/%@"
      },
      {
        "name": "谷歌翻译",
        "pattern": "http://translate.google.cn/?hl=en#auto/zh-CN/%@"
      },
      {
        "name": "维基",
        "pattern": "https://zh.wikipedia.org/wiki/%@"
      }
    ]
  ]);

let module = require(`scripts/${m[n]}`);

module.init($app.env == $env.app ? $context.query : initClipText);