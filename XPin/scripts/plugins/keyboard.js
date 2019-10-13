const kb = {
  hans: {
    key: [
      "零",
      "壹",
      "贰",
      "叁",
      "肆",
      "伍",
      "陆",
      "柒",
      "捌",
      "玖",
      "元",
      "万",
      "亿",
      "拾",
      "佰",
      "仟",
      "角",
      "分",
      "整",
      ""
    ],
    col: 5
  },
  hex: {
    key: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      ".",
      ""
    ],
    col: 6
  },
  dec: {
    key: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", ""],
    col: 4
  },
  oct: {
    key: ["1", "2", "3", "4", "5", "6", "7", "0", ".", ""],
    col: 5
  },
  bin: {
    key: ["0", "1", ".", ""],
    col: 4
  }
};
const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

exports.init = (
  type,
  view,
  handler,
  isNeedDot = true,
  switchHandler,
  prevViewHeight = 176
) => {
  const borderWidth = 1.0 / $device.info.screen.scale;
  const ui = require("../ui");
  const k = kb[type];
  const l = k.key.length;
  const data = k.key.map(i => {
    if (i == "." && !isNeedDot)
      return {
        x: {
          title: "",
          image: ui.image("keyboard"),
          tintColor: $color(COLOR),
          imageEdgeInsets: $insets(5, 0, 5, 0)
        }
      };
    else if (i == "")
      return {
        x: {
          title: "",
          image: ui.image("del"),
          tintColor: $color(COLOR),
          imageEdgeInsets: $insets(3, 0, 3, 0)
        }
      };
    else return { x: { title: i } };
  });
  return {
    type: "matrix",
    props: {
      columns: k.col,
      itemHeight: 26,
      bgcolor: $color("clear"),
      spacing: 4,
      info: view,
      scrollEnabled: 0,
      template: [
        {
          type: "button",
          props: {
            id: "x",
            radius: 8,
            userInteractionEnabled: 0,
            titleColor: ui.color.general,
            bgcolor: ui.rgba(200),
            borderColor: ui.color.border,
            borderWidth
          },
          layout: $layout.fill,
          events: {
            ready: sender =>
              $delay(0, () => {
                if (sender.title == "") {
                  sender.views[0].contentMode = 1;
                  ui.shadow(sender.views[0]);
                }
              })
          }
        }
      ],
      data
    },
    layout: make => {
      make.left.right.bottom.inset(0);
      make.top.equalTo($("mainView").bottom);
    },
    events: {
      ready: sender =>
        $delay(0, () => {
          $widget.height = (30 * l) / k.col + 4 + prevViewHeight;
        }),
      didSelect: (sender, indexPath, data) => {
        $device.taptic(0);
        let i = $(view);
        if (indexPath.row == l - 1) i.text = i.text.slice(0, -1);
        else if (indexPath.row == l - 2 && !isNeedDot) {
          switchHandler();
        } else i.text += data.x.title;
        handler();
      },
      didLongPress: (sender, indexPath) => {
        if (indexPath.row == l - 1) {
          $(view).text = "";
          $device.taptic(0);
          handler();
        }
      }
    }
  };
};
