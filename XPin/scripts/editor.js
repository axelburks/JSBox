/*
编辑器
点击进入创建
长按进入查看

图片
滑动返回
双击分享
长按保存
*/

let ui = require("./ui");
const ver = parseInt($device.info.version.split(".")[0]) - 12;
let view_blank = 4;
let view_width = $device.info.screen.width - view_blank * 2;
let searchViewHeight = 65;
let codeSearchHeight = $device.info.screen.height - (($app.env == $env.app) ? 500 : 570);
let codeContentHeight = $device.info.screen.height - (($app.env == $env.app) ? 120 : 170);
let search_result = [], search_result_index = 0, replaced = false, um;

function clipEditor(text, show=false) {
  search_result = [], search_result_index = 0, replaced = false;
  let textView = [
    {
      type: "code",
      props: {
        id: "codeContent",
        theme: "vs2015",
        language: "json",
        type: $kbType.default,
        adjustInsets: true,
        lineNumbers: true,
        darkKeyboard: $device.isDarkMode ? true : false,
        font: $font(15),
        radius: 10,
        accessoryView: {
          type: "view",
          props: {
            height: 40,
            bgcolor: $device.isDarkMode ? $color("#080808") : $color("#eeeeee"),
            borderWidth: 0.5,
            borderColor: $device.isDarkMode ? $color("clear") : $color("#cccccc")
          },
          views: [
            {
              type: "button",
              props: {
                id: "UndoButton",
                title: "⃔",
                radius: 6,
                font: $font(14),
                bgcolor: $device.isDarkMode ? $color("#404040") : $color("#ffffff"),
                borderWidth: 0.5,
                borderColor: $device.isDarkMode ? $color("#606060") : $color("#cccccc")
              },
              layout: function (make, view) {
                make.top.inset(5);
                make.left.inset(8);
                make.width.equalTo(35);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
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
                bgcolor: $device.isDarkMode ? $color("#404040") : $color("#ffffff"),
                borderWidth: 0.5,
                borderColor: $device.isDarkMode ? $color("#606060") : $color("#cccccc")
              },
              layout: function (make, view) {
                make.top.equalTo($("UndoButton").top);
                make.left.equalTo($("UndoButton").right).inset(5);
                make.width.equalTo($("UndoButton").width);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
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
                id: "QRButton",
                icon: $icon("017", $device.isDarkMode ? $color("#C0C0C0") : $color("gray"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear"),
              },
              layout: function (make, view) {
                make.top.bottom.inset(0);
                make.left.equalTo($("RedoButton").right).inset(12);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
                  if ($("codeContent").text.length > 0) {
                    let QRText = $("codeContent").selectedRange.length > 0 ? $("codeContent").text.substr($("codeContent").selectedRange.location, $("codeContent").selectedRange.length) : $("codeContent").text;
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
                id: "linkButton",
                icon: $icon("020", $color("#C0C0C0"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear")
              },
              layout: function (make, view) {
                make.top.bottom.inset(0);
                make.left.equalTo($("QRButton").right).inset(8);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: async function (sender) {
                  let regex = /([\w-]+:\/\/|(mailto|tel):)([^\s<>"]+)?/g;
                  let links = $("codeContent").text.match(regex);
                  if (links) {
                    if (links.length == 1) {
                      $app.openURL(links[0]);
                    } else {
                      let result = await $ui.menu({ items: links });
                      $app.openURL(result.title);
                    }
                  } else {
                    $ui.error("No URL");
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "searchButton",
                icon: $icon("023", $color("#C0C0C0"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear"),
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.left.equalTo(view.prev.right).inset(8);
              },
              events: {
                tapped: function(sender) {
                  showSearchView();
                }
              }
            },
            {
              type: "button",
              props: {
                title: "🌁",
                id: "ImageButton",
                font: $font("bold", 15),
                bgcolor: $color("clear"),
                hidden: 1
              },
              layout: function(make, view) {
                make.top.bottom.inset(0);
                make.left.equalTo(view.prev.right).inset(2);
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
                id: "doneButton",
                title: "Save",
                font: $font("bold", 14),
                bgcolor: $device.isDarkMode ? $color($cache.get("dark")) : $color("tint"),
                borderWidth: 0.5,
                borderColor: $device.isDarkMode ? $color("clear") : $color("#cccccc")
              },
              layout: function (make, view) {
                make.top.equalTo($("UndoButton").top);
                make.right.inset(5);
                make.width.equalTo(50);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
                  saveClip($("codeContent").text);
                }
              }
            },
            {
              type: "button",
              props: {
                id: "cancelButton",
                title: "X",
                font: $font("bold", 14),
                bgcolor: $device.isDarkMode ? $color("#585858") : $color("lightGray"),
                borderWidth: 0.5,
                borderColor: $device.isDarkMode ? $color("clear") : $color("#cccccc")
              },
              layout: function(make, view) {
                make.top.equalTo($("UndoButton").top);
                make.right.equalTo(view.prev.left).inset(view_blank);
                make.width.equalTo(40);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function(sender) {
                  $("codeContent").blur();
                  closeView();
                }
              }
            },
            {
              type: "button",
              props: {
                id: "clineButton",
                title: "CL",
                font: $font("bold", 14),
                bgcolor: $color("#383838"),
                borderWidth: 0.5,
                borderColor: $color("clear")
              },
              layout: function (make, view) {
                make.top.equalTo($("UndoButton").top);
                make.width.equalTo($("UndoButton").width);
                make.right.equalTo(view.prev.left).inset(5);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
                  let oriText = $("codeContent").text;
                  let curLoc = $("codeContent").info;
                  let oriLines = oriText.split("\n");
  
                  let charCount = 0;
                  for (let lineIndex in oriLines) {
                    charCount = charCount + oriLines[lineIndex].length + 1;
                    if (charCount > curLoc) {
                      $clipboard.set({
                        "type": "public.plain-text",
                        "value": oriLines[lineIndex]
                      })
                      $ui.toast("Copied Line: " + oriLines[lineIndex]);
                      break;
                    }
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "dlineButton",
                title: "DL",
                font: $font("bold", 14),
                bgcolor: $color("#993366"),
                borderWidth: 0.5,
                borderColor: $color("clear")
              },
              layout: function (make, view) {
                make.top.equalTo($("UndoButton").top);
                make.width.equalTo($("UndoButton").width);
                make.right.equalTo(view.prev.left).inset(5);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
                  let oriText = $("codeContent").text;
                  let curLoc = $("codeContent").info;
                  let oriLines = oriText.split("\n");
  
                  let charCount = 0;
                  for (let lineIndex in oriLines) {
                    let lastlineLoc = charCount;
                    charCount = charCount + oriLines[lineIndex].length + 1;
                    if (charCount > curLoc) {
                      oriLines.splice(lineIndex, 1);
                      $("codeContent").text = oriLines.join("\n");
                      $("codeContent").selectedRange = $range(lastlineLoc, 0);
                      break;
                    }
                  }
                }
              }
            },
            {
              type: "button",
              props: {
                id: "shareButton",
                icon: $icon("022", $device.isDarkMode ? $color("#C0C0C0") : $color("gray"), $size(20, 20)),
                font: $font("bold", 25),
                bgcolor: $color("clear"),
              },
              layout: function (make, view) {
                make.top.bottom.inset(0);
                make.right.equalTo(view.prev.left).inset(10);
                make.centerY.equalTo(view.super);
              },
              events: {
                tapped: function (sender) {
                  $share.sheet({
                    item: $("codeContent").text,
                    handler: function(success) {
                      if (success) {
                        $context.close();
                      }
                    }
                  });
                }
              }
            }
          ]
        }
      },
      layout: function (make, view) {
        make.top.equalTo(view.super.safeAreaTop).inset(0);
        make.width.equalTo(view_width);
        make.height.equalTo(codeContentHeight);
        make.centerX.equalTo(view.super);
      },
      events: {
        ready: function(sender) {
          if (show && text && text != "") {
            sender.text = text;
          }
          if (show && !text && $clipboard.image) {
            showImage($clipboard.image);
          } else {
            sender.focus();
          }
        },
        didChangeSelection: function(sender) {
          sender.info = sender.selectedRange.location;
        }
      }
    },
    {
      type: "view",
      props: {
        id: "searchView",
        hidden: true
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom);
        make.left.right.inset(0);
        make.width.equalTo(view.super.width);
        make.height.equalTo(0);
      },
      views: [
        {
          type: "button",
          props: {
            id: "button_next",
            symbol: "arrowtriangle.right.fill",
            bgcolor: $color("#7EC0EE")
          },
          layout: function(make, view) {
            make.top.equalTo(view.super.top).inset(5);
            make.right.inset(view_blank);
            make.width.equalTo(35);
            make.height.equalTo(27);
          },
          events: {
            tapped: function(sender) {
              if (search_result.length > 0) {
                $device.taptic(0);
                $("codeContent").blur();
                if (replaced) {
                  if (search_result_index >= search_result.length) {
                    search_result_index = 0;
                  }
                } else {
                  search_result_index = (search_result_index == search_result.length - 1) ? 0 : search_result_index + 1;
                }
                replaced = false;
                $("codeContent").focus();
                $("codeContent").selectedRange = $range(search_result[search_result_index][1], search_result[search_result_index][0].length);
                $("search_count").text = (search_result_index + 1) + "/" + search_result.length;
              } else if ($("search_input").text.length == 0) {
                $ui.toast("Please Input Query First");
              }
            }
          }
        },
        {
          type: "button",
          props: {
            id: "button_prev",
            symbol: "arrowtriangle.left.fill",
            bgcolor: $color("#7EC0EE")
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.top);
            make.right.equalTo(view.prev.left).inset(5);
            make.width.equalTo(view.prev.width);
            make.height.equalTo(view.prev.height);
          },
          events: {
            tapped: function(sender) {
              if (search_result.length > 0) {
                $device.taptic(0);
                $("codeContent").blur();
                search_result_index = (search_result_index  == 0) ?  search_result.length - 1 : search_result_index - 1;
                replaced = false;
                $("codeContent").focus();
                $("codeContent").selectedRange = $range(search_result[search_result_index][1], search_result[search_result_index][0].length);
                $("search_count").text = (search_result_index + 1) + "/" + search_result.length;
              } else if ($("search_input").text.length == 0) {
                $ui.toast("Please Input Query First");
              }
            }
          }
        },
        {
          type: "label",
          props: {
            id: "search_count",
            text: "0/0",
            bgcolor: $color("#9C9C9C"),
            radius: 5,
            autoFontSize: true,
            align: $align.center
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.top);
            make.right.equalTo(view.prev.left).inset(5);
            make.width.equalTo(60);
            make.height.equalTo(view.prev.height);
          }
        },
        {
          type: "input",
          props: {
            id: "search_input",
            type: $kbType.search,
            darkKeyboard: true
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.top);
            make.right.equalTo(view.prev.left).inset(5);
            make.height.equalTo(view.prev.height);
            make.left.inset(view_blank);
          },
          events: {
            didBeginEditing: function(sender) {
              search_result = [];
              search_result_index = 0;
              replaced = false;
              $("search_count").text = "0/0";
            },
            returned: function(sender) {
              if (sender.text.length > 0) {
                search_result = [];
                search_result_index = 0;
                replaced = false;
                $("search_count").text = "0/0";
                let search_query = sender.text.replace(/\\(?=$|\\)/g, "\\\\");
                let regex1 = RegExp(search_query, 'ig');
                let array1;
                while ((array1 = regex1.exec($("codeContent").text)) !== null) {
                  search_result.push([array1[0], regex1.lastIndex - array1[0].length]);
                }
                if (search_result.length > 0) {
                  $("codeContent").focus();
                  $("codeContent").selectedRange = $range(search_result[search_result_index][1], search_result[search_result_index][0].length);
                  $("search_count").text = "1/" + search_result.length;
                } else {
                  $ui.error("No Match Content");
                }
              } else {
                showSearchView();
              }
            }
          }
        },
        {
          type: "button",
          props: {
            id: "button_replace",
            title: "Replace",
            bgcolor: $color("#8968CD")
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.bottom).inset(5);
            make.right.inset(view_blank);
            make.width.equalTo(85);
            make.height.equalTo(view.prev.height);
          },
          events: {
            tapped: function(sender) {
              if (search_result.length > 0 && $("codeContent").selectedRange.length > 0) {
                $device.taptic(0);
                $("codeContent").text = $("codeContent").text.slice(0, search_result[search_result_index][1]) + $("replace_input").text + $("codeContent").text.slice(search_result[search_result_index][1] + search_result[search_result_index][0].length);
                $("codeContent").blur();
                $("codeContent").focus();
                $("codeContent").selectedRange = $range(search_result[search_result_index][1] + $("replace_input").text.length, 0);
                search_result.splice(search_result_index, 1);
                for (let i = search_result_index; i < search_result.length; i++) {
                  search_result[i][1] = search_result[i][1] + ($("replace_input").text.length - search_result[i][0].length);
                }
                replaced = true;
              } else if ($("search_input").text.length == 0) {
                $ui.toast("Please Input Query First");
              }
            }
          }
        },
        {
          type: "button",
          props: {
            id: "button_replaceall",
            title: "All",
            bgcolor: $color("#8968CD")
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.top);
            make.right.equalTo(view.prev.left).inset(5);
            make.width.equalTo(50);
            make.height.equalTo(view.prev.height);
          },
          events: {
            tapped: function(sender) {
              if (search_result.length > 0) {
                $device.taptic(0);
                let search_query = $("search_input").text.replace(/\\(?=$|\\)/g, "\\\\");
                let regex1 = RegExp(search_query, 'ig');
                $("codeContent").text = $("codeContent").text.replace(regex1, $("replace_input").text);
                $("codeContent").blur();
                $("codeContent").focus();
                $("codeContent").selectedRange = $range(search_result[0][1] + $("replace_input").text.length, 0);
                search_result = [];
                search_result_index = 0;
                replaced = false;
                $("search_count").text = "0/0";
              } else if ($("search_input").text.length == 0) {
                $ui.toast("Please Input Query First");
              }
            }
          }
        },
        {
          type: "input",
          props: {
            id: "replace_input",
            type: $kbType.search,
            darkKeyboard: true
          },
          layout: function(make, view) {
            make.top.equalTo(view.prev.top);
            make.right.equalTo(view.prev.left).inset(5);
            make.height.equalTo(view.prev.height);
            make.left.inset(view_blank);
          },
          events: {
            returned: function(sender) {
              if (search_result.length > 0) {
                replaced = false;
                $("codeContent").focus();
                $("codeContent").selectedRange = $range(search_result[search_result_index][1], search_result[search_result_index][0].length);
              }
            }
          }
        }
      ]
    }
  ];

  $ui.render({
    props: {
      id: "clipView",
      title: "Clip Editor",
      bgcolor: ver ? ui.color.editor_bg : $color("#FFFFFF"),
      navBarHidden: 1
    },
    views: textView
  });
  um = $("codeContent").runtimeValue().$undoManager();
  $clipboard.image && ($("ImageButton").hidden = 0);
}

function showSearchView() {
  $device.taptic(0);
  search_result = [];
  search_result_index = 0;
  replaced = false;
  $("search_input").text = "";
  $("replace_input").text = "";
  if ($("searchView").hidden) {
    $("searchView").updateLayout(function(make) {make.height.equalTo(searchViewHeight)});
    $("searchView").hidden = false;
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeSearchHeight)});
    $("search_input").focus();
  } else {
    $("codeContent").blur();
    $("search_input").text = "";
    $("search_count").text = "0/0";
    $("searchView").hidden = true;
    $("searchView").updateLayout(function(make) {make.height.equalTo(0)});
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeContentHeight)});
    $("codeContent").focus();
  }
}

