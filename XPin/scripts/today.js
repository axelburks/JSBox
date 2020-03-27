let _sync = $cache.get("sync");
let _list = $cache.get("list");
let _prefs = $cache.get("today") || [[0, 1], 0, 12, 9, 0, 0];

let dataManager = require("./data-manager"),
  builder = require("./builder"),
  helper = require("./helper"),
  ui = require("./ui");

const dark = Number($device.isDarkMode);
const COLOR = $cache.get(dark ? "dark" : "color");
const ver = parseInt($device.info.version.split(".")[0]) - 12;
const env = $app.env.toString().slice(0, 1) - 1;
const borderWidth = 1.0 / $device.info.screen.scale;

const layout = (make, view, name) => {
  ui.shadow(view, COLOR);
  if (name == "x") make.right.inset(8);
  else make.right.equalTo(view.prev.left).offset(-4);
  make.top.inset(2);
  make.size.equalTo($size(22.4, 22.4));
};

function init(initClipText) {
  let text = initClipText ? initClipText : JSON.stringify($clipboard.items).indexOf('org.nspasteboard.ConcealedType') < 0 && $clipboard.text ? $clipboard.text : "";
  let textColor = text.indexOf("\n") >= 0 ? ui.color.general_n : ui.color.general;
  let placeholder = $clipboard.image ? "🌁 ‣ Long-Press to Show" : "剪贴板无内容";

  let views = [
    {
      type: "view",
      props: {
        bgcolor: ver ? $color("clear") : $rgba(255, 255, 255, 0.28),
        borderColor: ui.rgba(100),
        borderWidth: 0.4
      },
      layout: make => {
        make.top.inset(-0.4);
        make.right.left.inset(-0.2);
        make.height.equalTo(30.4);
      }
    },
    ui.button({
      name: "x",
      tap: () => {
        $("i2clip").text = "";
        $clipboard.clear();
        ui.toast({ text: "剪贴板已清空", inset: 7 });
        $device.taptic(0);
      },
      long: () => builder.delTextItems(),
      layout
    }),
    ui.button({
      name: "share",
      tap: () => {
        $device.taptic(0);
        if ($("i2clip").text !== undefined && $("i2clip").text != "")
          $share.sheet($("i2clip").text);
        else ui.blink($("i2clip"));
      },
      long: () => {
        let items = dataManager.getTextItems();
        if (items == "") {
          ui.toast({ text: "记录列表为空", inset: 7 });
          $device.taptic(0);
        } else $share.sheet(items.join("\n"));
      },
      layout
    }),
    ui.button({
      name: "cloud",
      tap: () => {
        $device.taptic(0);
        createSyncView();
      },
      long: () => {
        $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name));
      },
      layout
    }),
    ui.button({
      name: "trans",
      tap: () => {
        $device.taptic(0);
        let ptext = $("i2clip").text || "";
        if (ptext.length > 0) {
          let translator = require("./translator");
          translator.gtrans(ptext);
        } else ui.blink($("i2clip"));
        $("i2clip").blur();
      },
      long: () => {
        let ptext = $("i2clip").text,
          dic = require("./dictionary");
        dic.dic(ptext);
        $("i2clip").blur();
      },
      layout
    }),
    ui.button({
      name: "search",
      tap: () => {
        $device.taptic(0);
        let t = $("i2clip").text;
        if (t == "") ui.blink($("i2clip"));
        else {
          let widgetPreview = require("./preview");
          widgetPreview.show(t);
          $("i2clip").blur();
        }
      },
      long: () => {
        $device.taptic(0);
        let t = $("i2clip").text;
        if (t == "") ui.blink($("i2clip"));
        else if ($detector.link(t) != "") $app.openURL($detector.link(t)[0]);
        else if ($detector.phoneNumber(t) != "")
          $app.openURL("tel:" + $detector.phoneNumber(t));
        else if (t) {
          const urls = [
            "x-web-search://?",
            "https://www.google.com/search?q=",
            "http://cn.bing.com/search?q=",
            "https://m.baidu.com/s?word="
          ];
          $app.openURL(urls[_prefs[1]] + encodeURIComponent(t));
        }
      },
      layout
    }),
    {
      type: "input",
      props: {
        darkKeyboard: $device.isDarkMode ? true : false,
        borderWidth: 1.0 / $device.info.screen.scale,
        borderColor: ui.color.border,
        text,
        textColor,
        placeholder,
        font: $font(_prefs[2]),
        bgcolor: ui.rgba(100),
        align: $align.left,
        id: "i2clip",
        radius: 10
      },
      layout: (make, view) => {
        make.top.inset(1);
        make.left.inset(8);
        make.height.equalTo(24.4);
        make.right.equalTo(view.prev.left).offset(-8);
      },
      events: {
        longPressed: sender => {
          $device.taptic(0);
          if (sender.sender.placeholder == "🌁 ‣ Long-Press to Show") {
            showImage($clipboard.image);
          } else {
            $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&from=1&clipindex=" + ($clipboard.text ? "0" : "-1"));
          }
        },
        ready: view => ui.placeholderTextColor(view),
        returned: sender => saveInput(sender),
        changed: sender => saveInput(sender)// $input 方法 Bug
      }
    },
    builder.createClipboardView(),
    createActionView()
  ];
  if (ver) delete views[6].events.returned;
  else delete views[6].events.changed;
  _prefs[4] && views.pop();
  _prefs[5] && views.splice(3, 1);
  $ui.render({ props: { id: "main" }, views: views });
  dataManager.init();
  !_prefs[4] && initActionButtons();
}

