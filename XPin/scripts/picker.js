let builder = require("./builder");
let ui = require("./ui");

const propsAndLayout = {
  props: {
    navBarHidden: 1,
    bgcolor: ui.color.cellbg,
    statusBarStyle: $device.isDarkMode
  },
  layout: $layout.fill
};
const listProps = {
  clipsToBounds: 0,
  bgcolor: $color("clear"),
  separatorColor: ui.color.separator
};
const template = (x = 0) => {
  return {
    props: {
      bgcolor: x ? $color("clear") : ui.color.cell,
      textColor: ui.color.general,
      align: $align.left
    }
  };
};

function iconLibrary(completionHandler) {
  if (typeof $ui.selectIcon === "function") {
    $ui.selectIcon().then(completionHandler);
    return;
  }
}

function jsList(completionHandler) {
  let addins = $addin.list;
  $ui.push({
    ...propsAndLayout,
    views: [
      {
        type: "list",
        props: {
          ...listProps,
          template: template(1),
          data: addins.map(item => item.displayName)
        },
        layout: builder.pushViewListLayout(),
        events: {
          didSelect: (sender, indexPath) => {
            let addin = addins[indexPath.row];
            completionHandler(
              addin.displayName,
              "jsbox://run?name=" + encodeURIComponent(addin.displayName)
            );
            $ui.pop();
          }
        }
      },
      builder.createPushView("JSBox 脚本")
    ]
  });
}

function actionList(completionHandler, i) {
  let actions = JSON.parse($file.read("assets/actions.json").string);
  i && actions.splice(0,5);
  $ui.push({
    ...propsAndLayout,
    views: [
      {
        type: "list",
        props: {
          ...listProps,
          template: template(),
          data: actions.map(item => {
            return {
              title: item.name,
              rows: item.items.map(item => {
                return item.name;
              })
            };
          })
        },
        layout: builder.pushViewListLayout(),
        events: {
          didSelect: (sender, indexPath) => {
            let action = actions[indexPath.section]["items"][indexPath.row];
            completionHandler(action.name, action.pattern);
            $ui.pop();
          }
        }
      },
      builder.createPushView("动作列表")
    ]
  });
}

let _image = $objc("UIImage").invoke("imageNamed", "AppIcon60x60"),
  _text = $objc("NSString").invoke("stringWithString", "text"),
  _url = $objc("NSURL").invoke("URLWithString", "https://apple.com");

let list = $objc("NSMutableArray").invoke("alloc.init");
list.invoke("addObject", _image);
list.invoke("addObject", _text);
list.invoke("addObject", _url);

let activities = $objc("UIApplicationExtensionActivity").invoke(
    "_applicationExtensionActivitiesForItems",
    list
  ),
  count = activities.invoke("count"),
  items = [];

for (let idx = 0; idx < count; ++idx) {
  let activity = activities.invoke("objectAtIndex", idx),
    name = activity.invoke("activityTitle").rawValue(),
    type = activity.invoke("activityType").rawValue(),
    image = activity.invoke("_activityImage").rawValue();
  items.push({
    name: name,
    type: type,
    image: image
  });
}

function extensionList(completionHandler) {
  $ui.push({
    ...propsAndLayout,
    views: [
      {
        type: "list",
        props: {
          rowHeight: 64,
          ...listProps,
          template: {
            props: { bgcolor: $color("clear") },
            views: [
              {
                type: "image",
                props: {
                  id: "image",
                  bgcolor: $color("clear")
                },
                layout: (make, view) => {
                  make.left.top.bottom.inset(10);
                  make.width.equalTo(view.height);
                }
              },
              {
                type: "label",
                props: {
                  id: "picker-name-label",
                  font: $font("bold", 18),
                  textColor: ui.color.general
                },
                layout: (make, view) => {
                  make.left.equalTo(view.prev.right).offset(10);
                  make.top.equalTo(view.prev);
                }
              },
              {
                type: "label",
                props: {
                  id: "picker-id-label",
                  textColor: ui.color.general
                },
                layout: (make, view) => {
                  make.left.equalTo(view.prev);
                  make.top.equalTo(view.prev.bottom);
                  make.right.inset(10);
                }
              }
            ]
          },
          data: items.map(item => {
            let props = {
              "picker-name-label": { text: item.name },
              "picker-id-label": { text: item.type }
            };
            if (item.image.size) props["image"] = { image: item.image };
            return props;
          })
        },
        layout: builder.pushViewListLayout(),
        events: {
          didSelect: (sender, indexPath) => {
            let item = items[indexPath.row],
              name = item.name,
              type = item.type,
              scheme = "compose://?id=" + type;
            completionHandler(name, scheme);
            $ui.pop();
          }
        }
      },
      builder.createPushView("分享扩展")
    ]
  });
}

module.exports = {
  iconLibrary: iconLibrary,
  jsList: jsList,
  actionList: actionList,
  extensionList: extensionList
};
