let ui = require("./ui");

const borderWidth = 1.0 / $device.info.screen.scale;
const takeApart = async content => await $text.tokenize({ text: content });

async function apart(content) {
  let apartMode = $cache.get("apartMode") || 0,
    picked = [],
    pickedα = [],
    results = await takeApart(content),
    pickedβ = [...results],
    arr = Array.from({ length: results.length }, (v, k) => k),
    rested = [...arr];
  $ui.render({
    props: {
      navBarHidden: 1,
      bgcolor: ui.color.bg,
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    views: [{
      type: "view",
      props: { alpha: 0 },
      layout: $layout.fillSafeArea,
      views: [{
        type: "views",
        props: {
          radius: 10,
          id: "apart",
          bgcolor: ui.color.widget,
          borderColor: ui.color.border,
          borderWidth
        },
        layout: make => {
          make.left.right.bottom.inset(4);
          make.top.inset($app.env == 3 ? 4 : 0);
        },
        views: [
          ui.button({
            name: "x",
            layout: make => {
              make.size.equalTo(22, 22);
              make.top.left.inset(5);
            },
            tap: () => ui.back()
          }),
          {
            type: "label",
            props: {
              font: $font("bold", 16),
              text: apartMode == 1 ? "分词:剔除模式" : "分词:常规",
              textColor: $color(
                $cache.get($device.isDarkMode ? "dark" : "color")
              )
            },
            layout: (make, view) => {
              ui.shadow(view);
              make.centerX.equalTo(view.super);
              make.centerY.equalTo(view.prev);
            },
            events: {
              tapped(sender) {
                apartReset();
                if (apartMode == 0) {
                  $cache.set("apartMode", 1);
                  sender.text = "分词:剔除模式";
                  apartMode = 1;
                } else {
                  $cache.set("apartMode", 0);
                  sender.text = "分词:常规";
                  apartMode = 0;
                }
                ui.toast({
                  text: "模式已改变",
                  inset: $app.env == 3 ? 38 : 34,
                  icon: "009"
                });
              }
            }
          },
          ui.button({
            name: "copy",
            layout: make => {
              make.size.equalTo(22, 22);
              make.top.right.inset(5);
            },
            tap: () => {
              $device.taptic(0);
              let a = apartMode == 0 ? pickedα : pickedβ;
              a = a.join("");
              if (a.length > 0) {
                let dataManager = require("./data-manager");
                dataManager.copyAndSaveText(a);
                let text = `选中内容已${apartMode == 0 ? "复制" : "剔除"}`;
                ui.toast({ text, inset: $app.env == 3 ? 38 : 34 });
              }
              apartReset();
            },
            props: { circular: 0 }
          }),
          {
            type: "label",
            props: { bgcolor: ui.color.separator },
            layout: make => {
              make.height.equalTo(borderWidth);
              make.right.left.inset(0);
              make.top.inset(30);
            }
          },
          {
            type: "matrix",
            props: {
              spacing: 4,
              bgcolor: $color("clear"),
              scrollEnabled: 1,
              template: [{
                type: "label",
                props: {
                  id: "tile",
                  radius: 8,
                  font: $font(12),
                  align: $align.center,
                  borderColor: ui.color.border,
                  borderWidth
                },
                layout: $layout.fill
              }],
              data: results.map(item => {
                return { tile: { text: item } };
              })
            },
            layout: make => {
              make.left.right.bottom.inset(0.2);
              make.top.inset(30);
            },
            events: {
              didSelect: (sender, indexPath) => {
                let cell = sender.cell(indexPath),
                  row = indexPath.row,
                  label = cell.get("tile");
                if (apartMode == 0) {
                  let test = testRow(picked, row);
                  if (test >= 0) {
                    picked.splice(test, 1);
                    pickedα.splice(test, 1);
                    deselected(label);
                  } else {
                    picked.push(row);
                    pickedα.push(label.text);
                    selected(label);
                  }
                } else {
                  let test = testRow(rested, row);
                  if (test >= 0) {
                    rested.splice(test, 1);
                    pickedβ.splice(test, 1);
                    selected(label);
                  } else {
                    rested = sortArr(rested, row);
                    test = testRow(rested, row);
                    pickedβ.splice(test, 0, label.text);
                    deselected(label);
                  }
                }
              },
              didLongPress: (sender, indexPath) => {
                let text = sender.cell(indexPath).get("tile").text;
                let dataManager = require("./data-manager");
                dataManager.copyAndSaveText(text);
                $device.taptic(0);
                ui.toast({ text: "已复制", inset: $app.env == 3 ? 38 : 34 });
              },
              itemSize: (sender, indexPath) => {
                let data = sender.object(indexPath),
                  size = $text.sizeThatFits({
                    text: data.tile.text,
                    width: 320,
                    font: $font(12)
                  });
                return $size(size.width + 12, $app.env == 2 ? 20 : 24);
              },
              forEachItem: (view, indexPath) => {
                let row = indexPath.row;
                let tile = view.get("tile");
                if (apartMode == 0) {
                  if (picked.includes(row)) selected(tile);
                  else deselected(tile);
                } else {
                  if (rested.includes(row)) deselected(tile);
                  else selected(tile);
                }
              }
            }
          }
        ]
      }]
    }]
  });
  ui.back(1);

  function apartReset() {
    $device.taptic(0);
    if (apartMode == 0) {
      for (let i of picked) {
        let cell = $("matrix").cell($indexPath(0, i));
        deselected(cell.get("tile"));
      }
      picked = [];
      pickedα = [];
    } else {
      for (let i of arr) {
        if (rested.indexOf(i) < 0) {
          let cell = $("matrix").cell($indexPath(0, i));
          deselected(cell.get("tile"));
        }
      }
      rested = [...arr];
      pickedβ = [...results];
    }
  }
}

function selected(label) {
  label.textColor = ui.color.general;
  label.bgcolor = $device.isDarkMode ? ui.rgba(50) : ui.rgba(100);
}

function deselected(label) {
  label.textColor = ui.color.general;
  label.bgcolor = ui.rgba(200);
}

function testRow(_picked, row) {
  let i = _picked.indexOf(row);
  if (i >= 0) return i;
}

function sortArr(arr, row) {
  arr.push(row);
  arr.sort((a, b) => a - b);
  return arr;
}

module.exports = { apart: apart };
