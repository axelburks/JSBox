const convertTitle = ["颜色转换", "进制转换", "人民币大小写"];
const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

let kb = require("./keyboard"),
  ui = require("../ui"),
  type = $cache.get("converType") || 0;

const _layout = i => {
  return (make, view) => {
    make.left.equalTo(view.prev.right).offset(8);
    make.size.equalTo(view.prev);
    make.top.inset(8);
    i ? ui.placeholderTextColor(view) : ui.shadow(view.views[0]);
  };
};

const convertView = [
  {
    type: "view",
    props: { bgcolor: $color("clear") },
    layout: $layout.fill,
    views: [
      inputView("Red", (make, view) => {
        make.top.left.inset(8);
        make.height.equalTo(26);
        make.width.lessThanOrEqualTo(view.super).multipliedBy(0.25);
        ui.placeholderTextColor(view);
      }),
      inputView("Green"),
      inputView("Blue"),
      buttonView(
        "RGB",
        () => rgbCopyMenu(),
        (make, view) => {
          make.left.equalTo(view.prev.right).offset(8);
          ui.shadow(view.views[0]);
          make.top.right.inset(8);
          make.size.equalTo(view.prev);
        }
      ),
      buttonView(
        "HEX",
        () => $("Hex").text != "" && hexCopyMenu(),
        (make, view) => {
          make.right.inset(8);
          ui.shadow(view.views[0]);
          make.size.equalTo(view.prev);
          make.top.equalTo(view.prev.bottom).offset(8);
        }
      ),
      inputView("Hex", (make, view) => {
        make.left.inset(8);
        ui.placeholderTextColor(view);
        make.height.centerY.equalTo(view.prev);
        make.right.equalTo(view.prev.left).inset(8);
      })
    ]
  },
  {
    type: "view",
    props: { bgcolor: $color("clear") },
    layout: $layout.fill,
    views: [
      numBTN("DEC"),
      numIPT("dec"),
      numBTN("OCT"),
      numIPT("oct"),
      numBTN("BIN"),
      numIPT("bin"),
      numBTN("HEX"),
      numIPT("hex")
    ]
  },
  {
    type: "view",
    props: { bgcolor: $color("clear") },
    layout: $layout.fill,
    views: [
      buttonView(
        "复制",
        () => {
          if ($("toChn").text == "") return;
          $clipboard.text = $("toChn").text;
          ui.toast({ text: "已复制", inset: 36 });
          $device.taptic(0);
        },
        (make, view) => {
          make.width.equalTo(view.super).multipliedBy(0.25);
          make.height.equalTo(26);
          make.top.right.inset(8);
          ui.shadow(view.views[0]);
        }
      ),
      inputView(
        "toChn",
        (make, view) => {
          ui.placeholderTextColor(view);
          make.height.centerY.equalTo(view.prev);
          make.right.equalTo(view.prev.left).offset(-8);
          make.left.inset(8);
        },
        "输入阿拉伯数字"
      ),
      inputView(
        "toArab",
        (make, view) => {
          ui.placeholderTextColor(view);
          make.size.centerX.equalTo(view.prev);
          make.top.equalTo(view.prev.bottom).offset(8);
        },
        "输入汉字大写数字"
      ),
      buttonView(
        "复制",
        () => {
          if ($("toArab").text == "") return;
          $clipboard.text = $("toArab").text;
          ui.toast({ text: "已复制", inset: 36 });
          $device.taptic(0);
        },
        (make, view) => {
          make.height.centerY.equalTo(view.prev);
          make.left.equalTo(view.prev.right).offset(8);
          make.right.inset(8);
          ui.shadow(view.views[0]);
        }
      )
    ]
  }
];

function buttonView(title, handler, layout = _layout(0)) {
  return {
    type: "button",
    props: {
      title: title,
      titleColor: $color(COLOR),
      font: $font("bold", 15),
      bgcolor: $rgba(255, 255, 255, 0.25),
      borderWidth: 0.8,
      radius: 5,
      borderColor: $rgba(100, 100, 100, 0.25)
    },
    layout: layout,
    events: {
      tapped: handler
    }
  };
}

