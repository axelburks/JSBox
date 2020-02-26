const ver = parseInt($device.info.version.split(".")[0]) - 12;
const env = $app.env.toString().slice(0, 1) - 1;
const dark = Number($device.isDarkMode);
const _env = env % 2;

const COLOR = $cache.get(dark ? "dark" : "color");

const rgba = (n, a = 0.25) => $rgba(n, n, n, a);
exports.rgba = rgba;

const color = {
  separator: [[$color("separator"), rgba(100)][_env], rgba(100, 0.8)][dark],
  widget: [rgba(200), rgba(150)][dark],
  border: rgba(100),
  general: [$color("#333"), $color("#FFF")][dark],
  general_n: [$color("#325793"), $color("#009999")][dark],
  editor_bg: [$color("#FFFFFF"), $color("#282828")][dark],
  editor_text_bg: [$rgba(100, 100, 100, 0.1), $color("#404040")][dark],
  title: [$color("000"), $color("#FFF")][dark],
  cell: [$color("#FFF"), $color("#1C1C1E")][dark],//#191919
  bg: [
    [rgba(255, 0.28), $color("clear")][ver],
    [rgba(0, 1), $color("clear")][_env]
  ][dark],
  todaybg: [rgba(200), rgba(100)][dark],
  cellbg: [$color("#F2F2F7"), rgba(0, 1)][dark]
};
exports.color = color;

const shadowColor = dark ? "#333" : COLOR;
const shadow = (view, color = shadowColor, opacity = 0.35) => {
  let layer = view.ocValue().invoke("layer");
  layer.invoke("setShadowOpacity", opacity);
  layer.invoke("setShadowOffset", $size(0, 2));
  layer.invoke(
    "setShadowColor",
    $color(color)
      .ocValue()
      .invoke("CGColor")
  );
};
exports.shadow = shadow;

const image = name => {
  let image = $file.read(`assets/src/${name}.png`).image;
  return image
    .ocValue()
    .invoke("imageWithRenderingMode", 2)
    .jsValue();
};
exports.image = image;

exports.button = ({ name, layout, tap, long, props = { circular: 1 } }) => {
  return {
    type: "button",
    props: {
      tintColor: $color(COLOR),
      bgcolor: $color("clear"),
      image: image(name),
      ...props
    },
    layout: (make, view) => layout(make, view, name),
    events: { tapped: tap, longPressed: long }
  };
};

const hideMainView = (hidden, p) => {
  if (env == 0) {
    for (let i of $("main").views) {
      let needsHidden =
        (i.ocValue().__clsName == "BBBlurView" && i.id != "bg") || i.id == p;
      needsHidden && (i.hidden = hidden);
    }
  } else {
    for (let i of $("main").views) i.id != "bg" && (i.hidden = hidden);
  }
  !ver &&
    env == 1 &&
    ($("main").bgcolor = hidden ? rgba(255, 0.28) : $color("clear"));
};

exports.appear = (isAppear = 1, p = "actionlist") => {
  isAppear && hideMainView(1, p);
  $ui.animate({
    duration: 0.4,
    animation: () => ($("bg").alpha = isAppear),
    completion: () => {
      if (!isAppear) {
        $("bg").remove();
        hideMainView(0, p);
      }
    }
  });
};

exports.back = (isRender = 0) => {
  !isRender && $device.taptic(0);
  $ui.animate({
    duration: 0.4,
    animation: () => {
      for (let i of $ui.window.views) i.alpha = isRender;
    },
    completion: () => {
      if (isRender) return;
      let main = ["app", "today", "keyboard"];
      let module = require("./" + main[env]);
      module.init();
    }
  });
};

exports.placeholderTextColor = view => {
  dark &&
    !view.text &&
    $delay(0, () => {
      let i = view.views.findIndex(v => {
        let color = v.textColor;
        if (color) return color.hexCode == "#EBEBF5";
      });
      i > -1 && (view.views[i].textColor = $color("#A2A2A2"));
    });
};

