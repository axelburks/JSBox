let _sync = $cache.get("sync");
let _list = $cache.get("list");

let dataManager = require("./data-manager"),
  builder = require("./builder"),
  setting = require("./setting"),
  ui = require("./ui");

const bgcolor = $color("clear");
const dark = Number($device.isDarkMode);
const COLOR = $cache.get(dark ? "dark" : "color");

function activeMenu(i) {
  let viewId = $("main").views.find(x => x.hidden == 0).id;
  let tappedId = ["itemlist", "actionlist", "settings"][i];
  if (tappedId != viewId) {
    $(viewId).hidden = 1;
    $(tappedId).hidden = 0;
  }
}

function init(context) {
  let topColunm = {
    type: "blur",
    props: { style: [1, 3][dark], bgcolor },
    layout: (make, view) => {
      make.top.left.right.inset(0);
      make.bottom.equalTo(view.super.safeAreaTop).offset(44);
    },
    views: [
      {
        type: "tab",
        props: {
          id: "tabview",
          index: _list,
          enabled: Boolean(_sync),
          tintColor: $color(COLOR), //iOS 12
          items: ["本地", "iCloud"]
        },
        layout: (make, view) => {
          make.centerX.equalTo(view.super);
          make.centerY.equalTo(view.super.safeArea).offset(-0.2);
          make.height.equalTo(28);
        },
        events: {
          ready(sender) {
            $delay(0, () => {
              for (let i of sender.views) {
                if (i.views.length > 0) i.views[0].textColor = $color(COLOR);
              }
            });
          },
          changed(sender) {
            if (_sync == 1) {
              $cache.set("list", sender.index);
              _list = sender.index;
              dataManager.init();
            }
          }
        }
      },
      {
        type: "label",
        props: {
          id: "title",
          font: $font("Lato-Medium", 18),
          textColor: ui.color.title
        },
        layout: (make, view) => {
          make.centerY.equalTo(view.super.safeAreaCenterY).offset(-0.2);
          make.centerX.equalTo(view.super);
        }
      },
      {
        type: "button",
        props: {
          bgcolor,
          title: "＋",
          id: "create",
          font: $font(30),
          titleColor: $color(COLOR)
        },
        layout: (make, view) => {
          make.right.inset(15);
          make.centerY.equalTo(view.prev);
        },
        events: {
          tapped(sender) {
            $("actionlist").hidden == 1
              ? addNewItem()
              : $ui
                  .menu(["新建底栏动作", "新建预览动作"])
                  .then(resp => resp && createNewActionItem(resp.index));
          },
          longPressed(sender) {
            $("actionlist").hidden == 1
              ? addNewItem($clipboard.text, true)
              : $ui
                  .menu(["新建底栏动作", "新建预览动作"])
                  .then(resp => resp && createNewActionItem(resp.index));
          }
        }
      },
      {
        type: "label",
        props: { bgcolor: ui.rgba(200, 0.8) },
        layout: (make, view) => {
          let inset = 1.0 / $device.info.screen.scale;
          make.bottom.equalTo(view.super);
          make.height.equalTo(inset);
          make.left.right.inset(0);
        }
      }
    ]
  };

  let bottomColunm = {
    type: "blur",
    props: { style: [1, 3][dark], bgcolor },
    layout: (make, view) => {
      make.top.equalTo(view.super.safeAreaBottom).offset(-50);
      make.left.right.bottom.inset(0);
    },
    views: [
      {
        type: "matrix",
        props: {
          bgcolor,
          columns: 3,
          id: "bottomtab",
          itemHeight: 50,
          spacing: 0,
          scrollEnabled: 0,
          template: [
            {
              type: "image",
              props: {
                bgcolor,
                id: "tabImage",
                tintColor: $color("#a2a2a2")
              },
              layout: (make, view) => {
                make.centerX.equalTo(view.super);
                make.size.equalTo($size(72, 72));
                make.width.height.equalTo(25);
                make.top.inset(7);
              }
            },
            {
              type: "label",
              props: {
                id: "tabName",
                font: $font(10),
                textColor: $color("#A2A2A2")
              },
              layout: (make, view) => {
                make.centerX.equalTo(view.prev);
                make.bottom.inset(5);
              }
            }
          ],
          data: [
            {
              tabImage: {
                image: ui.image("pin"),
                tintColor: $color(COLOR)
              },
              tabName: { text: "Pin", textColor: $color(COLOR) }
            },
            {
              tabImage: { icon: $icon("055", $color("#A2A2A2")) },
              tabName: { text: "动作" }
            },
            {
              tabImage: { icon: $icon("002", $color("#A2A2A2")) },
              tabName: { text: "设置" }
            }
          ]
        },
        layout: $layout.fill,
        events: {
          didSelect(sender, indexPath) {
            let i = indexPath.row;
            [0, 1, 2].forEach(x => {
              let view = sender.cell($indexPath(0, x));
              let color = x === i ? $color(COLOR) : $color("#A2A2A2");
              view.get("tabImage").tintColor = color;
              view.get("tabName").textColor = color;
            });
            $("title").hidden = i === 0;
            $("tabview").hidden = i !== 0;
            $("create").hidden = i === 2;
            $("searchInput").hidden = i > 0;
            $("title").text = i === 2 ? "设置" : "动作";
            activeMenu(i);
          }
        }
      },
      {
        type: "label",
        props: { bgcolor: ui.rgba(200, 0.8) },
        layout: (make, view) => {
          let inset = 1.0 / $device.info.screen.scale;
          make.top.equalTo(view.super);
          make.height.equalTo(inset);
          make.left.right.inset(0);
        }
      }
    ]
  };

  let searchInputview = {
    type: "input",
    props: {
      id: "searchInput",
      type: $kbType.search,
      darkKeyboard: true,
      align: $align.center,
      clearsOnBeginEditing: true,
      bgcolor: $color("lightGray"),
      placeholder: "Search"
    },
    layout: (make, view) => {
      make.top.equalTo($("create").bottom).inset(4);
      make.height.equalTo(30);
      make.left.right.inset(5);
    },
    events: {
      didBeginEditing: function (sender) {
        let all_items = dataManager.getTextItems();
        if ($("itemlist").data.length != all_items.length) {
          updateItem(all_items);
        }
      },
      returned: function (sender) {
        if (sender.text) {
          sender.blur();
          searchItem(sender.text);
        } else {
          sender.blur();
          let all_items = dataManager.getTextItems();
          updateItem(all_items);
        }
      }
    }
  }

  dark && topColunm.views.pop();
  dark && bottomColunm.views.pop();
  
  $ui.render({
    props: {
      id: "main",
      navBarHidden: 1,
      statusBarStyle: dark,
      bgcolor: dark ? $color("black") : $color("white")
    },
    views: [
      builder.createActionView(),
      setting.show(),
      builder.createClipboardView(),
      topColunm,
      searchInputview,
      bottomColunm
    ]
  });
  dataManager.init();
  if (context && $context.query.clipindex) {
    addNewItem($context.query.clipindex >= 0 ? $("itemlist").data[$context.query.clipindex].itemtext.text : "", true)
  }
}

