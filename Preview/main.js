let view_blank = 10;
let view_width = $device.info.screen.width - view_blank * 2;
let shareItems = [], naviaddButton = {}, addCount = 0, um;

let textContent = "";
if ($context.safari) {
  if ($context.safari.items.selection.text) {
    textContent = textContent + $context.safari.items.selection.text + "\n\n";
  }
  textContent = textContent + $context.safari.items.title + "\n" + $context.safari.items.baseURI
}
if ($context.textItems) {
  for (let i in $context.textItems) {
    textContent = textContent + ($context.textItems[i] ? $context.textItems[i] + "\n" : "");
  }
}
textContent = textContent ? textContent + "\n" : "";
if ($context.linkItems) {
  for (let i in $context.linkItems) {
    if ($context.linkItems[i].indexOf("file:///")) {
      textContent = textContent + $context.linkItems[i] + "\n";
    }
  }
}


if (!textContent) {
  naviaddButton = {
    title: "Add",
    icon: "104",
    handler: function() {
      if (addCount == 0) {
        addCount = 1;
        shareItems = [];
        $("scrollView").remove();
        $("mainView").add(scrollView);
        $("scrollView").relayout();
        $("scrollView").add(textView);
        um = $("codeContent").runtimeValue().$undoManager();
        drawOthers();
      } else {
        $ui.error("You can only add once");
      }
    }
  };
}