function inputView(id, layout = _layout(1), placeholder = id) {
  return {
    type: "input",
    props: {
      id: id,
      radius: 5,
      font: $font(15),
      borderWidth: 0.4,
      align: 1,
      textColor: ui.color.general,
      bgcolor: $rgba(200, 200, 200, 0.25),
      borderColor: $rgba(100, 100, 100, 0.25),
      placeholder
    },
    layout: layout,
    events: {
      didBeginEditing: inputHandler(1),
      tapped: inputHandler(),
      longPressed: sender => {
        sender.blur();
      }
    }
  };
}

function colorCvt() {
  let input = $("matrix").info;
  if (input == "Hex") {
    let text = $(input).text.match(/^[0-9a-fA-F]{0,6}$/) || "";
    $(input).text = (text === "" ? "" : text[0]).toUpperCase();
    let hex = parseInt($("Hex").text, 16);
    $("Red").text = ("" + (hex & 0xff0000)) >> 16;
    $("Green").text = ("" + (hex & 0xff00)) >> 8;
    $("Blue").text = "" + (hex & 0xff);
  } else {
    if ($(input).text >= 256) $(input).text = "";
    else {
      const convert = id =>
        (256 + Number($(id).text))
          .toString(16)
          .slice(1)
          .toUpperCase();
      $("Hex").text = convert("Red") + convert("Green") + convert("Blue");
    }
  }
}

function rgbCopyMenu() {
  let color = [$("Red").text, $("Green").text, $("Blue").text];
  if (!color.includes(""))
    $ui.menu([`rgb(${color.join(",")})`, color.join(",")]).then(resp => {
      if ('index' in resp) {
        $clipboard.text = resp.title;
        ui.toast({ text: "已复制", inset: 34 });
      }
    });
}

function hexCopyMenu() {
  let value = $("Hex").text;
  $ui.menu(["#" + value, "0x" + value]).then(resp => {
    if ('index' in resp) {
      $clipboard.text = resp.title;
      ui.toast({ text: "已复制", inset: 34 });
    }
  });
}
//进制转换
function numBTN(title) {
  return {
    type: "button",
    props: {
      radius: 5,
      title: title,
      borderWidth: 0.8,
      titleColor: $color(COLOR),
      font: $font("bold", 12.5),
      bgcolor: $rgba(255, 255, 255, 0.25),
      borderColor: $rgba(100, 100, 100, 0.25)
    },
    layout: (make, view) => {
      if (view.prev) make.top.equalTo(view.prev.bottom).offset(8);
      else make.top.inset(8);
      make.right.inset(8);
      make.height.equalTo(26);
      make.width.equalTo(36);
      ui.shadow(view);
    },
    events: {
      tapped: () => {
        let t = $(title.toLowerCase()).text;
        if (t != "") {
          $clipboard.text = t;
          ui.toast({ text: "已复制", inset: 36 });
          $device.taptic(0);
        }
      }
    }
  };
}

function numIPT(id) {
  return {
    type: "input",
    props: {
      id: id,
      radius: 5,
      borderWidth: 0.4,
      font: $font(12.5),
      bgcolor: ui.rgba(200),
      borderColor: ui.rgba(100),
      textColor: ui.color.general
    },
    layout: (make, view) => {
      make.left.inset(8);
      make.centerY.equalTo(view.prev);
      make.right.equalTo(view.prev.left).offset(-8);
      make.height.equalTo(26);
      ui.placeholderTextColor(view);
    },
    events: {
      didBeginEditing: inputHandler(1),
      tapped: inputHandler()
    }
  };
}

function numChanged() {
  let system = { dec: 10, oct: 8, bin: 2, hex: 16 };
  let input = $("matrix").info;
  let number = parseInt($(input).text, system[input]);
  Object.keys(system).forEach(i => {
    $(i).text = isNaN(number) ? "" : number.toString(system[i]).toUpperCase();
  });
}

//RMB
let chnNum = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
let _chnNum = {};
for (let i in chnNum) _chnNum[chnNum[i]] = Number(i);
let chnUnitSec = ["", "万", "亿", "万亿", "亿亿"];
let chnUnitChar = ["", "拾", "佰", "仟"];
let chnNameVal = {
  拾: { value: 10, secUnit: false },
  佰: { value: 100, secUnit: false },
  仟: { value: 1000, secUnit: false },
  万: { value: 10000, secUnit: true },
  亿: { value: 100000000, secUnit: true }
};