function addNewItem(text, show) {
  let editor = require("./editor");
  editor.showEditor(text, show);
}

function createNewActionItem(i) {
  let creator = require("./action-creator");
  creator.create(action => {
    let items = $cache.get("actions");
    items[i].unshift(action);
    $("actionlist").insert({
      indexPath: $indexPath(i, 0),
      value: builder.createActionItem(action, i)
    });
    $cache.set("actions", items);
    builder.reloadActionItems();
  }, i);
}

function updateItem(data) {
  if (data.length == 0) {
    $("itemlist").data = [];
    $ui.alert({
      title: "Error",
      message: $l10n("NO_MATCH_ITEM"),
    });
  } else {
    $("itemlist").data = [];
    let tmp = data.map(i => {
      let flag = i.indexOf("\n") >= 0;
      return { itemtext: {
        text: i,
        textColor: flag? ui.color.general_n:ui.color.general
      } };
    });
    $("itemlist").data = tmp;
  }
  
}

function searchItem(query) {
  function isContain(element) {
    try {
      let rex = RegExp(query,"im");
      return rex.test(element);
    } catch (error) {
      $ui.toast("Not Regex, Try As String", 1);
      return element.indexOf(query) > -1 ? true : false;
    }
  }
  let all_items = dataManager.getTextItems();
  let result = all_items.filter(isContain);
  updateItem(result);
}

module.exports = { init: init };
