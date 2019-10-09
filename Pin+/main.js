let bakStamp = $context.query.bak;
if (bakStamp) {
  let src = `shared://${bakStamp}-items.json`;
  let x = $file.move({ src, dst: "assets/text-items.json" });
  await $wait(1);
  x && $file.delete(src);
}

let m = ["app", "today", "keyboard"];
let n = $app.env.toString().slice(0, 1) - 1;

$cache.get("color") === undefined && $cache.set("color", "#007BFF");
$cache.get("dark") === undefined && $cache.set("dark", "#0A85FF");
$cache.get("sync") === undefined && $cache.set("sync", 0);
$cache.get("list") === undefined && $cache.set("list", 0);
$cache.get("actions") === undefined &&
  $cache.set("actions", [
    [
      {
        pattern: "word_art",
        icon: "icon_212.png",
        name: "花式字体"
      },
      {
        name: "汇率查询",
        pattern: "exchange_rate",
        icon: "icon_144.png"
      },
      {
        pattern: "data_convert",
        icon: "icon_156.png",
        name: "数据转换"
      },
      {
        pattern: "dencode",
        icon: "icon_054.png",
        name: "编码解码"
      },
      {
        name: "链接转换",
        pattern: "url_convert",
        icon: "icon_020.png"
      },
      {
        pattern: "dice",
        icon: "icon_153.png",
        name: "掷骰子"
      },
      {
        name: "区域切换",
        pattern: "appstore_shift",
        icon: "icon_013.png"
      }
    ],
    [
      {
        name: "百度",
        pattern: "https://www.baidu.com/s?wd=%@"
      },
      {
        name: "谷歌",
        pattern: "https://www.google.com/search?safe=off&q=%@"
      },
      {
        name: "翻译",
        pattern: "http://translate.google.cn/?hl=en#auto/zh-CN/%@"
      },
      {
        name: "维基",
        pattern: "https://zh.wikipedia.org/wiki/%@"
      }
    ]
  ]);

if (n === 2) {
  $keyboard.barHidden = 1;
  $keyboard.height = 268;
}

let module = require(`scripts/${m[n]}`);

module.init();
