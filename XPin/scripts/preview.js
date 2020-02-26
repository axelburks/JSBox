const ui = require("./ui");
const COLOR = $cache.get($device.isDarkMode ? 'dark' : 'color');

const layout = (make, view, name) => {
  make.width.equalTo(view.super).dividedBy(4);
  if (name == "arrowl") make.left.equalTo(0);
  else make.left.equalTo(view.prev.right);
  ui.shadow(view);
  make.height.equalTo(20);
  make.bottom.inset(3);
  $delay(0, () => (view.views[0].contentMode = 1));
};

const redirect = (site, content) => {
  if (site.indexOf("link") != -1) return $detector.link(content)[0];
  else return site.replace("%@", encodeURIComponent(content));
};

exports.show = content => {
  let bgcolor = $color("clear");
  if ($app.env == 2) $widget.height = 400;
  else if ($app.env == 32) ($keyboard.height = 400) && (bgcolor = $device.isDarkMode ? $color("black") : $color("white"));
  const openUrl = { name: "链接", pattern: "link" };
  let engines = $cache.get("actions")[1];
  if ($detector.link(content).length > 0) engines.unshift(openUrl);
  let tabUrl = engines[0].pattern;
  $ui.window.add({
    type: "view",
    props: { id: "bg", alpha: 0, bgcolor },
    views: [
      {
        type: "tab",
        props: {
          tintColor: $color(COLOR),
          items: engines.map(i => i.name)
        },
        layout: (make, view) => {
          make.left.right.inset(6);
          make.top.inset(4);
          make.height.equalTo(22);
          $device.isDarkMode && (view.bgcolor = ui.rgba(255));
        },
        events: {
          changed(sender) {
            tabUrl = engines[sender.index].pattern;
            $("web").url = redirect(tabUrl, content);
          }
        }
      },
      {
        type: "view",
        props: {
          id: "mianv",
          radius: 10,
          bgcolor: ui.color.widget,
          borderColor: ui.color.border,
          borderWidth: 1.0 / $device.info.screen.scale
        },
        layout: (make, view) => {
          make.left.right.bottom.inset(4);
          make.top.equalTo(view.prev.bottom).offset(4);
        },
        views: [
          ui.button({
            name: "x",
            layout: (make, view) => {
              ui.shadow(view, COLOR);
              make.left.top.inset(3);
              make.size.equalTo($size(22, 22));
            },
            tap: () => {
              ui.appear(0);
              $device.taptic(0);
              if ($app.env == 2) $widget.height = 180;
              else if ($app.env == 32) ($keyboard.height = 314) && ($keyboard.barHidden = false);
            }
          }),
          ui.button({
            name: "safari",
            layout: (make, view) => {
              ui.shadow(view, COLOR);
              make.right.top.inset(3);
              make.size.equalTo($size(22, 22));
            },
            tap: () => $app.openURL($("web").url)
          }),
          {
            type: "label",
            props: {
              bgcolor: $color("clear"),
              font: $font("bold", 12),
              textColor: ui.color.general,
              align: $align.center
            },
            layout: (make, view) => {
              make.width.equalTo(view.super).multipliedBy(0.5);
              ui.shadow(view, view.textColor);
              make.centerX.equalTo(view.super);
              make.top.inset(6);
            }
          },
          {
            type: "web",
            props: {
              id: "web",
              url: redirect(tabUrl, content)
            },
            layout: make => {
              make.left.right.inset(0);
              make.top.bottom.inset(28);
            },
            events: {
              didStart: sender => (sender.prev.text = sender.url),
              didFinish: sender => (sender.prev.text = sender.url)
            }
          },
          ui.button({ name: "arrowl", layout, tap: () => $("web").goBack() }),
          ui.button({
            name: "arrowr",
            layout,
            tap: () => $("web").goForward()
          }),
          ui.button({
            name: "share1",
            layout,
            tap: () => $share.sheet($("web").url)
          }),
          ui.button({ name: "refresh", layout, tap: () => $("web").reload() })
        ]
      }
    ],
    layout: make => {
      make.left.right.bottom.inset(0);
      make.top.inset(0.2);
    }
  });
  ui.appear(1);
};
