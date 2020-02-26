const languageKv = {
    "de-DE": "de",
    "en-US": "en",
    "en-GB": "en",
    "es-ES": "es",
    "fr-FR": "fr",
    "ja-JP": "ja",
    "ko-KR": "ko",
    "pt-PT": "pt",
    "ru-RU": "ru",
    "zh-CN": "zh-CN",
    "zh-HK": "zh-HK",
    "zh-TW": "zh-TW"
  },
  transClang = Object.keys(languageKv),
  transClangCN = [
    "德语",
    "英语(美国)",
    "英语(英国)",
    "西班牙语",
    "法语",
    "日语",
    "韩语",
    "葡萄牙语",
    "俄语",
    "简体中文",
    "繁中(香港)",
    "繁中(台湾)"
  ],
  env = $app.env.toString().slice(0, 1),  // 1/2/3 - app/today/keyboard
  origClang = ["auto", ...transClang],
  origClangCN = ["自动", ...transClangCN],
  borderWidth = 1.0 / $device.info.screen.scale,
  COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

let ui = require("./ui"),
  origLg,
  transLg,
  origPD,
  transPD,
  timer,
  isBack; //解决返回主视图时动画不自然的问题

function transUI() {
  if (env == 2) {
    $widget.height = 400;
    isBack = 0;
  }
  $ui.render({
    props: {
      id: "mainbg",
      bgcolor: env == 3 && $device.isDarkMode ? $color("black") : $color("clear")
    },
    events: {
      layoutSubviews: view => {
        $delay(0.0, () => {
          let v = $("iptvw"),
            w = v.frame.width,
            h = v.frame.height;
          if (isBack && env != 3) return;
          else if (env == 2) {
            v.views[0].frame = $rect(0, 0, w, h / 2);
            v.views[1].frame = $rect(0, h / 2, w, h / 2);
          } else if (env == 3) {
            v.views[0].frame = $rect(0, 0, w / 2, h);
            v.views[1].frame = $rect(w / 2, 0, w / 2, h);
          }
        });
      }
    },
    views: [
      {
        type: "view",
        props: {
          borderColor: ui.color.border,
          bgcolor: ui.color.widget,
          id: "mainvw",
          borderWidth,
          radius: 10,
          alpha: 0
        },
        layout: make => {
          make.edges.inset(4);
        },
        events: {
          ready: () => {
            if (env == 3) {
              timer = $timer.schedule({
                interval: 1,
                handler: () => {
                  let x = $keyboard.selectedText || "";
                  if (x == "" || x == $("originput").text) return;
                  else {
                    $("originput").text = x;
                    translate();
                  }
                }
              });
            }
          }
        },
        views: [
          ui.button({
            name: "x",
            layout: (make, view) => {
              ui.shadow(view);
              make.size.equalTo($size(20, 20));
              make.right.inset(6);
              make.top.inset(4);
            },
            tap: () => {
              isBack = 1;
              if (env == 2) $widget.height = 180;
              if (env == 3) ($keyboard.barHidden = false) && timer.invalidate();
              ui.back();
            }
          }),
          {
            type: "label",
            props: {
              textColor: $color(COLOR),
              text: "谷歌翻译",
              font: $font("bold", 16),
              bgcolor: $color("clear"),
              align: $align.center
            },
            layout: (make, view) => {
              ui.shadow(view);
              make.centerX.equalTo(view.super);
              make.top.inset(4);
            },
            events: {
              tapped(sender) {
                translate();
              }
            }
          },
          {
            type: "label",
            props: { bgcolor: ui.color.border },
            layout: make => {
              make.top.inset(28);
              make.right.left.inset(0);
              make.height.equalTo(borderWidth);
            }
          },
          {
            type: "view",
            props: {
              id: "iptvw"
            },
            layout: (make, view) => {
              make.left.right.inset(0);
              make.bottom.inset(28);
              make.top.equalTo(view.prev.bottom);
            },
            events: {
              ready: sender => {
                $delay(0.0, () => {
                  $ui.window.runtimeValue().$layoutSubviews();
                });
              }
            },
            views: [
              {
                type: "view",
                props: {
                  id: "originputbg",
                  bgcolor: $rgba(200, 200, 200, 0.25)
                },
                views: [
                  {
                    type: "text",
                    props: {
                      id: "originput",
                      font: $font(12),
                      editable: env != 3,
                      bgcolor: $color("clear"),
                      textColor: ui.color.general
                    },
                    layout: make => {
                      make.left.right.top.inset(0);
                      make.bottom.inset(5);
                    },
                    events: {
                      didChange: () => {
                        if ($("originput").text === undefined) {
                          $("origbtn").title = "自动";
                          origLg = "auto";
                        } else translate();
                      }
                    }
                  }
                ]
              },
              {
                type: "view",
                props: { bgcolor: $rgba(0, 0, 0, 0.25) },
                views: [
                  {
                    type: "text",
                    props: {
                      id: "transinput",
                      editable: 0,
                      selectable:1,
                      font: $font(12),
                      bgcolor: $color("clear"),
                      textColor: ui.color.general
                    },
                    layout: make => {
                      make.left.right.top.inset(0);
                      make.bottom.inset(5);
                    }
                  }
                ]
              }
            ]
          },
          {
            type: "view",
            props: { bgcolor: $color("clear") },
            layout: make => {
              make.height.equalTo(28);
              make.right.left.bottom.inset(0);
            },
            views: [
              ui.button({
                name: "trash",
                layout: (make, view) => {
                  make.left.inset(4);
                  make.centerY.equalTo(view.super);
                  make.size.equalTo($size(20, 20));
                  ui.shadow(view);
                },
                tap: () => {
                  $device.taptic(0);
                  $("originput").text = "";
                  $("transinput").text = "";
                }
              }),
              ui.button({
                name: "copy",
                layout: (make, view) => {
                  make.right.inset(4);
                  make.centerY.equalTo(view.super);
                  make.size.equalTo($size(20, 20));
                  ui.shadow(view);
                },
                tap: () => {
                  let text = $("transinput").text;
                  if (text) {
                    let dataManager = require("./data-manager");
                    dataManager.copyAndSaveText(text);
                    ui.toast({ text: "翻译结果已复制", inset: 36 });
                  }
                },
                props: { circular: 0 }
              }),
              ui.button({
                name: "convert",
                layout: (make, view) => {
                  ui.shadow(view);
                  make.center.equalTo(view.super);
                  make.size.equalTo($size(20, 20));
                },
                tap: () => {
                  let switchLg = $("origbtn").title;
                  $("origbtn").title = $("transbtn").title;
                  $("transbtn").title = switchLg;
                  let switchText = $("originput").text;
                  $("originput").text = $("transinput").text;
                  $("transinput").text = switchText;
                  let switchTextlg = origLg;
                  origLg = transLg;
                  transLg = switchTextlg;
                }
              }),
              {
                type: "button",
                props: {
                  id: "origbtn",
                  font: $font("bold", 14),
                  titleColor: $color(COLOR),
                  bgcolor: $color("clear")
                },
                layout: (make, view) => {
                  ui.shadow(view);
                  make.centerY.equalTo(view.super);
                  make.right.equalTo(view.prev.left).inset(10);
                },
                events: {
                  tapped(sender) {
                    $("lgPVBg").hidden = 0;
                  }
                }
              },
              {
                type: "button",
                props: {
                  id: "transbtn",
                  font: $font("bold", 14),
                  titleColor: $color(COLOR),
                  bgcolor: $color("clear")
                },
                layout: (make, view) => {
                  ui.shadow(view);
                  make.centerY.equalTo(view.super);
                  make.left.equalTo(view.prev.prev.right).inset(10);
                },
                events: { tapped: () => ($("lgPVBg").hidden = 0) }
              }
            ]
          },
          {
            type: "view",
            props: {
              id: "lgPVBg",
              bgcolor: $color("clear"),
              style: 4,
              hidden: 1
            },
            events: {
              tapped: () => {
                $("lgPVBg").hidden = 1;
              }
            },
            views: [
              {
                type: "blur",
                props: {
                  borderColor: ui.color.border,
                  id: "lgPickBg",
                  borderWidth,
                  radius: 10,
                  style: 4
                },
                layout: (make, view) => {
                  make.height.equalTo(150);
                  make.width.equalTo(view.super.width);
                  make.bottom.inset(0);
                },
                views: [
                  {
                    type: "picker",
                    props: {
                      id: "lgPick",
                      items: [origClangCN, ["翻译为"], transClangCN]
                    },
                    layout: (make, view) => {
                      make.left.right.inset(20);
                      make.bottom.inset(0);
                      make.height.equalTo(view.super).multipliedBy(0.9);
                    },
                    events: {
                      changed: sender => {
                        $device.taptic(0);
                        for (let i in origClangCN) {
                          if (origClangCN[i] === sender.data[0])
                            origPD = origClang[i];
                        }
                        for (let i in transClangCN) {
                          if (transClangCN[i] === sender.data[2])
                            transPD = transClang[i];
                        }
                      }
                    }
                  },
                  {
                    type: "button",
                    props: {
                      title: "取消",
                      font: $font(14),
                      titleColor: ui.color.general,
                      bgcolor: $color("clear")
                    },
                    layout: make => {
                      make.top.inset(2);
                      make.left.inset(8);
                    },
                    events: {
                      tapped(sender) {
                        $device.taptic(0);
                        $("lgPVBg").hidden = 1;
                      }
                    }
                  },
                  {
                    type: "button",
                    props: {
                      title: "完成",
                      font: $font(14),
                      titleColor: ui.color.general,
                      bgcolor: $color("clear")
                    },
                    layout: make => {
                      make.right.inset(8);
                      make.top.inset(2);
                    },
                    events: {
                      tapped: () => {
                        $device.taptic(0);
                        langPick();
                        translate();
                      }
                    }
                  }
                ]
              }
            ],
            layout: $layout.fill
          }
        ]
      }
    ]
  });
  ui.back(1);
}

