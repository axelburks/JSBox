let ui = require("./ui"),
  picker = require("./picker"),
  builder = require("./builder");

const bgcolor = ui.color.cell;
const textColor = ui.color.general;
const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

let iconCell = {
  type: "view",
  props: { bgcolor },
  layout: $layout.fill,
  views: [
    {
      type: "label",
      props: { text: "动作图标", textColor },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.equalTo(15);
      }
    },
    {
      type: "image",
      props: {
        id: "icon-image",
        bgcolor: $color("clear")
      },
      layout: (make, view) => {
        make.size.equalTo($size(20, 20));
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      }
    }
  ]
};

let encodeCell = {
  type: "view",
  props: { bgcolor },
  layout: $layout.fill,
  views: [
    {
      type: "label",
      props: { text: "不进行 URL 编码", textColor },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.equalTo(15);
      }
    },
    {
      type: "switch",
      props: {
        id: "encode-switch",
        onColor: $color(COLOR)
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.inset(15);
      }
    },
    {
      type: "button",
      props: {
        icon: $icon("008", $color(COLOR)),
        bgcolor: $color("clear")
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.right.equalTo(-80);
      },
      events: {
        tapped: () => {
          $ui.alert(
            "在大多数时候我们需要对链接里面的参数进行 URL 编码，但有些应用在解析参数的时候不会进行解码，所以会出现错误，在这种情况下你可以打开这个选项。"
          );
        }
      }
    }
  ]
};

let iconName = "";

const create = (completionHandler, i) => show(i, completionHandler, {});

const edit = (action, completionHandler, i) =>
  show(i, completionHandler, action);

function show(i, completionHandler, action) {
  let nameCell = createLabelCell("动作名称", "name-label");
  let patternCell = createLabelCell("动作模式", "pattern-label");
  let rows = [nameCell, patternCell];
  !i && (rows = rows.concat([iconCell, encodeCell]));

  $ui.push({
    props: {
      navBarHidden: 1,
      bgcolor: ui.color.bg,
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    layout: $layout.fill,
    views: [
      {
        type: "list",
        props: {
          separatorColor: ui.color.separator,
          data: [{ title: " ", rows: rows }],
          bgcolor: ui.color.cellbg,
          clipsToBounds: 0,
          header: {
            type: "view",
            props: { height: 44, bgcolor: $color("clear") }
          }
        },
        layout: $layout.fill,
        events: {
          didSelect: (sender, indexPath) => {
            ui.blink(sender.cell(indexPath));
            if (indexPath.row == 0) setName();
            else if (indexPath.row == 1) showActionMenu(i);
            else if (indexPath.row == 2) showIconMenu();
          }
        }
      },
      {
        type: "button",
        props: {
          title: "完成",
          radius: 10,
          font: $font(19),
          bgcolor: $color(COLOR)
        },
        layout: (make, view) => {
          make.left.right.inset(8);
          make.bottom.equalTo(view.super.safeArea).offset(-8);
          make.height.equalTo(40);
        },
        events: {
          tapped: () => {
            let name = nameLabel().text;
            let pattern = patternLabel().text;
            if (name.length > 0 && pattern.length > 0) {
              if (i) completionHandler({ name, pattern });
              else if (iconName.length > 0) {
                let noenc = encodeSwitch().on;
                completionHandler({ name, pattern, noenc, icon: iconName });
              }
              $ui.pop();
            }
          }
        }
      },
      builder.createPushView("创建动作")
    ]
  });

  nameLabel().text = action["name"] || "";
  patternLabel().text = action["pattern"] || "";

  if (i == 0) {
    iconName = action["icon"] || "";
    encodeSwitch().on = action["noenc"];
    if (iconName.length > 0) iconImage().icon = $icon(iconName, $color(COLOR));
  }
}

const setName = () =>
  $input.text({
    text: nameLabel().text || "",
    handler: text => {
      if (text && text.length > 0) nameLabel().text = text;
    }
  });

function showActionMenu(i) {
  let options = ["自定义动作", "动作列表", "JSBox 脚本", "分享扩展"];
  i && options.splice(2, 2);

  function pickHandler() {
    return (name, scheme) => {
      nameLabel().text = name;
      patternLabel().text = scheme;
    };
  }
  $ui.menu(options).then(selected => {
    if ('index' in selected) {
      let idx = selected.index;
      if (idx == 0) {
        ui.toast({ text: "请用 %@ 代替含有关键字等参数的 URL", time: 2 });
        $input.text({
          type: $kbType.url,
          text: patternLabel().text || "",
          handler: text => {
            if (text && text.length > 0) patternLabel().text = text;
          }
        });
      } else if (idx == 1) picker.actionList(pickHandler(), i);
      else if (idx == 2) picker.jsList(pickHandler());
      else picker.extensionList(pickHandler());
    }
  });
}

function createLabelCell(name, identifier) {
  return {
    type: "view",
    props: { bgcolor: ui.color.cell },
    layout: $layout.fill,
    views: [
      {
        type: "label",
        props: { text: name, textColor: ui.color.general },
        layout: (make, view) => {
          make.centerY.equalTo(view.super);
          make.left.equalTo(15);
        }
      },
      {
        type: "label",
        props: {
          id: identifier,
          align: $align.right,
          textColor: $color(COLOR)
        },
        layout: (make, view) => {
          make.centerY.equalTo(view.super);
          make.right.inset(15);
          make.width.equalTo(view.super).multipliedBy(0.5);
        }
      }
    ]
  };
}

const showIconMenu = () =>
  picker.iconLibrary(name => {
    iconName = name;
    iconImage().icon = $icon(name, $color(COLOR));
  });

function nameLabel() {
  return $("name-label");
}

function patternLabel() {
  return $("pattern-label");
}

function iconImage() {
  return $("icon-image");
}

function encodeSwitch() {
  return $("encode-switch");
}

module.exports = { create: create, edit: edit };
