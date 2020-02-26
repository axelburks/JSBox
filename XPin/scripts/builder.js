let dataManager = require("./data-manager"),
  aparter = require("./apart-items"),
  editor = require("./editor"),
  helper = require("./helper"),
  ui = require("./ui");

let _sync = $cache.get("sync");
let _list = $cache.get("list");
let _prefs = $cache.get("today") || [[0, 1], 0, 12, 9, 0, 0];
let actions = $cache.get("actions");

const textColor = ui.color.general;
const dark = Number($device.isDarkMode);
const env = $app.env.toString().slice(0, 1) - 1;
const borderWidth = 1.0 / $device.info.screen.scale;
const ver = parseInt($device.info.version.split(".")[0]) - 12;

const saveTextItemsFromList = () => {
  let data = $("itemlist").data;
  data = data.map(i => i.itemtext.text);
  dataManager.saveTextItems(data);
};

const delTextItems = () => {
  let menu = ["清空本地记录", "清空云端记录", "清空所有记录"];
  $ui.menu({
    items: _sync === 1 ? menu : menu.splice(2, 1),
    handler: (item, idx) => {
      $clipboard.clear();
      ui.toast({ text: "已清空" });
      $device.taptic(2);
      idx == 0 && _list == 0 && ($("itemlist").data = []);
      idx == 1 && _list == 1 && ($("itemlist").data = []);
      idx == 2 && ($("itemlist").data = []);
      idx != 1 && dataManager.setTextItems([], 0);
      idx != 0 && dataManager.setTextItems([], 1);
      env == 1 && ($("i2clip").text = "");
    }
  });
};

const listInsets = (h = 50) => {
  if (!env)
    return {
      indicatorInsets: $insets(44, 0, 50, 0),
      header: {
        type: "view",
        props: { height: 30, bgcolor: $color("clear") }
      },
      footer: {
        type: "view",
        props: { height: h, bgcolor: $color("clear") }
      }
    };
};

function createClipboardView() {
  let kbSendButton = env != 2 ? {} : {
    type: "button",
    props: { bgcolor: $color("clear") },
    layout: (make, view) => {
      make.left.top.bottom.inset(0);
      make.width.equalTo(view.super).dividedBy(6);
    },
    events: {
      tapped: sender => {
        $device.taptic(0);
        let text = sender.super.views[0].text;
        $keyboard.insert(text);
      }
    }
  };

  let view = {
    type: "list",
    props: {
      reorder: 1,
      id: "itemlist",
      ...listInsets(),
      showsVerticalIndicator: 1,
      rowHeight: [44, 30, 36][env],
      separatorColor: ui.color.separator,
      bgcolor: ver && env == 1 ? ui.rgba(80) : $color("clear"),
      template: {
        props: { bgcolor: $color("clear") },
        views: [
          {
            type: "label",
            props: {
              textColor,
              id: "itemtext",
              align: $align.left,
              font: $font(env == 1 ? _prefs[2] : 14)
            },
            layout: (make, view) => {
              make.right.inset(0);
              make.centerY.equalTo(view.super);
              make.left.right.inset(16);
            }
          },
          {
            type: "button",
            props: { bgcolor: $color("clear") },
            layout: (make, view) => {
              make.right.top.bottom.inset(0);
              make.width.equalTo(view.super).dividedBy(6);
            },
            events: {
              tapped: sender => {
                $device.taptic(0);
                let text = sender.super.views[0].text;
                if (env == 2) editor.showEditor(text, true);
                else {
                  let cell = sender.super.super;
                  let view = $("itemlist").ocValue();
                  let indexPath = view
                    .invoke("indexPathForCell", cell)
                    .jsValue();
                  itemPreview(indexPath, text);
                }
              }
            }
          },
          kbSendButton
        ]
      },
      actions: [
        {
          title: "delete", //不用写 sender.delete(object)
          handler: (sender, indexPath) => {
            let items = dataManager.getTextItems();
            if (items[indexPath.row] == $clipboard.text) {
              $clipboard.clear();
              env == 1 && ($("i2clip").text = "");
            }
            saveTextItemsFromList();
          }
        },
        {
          title: "编辑",
          color: $color("#009999"),
          handler: (sender, indexPath) => {
            let text = sender.object(indexPath).itemtext.text;
            if (env == 1) {
              $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&from=" + env + "&clipindex=" + indexPath.row);
            } else {
              editor.showEditor(text, true);
            }
          }
        },
        {
          title: "同步",
          color: $color("#F39B36"),
          handler: (sender, indexPath) => {
            let text = sender.object(indexPath).itemtext.text;
            if (_sync == 0)
              ui.toast({ text: "同步已关闭", inset: 7, icon: "009" });
            else if (_sync == 2)
              ui.toast({ text: "已自动同步", inset: 7, icon: "009" });
            else {
              let items = dataManager.getTextItems(!_list);
              items.unshift(text);
              items = [...new Set(items)];
              dataManager.setTextItems(items, !_list);
              let toast = `已${_list ? "下载" : "上传"}`;
              ui.toast({ text: toast, inset: 7 });
            }
          }
        },
        {
          title: "分词",
          color: $color("#4B94F4"),
          handler: (sender, indexPath) =>
            aparter.apart(sender.object(indexPath).itemtext.text)
        }
      ]
    },
    layout: (make, view) => {
      make.left.right.inset(0);
      if (env == 1) {
        make.top.inset(30);
        make.bottom.inset(_prefs[4] ? 0 : 30);
      } else if (env == 2) make.top.inset(40) && make.bottom.inset(4);
      else {
        make.top.equalTo(view.super.safeArea).inset(50);
        make.bottom.equalTo(view.super.safeArea);
      }
    },
    events: {
      didSelect: (sender, indexPath, data) => {
        $device.taptic(1);
        let text = data.itemtext.text;
        $clipboard.text = text;
        let flag = text.indexOf("\n") >= 0;
        env != 1 && ui.toast({ text: "Copied Success" });
        env == 1 && ($("i2clip").text = text) && ($("i2clip").textColor = flag? ui.color.general_n:ui.color.general) && ($("i2clip").placeholder = "剪贴板无内容");
      },
      pulled: sender => {
        sender.endRefreshing();
        $delay(0.4, () => refreshList());
      },
      reorderFinished: () => saveTextItemsFromList(),
      didEndDragging: sender => sender.contentOffset.y < -100 && refreshList()
    }
  };
  if (!env) delete view.events.pulled;
  //header 的存在会导致 pulled 动画被遮挡
  else delete view.events.didEndDragging;
  return view;
}

