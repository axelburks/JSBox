let ui = require("./ui"),
  timer;

const searchEngines = [
  {
    name: "M-W",
    pattern: "http://merriam-webster.com/dictionary/"
  },
  {
    name: "Oxford",
    pattern: "https://www.oxfordlearnersdictionaries.com/us/definition/english/"
  },
  {
    name: "Collins",
    pattern: "https://www.collinsdictionary.com/dictionary/english/"
  },
  {
    name: "Free Dictionary",
    pattern: "http://idioms.thefreedictionary.com/"
  },
  {
    name: "Urban",
    pattern: "https://www.urbandictionary.com/define.php?term="
  },
  {
    name: "Bing",
    pattern: "http://cn.bing.com/dict/search?q="
  }
];
const dark = Number($device.isDarkMode);
const env = $app.env.toString().slice(0, 1);  // 1/2/3 - app/today/keyboard
const COLOR = $cache.get(dark ? "dark" : "color");

function show() {
  let bgcolor = $color("clear");
  if (env == 3) bgcolor = dark ? $color("black") : $color("white");
  const borderWidth = 1.0 / $device.info.screen.scale;
  $ui.window.add({
    type: "view",
    props: { id: "bg", alpha: 0, bgcolor },
    layout: (make, view) => {
      make.left.right.bottom.inset(0);
      make.top.inset(0.2);
    },
    events: {
      ready: () => {
        if (env == 3) {
          timer = $timer.schedule({
            interval: 2,
            handler: () => {
              let x = $keyboard.selectedText || "";
              if (x == "") return;
              else translate(x);
            }
          });
        }
      }
    },
    views: [
      {
        type: "view",
        props: {
          borderColor: ui.color.border,
          bgcolor: ui.color.widget,
          borderWidth,
          radius: 10
        },
        layout: make => {
          make.edges.inset(4);
        },
        views: [
          ui.button({
            name: "x",
            layout: (make, view) => {
              ui.shadow(view);
              make.size.equalTo($size(24, 24));
              make.top.left.inset(5);
            },
            tap: () => {
              ui.appear(0);
              $device.taptic(0);
              if (env == 3) {
                $keyboard.barHidden = false;
                $keyboard.height = 314;
                timer.invalidate();
              }
            }
          }),
          ui.button({
            name: "copy",
            layout: (make, view) => {
              ui.shadow(view);
              make.size.equalTo($size(24, 24));
              make.right.top.inset(5);
            },
            tap: () => {
              if ($("result").text != "") {
                let dataManager = require("./data-manager");
                dataManager.copyAndSaveText($("result").text);
                ui.toast({text:"翻译结果已复制", inset:42});
              } else return;
            },
            props: { circular: 0 }
          }),
          {
            type: "input",
            props: {
              placeholder: "输入单词或词语查询…",
              borderColor: ui.color.border,
              textColor: ui.color.general,
              bgcolor: ui.rgba(200),
              id: "wordsearch",
              hidden: env == 3,
              font: $font(12),
              borderWidth,
              radius: 10
            },
            layout: (make, view) => {
              if (env == 3) return;
              make.top.inset(5.5);
              make.height.equalTo(24);
              make.left.inset(39);
              make.width.equalTo(view.super.width).dividedBy(2);
            },
            events: {
              ready(view) {
                dark &&
                  $delay(
                    0.1,
                    () => (view.views[0].textColor = $color("#A2A2A2"))
                  );
              },
              returned: sender => {
                sender.blur();
                translate(sender.text);
              }
            }
          },
          {
            type: "button",
            props: {
              id: "name",
              title: "英汉词典",
              font: $font("bold", 18),
              bgcolor: $color("clear"),
              titleColor: $color(COLOR)
            },
            layout: (make, view) => {
              ui.shadow(view);
              if (env == 3) {
                make.centerX.equalTo(view.super);
                make.height.equalTo(34);
              } else {
                make.right.inset(39);
                make.left.equalTo(view.prev.right).offset(10);
              }
              make.centerY.equalTo(view.prev.prev.centerY);
            },
            events: {
              tapped(sender) {
                if (env == 3) return;
                if ($("wordsearch").editing) {
                  if ($("wordsearch").text == "") return;
                  else translate($("wordsearch").text);
                } else {
                  $("wordsearch").text = "";
                  $("result").text = "";
                }
              }
            }
          },
          {
            type: "label",
            props: { bgcolor: ui.color.border },
            layout: make => {
              make.left.right.inset(0);
              make.top.inset(34);
              make.height.equalTo(borderWidth);
            }
          },
          {
            type: "view",
            props: { bgcolor: ui.rgba(200) },
            layout: (make, view) => {
              make.top.equalTo(view.prev.bottom);
              make.left.right.bottom.inset(0);
            },
            views: [
              {
                type: "text",
                props: {
                  radius: 10,
                  font: $font(12),
                  id: "result",
                  editable: 0,
                  textColor: ui.color.general,
                  bgcolor: $color("clear")
                },
                layout: make => {
                  make.left.right.inset(4);
                  make.bottom.inset(34);
                  make.top.inset(0);
                }
              },
              {
                type: "tab",
                props: {
                  bgcolor: $color("clear"),
                  //                  tintColor: $color(COLOR),//iOS 12
                  font: $font(14),
                  index: Number($cache.get("engine")) || 0,
                  items: ["有道", "扇贝", "金山", "谷歌"]
                },
                layout: (make, view) => {
                  make.left.inset(6);
                  make.height.equalTo(22);
                  make.top.equalTo(view.prev.bottom).offset(6);
                  make.width.equalTo(view.super).multipliedBy(0.5);
                  dark && (view.bgcolor = ui.rgba(255));
                },
                events: {
                  changed: sender => {
                    $cache.set("engine", sender.index);
                    $cache.remove("textSound");
                    $("result").text = "";
                    if ($("wordsearch").text === "") return;
                    else translate($("wordsearch").text);
                  }
                }
              },
              ui.button({
                name: "safari",
                layout: (make, view) => {
                  make.right.inset(6);
                  make.centerY.equalTo(view.prev);
                  ui.shadow(view);
                  make.size.equalTo($size(24, 24));
                },
                tap: () => {
                  if ($("wordsearch").text != "")
                    searchMore($("wordsearch").text);
                  else return;
                }
              }),
              ui.button({
                name: "volume",
                layout: (make, view) => {
                  ui.shadow(view);
                  make.size.equalTo($size(24, 24));
                  make.centerY.equalTo(view.prev);
                  make.right.inset(39);
                },
                tap: () => {
                  $device.taptic(0);
                  let sound = $cache.get("textSound");
                  if (sound && sound.length == 2)
                    $audio.play({
                      url: sound[0],
                      events: {
                        didPlayToEndTime: () => $audio.play({ url: sound[1] })
                      }
                    });
                  else {
                    if ($("result").text == "") return;
                    else {
                      ui.toast({text:"系统TTS",isnet: 42});
                      speechText($("wordsearch").text);
                    }
                  }
                }
              })
            ]
          }
        ]
      }
    ]
  });
  ui.appear(1);
}

