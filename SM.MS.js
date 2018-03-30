/*
脚本工具箱合集
1.点击 ⚙️ 进入设置项
2.可在设置内关闭开关或者直接在首页左滑删除
3.支持拖动排序，检索（支持字母检索中文、支持非连续关键字检索: xscj->xteko文本收藏夹）

作者联系：https://t.me/axel_burks
*/
var version = 1.3

var extensions = $cache.get("extensions") || []
const DeviceSIZE = $device.info.screen

if ($app.env == $env.today) {
  $ui.menu({
    items: extensions,
    handler: function(title, idx) {
      $app.openExtension(title)
    }
  })
  return
}

const runIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAvUlEQVQ4T6WT0Q3CMAxEzxvBBlwn6QiM0G7QbgAbsIHLBrABbAATGFlKUEuVpin+iSLlXnT2WfBnyVivqjWAgeRjLfcLUNUDAA3CBkBP8pUDpQCuc/GR5HkJsgSIugFAS9LPWa0BRNEpgCb9KQFEWx3JNlJLAVF3I7n3yyaAmd2rqtoVA8zsLSINyW6LhR6AiyfZyFows6uI1Kl0JgFm9hQRD9KlKEjBp4/K45yt32XyffARZXdg1sTsV4kHH8DdXxEwdimcAAAAAElFTkSuQmCC"

