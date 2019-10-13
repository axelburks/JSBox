let _sync = $cache.get("sync");
let _list = $cache.get("list");

let dataManager = require("./data-manager"),
  builder = require("./builder"),
  ui = require("./ui");

const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

//连续删除
$define({
  type: "EventEmitter: NSObject",
  props: ["timer", "charCnt", "callCnt"],
  events: {
    "deleteOnce:": sender => {
      $keyboard.playInputClick();
      $keyboard.delete();
    },
    "touchDown:": sender => self.$enableTimer(),
    "touchUp:": sender => self.$disableTimer(),
    "enableTimer": () => {
      self.$disableTimer();
      self.$setCharCnt(1);
      self.$setCallCnt(0);

      const timer = $objc(
        "NSTimer"
      ).$scheduledTimerWithTimeInterval_target_selector_userInfo_repeats(
        0.15,
        self,
        "fireAction",
        null,
        true
      );
      self.$setTimer(timer);
    },
    "disableTimer": () => {
      if (self.$timer()) {
        self.$timer().$invalidate();
        self.$setTimer(null);
      }
    },
    "fireAction": () => {
      self.$setCallCnt(self.$callCnt() + 1);
      $objc(
        "NSObject"
      ).$cancelPreviousPerformRequestsWithTarget_selector_object(
        self,
        "fireAction",
        null
      );

      if (self.$callCnt() % 8 == 0) {
        self.$setCharCnt(self.$charCnt() + 4);
      }

      for (let idx = 0; idx < self.$charCnt(); ++idx) {
        $keyboard.delete();
      }

      $keyboard.playInputClick();
    }
  }
});

const emitter = $objc("EventEmitter").$new();
$objc_retain(emitter);
const button = $objc("BaseButton").$new();
button.$addTarget_action_forControlEvents(emitter, "deleteOnce:", 1 << 0);
button.$addTarget_action_forControlEvents(emitter, "touchDown:", 1 << 0);
button.$addTarget_action_forControlEvents(
  emitter,
  "touchUp:",
  (1 << 6) | (1 << 7) | (1 << 3) | (1 << 5) | (1 << 8)
);

async function getText() {
  if ($keyboard.selectedText) return $keyboard.selectedText;
  else if ($clipboard.text) return $clipboard.text;
  else if ($keyboard.hasText) {
    let w = await $keyboard.getAllText();
    return w;
  } else return "";
}