let textView = {
  type: "code",
  props: {
    id: "codeContent",
    theme: "dracula",
    type: $kbType.default,
    adjustInsets: true,
    lineNumbers: true,
    darkKeyboard: true,
    font: $font(15),
    radius: 10,
    accessoryView: {
      type: "view",
      props: {
        height: 40,
        bgcolor: $color("#080808"),
        borderWidth: 0.5,
        borderColor: $color("clear")
      },
      views: [
        {
          type: "button",
          props: {
            id: "UndoButton",
            title: "⃔",
            radius: 6,
            font: $font(14),
            bgcolor: $color("#404040"),
            borderWidth: 0.5,
            borderColor: $color("#606060")
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
            bgcolor: $color("#404040"),
            borderWidth: 0.5,
            borderColor: $color("#606060")
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
            icon: $icon("017", $color("#C0C0C0"), $size(20, 20)),
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
              let regex = /([\w-]+:\/\/|(mailto|tel):)([^\s<>]+)?/g;
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
            id: "doneButton",
            title: "Done",
            font: $font("bold", 14),
            bgcolor: $color("#0a85ff"),
            borderWidth: 0.5,
            borderColor: $color("clear")
          },
          layout: function (make, view) {
            make.top.equalTo($("UndoButton").top);
            make.right.inset(5);
            make.width.equalTo(60);
            make.centerY.equalTo(view.super);
          },
          events: {
            tapped: function (sender) {
              $("codeContent").blur();
            }
          }
        },
        {
          type: "button",
          props: {
            id: "copyButton",
            title: "CA",
            font: $font("bold", 14),
            bgcolor: $color("#383838"),
            borderWidth: 0.5,
            borderColor: $color("clear")
          },
          layout: function (make, view) {
            make.top.equalTo($("UndoButton").top);
            make.width.equalTo($("UndoButton").width);
            make.right.equalTo($("doneButton").left).inset(8);
            make.centerY.equalTo(view.super);
          },
          events: {
            tapped: function (sender) {
              $clipboard.set({
                "type": "public.plain-text",
                "value": $("codeContent").text
              });
              $ui.toast("Copied All");
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
            make.right.equalTo($("copyButton").left).inset(5);
            make.centerY.equalTo(view.super);
          },
          events: {
            tapped: function (sender) {
              let oriText = $("codeContent").text;
              let curLoc = $("codeContent").info;
              let oriLines = oriText.split("\n");

              charCount = 0;
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
            make.right.equalTo($("clineButton").left).inset(5);
            make.centerY.equalTo(view.super);
          },
          events: {
            tapped: function (sender) {
              let oriText = $("codeContent").text;
              let curLoc = $("codeContent").info;
              let oriLines = oriText.split("\n");

              charCount = 0;
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
            icon: $icon("022", $color("#C0C0C0"), $size(20, 20)),
            font: $font("bold", 25),
            bgcolor: $color("clear"),
          },
          layout: function (make, view) {
            make.top.bottom.inset(0);
            make.right.equalTo($("dlineButton").left).inset(10);
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
    make.centerX.equalTo(view.super);
    make.width.equalTo(view_width);
    make.top.inset(view_blank);
    make.height.equalTo(378);
  },
  events: {
    didChangeSelection: function(sender) {
      sender.info = sender.selectedRange.location;
    }
  }
};

let scrollView = {
  type: "scroll",
  props: {
    id: "scrollView"
  },
  layout: function(make, view) {
    make.left.right.top.bottom.inset(0);
  },
  events: {
    pulled: function(sender) {
      $context.close();
    }
  }
};

$ui.render({
  props: {
    id: "mainView",
    bgcolor: $color("#202020"),
    navButtons: [
      {
        title: "Share",
        icon: "022",
        handler: function() {
          $console.info($("codeContent").text);
          $console.info($("codeContent").text.length);
          if ($("codeContent") && $("codeContent").text && $("codeContent").text.length > 0) {
            shareItems.push($("codeContent").text);
          }
          if (shareItems.length > 0) {
            $share.sheet({
              items: shareItems,
              handler: function(success) {
                $console.info(success);
                if (success) {
                  $context.close();
                } else if ($("codeContent") && $("codeContent").text && $("codeContent").text.length > 0) {
                  shareItems.pop();
                }
              }
            });
          } else {
            $ui.error("Nothing to share");
          }
        }
      },
      naviaddButton
    ]
  }
});
$("mainView").add(scrollView);

if (textContent) {
  $("scrollView").add(textView);
  $("codeContent").text = textContent;
  um = $("codeContent").runtimeValue().$undoManager();
}
drawOthers();

function drawOthers() {
  if ($context.dataItems) {
    let iconSize = 20;
    for (let dataIndex in $context.dataItems) {
      shareItems.push({
        "name": $context.dataItems[dataIndex].fileName,
        "data": $context.dataItems[dataIndex]
      });
      let dataView = {
        type: "button",
        props: {
          id: "dataView" + dataIndex,
          title: "" + $context.dataItems[dataIndex].info.mimeType + " (" + convertVol($context.dataItems[dataIndex].info.size) + ")",
          font: $font(15),
          info: dataIndex,
          icon: $icon("152", $color("#ffffff"), $size(iconSize, iconSize)),
          bgcolor: $color("#333353"),
          titleEdgeInsets: $insets(0, 20, 0, 0)
        },
        layout: function (make, view) {
          make.width.equalTo(view_width);
          make.height.equalTo(iconSize + 20);
          make.left.equalTo(view.super.left).inset(view_blank);
          if (view.prev) {
            make.top.equalTo(view.prev.bottom).offset(view_blank);
          } else {
            make.top.inset(view_blank);
          }
        },
        events: {
          tapped: function (sender) {
            if ($context.dataItems[sender.info].info.mimeType.indexOf("text") > -1) {
              $quicklook.open({
                text: $context.dataItems[sender.info].string
              })
            } else {
              $quicklook.open({
                data: $context.dataItems[sender.info]
              })
            }
          },
          longPressed: function(sender) {
            $ui.alert({
              title: "Data INFO",
              message: "Filename: " + $context.dataItems[sender.sender.info].fileName + "\nMimetype: " + $context.dataItems[sender.sender.info].info.mimeType,
            });
          }
        }
      };
      $("scrollView").add(dataView);
    }
  }
  
  if ($context.imageItems) {
    for (let imgIndex in $context.imageItems) {
      shareItems.push($context.imageItems[imgIndex]);
      let ori_img_width = $context.imageItems[imgIndex].info.width;
      let img_width = ori_img_width > view_width ? view_width : ori_img_width;
      let img_height = $context.imageItems[imgIndex].info.height / (ori_img_width / img_width);
      let imageView = {
        type: "image",
        props: {
          id: "imageView" + imgIndex,
          info: imgIndex,
          data: $context.imageItems[imgIndex].resized($size(img_width, img_height)).png
        },
        layout: function (make, view) {
          make.left.inset(view_blank);
          make.width.equalTo(img_width);
          make.height.equalTo(img_height);
          if (view.prev) {
            make.top.equalTo(view.prev.bottom).offset(view_blank);
          } else {
            make.top.inset(view_blank);
          }
        },
        events: {
          tapped: function (sender) {
            $quicklook.open({
              data: $context.imageItems[imgIndex].resized($size(img_width, img_height)).png
            })
          }
        }
      };
      $("scrollView").add(imageView);
    }
  }
  
  $("scrollView").resize();
}

function showImage(imageData) {
  let ratio = imageData.image.size.height / imageData.image.size.width;
  $("codeContent").blur();
  let initLocation = new Array();
  $ui.push({
    props: {
      id: "QRImageView",
      bgcolor: $color("#202020"),
      navBarHidden: 1
    },
    views: [
      {
        type: "image",
        props: {
          bgcolor: $color("#FFFFFF"),
          data: imageData
        },
        layout: function (make, view) {
          make.center.equalTo(view.super);
          make.size.equalTo(
            $size(
              $device.info.screen.width - 100,
              ($device.info.screen.width - 100) * ratio
            )
          );
        }
      }
    ],
    events: {
      touchesBegan: function (sender, location) {
        initLocation = location;
      },
      touchesEnded: function (sender, location) {
        if (
          Math.abs(location.x - initLocation.x) > 2 ||
          Math.abs(location.y - initLocation.y) > 2
        ) {
          $ui.pop();
        }
      },
      doubleTapped: function (sender) {
        $share.sheet({
          item: ["Image.png", imageData],
          handler: function (success) {
            if (success) {
              $ui.pop();
            }
          }
        });
      },
      longPressed: function (sender) {
        $photo.save({
          data: imageData,
          handler: function (success) {
            $ui.toast("Image Saved", 0.5);
          }
        });
      }
    }
  });
}

function convertVol(bnums){
  var size = "";
  if( bnums < 0.1 * 1024 ){
    size = bnums.toFixed(2) + "B"; 	
  }else if(bnums < 0.1 * 1024 * 1024 ){
    size = (bnums / 1024).toFixed(2) + "KB";			
  }else if(bnums < 0.1 * 1024 * 1024 * 1024){
    size = (bnums / (1024 * 1024)).toFixed(2) + "MB";
  }else{
    size = (bnums / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  
  var sizestr = size + ""; 
  var len = sizestr.indexOf(".");
  var dec = sizestr.substr(len + 1, 2);
  if(dec == "00"){
    return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
  }
  return sizestr;
}