$ui.render({
  props: {
    id: "Main",
    title: "SM.MS"
  },
  views: [
    {
      type: "button",
      props: {
        id: "uploadButton",
        title: "Upload Pics",
        titleColor: $color("black"),
        align: $align.center,
        radius: 10,
        bgcolor: $rgba(30,144,255,1)
      },
      layout: function (make, view) {
        make.top.equalTo(view.prev).inset(15)
        make.height.equalTo(40)
        make.left.inset(10)
        make.right.inset(111)
      },
      events: {
        tapped(sender) {
          $photo.pick({
            multi: true,
            handler: function(resp) {
              if (resp.status) {
                $console.info(resp.results.length)
                for (var i = 0; i < resp.results.length; i++) {
                  var image = resp.results[i].image;
                  //$console.info($props(image.jpg(1.0)))
                  uploadPic(image.png);
                }
              } else {
                $console.info("Select Pics Error!")
              }

              // var image = resp.image
              // uploadPic(image);
            }
          })
        }
      }
    },
    {
      type: "button",
      props: {
        id: "historyButton",
        title: "History",
        titleColor: $color("black"),
        align: $align.center,
        radius: 10,
        bgcolor: $rgba(0, 0, 0, 0.1)
      },
      layout: function(make, view) {
        make.top.inset(15)
        make.right.inset(10)
        make.left.equalTo($("uploadButton").right).offset(8)
        make.height.equalTo($("uploadButton"))
      },
      events: {
        tapped(sender) {
          selectItem()
        }
      }
    },
    {
      type: "list",
      props: {
        id: "resultList",
        //rowHeight: 50,
        separatorHidden: false,
        template: [
          {
            type: "image",
            props: {
              id: "imageViewer",
            },
            layout: function(make, view) {
              make.left.right.inset(10)
              make.top.inset(5)
              make.width.equalTo(DeviceSIZE.width - 40)
              make.height.equalTo(100)
            }
          },
          {
            type: "button",
            props: {
              id: "urlName",
              titleColor: $color("black"),
              bgcolor: $rgba(100, 100, 100, 0.1),
              radius: 5
            },
            layout: function (make, view) {
              var preView = $("imageViewer")
              make.top.equalTo(preView.bottom).offset(10)
              make.left.right.inset(10)
              make.height.equalTo(40)
            }
          },
          {
            type: "button",
            props: {
              id: "urlButton",
              bgcolor: $color("clear"),
              titleColor: $color("clear")
            },
            layout: function (make, view) {
              var preView = $("urlName")
              make.top.equalTo(preView.top).offset(0)
              make.left.equalTo(preView.left).offset(0)
              make.height.equalTo(preView.height)
              make.right.equalTo(preView.right).offset(0)
            },
            events: {
              tapped: function(sender) {
                if (sender.title == "") {
                  return;
                }
                $clipboard.set({
                  "type": "public.plain-text",
                  "value": sender.title
                })
              }
            }
          },
          {
            type: "button",
            props: {
              id: "htmlName",
              titleColor: $color("black"),
              bgcolor: $rgba(100, 100, 100, 0.1),
              radius: 5
            },
            layout: function (make, view) {
              var preView = $("urlName")
              make.top.equalTo(preView.bottom).offset(10)
              make.left.right.inset(10)
              make.height.equalTo(40)
            }
          },
          {
            type: "button",
            props: {
              id: "htmlButton",
              bgcolor: $color("clear"),
              titleColor: $color("clear")
            },
            layout: function (make, view) {
              var preView = $("htmlName")
              make.top.equalTo(preView.top).offset(0)
              make.left.equalTo(preView.left).offset(0)
              make.height.equalTo(preView.height)
              make.right.equalTo(preView.right).offset(0)
            },
            events: {
              tapped: function(sender) {
                if (sender.title == "") {
                  return;
                }
                $clipboard.set({
                  "type": "public.plain-text",
                  "value": sender.title
                })
              }
            }
          },
          {
            type: "button",
            props: {
              id: "markdownName",
              titleColor: $color("black"),
              bgcolor: $rgba(100, 100, 100, 0.1),
              radius: 5
            },
            layout: function (make, view) {
              var preView = $("htmlName")
              make.top.equalTo(preView.bottom).offset(10)
              make.left.right.inset(10)
              make.height.equalTo(40)
            }
          },
          {
            type: "button",
            props: {
              id: "markdownButton",
              bgcolor: $color("clear"),
              titleColor: $color("clear")
            },
            layout: function (make, view) {
              var preView = $("markdownName")
              make.top.equalTo(preView.top).offset(0)
              make.left.equalTo(preView.left).offset(0)
              make.height.equalTo(preView.height)
              make.right.equalTo(preView.right).offset(0)
            },
            events: {
              tapped: function(sender) {
                if (sender.title == "") {
                  return;
                }
                $clipboard.set({
                  "type": "public.plain-text",
                  "value": sender.title
                })
              }
            }
          },
          {
            type: "button",
            props: {
              id: "marklinkName",
              titleColor: $color("black"),
              bgcolor: $rgba(100, 100, 100, 0.1),
              radius: 5
            },
            layout: function (make, view) {
              var preView = $("markdownName")
              make.top.equalTo(preView.bottom).offset(10)
              make.left.right.inset(10)
              make.height.equalTo(40)
            }
          },
          {
            type: "button",
            props: {
              id: "marklinkButton",
              bgcolor: $color("clear"),
              titleColor: $color("clear")
            },
            layout: function (make, view) {
              var preView = $("marklinkName")
              make.top.equalTo(preView.top).offset(0)
              make.left.equalTo(preView.left).offset(0)
              make.height.equalTo(preView.height)
              make.right.equalTo(preView.right).offset(0)
            },
            events: {
              tapped: function(sender) {
                if (sender.title == "") {
                  return;
                }
                $clipboard.set({
                  "type": "public.plain-text",
                  "value": sender.title
                })
              }
            }
          },
          {
            type: "button",
            props: {
              id: "deleteName",
              titleColor: $color("black"),
              bgcolor: $rgba(255, 69, 0, 0.9),
              radius: 5
            },
            layout: function (make, view) {
              var preView = $("marklinkName")
              make.top.equalTo(preView.bottom).offset(10)
              make.left.right.inset(10)
              make.height.equalTo(40)
            }
          },
          {
            type: "button",
            props: {
              id: "deleteButton",
              bgcolor: $color("clear"),
              titleColor: $color("clear")
            },
            layout: function (make, view) {
              var preView = $("deleteName")
              make.top.equalTo(preView.top).offset(0)
              make.left.equalTo(preView.left).offset(0)
              make.height.equalTo(preView.height)
              make.right.equalTo(preView.right).offset(0)
            },
            events: {
              tapped: function(sender) {
                // if (sender.title == "") {
                //   return;
                // }
                deletePic(sender.title);
              }
            }
          },
        ]
      },
      layout: function(make) {
        make.left.bottom.right.equalTo(0)
        make.top.equalTo($("uploadButton").bottom).offset(10)
      }
    }
  ]
})

// var temp = [];
// temp = [{
//   imageViewer: {
//     src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAASCAMAAAB7LJ7rAAAANlBMVEUAAABnZ2dmZmZmZmZnZ2dmZmZmZmZmZmZnZ2dnZ2dnZ2dmZmZoaGhnZ2dnZ2dubm5paWlmZmbvpwLOAAAAEXRSTlMA9h6lQ95r4cmLdHNbTzksJ9o8+Y0AAABcSURBVCjPhc1JDoAwFAJQWus8cv/LqkkjMXwjCxa8BfjLWuI9L/nqhmwiLYnpAMjqpuQMDI+bcgNyW921A+Sxyl3NXeWu7lL3WOXS0Ck1N3WXut/HEz6z92l8Lyf1mAh1wPbVFAAAAABJRU5ErkJggg=="
//   },
//   urlName: {
//     title: "  URL Link"
//   },
//   htmlName: {
//     title: "  HTML Style"
//   },
//   markdownName: {
//     title: "  MarkDown Style"
//   },
//   marklinkName: {
//     title: "  MDLink Style"
//   }
// }];
// $("resultList").data = temp;