//TTS
function speechText(text) {
  let lan = whichLan(text),
    rate = 0.5;
  if (lan == "en") {
    lan = "en-US";
    rate = 0.4;
  }
  $text.speech({ text: text, rate: rate, language: lan });
}

function translate(text) {
  $cache.remove("textSound");
  let engine = $cache.get("engine") || 0;
  if (engine == 0) youdaotrans(text);
  else if (engine == 1) shanbeitrans(text);
  else if (engine == 2) kingsofttrans(text);
  else googletrans(text);
}

//有道词典
function youdaotrans(text) {
  let url =
    "https://dict.youdao.com/jsonapi?le=eng&q=" +
    text +
    "&keyfrom=dataserver&doctype=json&jsonversion=2";
  let codeUrl = encodeURI(url);
  $http.request({
    method: "GET",
    url: codeUrl,
    timeout: 5,
    handler: resp => {
      let data = resp.data;
      if (Object.keys(data).length == 0) {
        $("result").text = "";
        return;
      }
      let dic = data.meta.dicts,
        meanText = "";
      if (dic.includes("urg")) {
        let ugc = data.ugc;
        if (!ugc.success) $ui.error(ugc.reason);
      } else if (dic.includes("ec")) {
        let ec = data.ec.word[0];
        if (ec.ukphone != "" && ec.ukphone !== undefined) {
          meanText = "BrE /" + ec.ukphone + "/   AmE /" + ec.usphone + "/\n";
          let prou = "http://dict.youdao.com/dictvoice?audio=";
          $cache.set("textSound", [prou + ec.ukspeech, prou + ec.usspeech]);
        }
        if (ec.hasOwnProperty("wfs"))
          meanText +=
            ec.wfs
              .map(i => {
                return i.wf.name + ":" + i.wf.value;
              })
              .join(" ") + "\n";
        meanText += ec.trs
          .map(i => {
            return i.tr[0].l.i[0];
          })
          .join("\n");
      } else if (dic.includes("ce")) {
        let ce = data.ce.word[0];
        if (ce.hasOwnProperty("phone")) meanText = "[" + ce.phone + "]" + "\n";
        meanText += ce.trs
          .map(j => {
            return j.tr[0].l.i
              .map(k => {
                if (k != "" && k != " ") k = k["#text"];
                return k;
              })
              .join("");
          })
          .join("\n");
      } else if (dic.includes("fanyi")) meanText = data.fanyi.tran;
      $("result").text = meanText;
    }
  });
}
//扇贝接口
function shanbeitrans(text) {
  $http.request({
    method: "GET",
    url: "https://api.shanbay.com/bdc/search/?word=" + text,
    timeout: 5,
    handler: resp => {
      let data = resp.data;
      if (data == "") ui.toast({text:"请检查待查询内容,该API不支持汉译英", inset:42, icon:"225"});
      else if (data.msg != "SUCCESS") $("result").text = data.msg;
      else {
        $("result").text =
          "BrE /" +
          data.data.pronunciations.uk +
          "/   AmE /" +
          data.data.pronunciations.us +
          "/\n" +
          data.data.definition;
      }
      let uss = data.data.audio_addresses.us[0],
        uks = data.data.audio_addresses.uk[0];
      $cache.set("textSound", [uks, uss]);
    }
  });
}
//金山词霸
function kingsofttrans(text) {
  let url =
      "http://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=1&client=6&is_need_mean=1&word=" +
      text,
    codeUrl = encodeURI(url);
  $http.get({
    url: codeUrl,
    timeout: 5,
    handler: resp => {
      let data = resp.data.message[0];
      if (resp.data.status == 1) {
        let length = data.means.length,
          meanText = "";
        for (let i = 0; i < length; i++) {
          meanText += data.means[i].part;
          meanText += " ";
          let meansLength = data.means[i].means.length;
          for (let j = 0; j < meansLength; j++) {
            meanText += data.means[i].means[j];
            meanText += "; ";
          }
          if (i < length - 1) meanText += "\n";
        }
        if ($("wordsearch").text == data.key || env == 3)
          $("result").text = meanText;
        else if (env == 2)
          $("result").text =
            "提示:查询到与键入内容不符的单词 [ " + data.key + " ]\n" + meanText;
      } else ui.toast({text:"请检查待查询内容", inset:42, icon:"225"});
    }
  });
}
//谷歌翻译
function googletrans(text) {
  let sl = whichLan(text);
  let tl = "";
  if (sl == "en") {
    tl = "zh-CN";
  } else {
    tl = "en";
  }
  $http.request({
    method: "POST",
    url: "http://translate.google.cn/translate_a/single",
    timeout: 5,
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      dt: "t",
      q: text,
      tl: tl,
      ie: "UTF-8",
      sl: sl,
      client: "ia",
      dj: "1"
    },
    showsProgress: 0,
    handler: resp => {
      let data = resp.data;
      let length = data.sentences.length;
      if (length != undefined) {
        let meanText = " ";
        for (let i = 0; i < length; i++) {
          meanText += data.sentences[i].trans;
          if (i < length - 1) meanText += "\n";
        }
        $("result").text = meanText;
      }
    }
  });
}

function whichLan(text) {
  let englishChar = text.match(/[a-zA-Z]/g),
    englishNumber = !englishChar ? 0 : englishChar.length,
    chineseChar = text.match(/[\u4e00-\u9fff\uf900-\ufaff]/g),
    chineseNumber = !chineseChar ? 0 : chineseChar.length,
    tl = "en";
  if (chineseNumber * 2 >= englishNumber) tl = "zh-CN";
  else tl = "en";
  return tl;
}

function searchMore(text) {
  $ui.menu({
    items: searchEngines.map(item => {
      return item.name;
    }),
    handler: (title, idx) => {
      $thread.main({
        delay: 0.4,
        handler: () => {
          search(searchEngines[idx].pattern, text);
        }
      });
    }
  });
}

const search = (pattern, text) =>
  $app.openURL(pattern + encodeURIComponent(text));

function dic(text) {
  $cache.remove("textSound");
  show();
  $("wordsearch").text = text || "";
  translate(text);
}

module.exports = { dic: dic };
