let today = $cache.get("today") || [[0, 1], 0, 12, 9, 0, 0];
let builder = require("./builder");
let ui = require("./ui");

const cv = 2.93;
const bgcolor = ui.color.cell;
const textColor = ui.color.general;
const ver = parseInt($device.info.version.split(".")[0]) - 12;
const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

function show() {
  return {
    type: "list",
    props: {
      hidden: 1,
      id: "settings",
      bgcolor: ui.color.cellbg,
      separatorColor: ui.color.separator,
      indicatorInsets: $insets(44, 0, 50, 0),
      header: { type: "view", props: { bgcolor: $color("clear"), height: 44 } },
      footer: {
        type: "view",
        props: { bgcolor: $color("clear"), height: 100 },
        views: [
          {
            type: "label",
            props: {
              text: `Modified by coo11\nVersion ${cv}`,
              lines: 0,
              font: $font(12),
              align: $align.center,
              textColor: $color("#a2a2a2")
            },
            layout: (make, view) => {
              make.top.equalTo(0);
              make.centerX.equalTo(view.super);
            }
          }
        ]
      },
      template: {
        props: { bgcolor },
        views: [
          {
            type: "label",
            props: { id: "setTitle", textColor },
            layout: (make, view) => {
              make.centerY.equalTo(view.super);
              make.left.inset(15);
            }
          },
          {
            type: "label",
            props: {
              id: "content",
              textColor: $color(COLOR)
            },
            layout: (make, view) => {
              make.centerY.equalTo(view.super);
              make.right.inset(15);
            }
          }
        ]
      },
      data: [
        {
          title: "通用",
          rows: [
            { setTitle: { text: "清空记录列表" } },
            {
              setTitle: { text: "主题颜色" },
              content: {
                text:
                  $cache.get("color") == "tint"
                    ? "跟随应用"
                    : $cache.get("color"),
                textColor: $color(COLOR)
              }
            },
            {
              setTitle: { text: "主题颜色（深色模式)" },
              content: {
                text:
                  $cache.get("dark") == $cache.get("color")
                    ? "跟随应用"
                    : $cache.get("dark"),
                textColor: $color(COLOR)
              }
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: tabView(
                "iCloud 同步",
                ["关闭", "手动", "自动"],
                $cache.get("sync"),
                sender => {
                  let i = sender.index;
                  $cache.set("sync", i);
                  $cache.set("list", 0);
                  if (i !== 0) {
                    let path = "drive://XPin/text-items.json";
                    if (!$file.exists(path)) {
                      $file.mkdir("drive://XPin/");
                      $file.write({
                        data: $data({ string: JSON.stringify([]) }),
                        path: path
                      });
                    }
                  }
                  $addin.restart();
                }
              )
            }
          ]
        },
        {
          title: "通知中心",
          rows: [
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: tabView(
                "底栏滚动方式",
                ["滑动", "分页", "禁用"],
                today[0][1] ? (today[0][0] ? 0 : 1) : 2,
                sender => {
                  today[0][0] = sender.index ? 1 : 0;
                  today[0][1] = sender.index == 2 ? 0 : 1;
                  $cache.set("today", today);
                }
              )
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: tabView(
                "搜索引擎",
                ["默认", "谷歌", "必应", "百度"],
                today[1],
                sender => {
                  today[1] = sender.index;
                  $cache.set("today", today);
                }
              )
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: stepperView("字体大小", 2, [12, 16])
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: stepperView("底栏图标列数", 3, [3, 30])
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: [
                {
                  type: "label",
                  props: { text: "隐藏底栏", textColor },
                  layout: (make, view) => {
                    make.centerY.equalTo(view.super);
                    make.left.inset(15);
                  }
                },
                {
                  type: "switch",
                  props: {
                    on: today[4],
                    onColor: $color(COLOR)
                  },
                  layout: (make, view) => {
                    make.centerY.equalTo(view.super);
                    make.right.inset(15);
                  },
                  events: {
                    changed: sender => {
                      today[4] = sender.on;
                      $cache.set("today", today);
                    }
                  }
                }
              ]
            },
            {
              type: "views",
              props: { bgcolor },
              layout: $layout.fill,
              views: [
                {
                  type: "label",
                  props: { text: "隐藏同步图标", textColor },
                  layout: (make, view) => {
                    make.centerY.equalTo(view.super);
                    make.left.inset(15);
                  }
                },
                {
                  type: "switch",
                  props: {
                    on: today[5],
                    onColor: $color(COLOR)
                  },
                  layout: (make, view) => {
                    make.centerY.equalTo(view.super);
                    make.right.inset(15);
                  },
                  events: {
                    changed: sender => {
                      today[5] = sender.on;
                      $cache.set("today", today);
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          title: "其他",
          rows: [
            { setTitle: { text: "重置" } },
            { setTitle: { text: "支持鼓励" } },
            { setTitle: { text: "使用说明" } },
            { setTitle: { text: "检查更新" } },
            { setTitle: { text: "备份动作" } },
            { setTitle: { text: "恢复动作" } }
          ]
        }
      ]
    },
    layout: $layout.fillSafeArea,
    events: {
      didSelect: (sender, indexPath) => {
        let sec = indexPath.section,
          row = indexPath.row;
        switch (sec) {
          case 0:
            switch (row) {
              case 0:
                builder.delTextItems();
                break;
              case 1:
                setColor(0);
                break;
              case 2:
                setColor(1);
                break;
            }
            break;
          case 2:
            switch (row) {
              case 0:
                $ui.menu(["确认"]).then(selected => {
                  if ('index' in selected) {
                    $device.taptic(2);
                    $cache.clear();
                  }
                });
                break;
              case 1:
                support();
                break;
              case 2:
                readme();
                break;
              case 3:
                check();
                break;
              case 4:
                backup("backup");
                break;
              case 5:
                backup("restore");
                break;
          }
        }
      }
    }
  };
}

function tabView(title, items, index, handler) {
  return [
    {
      type: "label",
      props: { text: title, textColor, bgcolor: $color("clear") },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.inset(15);
      }
    },
    {
      type: "tab",
      props: {
        items: items,
        index: index,
        titleColor: $color(COLOR),
        tintColor: $color(COLOR)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.prev);
        make.right.inset(15);
        ver &&
          $delay(0, () => {
            for (let i of view.views) {
              if (i.views.length > 0) i.views[0].textColor = $color(COLOR);
            }
          });
      },
      events: { changed: handler }
    }
  ];
}

function stepperView(text, index, range) {
  return [
    {
      type: "label",
      props: { text, textColor },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.inset(15);
      }
    },
    {
      type: "stepper",
      props: {
        min: range[0],
        max: range[1],
        value: today[index],
        tintColor: $color(COLOR)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      },
      events: {
        ready: sender => {
          if (!ver) return;
          sender.views[0].views[6].tintColor = $color(COLOR);
          sender.views[0].views[5].tintColor = $color(COLOR);
        },
        changed: sender => {
          sender.next.text = sender.value;
          today[index] = sender.value;
          $cache.set("today", today);
        }
      }
    },
    {
      type: "label",
      props: {
        text: String(today[index]),
        color: $color(COLOR)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.equalTo(view.prev.left).offset(-10);
      }
    }
  ];
}

function setColor(i) {
  $ui.menu({
    items: ["跟随应用", "自定义"],
    handler: (title, idx) => {
      if (idx == 0) {
        i ? $cache.set("dark", "tint") : $cache.set("color", "tint");
        $addin.restart();
      } else
        $input.text({
          type: $kbType.ascii,
          text:
            $cache
              .get(i ? "dark" : "color")
              .replace("#", "")
              .replace("tint", "") || "",
          placeholder: "请输入 00FFEE 格式的颜色",
          handler: t => {
            if (/(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(t)) {
              let text = "#" + t.toLocaleUpperCase();
              if (i == 0 && text != $cache.get("color")) {
                $cache.set("color", text);
                $addin.restart();
              } else if (i && text != $cache.get("dark")) {
                $cache.set("dark", text);
                $addin.restart();
              }
            } else ui.toast({ text: "输入有误", icon: "225" });
          }
        });
    }
  });
}

function support() {
  $ui.push({
    type: "view",
    props: {
      id: "_view",
      navBarHidden: 1,
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    layout: $layout.fill,
    views: [
      {
        type: "view",
        props: { bgcolor: $color("white") },
        layout: builder.pushViewListLayout(),
        views: [
          {
            type: "image",
            props: {
              src: "assets/support/bg.png"
            },
            layout: (make, view) => {
              let l = $device.info.screen.width;
              make.right.left.inset(0);
              make.size.equalTo($size(l, l));
              make.top.equalTo(view.super.top).offset(-44);
            }
          },
          {
            type: "label",
            props: {
              text: "XPin",
              font: $font(72),
              align: $align.right
            },
            layout: make => {
              make.top.left.inset(30);
            }
          },
          {
            type: "label",
            props: {
              text: "感谢使用与支持。",
              font: $font("bold", 36),
              align: $align.right
            },
            layout: (make, view) => {
              make.top.equalTo(view.prev.bottom);
              make.left.inset(30);
            }
          },
          {
            type: "label",
            props: {
              id: "_label",
              text: "打赏列表",
              font: $font("bold", 24),
              align: $align.right
            },
            layout: (make, view) => {
              make.top.equalTo(view.prev.bottom).offset(10);
              make.left.inset(30);
            }
          },
          {
            type: "list",
            props: {
              id: "_list",
              showsVerticalIndicator: 0,
              bgcolor: $color("clear"),
              rowHeight: 28,
              radius: 10,
              template: {
                props: {
                  textColor: $color("black"),
                  bgcolor: $color("clear"),
                  font: $font(12)
                }
              }
            },
            layout: (make, view) => {
              make.top.equalTo(view.prev.bottom).offset(10);
              make.left.inset(30);
              make.width.equalTo(100);
              make.height.equalTo(168);
            },
            events: {
              ready: sender => {
                sender.data = $cache.get("thx");
                $http.download({
                  url: "http://t.cn/Ai0m2hCC",
                  handler: resp => {
                    let data = JSON.parse(resp.data.string);
                    sender.data = data;
                    $cache.set("thx", data);
                  }
                });
              }
            }
          },
          {
            type: "lottie",
            props: {
              src: "assets/support/ani.json",
              loop: 1,
              userInteractionEnabled: 0
            },
            layout: make => {
              make.centerY.equalTo($("_label"));
              make.centerX.equalTo($("_label").right).offset(30);
              make.size.equalTo($size(200, 200));
            },
            events: {
              ready: sender => sender.play()
            }
          },
          {
            type: "button",
            props: {
              bgcolor: $color("clear"),
              src: "assets/support/zfb.png"
            },
            layout: make => {
              make.left.inset(30);
              make.size.equalTo($size(110, 40));
              make.top.equalTo($("_list").bottom).offset(10);
            },
            events: {
              tapped(sender) {
                $ui.alert({
                  message: "通过支付宝打赏",
                  actions: [
                    {
                      title: "好的",
                      handler: () => {
                        $app.openURL("http://t.cn/EXOp1a6");
                      }
                    },
                    { title: "算了" }
                  ]
                });
              }
            }
          },
          {
            type: "button",
            props: {
              bgcolor: $color("clear"),
              src: "assets/support/wx.png"
            },
            layout: (make, view) => {
              make.centerY.equalTo(view.prev);
              make.size.equalTo($size(110, 40));
              make.left.equalTo(view.prev.right).offset(30);
            },
            events: {
              tapped(sender) {
                $ui.alert({
                  message: "通过微信打赏",
                  actions: [
                    {
                      title: "好的",
                      handler: () => {
                        $app.openURL("weixin://scanqrcode");
                        $photo.save({
                          data: $file.read("assets/support/wxpay.png")
                        });
                      }
                    },
                    { title: "算了" }
                  ]
                });
              }
            }
          }
        ]
      },
      builder.createPushView("支持鼓励")
    ]
  });
}

function backup(action) {
  let CloudBKPath = "drive://MyPinAction.json"
  if (action == "backup") {
    let success = $file.write({
      data: $data({ string: JSON.stringify($cache.get("actions")) }),
      path: CloudBKPath
    });
    success && ui.toast({text: "Backup Success"});
  } else {
    if ($file.exists(CloudBKPath)) {
      $cache.set("actions", JSON.parse($file.read(CloudBKPath).string));
      ui.toast({text: "Restore Success"});
      $delay(1, () => { $addin.restart(); });
    } else $ui.error("No Backup File");
  }
}

async function check() {
  ui.guide(5, "检查中，请勿连续点击…");
  let res = await $http.get("https://raw.githubusercontent.com/axelburks/JSBox/master/version.json");
  let ver = res.data.xpin;
  if (ver <= cv) {
    ui.toast({ text: "您这是最新版本^_^" });
    return;
  }
  $("toastView") && $("toastView").remove();
  let { index } = await $ui.alert({
    title: "更新提示",
    message: `发现新版本 ${ver}，是否升级？`,
    actions: ["否", "是"]
  });
  if (index == 0) return;
  let url = "https://github.com/axelburks/JSBox/raw/master/XPin/.output/XPin.box";
  let { displayName, name } = $addin.current;
  $http.download({
    url: url,
    showsProgress: 1,
    handler: res => {
      let code = res.response.statusCode;
      if (code == 200) {
        let time = new Date().valueOf();
        let url = `jsbox://run?name=${encodeURIComponent(
          displayName
        )}&bak=${time}`;
        $file.copy({
          src: "/assets/text-items.json",
          dst: `shared://${time}-items.json`
        }) &&
          $addin.save({
            name: name,
            data: res.data,
            handler: success => {
              if (success) {
                ui.toast({ text: "升级完毕" });
                $device.taptic(2);
                $delay(0.6, () => $app.openURL(url));
              }
            }
          });
      } else ui.toast({ text: `更新失败 ${code}` });
    }
  });
}

function readme() {
  $ui.push({
    props: {
      navBarHidden: 1,
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    layout: $layout.fill,
    views: [
      {
        type: "markdown",
        props: {
          clipsToBounds: 0,
          content: $file.read("README.md").string
        },
        layout: builder.pushViewListLayout()
      },
      builder.createPushView("使用说明")
    ]
  });
}

module.exports = { show: show };