function selectItem() {
  $ui.push({
    props: {
      id: "Main",
      title: "Tool Box"
    },
    views: [
      {
        type: "input",
        props: {
          id: "uploadButton",
          type: $kbType.search,
          align: $align.center,
          clearsOnBeginEditing:true,
          bgcolor: $rgba(0, 0, 0, 0.04),
          placeholder: "搜索"
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev).inset(8)
          make.height.equalTo(32)
          make.left.inset(10)
          make.right.inset(45)
        },
        events: {
          didBeginEditing: function(sender) {
            if (listView.data.length != extensions.length) {
              updateItem(extensions)
            }
          },
          changed: function(sender) {
            if (sender.text) {
              searchItem(sender.text)
            } else {
              updateItem(extensions)
            }
          },
          returned: function (sender) {
            
            if (sender.text) {
              sender.blur()
              searchItem(sender.text)
            } else {
              sender.blur()
              updateItem(extensions)
            }
          }
        }
      },
      {
        type: "button",
        props: {
          title: "⚙️",
          align: $align.center,
          bgcolor: $rgba(0, 0, 0, 0)
        },
        layout: function(make, view) {
          make.top.inset(8)
          make.right.inset(10)
          make.left.equalTo($("uploadButton").right).offset(5)
          make.height.equalTo($("uploadButton"))
        },
        events: {
          tapped(sender) {
            selectItem()
          }
        }
      },
      {
        type: "list",
        props: {
          id: "list",
          reorder: true,
          rowHeight: 50,
          separatorHidden: true,
          template: [
            {
              type: "view",
              props: {
                id: "itemView",
                bgcolor: $rgba(100, 100, 100, 0.1),
                radius: 5
              },
              layout: function (make, view) {
                make.left.right.inset(10)
                make.top.inset(5)
                make.width.equalTo(DeviceSIZE.width - 40)
                make.height.equalTo(40)
              }
            },
            {
              type: "button",
              props: {
                id: "icon",
                //imageEdgeInsets: $insets(0, (DeviceSIZE.width - 40)/4, 0, 0),
                //contentEdgeInsets: $insets(0, 100, 0, 0),
                bgcolor: $color("clear")
              },
              layout: function (make, view) {
                var preView = $("itemView")
                make.top.equalTo(preView.top).offset(0)
                make.left.equalTo(preView.left).offset(0)
                make.height.equalTo(preView.height)
                make.width.equalTo((DeviceSIZE.width - 40)/5)
              }
            },
            {
              type: "button",
              props: {
                id: "run",
                src: runIcon,
                bgcolor: $color("clear")
              },
              layout: function (make, view) {
                var preView = $("itemView")
                make.top.equalTo(preView.top).offset(0)
                make.right.equalTo(preView.right).offset(0)
                make.height.equalTo(preView.height)
                make.width.equalTo((DeviceSIZE.width - 40)/7)
              }
            },
            {
              type: "label",
              props: {
                id: "name",
                textColor: $color("black"),
                autoFontSize: true,
                bgcolor: $color("clear"),
                align: $align.center
              },
              layout: function (make) {
                var preView = $("icon")
                make.top.equalTo($("itemView").top).offset(0)
                make.left.equalTo(preView.right).offset(0)
                make.height.equalTo(preView.height)
                make.right.equalTo($("run").left).offset(0)
              }
            },
            {
              type: "button",
              props: {
                id: "tapArea",
                bgcolor: $color("clear"),
                titleColor: $color("clear")
              },
              layout: function (make, view) {
                var preView = $("itemView")
                make.top.equalTo(preView.top).offset(0)
                make.left.equalTo(preView.left).offset(0)
                make.height.equalTo(preView.height)
                make.right.equalTo(preView.right).offset(0)
              },
              events: {
                tapped: function(sender) {
                  if (sender.title == "") {
                    return
                  }
                  if ($app.env == $env.app) {
                    $app.openURL("jsbox://run?name=" + encodeURI(sender.title))
                  } else {
                    $addin.run(sender.title)
                  }
                }
              }
            },
          ],
          actions: [
            {
              title: "delete",
              handler: function(sender, indexPath) {
                deleteItem(indexPath)
              }
            }
          ]
        },
        layout: function(make) {
          make.left.bottom.right.equalTo(0)
          make.top.equalTo($("uploadButton").bottom).offset(10)
        },
        events: {
          reorderMoved: function(from, to) {
            extensions.move(from.row, to.row)
          },
          reorderFinished: function() {
            saveItems()
          }
        }
      }
    ]
  })
}