function Sec2Chn(sec) {
  let strIns = "",
    chnStr = "";
  let unitPos = 0;
  let zero = true;
  while (sec > 0) {
    let v = sec % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = "零" + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNum[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    sec = Math.floor(sec / 10);
  }
  return chnStr;
}

function dotLeft2Chn(n) {
  let unitPos = 0;
  let strIns = "",
    chnStr = "";
  let needZero = false;
  if (n == 0) return chnNum[n];
  while (n > 0) {
    let sec = n % 10000;
    if (needZero) {
      chnStr = chnNum[0] + chnStr;
    }
    strIns = Sec2Chn(sec);
    strIns += sec !== 0 ? chnUnitSec[unitPos] : chnUnitSec[0];
    chnStr = strIns + chnStr;
    needZero = sec < 1000 && sec > 0;
    n = Math.floor(n / 10000);
    unitPos++;
  }
  return chnStr;
}

function dotRight2Chn(n) {
  let m = n || "";
  switch (m.length) {
    case 0:
      return "整";
    case 1:
      return chnNum[m] + "角";
    default: {
      let a = m.charAt(0);
      let b = a == 0 ? "零" : chnNum[a] + "角";
      return b + chnNum[m.charAt(1)] + "分";
    }
  }
}

function yuanLeft2Int(chnStr) {
  var rtn = 0;
  var section = 0;
  var number = 0;
  var secUnit = false;
  var str = chnStr.split("");

  for (var i = 0; i < str.length; i++) {
    var num = _chnNum[str[i]];
    if (typeof num !== "undefined") {
      number = num;
      if (i === str.length - 1) section += number;
    } else {
      var unit = chnNameVal[str[i]].value;
      secUnit = chnNameVal[str[i]].secUnit;
      if (secUnit) {
        section = (section + number) * unit;
        rtn += section;
        section = 0;
      } else section += number * unit;
      number = 0;
    }
  }
  return rtn + section;
}

function yuanRight2Dec(str) {
  let res = "",
    t = str.replace(/[^零壹贰叁肆伍陆柒捌玖]+/g, "").split("");
  if (t.length) res = ".";
  else return "";
  for (let i = 0; i < t.length && i < 2; i++) res += _chnNum[t[i]];
  return res;
}

function num2Chn(num) {
  let n = Number(num);
  if (num == 0) return "零元整";
  let x = ("" + n).split(".");
  let dl = dotLeft2Chn(x[0]);
  let dr = dotRight2Chn(x[1]);
  return dl + "元" + dr;
}

function chn2Num(str) {
  let a = str.split("元"),
    a1 = a[1],
    a0 = a[0];
  if (a.length == 1) {
    a1 = a0;
    a0 = "";
  }
  let output = yuanLeft2Int(a0) + yuanRight2Dec(a1);
  return str == num2Chn(output) ? output : output + "(?)";
}

function rmbCvt() {
  let id = $("matrix").info;
  if ($(id).text == "") {
    $("toChn").text = "";
    $("toArab").text = "";
    return;
  }
  if (id == "toChn") {
    let input = $(id).text;
    if (!/^\d+\.?\d{0,2}$/.test(input)) {
      let x = input.slice(0, -1);
      $(id).text = x;
      $("toArab").text = num2Chn(x);
    } else $("toArab").text = num2Chn(input);
  } else $("toChn").text = chn2Num($(id).text);
}

function initKeyboard(isNext = true, nextFocus) {
  let kbdType, handler;
  let _kbd = $("matrix");
  if (isNext) {
    if (!nextFocus) {
      let next = [
        { Red: "Green", Green: "Blue", Blue: "Hex", Hex: "Red" },
        { dec: "oct", oct: "bin", bin: "hex", hex: "dec" },
        { toChn: "toArab", toArab: "toChn" }
      ];
      nextFocus = next[type][_kbd.info];
    }
  } else {
    if (type == 0) nextFocus = "Red";
    else if (type == 1) nextFocus = "dec";
    else nextFocus = "toChn";
  }

  if (_kbd) _kbd.remove();

  if (type == 1) kbdType = nextFocus;
  else if (nextFocus == "Hex") kbdType = "hex";
  else if (nextFocus == "toArab") kbdType = "hans";
  else kbdType = "dec";

  if (type == 0) handler = colorCvt;
  else if (type == 1) handler = numChanged;
  else handler = rmbCvt;

  let isNeedDot = type == 2;
  let height = type == 1 ? 172 : 104;
  $("mainView").updateLayout(make => make.height.equalTo(height));
  let kbd = kb.init(
    kbdType,
    nextFocus,
    handler,
    isNeedDot,
    isNeedDot ? undefined : initKeyboard,
    height
  );
  $("bg").add(kbd);
  $("bg").alpha == 0 && ui.back(1);
  ui.blink($(nextFocus));
}

function inputHandler(event = 0) {
  if (event == 0)
    return sender => {
      if ($("matrix").info == sender.id) return;
      initKeyboard(true, sender.id);
      $device.taptic(0);
    };
  else sender => sender.blur();
}

function menuHandler(sender) {
  $device.taptic(0);
  $("down").hidden = 1;
  $("up").hidden = 0;
  $ui.menu(convertTitle).then(resp => {
    if ('index' in resp) {
      if (type == resp.index) return;
      else type = resp.index;
      $cache.set("converType", type);
      $("body").views[0].remove();
      $("body").add(convertView[type]);
      sender.text = resp.title;
      initKeyboard(false);
    }
    $("down").hidden = 0;
    $("up").hidden = 1;
  });
}

exports.show = () => {
  $ui.render({
    props: {
      navBarHidden: 1,
      bgcolor: ui.color.bg, //env == 2 && !VER ? $rgba(255, 255, 255, 0.28) : $color("clear"),
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    views: [
      {
        props: { id: "bg", alpha: 0 },
        layout: $layout.fillSafeArea,
        views: [
          {
            type: "view",
            props: {
              borderWidth: 1.0 / $device.info.screen.scale,
              borderColor: ui.color.border,
              bgcolor: ui.color.widget, //$rgba(255, 255, 255, 0.28),
              id: "mainView",
              radius: 10
            },
            layout: (make, view) => {
              make.left.right.inset(4);
              make.top.equalTo(view.super.safeArea);
            },
            views: [
              ui.button({
                name: "x",
                layout: (make, view) => {
                  make.top.right.inset(4);
                  make.size.equalTo($size(20, 20));
                  ui.shadow(view);
                },
                tap: () => {
                  if ($app.env == 2) $widget.height = 180;
                  ui.back();
                }
              }),
              {
                type: "label",
                props: {
                  text: convertTitle[type],
                  textColor: $color(COLOR),
                  font: $font("bold", 16)
                },
                layout: (make, view) => {
                  ui.shadow(view);
                  make.centerY.equalTo(view.prev);
                  make.centerX.equalTo(view.super);
                  make.height.equalTo(22);
                },
                events: {
                  tapped: sender => menuHandler(sender)
                }
              },
              {
                type: "view",
                layout: (make, view) => {
                  make.centerY.equalTo(view.prev);
                  make.left.equalTo(view.prev.right).offset(0);
                  make.size.equalTo($size(20, 20));
                },
                views: [
                  ui.triangle(10, "down", false),
                  ui.triangle(-10, "up", true)
                ],
                events: {
                  tapped: sender => menuHandler(sender.prev)
                }
              },
              {
                type: "label",
                props: {
                  bgcolor: ui.color.separator
                },
                layout: make => {
                  make.left.right.inset(0);
                  make.height.equalTo(0.4);
                  make.top.inset(27.6);
                }
              },
              {
                type: "view",
                props: {
                  id: "body",
                  bgcolor: $color("clear")
                },
                layout: make => {
                  make.left.right.bottom.inset(0);
                  make.top.inset(28);
                },
                views: [convertView[type]]
              }
            ]
          }
        ]
      }
    ]
  });
  initKeyboard(false);
};