function showImage(imageData) {
  let { width, height } = $ui.window.frame;
  let ratio = imageData.image.size.width/imageData.image.size.height;
  env == 1 && ($widget.height = width);
  let view = {
    type: "blur",
    props: {
      id: "bg",
      alpha: 0,
      style: dark ? 3 : 1
    },
    layout: (make, view) => {
      ui.shadow(view, "black");
      if (env == 1) {
        view.borderWidth = borderWidth;
        view.borderColor = ui.color.border;
        view.radius = 8;
        make.bottom.left.right.inset(4);
        make.top.inset(0);
      } else make.edges.equalTo(view.super);
    },
    views: [
      {
        type: "image",
        props: {
          bgcolor: $color("white"),
          image: imageData.image.jpg(0.5).image
        },
        layout: (make, view) => {
          make.size.equalTo($size($widget.height*ratio, $widget.height));
          make.center.equalTo(view.super);
        },
        events: {
          tapped: () => {
            $device.taptic(0);
            $widget.height = 180;
            ui.appear(0, "itemlist");
          },
          doubleTapped: () => {
            $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&from=1&clipindex=" + ($clipboard.text ? "0" : "-1"));
          },
          longPressed: () => {
            $device.taptic(1);
            $photo.save({
              data: imageData,
              handler: success =>
                success && ui.toast({ text: "已保存至相册" })
            });
          }
        }
      }
    ]
  };
  $ui.window.add(view);
  ui.appear(1, "itemlist");
}

function saveInput(sender) {
  let text = sender.text;
  if (!text) return;
  let items = dataManager.getTextItems();
  $clipboard.set({ type: "public.plain-text", value: text });
  if (items.indexOf(text) == -1 && text.length > 0) {
    $("itemlist").insert({
      index: 0,
      value: { itemtext: { text: text } }
    });
    items.unshift(text);
    items = [...new Set(items)];
    dataManager.saveTextItems(items);
  } else return;
}

function createActionView() {
  return {
    type: "scroll",
    props: {
      id: "actionview",
      bgcolor: ver ? $color("clear") : ui.rgba(255, 0.28),
      pagingEnabled: _prefs[0][0],
      scrollEnabled: _prefs[0][1],
      alwaysBounceVertical: 0,
      showsHorizontalIndicator: 0,
      showsVerticalIndicator: 0
    },
    layout: make => {
      make.left.right.bottom.inset(0);
      make.height.equalTo(30.2);
    }
  };
}

function initActionButtons() {
  let actionView = $("actionview"),
    actions = $cache.get("actions")[0],
    multiplyRatio = 1.0 / Math.min(actions.length, _prefs[3]),
    contentWidth = 0;
  actionView.relayout();
  for (let idx = 0; idx < actions.length; ++idx) {
    let action = actions[idx],
      button = {
        type: "button",
        props: {
          bgcolor: $color("clear"),
          icon: $icon(action.icon, $color(COLOR), $size(18, 18)),
          info: { pattern: action.pattern, noenc: action.noenc }
        },
        layout: (make, view) => {
          if (view.prev) make.left.equalTo(view.prev.right);
          else make.left.equalTo(0);
          make.top.inset(0);
          make.height.equalTo(30);
          make.width.equalTo(view.super).multipliedBy(multiplyRatio);
          contentWidth =
            (actionView.frame.width - 16) * multiplyRatio * actions.length;
        },
        events: {
          tapped(sender) {
            $device.taptic(1);
            helper.runAction(sender.info);
          },
          longPressed(sender) {
            $device.taptic(2);
            helper.runLongAction(sender.sender.info);
          },
        }
      };
    actionView.add(button);
  }
  actionView.contentSize = $size(contentWidth, 30);
}