function updateItem(data, status) {
  var temp = []
  count = data.length
  if (count > 0) {
    for (var id = 0; id < count; id++) {
      var ext_name = data[id]
      temp.push({
        icon: {
          icon: $icon(ext_icon[ext_name], $color("darkGray"), $size(20, 20)),
        },
        name: {
          text: ext_name
        },
        run: {
          src: runIcon
        },
        tapArea: {
          title: ext_name
        }
      })
    }
  } else {
    if (status == "init") {
      temp = [{
        icon: {
          icon: $icon("100", $color("clear"), $size(20, 20)),
        },
        name: {
          text: "未添加扩展，请点击 ⚙️ 按钮"
        },
        run: {
          src: ""
        },
        tapArea: {
          title: ""
        }
      }]
    } else {
      temp = [{
        icon: {
          icon: $icon("100", $color("clear"), $size(20, 20)),
        },
        name: {
          text: "Inputing...Try to tap Return button..."
        },
        run: {
          src: ""
        },
        tapArea: {
          title: ""
        }
      }]
    }
  }
  
  listView.data = temp
}

function uploadPic(image) {
  $ui.toast("Uploading...");
  $http.upload({
    url: "https://sm.ms/api/upload",
    files: [
      {
        "data": image,
        "name": "smfile"
      }
    ],
    progress: function(percentage) {

    },
    handler: function(resp) {
      $console.info(resp.data)
      // var data = resp.data
      // if (data.code == "success") {
      //   $console.info(data)
      // } else {
      //   $ui.toast(data.msg);
      // }
    }
  })

}

function deletePic(url) {
  $console.info(url)
  $http.get({
    url: url,
    handler: function(resp) {
      var data = resp.data
      $ui.toast("File delete success!")
      // if (data.indexOf("File delete success") != -1) {
      //   $ui.toast("File delete success!")
      //   //delayClose(0.8)
      // }
    }
  })
}

function saveItems() {
  $cache.set("extensions", extensions)
}

function searchItem(query) {
  function isContain(element) {
    var rex = query.split("").join(".*")
    var patt = new RegExp("[\u4e00-\u9fa5]")
    var temp = ""
    if (patt.test(query)) {
      temp = element
    } else {
      temp = ConvertPinyin(element)
    }
    return new RegExp(rex,"i").test(temp)
  }
  var result = extensions.filter(isContain)
  updateItem(result)
}

function updateSwitch(name, delay) {
  var index = extensions.indexOf(name)
  if (index === -1) {
    insertItem(name)
  } else {
    extensions.splice(index, 1)
    saveItems()
  }
  $("switchAll").on = statusAll()
  $delay(delay, function() {
    updateSwitchlist()
  })
  updateItem(extensions, "init")
}

function updateSwitchlist() {
  $("addList").data = $file.extensions.map(function(item, index) { 
    return {
      itemName: { text: item },
      itemSwitch: { on: extensions.indexOf(item) != -1, info: index }
    }
  })
}

function statusAll() {
  var status = true
  var itemAll = $file.extensions
  for (var i = 0; i < itemAll.length; i++) {
    if (extensions.indexOf(itemAll[i]) == -1) {
      status = false
    }
  }
  return status
}

function switchAll(status) {
  if (status == true) {
    var allexts = $file.extensions
    for (var i = 0; i < extensions.length; i++) {
      allexts.removeByValue(extensions[i]);
    }
    extensions = extensions.concat(allexts)
  } else {
    extensions = []
  }
  updateSwitchlist()
  updateItem(extensions, "init")
  saveItems()
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
        $app.close()
      }
    }
  })
}

Array.prototype.move = function(from, to) {
  var object = this[from]
  this.splice(from, 1)
  this.splice(to, 0, object)
}

Array.prototype.removeByValue = function(val) {
  for(var i=0; i<this.length; i++) {
    if(this[i] == val) {
      this.splice(i, 1);
      break;
    }
  }
}

$thread.background({
  handler: function() {
    checkVersion()
  }
})

function checkVersion() {
  $http.get({
    url: "https://raw.githubusercontent.com/axelburks/JSBox/master/updateInfo",
    handler: function(resp) {
      var afterVersion = resp.data["Tool Box"]["version"];
      var msg = resp.data["Tool Box"]["msg"];
      if (afterVersion > version) {
        $ui.alert({
          title: "检测到新的版本！V" + afterVersion,
          message: "更新说明：\n" + msg,
          actions: [{
            title: "更新",
            handler: function() {
              var url = "jsbox://install?url=https://raw.githubusercontent.com/axelburks/JSBox/master/Tool%20Box.js&name=" + $addin.current.name.split(".js")[0] + "&icon=" + $addin.current.icon;
              $app.openURL(encodeURI(url));
              $app.close()
            }
          }, {
            title: "取消"
          }]
        })
      }
    }
  })
}