function showImage(imageData) {
  let ratio = imageData.image.size.height / imageData.image.size.width;
  $("codeContent").blur();
  let initLocation = new Array;
  $ui.push({
    props: {
      id: "QRImageView",
      bgcolor: ver ? ui.color.editor_bg : $color("#FFFFFF"),
      navBarHidden: 1
    },
    views: [
      {
        type: "image",
        props: {
          bgcolor: ver ? ui.color.editor_bg : $color("#FFFFFF"),
          data: imageData
        },
        layout: function(make, view) {
          make.center.equalTo(view.super);
          make.size.equalTo($size(($device.info.screen.width - 100), ($device.info.screen.width - 100) * ratio));
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
            $("codeContent").focus();
          })
        }
      },
      doubleTapped: function(sender) {
        $share.sheet({
          item: ["Image.png", imageData],
          handler: function(success) {
            if (success) {
              $ui.pop();
              $delay(0.6, function() {
                $("codeContent").focus();
              })
            }
          }
        })
      },
      longPressed: function(sender) {
        $photo.save({
          data: imageData,
          handler: function(success) {
            $ui.toast("Image Saved", 0.5);
          }
        })
      }
    }
  });
}

function saveClip(text) {
  $clipboard.set({ type: "public.plain-text", value: text });
  $ui.toast("Saved", 0.8);
  $device.taptic(0);
  closeView();
}

function closeView() {
  $("clipView").remove();
  let app = require("./app");
  app.init();
}

module.exports = {
  clipEditor: clipEditor
};