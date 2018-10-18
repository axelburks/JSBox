// 文本框高度，可根据需要自行修改
let TextViewHeight = 200;

$ui.render({
  props: {
    id: "mainView",
    title: "Clip Editor",
    navBarHidden: $app.env == $env.today ? 1 : 0
  },
  views: [
    {
      type: "text",
      props: {
        id: "clipContent",
        type: $kbType.default,
        bgcolor: $rgba(100, 100, 100, 0.1),
        font: $font(15),
        radius: 10,
        accessoryView: {
          type: "view",
          props: {
            height: 40,
            bgcolor: $color("#eeeeee"),
            borderWidth: 0.5,
            borderColor: $color("#cccccc")
          },
          views: [
            {
              type: "button",
              props: {
                id: "UndoButton",
                title: "⃔",
                radius: 6,
                font: $font(14),
                titleColor: $color("#333333"),
                bgcolor: $color("#ffffff"),
                borderWidth: 0.5,
                borderColor: $color("#cccccc")
              },
              layout: function(make, view) {
                make.top.inset(5);
                make.left.inset(8);
                make.width.equalTo(35);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function(sender) {
                  $device.taptic(0);
                  if (um.$canUndo()) {
                    um.$undo();
                  } else {
                    $ui.error("Nothing to Undo!", 0.6);
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "RedoButton",
                title: "⃕",
                radius: 6,
                font: $font(14),
                titleColor: $color("#333333"),
                bgcolor: $color("#ffffff"),
                borderWidth: 0.5,
                borderColor: $color("#cccccc")
              },
              layout: function(make, view) {
                make.top.equalTo($("UndoButton").top);
                make.left.equalTo($("UndoButton").right).inset(5);
                make.width.equalTo($("UndoButton").width);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function(sender) {
                  $device.taptic(0);
                  if (um.$canRedo()) {
                    um.$redo();
                  } else {
                    $ui.error("Nothing to Redo!", 0.6);
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                title: "🌁",
                id: "ImageButton",
                font: $font("bold", 20),
                bgcolor: $color("clear"),
                hidden: 1
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.centerX.equalTo(view.super).offset(22);
              },
              events: {
                tapped: function(sender) {
                  showImage($clipboard.image);
                }
              }
            },
            {
              type: "button",
              props: {
                id: "ShareButton",
                icon: $icon("022", $color("gray"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear"),
                hidden: 0
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.right.equalTo($("ImageButton").left).inset(10);
              },
              events: {
                tapped: function(sender) {
                  if ($("clipContent").text.length > 0) {
                    let ShareText = $("clipContent").selectedRange.length > 0 ? $("clipContent").text.substr($("clipContent").selectedRange.location, $("clipContent").selectedRange.length) : $("clipContent").text;
                    $share.sheet(ShareText)
                  } else {
                    $ui.error("No Content!", 0.5);
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "QRButton",
                icon: $icon("017", $color("gray"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear"),
                hidden: 0
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.right.equalTo($("ShareButton").left).inset(12);
              },
              events: {
                tapped: function(sender) {
                  if ($("clipContent").text.length > 0) {
                    let QRText = $("clipContent").selectedRange.length > 0 ? $("clipContent").text.substr($("clipContent").selectedRange.location, $("clipContent").selectedRange.length) : $("clipContent").text;
                    let QRimage = $qrcode.encode(QRText);
                    showImage(QRimage.png);
                  } else {
                    $ui.error("No Content!", 0.5);
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                title: "🔗",
                id: "LinkButton",
                font: $font("bold", 13),
                bgcolor: $color("clear"),
                hidden: 1
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.right.equalTo($("QRButton").left).inset(8);
              },
              events: {
                tapped: async function(sender) {
                  if (sender.info.length == 1) {
                    $app.openURL(sender.info[0]);
                  } else {
                    let result = await $ui.menu({ items: sender.info });
                    $app.openURL(result.title);
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "saveButton",
                title: "Save",
                font: $font("bold", 14),
                bgcolor: $color("tint"),
                borderWidth: 0.5,
                borderColor: $color("#cccccc")
              },
              layout: function(make, view) {
                make.top.equalTo($("UndoButton").top);
                make.right.inset(5);
                make.width.equalTo(60);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function(sender) {
                  saveClip($("clipContent").text);
                }
              }
            },
            {
              type: "button",
              props: {
                id: "cancelButton",
                title: "Cancel",
                font: $font("bold", 14),
                bgcolor: $color("lightGray"),
                borderWidth: 0.5,
                borderColor: $color("#cccccc")
              },
              layout: function(make, view) {
                make.top.equalTo($("UndoButton").top);
                make.right.equalTo($("saveButton").left).inset(8);
                make.width.equalTo($("saveButton").width);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function(sender) {
                  $("clipContent").blur();
                  $app.close();
                }
              }
            }
          ]
        }
      },
      layout: function(make) {
        make.top.right.left.inset(10);
        make.height.equalTo(TextViewHeight);
      },
      events: {
        ready: function(sender) {
          sender.focus();
          if ($clipboard.text && $clipboard.text != "") {
            sender.text = $clipboard.text;
          }
        }
      }
    }
  ]
});
let um = $("clipContent").runtimeValue().$undoManager();

if ($clipboard.text) {
  let links = $detector.link($clipboard.text);
  if(links.length > 0){
    $("LinkButton").hidden = 0;
    $("LinkButton").info = links;
  }
}

if ($clipboard.image) {
  $("ImageButton").hidden = 0;
}

$widget.height = TextViewHeight + 20;

function showImage(imageData) {
  $("clipContent").blur();
  let initLocation = new Array;
  $ui.push({
    props: {
      id: "QRImageView",
      navBarHidden: $app.env == $env.today ? 1 : 0
    },
    views: [
      {
        type: "image",
        props: {
          data: imageData
        },
        layout: function(make, view) {
          make.center.equalTo(view.super);
          make.size.equalTo($size(200, 200));
        }
      }
    ],
    events: {
      touchesBegan: function(sender, location) {
        initLocation = location;
      },
      touchesEnded: function(sender, location) {
        if (Math.abs(location.x - initLocation.x) > 2 || Math.abs(location.y - initLocation.y) > 2) {
          $ui.pop();
          $delay(0.6, function() {
            $("clipContent").focus();
          })
        }
      },
      doubleTapped: function(sender) {
        $photo.save({
          data: imageData,
          handler: function(success) {
            $ui.toast("QRCode Saved", 0.5);
          }
        })
      },
      longPressed: function(sender) {
        $share.sheet({
          item: ["QRImage.png", imageData],
          handler: function(success) {
            if (success) {
              $ui.pop();
              $delay(0.6, function() {
                $("clipContent").focus();
              })
            }
          }
        })
      }
    }
  });
}

function saveClip(text) {
  $clipboard.text = text;
  $ui.toast("Saved", 0.8);
  $("clipContent").blur();
  delayClose();
}

function delayClose() {
  $thread.main({
    delay: 0.8,
    handler: function() {
      $app.close();
    }
  });
}