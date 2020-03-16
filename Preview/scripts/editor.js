const env = $app.env.toString().slice(0, 1) - 1;  // 0/1/2 - app/today/keyboard
let view_blank = 4;
let view_width = $device.info.screen.width - view_blank * 2;
let shareItems = [], naviaddButton = {}, addCount = 0, um;
let searchViewHeight = 65;
let codeSearchHeight = $device.info.screen.height - ((env == 0) ? 510 : 535);
let codeContentHeight = $context.dataItems ? 400 : $device.info.screen.height - ((env == 0) ? 120 : 170);
let search_result = [], search_result_index = 0, replaced = false, scrollViewHeight = 0;

let accessoryView = {
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
        make.top.width.equalTo(view.prev);
        make.left.equalTo(view.prev.right).inset(5);
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
        make.top.bottom.equalTo(view.prev);
        make.left.equalTo(view.prev.right).inset(12);
      },
      events: {
        tapped: function (sender) {
          processText("QRcode");
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
        make.top.bottom.equalTo(view.prev);
        make.left.equalTo(view.prev.right).inset(8);
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
        make.top.bottom.equalTo(view.prev);
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
        make.width.equalTo(50);
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
        make.top.width.equalTo($("UndoButton"));
        make.right.equalTo(view.prev.left).inset(8);
      },
      events: {
        tapped: function (sender) {
          processText("CopyAll");
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
        make.top.width.equalTo(view.prev);
        make.right.equalTo(view.prev.left).inset(5);
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
              $clipboard.text = oriLines[lineIndex];
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
        make.top.width.equalTo(view.prev);
        make.right.equalTo(view.prev.left).inset(5);
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
        icon: $icon("022", $color("#C0C0C0"), $size(20, 20)),
        font: $font("bold", 25),
        bgcolor: $color("clear"),
      },
      layout: function (make, view) {
        make.top.bottom.inset(0);
        make.right.equalTo(view.prev.left).inset(10);
      },
      events: {
        tapped: function (sender) {
          processText("Share");
        }
      }
    }
  ]
};

let searchView = {
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
            let regex1;
            try {
              regex1 = RegExp(sender.text, 'ig');
            } catch (error) {
              $ui.error("Not Regex, Please Check Again", 2);
              return;
            }
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
            let regex1;
            try {
              regex1 = RegExp($("search_input").text, 'ig');
            } catch (error) {
              $ui.error("Not Regex, Please Check Again", 2);
              return;
            }
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
};

let textView = [
  {
    type: "code",
    props: {
      id: "codeContent",
      theme: "vs2015",
      language: "json",
      type: $kbType.default,
      adjustInsets: true,
      // lineNumbers: true,
      darkKeyboard: true,
      font: $font(15),
      radius: 10,
      accessoryView
    },
    layout: function (make, view) {
      make.top.equalTo(view.super.safeAreaTop).inset(view_blank);
      make.width.equalTo(view_width);
      make.height.equalTo(codeContentHeight);
      make.centerX.equalTo(view.super);
    },
    events: {
      ready: function(sender) {
        sender.info = sender.selectedRange.location;
      },
      didChangeSelection: function(sender) {
        sender.info = sender.selectedRange.location;
      }
    }
  },
  searchView
];