const toast = ({ text, inset = 9, icon = "064", time = 0.6 }) => {
  inset = inset > 10 ? inset : [44 + inset, 34, 52][env];

  let t = new Date().getTime();
  //  if (time === undefined) time = text.length / 5;
  $("toastView") && $("toastView").remove();

  $ui.window.add({
    type: "blur",
    props: {
      info: t,
      style: 1,
      alpha: 0,
      radius: 8,
      id: "toastView",
      borderWidth: 0.4,
      borderColor: rgba(100),
      userInteractionEnabled: 0,
      bgcolor: [[rgba(255, 1), rgba(200)][_env], rgba(0,.6)][dark]
    },
    layout: (make, view) => {
      let textSize = $text.sizeThatFits({
        text: text,
        width: view.super.frame.width,
        font: $font(14)
      });
      make.centerX.equalTo(view.super);
      make.top.equalTo(view.super.safeArea).offset(0);
      make.width.equalTo(textSize.width + 60);
      make.height.equalTo(30);
    },
    views: [
      {
        type: "image",
        props: {
          icon: $icon(icon, $color(COLOR))
        },
        layout: (make, view) => {
          make.centerY.equalTo(view.super);
          make.size.equalTo($size(16, 16));
          make.left.inset(10);
        }
      },
      {
        type: "view",
        layout: (make, view) => {
          make.centerY.equalTo(view.super);
          make.left.equalTo(view.prev.right);
          make.right.inset(10);
          make.height.equalTo(view.super);
        },
        views: [
          {
            type: "label",
            props: {
              bgcolor: $color("clear"),
              textColor: color.general,
              font: $font(15),
              text
            },
            layout: (make, view) => {
              shadow(view, "black", 0.2);
              make.center.equalTo(view.super);
            }
          }
        ]
      }
    ]
  });

  $delay(0.05, () => {
    let fView = $("toastView");
    if (fView == undefined) return 0;
    fView.updateLayout((make, view) => {
      make.top.equalTo(view.super.safeArea).offset(inset);
    });
    $ui.animate({
      duration: 0.4,
      animation: () => {
        fView.alpha = 1;
        fView.relayout();
      },
      completion: () => {
        $delay(time, () => {
          let fView = $("toastView");
          if (fView == undefined) return 0;
          else if (fView.info != t) return 0;
          fView.updateLayout((make, view) =>
            make.top.equalTo(view.super.safeArea).offset(0)
          );
          $ui.animate({
            duration: 0.4,
            animation: () => {
              fView.alpha = 0.0;
              fView.relayout();
            },
            completion: () => fView && fView.remove()
          });
        });
      }
    });
  });
};
exports.toast = toast;

exports.guide = (x, text) => {
  let cacheName = `tip-${x}`;
  if (!$cache.get(cacheName)) {
    toast({ text, time: text.length / 5 });
    $cache.set(cacheName, true);
  }
};

const p = Math.PI;

//🔺🔻
exports.triangle = function(n, id, hidden) {
  return {
    type: "canvas",
    props: { id: id, hidden: hidden },
    layout: (make, view) => {
      shadow(view);
      make.edges.inset(0);
    },
    events: {
      draw: (view, ctx) => {
        let cX = view.frame.width * 0.5,
          cY = view.frame.height * 0.5,
          s = n * 0.5,
          t = n * Math.sqrt(3 / 16);
        ctx.fillColor = $color(COLOR);
        ctx.moveToPoint(cX + s, cY - t);
        ctx.addLineToPoint(cX - s, cY - t);
        ctx.addLineToPoint(cX, cY + t);
        ctx.fillPath();
      }
    }
  };
};