function createSyncView() {
  $ui.window.add({
    type: "view",
    props: { id: "bg" },
    layout: $layout.fill,
    events: {
      tapped: sender => {
        if ($("modeMenu")) menuAnimate($("modeMenu"));
        if ($("manuallyMenu")) menuAnimate($("manuallyMenu"));
        sender.remove();
      }
    }
  });
  $ui.window.add(_sync == 1 ? manuallySyncMenu() : syncMenu());
  menuAnimate(_sync == 1 ? $("manuallyMenu") : $("modeMenu"));
}

function manuallySyncMenu() {
  let syncMenuList = [
    "查看本地记录",
    "查看云端记录",
    "同步云端记录至本地",
    "同步本地记录至云端",
    "更改同步模式"
  ];
  syncMenuList.splice(_list, 1);
  return {
    type: "list",
    props: menuProps("manuallyMenu", syncMenuList),
    layout: make => {
      make.right.inset(8);
      make.top.inset(30);
      make.height.equalTo(120);
      make.width.equalTo(138);
    },
    events: {
      didSelect: (sender, indexPath) => {
        $device.taptic(0);
        let idx = indexPath.row;
        if (idx == 0) {
          _list = Number(!_list);
          $cache.set("list", _list);
          dataManager.init();
          ui.toast({ text: `已显示${_list ? "云端" : "本地"}记录`, inset: 7 });
          $("bg").remove();
        } else if (idx == 3) {
          $ui.window.add(syncMenu());
          menuAnimate($("modeMenu"));
        } else {
          let x = idx - 1;
          let data = dataManager.mergeData();
          dataManager.setTextItems(data, x);
          if (_list == x) dataManager.init();
          ui.toast({ text: `已同步至${x ? "云端" : "本地"}`, inset: 7 });
          $("bg").remove();
        }
        menuAnimate(sender);
      }
    }
  };
}

function syncMenu() {
  return {
    type: "list",
    props: menuProps(
      "modeMenu",
      ["关闭", "手动", "自动"].map((i, j) => {
        return { props: { text: i, accessoryType: _sync == j ? 3 : 0 } };
      })
    ),
    layout: make => {
      make.top.right.inset(30);
      make.width.equalTo(104);
      make.height.equalTo(90);
    },
    events: {
      didSelect: (sender, indexPath) => {
        $device.taptic(0);
        let i = indexPath.row;
        if (i != _sync) {
          _sync = i;
          $cache.set("sync", i);
          if (_sync !== 0) {
            let path = "drive://XPin/text-items.json";
            if (!$file.exists(path)) {
              $file.mkdir("drive://XPin/");
              $file.write({
                data: $data({ string: JSON.stringify([]) }),
                path: path
              });
            }
          }
          i == 0 && $cache.set("list", 0) && (_list = 0);
          dataManager.init();
          let toast =
            i == 0 ? "已关闭同步功能" : `已变更为${i == 1 ? "手" : "自"}动同步`;
          ui.toast({ text: toast, inset: 7 });
        }
        menuAnimate($("bg"));
        menuAnimate($("modeMenu"));
      }
    }
  };
}

function menuProps(id, data) {
  return {
    bgcolor: dark ? ui.rgba(200, 0.8) : ui.rgba(255, 0.8),
    borderWidth: 1.0 / $device.info.screen.scale,
    borderColor: ui.color.border,
    separatorColor: ui.rgba(100),
    showsVerticalIndicator: 0,
    rowHeight: 30,
    data: data,
    radius: 10,
    hidden: 1,
    alpha: 0,
    id: id,
    template: {
      props: {
        textColor: $color("black"),
        font: $font(_prefs[2]),
        align: $align.left
      }
    }
  };
}

function menuAnimate(view) {
  if (!view.hidden) {
    $ui.animate({
      duration: 0.4,
      animation: () => (view.alpha = 0),
      completion: () => view.remove()
    });
  } else {
    view.hidden = 0;
    $ui.animate({
      duration: 0.4,
      animation: () => (view.alpha = 1)
    });
  }
}

module.exports = { init: init };