function init() {
  $ui.render({
    type: "view",
    views: [
      {
        type: "view",
        props: { id: "main", bgcolor: ui.color.bg },
        views: [builder.createClipboardView()],
        layout: $layout.fillSafeArea
      },
      {
        type: "blur",
        props: {
          style: 1,
          borderWidth: 0.4,
          borderColor: $rgba(100, 100, 100, 0.25)
        },
        layout: (make, view) => {
          make.right.left.inset(-0.2);
          make.top.inset(0);
          make.height.equalTo(49);
        },
        views: [
          {
            type: "tab",
            props: {
              id: "tabview",
              index: _list,
              enabled: _sync !== 0,
              tintColor: $color(COLOR),
              items: ["本地", "iCloud"]
            },
            layout: (make, view) => {
              make.centerY.equalTo(view.super);
              make.left.inset(10.5);
              make.height.equalTo(28);
            },
            events: {
              changed: sender => {
                if (_sync == 1) {
                  $cache.set("list", sender.index);
                  _list = sender.index;
                  dataManager.init();
                }
              }
            }
          },
          createButton(
            "027",
            () => {
              $clipboard.clear();
              ui.toast({ text: "剪贴板已清空", inset: 7 });
              $device.taptic(0);
            },
            () => builder.delTextItems()
          ),
          createButton(
            "022",
            () => {
              getText().then(x => {
                if (x != "") {
                  $keyboard.height = 350;
                  $share.sheet({
                    item: x,
                    handler: () => ($keyboard.height = 314)
                  });
                }
              });
            },
            () => {
              let items = dataManager.getTextItems();
              if (items == "") {
                ui.toast({ text: "记录列表为空", inset: 7 });
                $device.taptic(0);
              } else {
                $keyboard.height = 350;
                $share.sheet({
                  item: items.join("\n"),
                  handler: () => {
                    $keyboard.height = 314;
                  }
                });
              }
            }
          ),
          createButton(
            "057",
            () => {
              getText().then(x => {
                if (x.length > 0) {
                  let translator = require("./translator");
                  translator.gtrans(x);
                }
              });
            },
            () => {
              getText().then(x => {
                if (x.length > 0) {
                  let dic = require("./dictionary");
                  dic.dic(x);
                }
              });
            }
          ),
          createButton(
            "023",
            () => {
              getText().then(x => {
                let preview = require("./preview");
                if (x != "") preview.show(x);
              });
            },
            () => {
              getText().then(x => {
                if (x != "") {
                  if ($detector.link(x) != "")
                    $app.openURL($detector.link(x)[0]);
                  else if ($detector.phoneNumber(x) != "")
                    $app.openURL("tel:" + $detector.phoneNumber(x));
                  else {
                    let eng = $cache.get("search-engine") || "x-web-search://?";
                    $app.openURL(eng + encodeURIComponent(x));
                  }
                }
              });
            }
          )
        ],
        events: {
          doubleTapped: sender => {
            $("itemlist").beginRefreshing();
            $("itemlist").scrollTo({
              indexPath: $indexPath(0, 0),
              animated: 1
            });
            $("itemlist").endRefreshing();
            $delay(0.4, () => {
              builder.refreshList();
            });
          }
        }
      },
      {
        type: "blur",
        props: {
          style: 1,
          borderWidth: 0.4,
          borderColor: $rgba(100, 100, 100, 0.25)
        },
        layout: (make, view) => {
          make.right.left.inset(-0.2);
          make.bottom.inset(0);
          make.top.equalTo(view.super.safeAreaBottom).offset(-49.4);
        },
        views: [
          {
            type: "button",
            props: {
              bgcolor: $color("clear"),
              borderWidth: 0.6,
              borderColor: $rgba(100, 100, 100, 0.25)
            },
            layout: (make, view) => {
              make.left.inset(4);
              make.centerY.equalTo(view.super);
              make.size.equalTo($size(41.4, 41.4));
            },
            views: ui.earth(),
            events: {
              tapped(sender) {
                $device.taptic(1);
                $keyboard.next();
              }
            }
          },
          {
            type: "button",
            props: { bgcolor: $color(COLOR) },
            views: ui.enter(),
            layout: (make, view) => {
              make.right.inset(4);
              make.centerY.equalTo(view.super);
              make.size.equalTo($size(40.5, 40.5));
            },
            events: {
              tapped(sender) {
                $keyboard.send();
              },
              longPressed: sender => {
                $keyboard.insert("\n ");
                $keyboard.delete();
              }
            }
          },
          {
            type: "runtime",
            props: {
              view: button,
              bgcolor: $color("clear"),
              radius: 6,
              borderWidth: 0.6,
              borderColor: $rgba(100, 100, 100, 0.25)
            },
            layout: (make, view) => {
              make.right.inset(49.4);
              make.centerY.equalTo(view.super);
              make.size.equalTo($size(41.4, 41.4));
            },
            views: ui.del()
          }
        ]
      }
    ]
  });
  dataManager.init();
}

function createButton(icon, handler, handler2) {
  return {
    type: "button",
    props: {
      id: icon,
      icon: $icon(icon, $color(COLOR), $size(20, 20)),
      bgcolor: $color("clear")
    },
    layout: (make, view) => {
      if (icon == "027") make.right.inset(8);
      else make.right.equalTo(view.prev.left).offset(-8);
      make.centerY.equalTo(view.super);
      make.height.equalTo(26);
      make.width.equalTo(24.4);
    },
    events: { tapped: handler, longPressed: handler2 }
  };
}

module.exports = { init: init };