exports.earth = function() {
  return [
    {
      type: "canvas",
      props: { userInteractionEnabled: 0 },
      layout: $layout.fill,
      events: {
        draw: (view, ctx) => {
          let r = 10;
          let _r = r * 0.95;
          let s = r / Math.SQRT2;
          let cX = view.frame.width * 0.5;
          let cY = view.frame.height * 0.5;
          ctx.setLineWidth(1.2);
          ctx.strokeColor = $color(COLOR);
          ctx.addArc(cX, cY, r, 0, p * 2, 0);
          ctx.moveToPoint(cX, cY - _r);
          ctx.addQuadCurveToPoint(cX - r, cY, cX, cY + _r);
          ctx.addLineToPoint(cX, cY - _r);
          ctx.addQuadCurveToPoint(cX + r, cY, cX, cY + _r);
          ctx.moveToPoint(cX - r, cY);
          ctx.addLineToPoint(cX + r, cY);
          ctx.moveToPoint(cX - s, cY - s);
          ctx.addQuadCurveToPoint(cX, cY, cX + s, cY - s);
          ctx.moveToPoint(cX + s, cY + s);
          ctx.addQuadCurveToPoint(cX, cY, cX - s, cY + s);
          ctx.strokePath();
        }
      }
    }
  ];
};

exports.enter = function() {
  return [
    {
      type: "canvas",
      props: { userInteractionEnabled: 0 },
      layout: $layout.fill,
      events: {
        draw: (view, ctx) => {
          let cX = view.frame.width * 0.5,
            cY = view.frame.height * 0.5,
            n = 5.4,
            m = n / 2;
          ctx.strokeColor = $color("white");
          ctx.setLineJoin(1);
          ctx.setLineCap(1);
          ctx.setLineWidth(1.8);
          ctx.moveToPoint(cX - m, cY - n);
          ctx.addLineToPoint(cX + m * -3, cY);
          ctx.addLineToPoint(cX - m, cY + n);
          ctx.moveToPoint(cX + m * -3, cY);
          ctx.addLineToPoint(cX + m * 3, cY);
          ctx.addLineToPoint(cX + m * 3, cY - n);
          ctx.strokePath();
        }
      }
    }
  ];
};

exports.del = function() {
  return [
    {
      type: "canvas",
      props: { userInteractionEnabled: 0 },
      layout: $layout.fill,
      events: {
        draw: (view, ctx) => {
          let cX = view.frame.width * 0.5,
            cY = view.frame.height * 0.5,
            n = 14,
            r = (n * 2) / 5,
            s = (n - r) / 2,
            m = n / 4,
            xa = cX - m * 3,
            xbe = cX - m,
            xcd = cX + m * 3,
            ybc = cY - n / 2,
            yde = cY + n / 2,
            xpq = cX + s - m,
            ypm = cY - r / 2,
            xmn = cX + s + r - m,
            yqn = cY + r / 2;
          ctx.strokeColor = $color(COLOR);
          ctx.setLineWidth(1.8);
          ctx.setLineCap(1);
          ctx.setLineJoin(1);
          ctx.moveToPoint(xa, cY);
          ctx.addLineToPoint(xbe, ybc);
          ctx.addLineToPoint(xcd, ybc);
          ctx.addLineToPoint(xcd, yde);
          ctx.addLineToPoint(xbe, yde);
          ctx.addLineToPoint(xa, cY);
          ctx.moveToPoint(xpq, yqn);
          ctx.addLineToPoint(xmn, ypm);
          ctx.moveToPoint(xpq, ypm);
          ctx.addLineToPoint(xmn, yqn);
          ctx.strokePath();
        }
      }
    }
  ];
};

exports.safeGeneralLayout = () => {
  return (make, view) => {
    make.left.right.inset(4);
    make.top.equalTo(view.super.safeAreaTop);
    make.bottom.equalTo(view.super.safeAreaBottom).inset(4);
  };
};

exports.blink = view => {
  let orignColor = view.bgcolor;
  $ui.animate({
    duration: 0.3,
    animation: () => (view.bgcolor = dark && env == 1 ? $color("clear") : rgba(100)),
    completion: () => {
      $ui.animate({
        duration: 0.3,
        animation: () => (view.bgcolor = orignColor)
      });
    }
  });
};