function editAction(action, indexPath) {
  let creator = require("./action-creator");
  creator.edit(
    action,
    action => {
      actions[indexPath.section][indexPath.row] = action;
      $("actionlist").data = mapActionItems();
      $cache.set("actions", actions);
    },
    indexPath.section
  );
}

const reloadActionItems = () => (actions = $cache.get("actions"));

function createActionView() {
  return {
    type: "list",
    props: {
      separatorColor: ui.color.separator,
      bgcolor: ui.color.cellbg,
      ...listInsets(80),
      id: "actionlist",
      crossSections: 0,
      reorder: 1,
      hidden: 1,
      actions: [
        {
          title: "delete",
          handler: (sender, indexPath) => {
            actions[indexPath.section].splice(indexPath.row, 1);
            $cache.set("actions", actions);
          }
        },
        {
          title: "启动",
          color: $color("#4B94F4"),
          handler: (sender, indexPath) =>
            helper.runAction(actions[indexPath.section][indexPath.row])
        }
      ],
      template: {
        props: { bgcolor: ui.color.cell },
        views: [
          {
            type: "label",
            props: { id: "actionname", textColor },
            layout: (make, view) => {
              make.centerY.equalTo(view.super);
              make.left.inset(15);
            }
          },
          {
            type: "label",
            props: {
              id: "actionpattern",
              font: $font(12),
              align: $align.right,
              textColor: $color("#a2a2a2")
            },
            layout: (make, view) => {
              make.width.equalTo(view.super).multipliedBy(0.5);
              make.centerY.equalTo(view.super);
              make.right.inset(15);
            }
          },
          {
            type: "image",
            props: {
              id: "actionicon",
              bgcolor: $color("clear")
            },
            layout: (make, view) => {
              make.centerY.equalTo(view.super);
              make.right.inset(20);
              make.size.equalTo($size(20, 20));
            }
          }
        ]
      },
      data: mapActionItems()
    },
    layout: $layout.fillSafeArea,
    events: {
      didSelect: (sender, indexPath) => {
        let action = actions[indexPath.section][indexPath.row];
        editAction(action, indexPath);
      },
      reorderMoved: (fromIndexPath, toIndexPath) => {
        let sec = fromIndexPath.section;
        actions[sec].splice(
          toIndexPath.row,
          0,
          actions[sec].splice(fromIndexPath.row, 1)[0]
        );
      },
      reorderFinished: () => $cache.set("actions", actions)
    }
  };
}

function createActionItem(item, i = 0) {
  if (i == 0) {
    let icon = $icon(item.icon, $color($cache.get(dark ? "dark" : "color")));
    return {
      actionname: { text: item.name },
      actionpattern: { text: "" },
      actionicon: { icon }
    };
  } else
    return {
      actionicon: { icon: null },
      actionname: { text: item.name },
      actionpattern: { text: item.pattern }
    };
}

function mapActionItems() {
  let scrollAction = actions[0].map(item => {
    return createActionItem(item);
  });
  let previewAction = actions[1].map(item => {
    return createActionItem(item, 1);
  });
  return [
    { title: "底栏动作", rows: scrollAction },
    { title: "预览动作", rows: previewAction }
  ];
}