function gtrans(text) {
  transUI();
  if (text) {
    $("originput").text = text;
    origLg = "auto";
    transLg = cnTest();
    translate();
  } else {
    origLg = "en-US";
    transLg = "zh-CN";
    $("origbtn").title = getZhTitle(origLg);
    $("transbtn").title = getZhTitle(transLg);
  }
}

function cnTest() {
  let translang;
  let cn = new RegExp("[\u4e00-\u9fa5]+");
  let slang = cn.test($("originput").text);
  if (slang) translang = "en-US";
  else translang = "zh-CN";
  return translang;
}

function translate() {
  $http.request({
    method: "POST",
    url: "http://translate.google.cn/translate_a/single",
    header: {
      "User-Agent": "iOSTranslate",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      dt: "t",
      q: $("originput").text,
      tl: transLg,
      ie: "UTF-8",
      sl: origLg,
      client: "ia",
      dj: "1"
    },
    handler: resp => {
      let data = resp.data.sentences,
        orig = "",
        trans = "";
      data.forEach(e => {
        orig = orig.concat(e.orig + "\n");
        trans = trans.concat(e.trans + "\n");
      });
      let src = resp.data.src || data.src;
      if (src == "en" || src == "es" || src == "fr" || src == "pt") {
        if (origLg == "auto") {
          origLg = getKeyByValue(src);
          $("origbtn").title = getZhTitle(origLg);
        }
      } else {
        origLg = getKeyByValue(src);
        $("origbtn").title = getZhTitle(origLg) || "自动";
      }
      $("transinput").text = trans.trim();
      $("transbtn").title = getZhTitle(transLg);
    }
  });
}

function langPick() {
  origLg = origPD || "auto";
  $("origbtn").title = getZhTitle(origLg) || "自动";
  transLg = transPD || "de-DE";
  $("transbtn").title = getZhTitle(transLg);
  $("lgPVBg").hidden = 1;
}

const getKeyByValue = val => {
  for (let i in languageKv) {
    if (languageKv[i] == val) {
      return i;
    }
  }
};

const getZhTitle = key => transClangCN[transClang.indexOf(key)];

module.exports = {
  gtrans: gtrans
};