function showEditor(textContent, popItems = []) {
  scrollViewHeight = textContent ? codeContentHeight : 0;
  if (!textContent) {
    naviaddButton = {
      title: "Add",
      icon: "104",
      handler: function() {
        if (addCount == 0) {
          addCount = 1;
          shareItems = [];
          scrollViewHeight = codeContentHeight
          $("scrollView").remove();
          let otherViews = drawOthers();
          $("editorView").add(scrollView);
          textView.forEach(element => $("scrollContainer").add(element));
          um = $("codeContent").runtimeValue().$undoManager();
          otherViews.forEach(element => $("scrollContainer").add(element));
        } else {
          $ui.error("You can only add once");
        }
      }
    };
  } else if (popItems.length > 0) {
    naviaddButton = {
      title: "Type",
      icon: "102",
      handler: async(sender) => {
        const {index, title} = await $ui.popover({
          sourceView: sender,
          items: popItems.map(x => x.type)
        });
        $("codeContent").text = popItems.map(x => x.value)[index];
      }
    };
  }

  let otherViews = drawOthers();
  let scrollView = {
    type: "scroll",
    props: {
      id: "scrollView"
    },
    layout: $layout.fill,
    events: {
      pulled: function(sender) {
        env == 0 ? $app.close() : $context.close();
      },
      layoutSubviews: sender => {
        $("scrollContainer").frame = $rect(0, 0, sender.frame.width, scrollViewHeight);
      }
    },
    views: [
      {
        type: "view",
        props: {
          id: "scrollContainer",
        },
      }
    ]
  };

  $ui.render({
    props: {
      id: "editorView",
      bgcolor: $color("#282828"),
      navButtons: [
        {
          title: "Share",
          icon: "022",
          handler: function() {
            if ($("codeContent") && $("codeContent").text && $("codeContent").text.length > 0) {
              shareItems.push($("codeContent").text);
            }
            if (shareItems.length > 0) {
              $share.sheet({
                items: shareItems,
                handler: function(success) {
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
        {
          title: "Json Viewer",
          symbol: "j.circle",
          handler: function () {
            let helper = require("scripts/helper");
            let text = $("codeContent") ? $("codeContent").text : "";
              let json = helper.parseJson(text || "{}");
              if (json && $("codeContent")) {
                helper.renderJson(json);
              }
          }
        },
        naviaddButton
      ]
    },
  });

  $("editorView").add(scrollView);
  if (textContent) {
    textView.forEach(element => $("scrollContainer").add(element));
    $("codeContent").text = textContent;
    um = $("codeContent").runtimeValue().$undoManager();
  }
  otherViews.forEach(element => $("scrollContainer").add(element));
}

function showSearchView() {
  $device.taptic(0);
  search_result = [];
  search_result_index = 0;
  replaced = false;
  $("search_input").text = "";
  $("replace_input").text = "";
  if ($("searchView").hidden) {
    scrollViewHeight += searchViewHeight + view_blank;
    $("searchView").updateLayout(function(make) {make.height.equalTo(searchViewHeight)});
    $("searchView").hidden = false;
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeSearchHeight)});
    $("search_input").focus();
  } else {
    scrollViewHeight -= searchViewHeight + view_blank;
    $("codeContent").blur();
    $("search_input").text = "";
    $("search_count").text = "0/0";
    $("searchView").hidden = true;
    $("searchView").updateLayout(function(make) {make.height.equalTo(0)});
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeContentHeight)});
    $("codeContent").focus();
  }
}

function processText(type) {
  if ($("codeContent").text.length > 0) {
    let OriText = $("codeContent").selectedRange.length > 0 ? $("codeContent").text.substr($("codeContent").selectedRange.location, $("codeContent").selectedRange.length) : $("codeContent").text;
    type == "Share" && $share.sheet({ item: OriText, handler: function(success) { success && $context.close() }});
    type == "QRcode" && showImage($qrcode.encode(OriText).png);
    type == "CopyAll" && ($clipboard.text = $("codeContent").text) && $ui.toast("Copied All");
  } else {
    $ui.error("No Content!", 0.5);
  }
}

function drawOthers() {
  let otherViews = [];
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
      scrollViewHeight += iconSize + 20 + view_blank;
      otherViews.push(dataView);
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
      scrollViewHeight += img_height + view_blank;
      otherViews.push(imageView);
    }
  }
  return otherViews;
}

function convertVol(bnums){
  let size = "";
  if( bnums < 0.1 * 1024 ){
    size = bnums.toFixed(2) + "B"; 	
  }else if(bnums < 0.1 * 1024 * 1024 ){
    size = (bnums / 1024).toFixed(2) + "KB";			
  }else if(bnums < 0.1 * 1024 * 1024 * 1024){
    size = (bnums / (1024 * 1024)).toFixed(2) + "MB";
  }else{
    size = (bnums / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
  let sizestr = size + ""; 
  let len = sizestr.indexOf(".");
  let dec = sizestr.substr(len + 1, 2);
  if(dec == "00"){
    return sizestr.substring(0,len) + sizestr.substr(len + 3,2);
  }
  return sizestr;
}

function showImage(imageData) {
  let ratio = imageData.image.size.height / imageData.image.size.width;
  let baseEdge = $device.info.screen.width - 100;
  let imgSize = $size(baseEdge, baseEdge * ratio);
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
          make.size.equalTo(imgSize);
        }
      }
    ],
    events: {
      touchesBegan: function (sender, location) {
        initLocation = location;
      },
      touchesEnded: function (sender, location) {
        if (Math.abs(location.x - initLocation.x) > 2 || Math.abs(location.y - initLocation.y) > 2) {
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

module.exports = {
  showEditor: showEditor,
  drawOthers: drawOthers
}