function createPushView(title, button) {
  let views = [
    {
      type: "label",
      props: {
        textColor,
        text: title,
        font: $font("Lato-Medium", 18)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super.bottom).offset(-22);
        make.centerX.equalTo(view.super);
      }
    },
    ui.button({
      name: "arrowl",
      layout: (make, view) => {
        make.left.inset(10);
        make.centerY.equalTo(view.prev);
        make.size.equalTo($size(22, 22));
        $delay(0, () => (view.views[0].contentMode = 1));
      },
      tap: () => $ui.pop()
    }),
    {
      type: "label",
      props: { bgcolor: ui.rgba(200, 0.8) },
      layout: (make, view) => {
        make.bottom.equalTo(view.super);
        make.height.equalTo(borderWidth);
        make.left.right.inset(0);
      }
    }
  ];
  button && views.splice(2, 0, button);
  dark && views.pop();
  return {
    type: "blur",
    props: { style: [1, 3][dark], bgcolor: $color("clear") },
    layout: (make, view) => {
      make.top.left.right.inset(0);
      make.bottom.equalTo(view.super.safeAreaTop).offset(44);
    },
    views: views
  };
}

function refreshList() {
  dataManager.init("RefreshList");
  if (env == 1) (($("i2clip").text = $clipboard.text) && ($("i2clip").textColor = $clipboard.text.indexOf("\n") >= 0 ? ui.color.general_n:ui.color.general)) || ($("i2clip").text = "");
  let t = dataManager.getTextItems();
  let total = `已记录 ${t.length} 条`;
  ui.toast({ text: total, inset: 7 });
}

function pushViewListLayout() {
  return (make, view) => {
    make.left.right.inset(0);
    make.top.equalTo(view.super.safeAreaTop).offset(44);
    make.bottom.equalTo(view.super.safeAreaBottom);
  };
}

function itemPreview(indexPath, text) {
  let { width, height } = $ui.window.frame;
  let size = $text.sizeThatFits({ text, width: width * 0.9, font: $font(14) });
  let textHeight = Math.min(size.height + 8, height);
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
    events: {
      tapped(sender) {
        $device.taptic(0);
        ui.appear(0, "itemlist");
      },
      longPressed: () => {
        $device.taptic(0);
        let image = $qrcode.encode(text);
        env == 1 && ($widget.height = width);
        $("bg").add({
          type: "image",
          props: {
            bgcolor: $color("white"),
            image: image
          },
          layout: (make, view) => {
            make.size.equalTo($size(width - 6, width - 6));
            make.center.equalTo(view.super);
          },
          events: {
            tapped(sender) {
              $device.taptic(0);
              $widget.height = 180;
              ui.appear(0, "itemlist");
            },
            longPressed: () => {
              $device.taptic(1);
              $photo.save({
                image: image,
                handler: success =>
                  success && ui.toast({ text: "已保存至相册" })
              });
            }
          }
        });
        ui.guide(1, "长按即可保存二维码");
      },
      doubleTapped: () => {
        $input.text({
          text,
          handler: t => {
            let label = $("itemlist")
              .cell(indexPath)
              .get("itemtext");
            if (t && t != label.text) {
              let items = dataManager.getTextItems();
              if (items.includes(t))
                ui.toast({ text: "列表已存在", icon: "225" });
              else {
                if ($clipboard.text == label.text) {
                  $clipboard.text = t;
                  $env == 1 && ($("i2clip").text = t);
                }
                label.text = t;
                items[indexPath.row] = t;
                dataManager.saveTextItems(items);
                ui.toast({text: "已保存"})
                $device.taptic(0);
                ui.appear(0, "itemlist");
              }
            }
          }
        });
      }
    },
    views: [
      {
        type: "scroll",
        props: {
          bgcolor: $color("clear"),
          showsVerticalIndicator: 0,
          scrollEnabled: size.height > textHeight
        },
        layout: (make, view) => {
          make.height.equalTo(textHeight);
          make.width.equalTo(view.super).multipliedBy(0.96);
          make.center.equalTo(view.super);
          $delay(0.0, () => (view.contentSize = $size(0, size.height + 8)));
        },
        views: [
          {
            type: "label",
            props: {
              align: $align.left,
              textColor: ui.color.general,
              bgcolor: $color("clear"),
              font: $font(14),
              lines: 0,
              text
            },
            layout: (make, view) => {
              make.height.equalTo(size.height + 8);
              make.width.equalTo(view.super);
              make.top.inset(0);
            }
          }
        ]
      }
    ]
  };
  $ui.window.add(view);
  ui.appear(1, "itemlist");
  ui.guide(0, "双击文本编辑，长按查看二维码");
}

module.exports = {
  createClipboardView: createClipboardView,
  createActionView: createActionView,
  createPushView: createPushView,
  refreshList: refreshList,
  delTextItems: delTextItems,
  createActionItem: createActionItem,
  reloadActionItems: reloadActionItems,
  pushViewListLayout: pushViewListLayout
};
