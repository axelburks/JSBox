let ui = require('scripts/ui')
let utils = require('scripts/utils')
let sync = require('scripts/sync')


// let engine = $objc("BBEngine").$shared();
// let diskCache = engine.$global().$cache().$cache().$diskCache();
// let metadata = diskCache.$metadata();
// let keys = metadata.$allKeys();

// let testallCache = new Object();
// for (var idx=0; idx<keys.$count(); ++idx) {
//   let key = keys.$objectAtIndex(idx).rawValue();
//   testallCache[key] = $cache.get(key)
// }
// $console.info(testallCache);


let colors = [$rgba(120, 219, 252, 0.9), $rgba(252, 175, 230, 0.9), $rgba(252, 200, 121, 0.9), $rgba(187, 252, 121, 0.9), $rgba(173, 121, 252, 0.9), $rgba(252, 121, 121, 0.9), $rgba(121, 252, 252, 0.9)]
let showType = ["Scheme", "Appid", "Script", "Folder"]
let showMode = ["图文模式", "小图标", "大图标"]
let broswers = ["Safari", "Chrome", "UC", "Firefox", "QQ", "Opera", "Quark", "iCab", "Maxthon", "Dolphin", "2345", "Alook"]

const mColor = {
  gray: "#a2a2a2",
  blue: "#3478f7",
  black: "#303032",
  green: "#27AE60",
  red: "#E74C3C",
  iosGreen: "#4CD964",
}
const mIcon = [
  {
    blue: $icon("026", $color(mColor.blue), $size(25, 25)),
    gray: $icon("026", $color(mColor.gray), $size(25, 25)),
  },
  {
    blue: $icon("102", $color(mColor.blue), $size(25, 25)),
    gray: $icon("102", $color(mColor.gray), $size(25, 25)),
  },
  {
    blue: $icon("002", $color(mColor.blue), $size(25, 25)),
    gray: $icon("002", $color(mColor.gray), $size(25, 25)),
  },
]
function show() {
  main()
}

function main() {
  sync.sync()
  setupMainView()
}

let contentViews = ["widgetView", "inappView", "settingView"]
  
function setupMainView(type) {
  let openFrom = 1
  let query = $context.query
  if(query) {
    switch(query.from) {
      case "0":
      case "1":
      case "2":
        openFrom = 0;
        break;
      default:
        break;
    }
  }
  $app.autoKeyboardEnabled = false
  $app.keyboardToolbarEnabled = false
  $ui.render({
    props: {
      id: "mainView",
      title: "Magic Launcher",
      navBarHidden: true,
      homeIndicatorHidden: 1,
      statusBarStyle: 0,
      //debugging: true
    },
    views: [{
        type: "blur",
        props: {
          style: 5 // 0 ~ 5 调整背景的颜色程度
        },
        layout: function(make, view) {
          make.left.bottom.right.inset(0)
          if($device.info.version >= "11"){
            make.top.equalTo(view.super.safeAreaBottom).offset(-50)
          } else {
            make.height.equalTo(50)
          }
        },
      },
      {
        type: "matrix",
        props: {
          id: "tab",
          columns: 3,
          itemHeight: 50,
          spacing: 0,
          scrollEnabled: false,
          bgcolor: $color("clear"),
          template: [{
              type: "image",
              props: {
                id: "menu_image",
                bgcolor: $color("clear")
              },
              layout: function(make, view) {
                make.centerX.equalTo(view.super)
                make.width.height.equalTo(25)
                make.top.inset(7)
              },
            },
            {
              type: "label",
              props: {
                id: "menu_label",
                font: $font(10),
              },
              layout: function(make, view) {
                var preView = view.prev
                make.centerX.equalTo(preView)
                make.bottom.inset(5)
              }
            }
          ],
          data: [{
            menu_image: {
              icon: mIcon[0].gray,
            },
            menu_label: {
              text: "Widget",
              textColor: $color(mColor.gray)
            }
          },
          {
            menu_image: {
              icon: mIcon[1].blue,
            },
            menu_label: {
              text: "Main",
              textColor: $color(mColor.blue)
            }
          },
          {
            menu_image: {
              icon: mIcon[2].gray,
            },
            menu_label: {
              text: "Setting",
              textColor: $color(mColor.gray),
            }
          }
        ],
        },
        layout: function(make, view) {
          make.height.equalTo(50)
          make.left.right.inset(0)
          if($device.info.version >= "11"){
            make.bottom.equalTo(view.super.safeAreaBottom)
          } else {
            make.bottom.inset(0)
          }
        },
        events: {
          didSelect(sender, indexPath, data) {
            handleSelect(sender, indexPath.row)
          }
        }
      },
      {
        type: "canvas",
        layout: function(make, view) {
          var preView = view.prev
          make.top.equalTo(preView.top)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("gray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },
      // {
      //   type: "view",
      //   props: {
      //     bgcolor: $color("white"),
      //   },
      //   layout: function(make, view) {
      //     make.width.equalTo(view.super)
      //     make.left.right.top.inset(0)
      //     make.height.equalTo(20)
      //   },
      // },
      // {
      //   type: "button",
      //   props: {
      //     id: "launcherAddbutton",
      //     //title: "Add Launcher",
      //     src: "assets/add.png",
      //     bgcolor: $color("lightGray"),
      //     // titleColor: $color("white"),
      //     circular: true,
      //     hidden: true
      //   },
      //   layout: function(make, view) {
      //     // make.left.right.inset(10)
      //     make.centerX.equalTo(view.super)
      //     make.width.equalTo(40)
      //     make.bottom.equalTo($("tab").top).inset(20)
      //     make.height.equalTo(40)
      //   },
      //   events: {
      //     tapped: function(sender) {
      //       launcherEditView("widget")
      //     }
      //   }
      // },
      {
        type: "view",
        props: {
          id: "content",
          bgcolor: $color("clear"),
          clipsToBounds: true,
        },
        layout: function(make, view) {
          make.width.equalTo(view.super)
          make.left.right.inset(0)
          make.bottom.equalTo($("tab").top)
          if($device.info.version >= "11"){
            make.top.equalTo(view.super.safeAreaTop)
          } else {
            make.top.inset(20)
          }
        },
        // views: [genShowView(openFrom)],
        views: [],
      },
    ]
  })
  handleSelect($("tab"), openFrom)
}

function setupFolderView(folderID) {
  var folderViews = {
    type: "blur",
    props: {
      id: "folderBlur",
      alpha: 0,
      style: 3
    },
    views: [{
      type: "view",
      props: {
        id: "folderImg",
        smoothRadius: 15,
        bgcolor: $color("white")
      },
      views: [genShowView(folderID)],
      layout: function (make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(310, 323))
      },
      events: {
        tapped: function (sender) {}
      }
    }],
    layout: $layout.fill,
    events: {
      tapped: function (sender) {
        $ui.animate({
          duration: 0.3,
          animation: function () {
            $("folderBlur").alpha = 0
            $("folderImg").scale(1)
          }
        })
        $delay(0.4, function() {
          $("folderBlur").remove()
        });
      }
    }
  }
  $("mainView").add(folderViews)
  $ui.animate({
    duration: 0.3,
    animation: function () {
      $("folderBlur").alpha = 1
      $("folderImg").scale(1.1)
    }
  })
}


function handleSelect(view, row) {
  // if(row == 0) {
  //   $("launcherAddbutton").hidden = false
  // } else {
  //   $("launcherAddbutton").hidden = true
  // }
  let newData = view.data
  for(let i = 0; i < newData.length; i++) {
    if (i == row) {
      newData[i].menu_label.textColor = $color(mColor.blue)
      newData[i].menu_image.icon = mIcon[i].blue
      if($(contentViews[i]) == undefined) {
        $("content").add(getContentView(i)) 
      }
      $(contentViews[i]).hidden = false
    } else {
      newData[i].menu_label.textColor = $color(mColor.gray)
      newData[i].menu_image.icon = mIcon[i].gray
      if($(contentViews[i]) != undefined) {
        $(contentViews[i]).hidden = true
      }
    }
  }
  view.data = newData
}

function getContentView(number) {
  switch(number) {
    case 0: return genShowView("widget")
    case 1: return genShowView("inapp")
    case 2: return genSettingView()
  }
}

function genRowsView(reorder, columns, source) {
  let itemsource = source
  let rowsShow = "folderrowsShow"
  let deleteButton = "folderdeleteButton"
  let itemHeight = 35
  let bgcolor = $rgba(210, 216, 234, 0.6)
  if(source == "inapp") {
    itemsource = "inappItems"
    rowsShow = "inapprowsShow"
    deleteButton = "inappdeleteButton"
    itemHeight = 35
    bgcolor = $rgba(210, 216, 234, 0.6)
  } else if(source == "widget") {
    itemsource = "widgetItems"
    rowsShow = "widgetrowsShow"
    deleteButton = "widgetdeleteButton"
    itemHeight = 35
    bgcolor = $rgba(210, 216, 234, 1)
  } 
  let view = {
    type: "matrix",
    props: {
      id: rowsShow,
      columns: columns, //横行个数
      itemHeight: itemHeight, //图标到字之间得距离
      spacing: 8, //每个边框与边框之间得距离
      reorder: reorder,
      bgcolor: bgcolor,
      template: ui.genTemplate(source),
      data: utils.getCache(itemsource, [])
    },
    layout: $layout.fill,
    events: {
      didSelect: function(sender, indexPath, data) {
        let view = $(deleteButton)
        if(view == undefined || view.info == false) {
          if(data.content != "") {
            $device.taptic(1)
            if(data.type == "Folder") {
              //文件夹处理
              // let folder = require("scripts/folder") 
              // folder.showFolderView(data.content)
              setupFolderView(data.content)
            } else {
              utils.myOpenContent(data.type, data.content)
            }
          }
        } else {
          $(rowsShow).delete(indexPath)
          $file.delete(data.icon.src)
          $cache.set(itemsource, $(rowsShow).data)
          sync.upload()
        }
      },
      reorderFinished: function(data) {
        $cache.set(itemsource, $(rowsShow).data)
      },
      didLongPress: function(sender, indexPath, data) {
        $device.taptic(2)
        $ui.menu({
          items: ["Delete", "Copy Content", "Save to Homescreen", "Edit"],
          handler: function(title, idx) {
            if(idx == 0) {
              $(rowsShow).delete(indexPath)
              $file.delete(data.icon.src)
              $cache.set(itemsource, $(rowsShow).data)
              sync.upload()
            } else if(idx == 1) {
              $clipboard.text = utils.getCache(itemsource, [])[indexPath.row].content
              ui.showToastView($("mainView"), mColor.green, "Copied")
            } else if(idx == 2) {
              $system.makeIcon({ title: utils.getCache(itemsource, [])[indexPath.row].title.text, scheme: utils.getCache(itemsource, [])[indexPath.row].content, icon: $(rowsShow).cell(indexPath).get("icon").image })
            } else if(idx == 3) {
              launcherEditView(source, "edit", data.title.text, data.icon.src, data.type, data.content, data.descript, indexPath)
            }
          }
        })
      }
    }
  }
  return view
}

function genShowView(source) {
  let viewname = "folderView"
  let addButton = "folderaddButton"
  let reorderButton = "folderreorderButton"
  let rowsShow = "folderrowsShow"
  let rowsShowParent = "folderrowsShowParent"
  let columns = "foldercolumns"
  let deleteButton = "folderdeleteButton"
  let itemsource = source
  let iconpath = "drive://magic-launcher/app-icons/folder/" + source

  if(source == "widget") {
    viewname = "widgetView"
    addButton = "widgetaddButton"
    reorderButton = "widgetreorderButton"
    rowsShow = "widgetrowsShow"
    rowsShowParent = "widgetrowsShowParent"
    columns = "widgetcolumns"
    deleteButton = "widgetdeleteButton"
    itemsource = "widgetItems"
    iconpath = "drive://magic-launcher/app-icons/widget"
  } else if(source == "inapp") {
    viewname = "inappView"
    addButton = "inappaddButton"
    reorderButton = "inappreorderButton"
    rowsShow = "inapprowsShow"
    rowsShowParent = "inapprowsShowParent"
    columns = "inappcolumns"
    deleteButton = "inappdeleteButton"
    itemsource = "inappItems"
    iconpath = "drive://magic-launcher/app-icons/inapp"
  }

  let view = {
    type: "view",
    props: {
      id: viewname,
      hidden: false,
    },
    layout: $layout.fill,
    views: [{
      type: "button",
      props: {
        id: addButton,
        icon: $icon("104", $color("#2ECC71"), $size(20, 20)),
        bgcolor: $color("clear")
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.right.inset(10)
        make.width.equalTo(50)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          launcherEditView(source)
        }
      }
    },{
      type: "button",
      props: {
        id: reorderButton,
        //title: "排序",
        icon: $icon("067", $color("#3496DF"), $size(20, 20)),
        bgcolor: $color("clear"),
        //titleColor: $color("#3496DF"),
        info: false,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.top.inset(10)
        // make.right.inset(10)
        make.width.equalTo(50)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          if (sender.info == false) {
            sender.info = true
            sender.bgcolor = $color("#2E86C1")
            // sender.titleColor = $color("white")
            sender.icon = $icon("067", $color("white"), $size(20, 20))
            $(rowsShow).remove()
            $(rowsShowParent).add(genRowsView(true, utils.getCache(columns), source))
          } else {
            sender.info = false
            sender.bgcolor = $color("clear")
            // sender.titleColor = $color("#3496DF")
            sender.icon = $icon("067", $color("#3496DF"), $size(20, 20))
            $(rowsShow).remove()
            $(rowsShowParent).add(genRowsView(false, utils.getCache(columns), source))
          }
        }
      }
    },
    {
      type: "button",
      props: {
        id: deleteButton,
        // title: "删除",
        bgcolor: $color("clear"),
        // titleColor: $color("orange"),
        icon: $icon("027", $color("orange"), $size(20, 20)),
        info: false,
      },
      layout: function(make, view) {
        make.top.inset(10)
        make.left.inset(10)
        make.width.equalTo(50)
        make.height.equalTo(30)
      },
      events: {
        tapped: function(sender) {
          if (sender.info == undefined || sender.info == false) {
            sender.info = true
            sender.bgcolor = $color("#C70039")
            // sender.titleColor = $color("white")
            sender.icon = $icon("027", $color("white"), $size(20, 20))
          } else {
            sender.info = false
            sender.bgcolor = $color("clear")
            // sender.titleColor = $color("orange")
            sender.icon = $icon("027", $color("orange"), $size(20, 20))
          }
        },
        longPressed: function(sender) {
          $device.taptic(2)
          $ui.alert({
            title: "确定清空？",
            message: "清空操作无法撤销",
            actions: [
              {
                title: "OK",
                handler: function() {
                  $device.taptic(2)
                  $delay(0.15, function(){
                    $device.taptic(2)
                  })
                  if (source == "inapp" || source == "widget") {
                    $cache.set(itemsource, [])
                  } else {
                    $cache.remove(itemsource)
                  }
                  $(rowsShow).data = []
                  $file.delete(iconpath)
                }
              },
              {
                title: "Cancel",
                handler: function() {
          
                }
              }
            ]
          })
        }
      }
    },{
      type: "view",
      props: {
        id: rowsShowParent,
      },
      layout: function(make, view) {
        make.width.equalTo(view.super)
        make.top.equalTo($(deleteButton).bottom).inset(10)
        make.bottom.inset(0)
        make.centerX.equalTo(view.super)
      },
      views: [genRowsView(false, utils.getCache(columns), source)]
    }]
  }
  return view
}

function addToSource(source, title, iconpath, type, content, descript) {
  let itemsource = source
  let rowsShow = "folderrowsShow"
  if(source == "inapp") {
    itemsource = "inappItems"
    rowsShow = "inapprowsShow"
  } else if(source == "widget") {
    itemsource = "widgetItems"
    rowsShow = "widgetrowsShow"
  }
  let array = utils.getCache(itemsource, [])
  array.push({
    title: {
      text: title
    },
    icon: {
      src: iconpath
    },
    type: type,
    content: content,
    descript: descript
  })
  $cache.set(itemsource, array)
  $(rowsShow).data = utils.getCache(itemsource, [])
}

function updateToSource(source, sender, indexPath, title, type, content, descript) {
  let itemsource = source
  let rowsShow = "folderrowsShow"
  if(source == "inapp") {
    itemsource = "inappItems"
    rowsShow = "inapprowsShow"
  } else if(source == "widget") {
    itemsource = "widgetItems"
    rowsShow = "widgetrowsShow"
  }
  let array = utils.getCache(itemsource, [])
  array[indexPath.row].title.text = title
  array[indexPath.row].type = type
  array[indexPath.row].content = content
  array[indexPath.row].descript = descript
  $cache.set(itemsource, array)
  $(rowsShow).data = utils.getCache(itemsource, [])
}

function genSettingView() {

  const tabAutoSync = {
    type: "view",
    views: [{
        type: "label",
        props: {
          text: "iCloud 自动同步",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "label",
        props: {
          text: "已启用",
          textColor: $color("#AAAAAA"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  const widgettabSetColumns = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "widgettabSetColumns",
          text: "widget显示列数",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "stepper",
        props: {
          max: 20,
          min: 2,
          tintColor: $color("black"),
          value: utils.getCache("widgetcolumns"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $("widgettabSetColumnsDetail").text = sender.value
            $cache.set("widgetcolumns", sender.value)
            refreshView("widget")
          }
        }
      },
      {
        type: "label",
        props: {
          id: "widgettabSetColumnsDetail",
          text: "" + utils.getCache("widgetcolumns"),
        },
        layout: function(make, view) {
          make.right.equalTo(view.prev.left).inset(5)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  const inapptabSetColumns = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "inapptabSetColumns",
          text: "inapp显示列数",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "stepper",
        props: {
          max: 20,
          min: 2,
          tintColor: $color("black"),
          value: utils.getCache("inappcolumns"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $("inapptabSetColumnsDetail").text = sender.value
            $cache.set("inappcolumns", sender.value)
            refreshView("inapp")
          }
        }
      },
      {
        type: "label",
        props: {
          id: "inapptabSetColumnsDetail",
          text: "" + utils.getCache("inappcolumns"),
        },
        layout: function(make, view) {
          make.right.equalTo(view.prev.left).inset(5)
          make.centerY.equalTo(view.super)
        }
      }
    ],
    layout: $layout.fill
  }

  const tabwidgetShowMode = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabwidgetShowMode",
          text: "Widget显示样式",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.height.equalTo(view.super)
          make.width.equalTo(view.super).multipliedBy(0.5)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: showMode,
              handler: function(title, idx) {
                $cache.set("widgetshowMode", idx)
                $("tabwidgetShowModeDetail").text = getShowModeText("widget")
                $("widgetrowsShow").remove()
                $("widgetrowsShowParent").add(genRowsView($("widgetreorderButton").info, utils.getCache("widgetcolumns"), "widget"))
              }
            })
          }
        },
        views: [{
          type: "image",
          props: {
            src: "assets/enter.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(0)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(8, 18))
          },
        },{
          type: "label",
          props: {
            id: "tabwidgetShowModeDetail",
            text: getShowModeText("widget"),
            align: $align.right,
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev.left).inset(5)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },]
      },
      
    ],
    layout: $layout.fill
  }

  const tabinappShowMode = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabinappShowMode",
          text: "App内显示样式",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.height.equalTo(view.super)
          make.width.equalTo(view.super).multipliedBy(0.5)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: showMode,
              handler: function(title, idx) {
                $cache.set("inappshowMode", idx)
                $("tabinappShowModeDetail").text = getShowModeText("inapp")
                $("inapprowsShow").remove()
                $("inapprowsShowParent").add(genRowsView($("inappreorderButton").info, utils.getCache("inappcolumns"), "inapp"))
              }
            })
          }
        },
        views: [{
          type: "image",
          props: {
            src: "assets/enter.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(0)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(8, 18))
          },
        },{
          type: "label",
          props: {
            id: "tabinappShowModeDetail",
            text: getShowModeText("inapp"),
            align: $align.right,
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev.left).inset(5)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },]
      },
      
    ],
    layout: $layout.fill
  }

  const tabOpenBroswer = {
    type: "view",
    views: [{
        type: "label",
        props: {
          id: "tabOpenBroswer",
          text: "启动浏览器",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "view",
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
          make.height.equalTo(view.super)
          make.width.equalTo(view.super).multipliedBy(0.5)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: broswers,
              handler: function(title, idx) {
                $cache.set("openBroswer", idx)
                $("tabOpenBroswerDetail").text = getOpenBroswer()
              }
            })
          }
        },
        views: [{
          type: "image",
          props: {
            src: "assets/enter.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.right.inset(0)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(8, 18))
          },
        },{
          type: "label",
          props: {
            id: "tabOpenBroswerDetail",
            text: getOpenBroswer(),
            align: $align.right,
          },
          layout: function(make, view) {
            make.right.equalTo(view.prev.left).inset(5)
            make.centerY.equalTo(view.super)
            make.height.equalTo(view.super)
          },
        },]
      },
      
    ],
    layout: $layout.fill
  }

  const tabPullToClose = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabPullToClose",
          text: "下拉关闭",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },
      {
        type: "switch",
        props: {
          id: "tabPullToCloseSwitch",
          onColor: $color(mColor.iosGreen),
          on: utils.getCache("pullToClose"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("pullToClose", sender.on)
          }
        }
      }
    ],
    layout: $layout.fill
  }

  const tabStaticHeight = {
    type: "view",
    props: {

    },
    views: [{
        type: "label",
        props: {
          id: "tabStaticHeight",
          text: "高度跟随",
        },
        layout: function(make, view) {
          make.left.inset(15)
          make.centerY.equalTo(view.super)
        }
      },{
        type: "button",
        props: {
          icon: $icon("008", $color("white"), $size(14, 14)),
          bgcolor: $color("lightGray"),
          borderWidth: 1,
          borderColor: $color("lightGray"),
          circular: true,
        },
        layout: function(make, view) {
          make.left.equalTo(view.prev.right).inset(10)
          make.centerY.equalTo(view.super)
          make.size.equalTo($size(14,14))
        },
        events: {
          tapped: function(sender) {
            $ui.alert({
              title: "高度跟随",
              message: "即通知中心打开不改变原来的高度",
            });
          }
        }
      },
      {
        type: "switch",
        props: {
          id: "tabStaticHeightSwitch",
          onColor: $color(mColor.iosGreen),
          on: utils.getCache("staticHeight"),
        },
        layout: function(make, view) {
          make.right.inset(15)
          make.centerY.equalTo(view.super)
        },
        events: {
          changed: function(sender) {
            $cache.set("staticHeight", sender.on)
            let file = $file.read("config.json")
            if(file) {
              let json = JSON.parse(file.string)
              json.widget.staticSize = sender.on
              $file.write({
                data: $data({string: JSON.stringify(json, null, 2)}),
                path: "config.json"
              });
            }
            if($app.info.build < 339 && sender.on == true) {
              ui.showToastView($("mainView"), mColor.blue, "当前JSBox版本低，当前设置不会生效")
            }
          }
        }
      }
    ],
    layout: $layout.fill
  }

  let view = {
    type: "view",
    props: {
      id: "settingView",
      hidden: true,
    },
    layout: $layout.fill,
    views: [{
      type: "view",
      props: {
        hidden: true,
      },
      layout: function(make, view) {
        make.left.top.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "设置",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
      },{
        type: "canvas",
        layout: function(make, view) {
          make.bottom.inset(0)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },],
    },{
      type: "list",
      props: {
        id: "list",
        bgcolor: $color("clear"),
        //template: feedBackTemplate,
        header: {
          type: "view",
          props:{
            height: 45,
          },
          views: [{
            type: "label",
            props: {
              text: "设置",
              font: $font("Avenir-Black", 35),
              textColor: $color("black"),
              align: $align.center,
            },
            layout: function(make, view) {
              make.left.inset(15)
              make.bottom.inset(0)
              make.height.equalTo(45)
            }
          }]
        },
        data: [{
          title: "功能",
          rows: [inapptabSetColumns, widgettabSetColumns, tabinappShowMode, tabwidgetShowMode, tabOpenBroswer],
        },
        {
          title: "JSBox 启动器",
          rows: [tabPullToClose, tabStaticHeight],
        },
        {
          title: "同步",
          rows: [tabAutoSync],
        }],
      },
      layout: function(make, view) {
        make.top.equalTo(view.prev.bottom)
        make.bottom.inset(0)
        make.left.right.inset(0)
      },
      events: {
        // didSelect: function(sender, indexPath, title) {
        //   // if(title.templateTitle == undefined) {
        //   //   return 0
        //   // }
        //   // let titleText = title.templateTitle.text
        //   // if(title.url) {
        //   //   //setupWebView(titleText, title.url)
        //   // } else {
        //   //   switch(indexPath.row) {
        //   //     case 2: update.checkUpdate(true)
        //   //       break
        //   //     case 3: setupFeedBack()
        //   //       break
        //   //     case 4: setupReward()
        //   //       break
        //   //     case 5: 
        //   //       break
        //   //     default:
        //   //   }
        //   // }
        // },
        didScroll: function(sender) {
          if(sender.contentOffset.y >= 37 && sender.prev.hidden === true) {
            sender.prev.hidden = false
          } else if(sender.contentOffset.y < 37 && sender.prev.hidden === false) {
            sender.prev.hidden = true
          }
        },
      }
    },],
  }
  //requireInstallNumbers()
  return view
}

function getShowModeText(source) {
  let mode = utils.getCache("widgetshowMode")
  if(source != "widget") {
    mode = utils.getCache("inappshowMode")
  }
  return showMode[mode]
}

function getOpenBroswer() {
  let mode = utils.getCache("openBroswer")
  return broswers[mode]
}




function launcherEditView(source, action, title, iconpath, type, content, descript, indexPath) {
  // let isIconRevised = false
  let actionText = "  Save  "
  $ui.push({
    props: {
      id: "editItemView",
      title: "Launcher Editor",
      navBarHidden: true,
      statusBarStyle: 0,
    },
    events: {
      appeared: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      didAppear: function(sender) {
        $app.autoKeyboardEnabled = true
        $app.keyboardToolbarEnabled = true
      },
      disappeared: function() {
        $app.autoKeyboardEnabled = false
        $app.keyboardToolbarEnabled = false
      }
    },
    views: [{
      type: "view",
      layout: function(make, view) {
        if($device.info.version >= "11"){
          make.top.equalTo(view.super.safeAreaTop)
        } else {
          make.top.inset(20)
        }
        make.left.right.inset(0)
        make.height.equalTo(45)
      },
      views:[{
        type: "label",
        props: {
          text: "Launcher Editor",
          font: $font("bold", 17),
          align: $align.center,
          bgcolor: $color("white"),
          textColor: $color("black"),
        },
        layout: $layout.fill,
      },{
        type: "canvas",
        layout: function(make, view) {
          make.bottom.inset(0)
          make.height.equalTo(1)
          make.left.right.inset(0)
        },
        events: {
          draw: function(view, ctx) {
            var width = view.frame.width
            var scale = $device.info.screen.scale
            ctx.strokeColor = $color("darkGray")
            ctx.setLineWidth(1 / scale)
            ctx.moveToPoint(0, 0)
            ctx.addLineToPoint(width, 0)
            ctx.strokePath()
          }
        }
      },{
        type: "button",
        props: {
          bgcolor: $color("clear"),
        },
        layout: function(make, view) {
          make.left.inset(0)
          make.width.equalTo(60)
          make.height.equalTo(view.super)
        },
        events: {
          tapped: function(sender) {
            $ui.pop()
          },
        },
        views:[{
          type: "image",
          props: {
            src: "assets/back.png",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.left.inset(10)
            make.centerY.equalTo(view.super)
            make.size.equalTo($size(12, 23))
          },
        },{
          type: "label",
          props: {
            text: "返回",
            align: $align.center,
            textColor: $color(mColor.blue),
            font: $font(17)
          },
          layout: function(make, view) {
            make.height.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(3)
          }
        }],
      },],
    },
    {
      type: "scroll",
      props: {
        id: "uploadScroll",
        bgcolor: $color("#F9F9F8"),
        showsVerticalIndicator: true,
      },
      layout: function(make, view) {
        make.centerX.equalTo(view.super)
        make.width.equalTo(view.super)
        make.top.equalTo(view.prev.bottom)
        if($device.info.version >= "11"){
          make.bottom.equalTo(view.super.safeAreaBottom)
        } else {
          make.bottom.inset(0)
        }
      },
      views: [{
        type: "label",
        props: {
          id: "previewLabel",
          text: "Preview",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.inset(10)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          id: "preView",
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.left.right.inset(0)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(60)
          make.centerX.equalTo(view.super)
        },
        views: [{
          type: "view",
          layout: function(make, view) {
            make.left.right.inset(0)
            make.height.equalTo(50)
            make.center.equalTo(view.super)
          },
          views: [{
            type: "blur",
            props: {
              radius: 2.0, //调整边框是什么形状的如:方形圆形什么的
              style: 1 // 0 ~ 5 调整背景的颜色程度
            },
            layout: $layout.fill
          },
          {
            type: "label",
            props: {
              id: "title",
              textColor: $color("black"),
              bgcolor: $color("clear"),
              font: $font(13),
              text: (title == undefined)?"None":title,
              align: $align.center
            },
            layout(make, view) {
              make.bottom.inset(0)
              make.centerX.equalTo(view.super)
              make.height.equalTo(18)
              make.width.equalTo(view.super)
            }
          },
          {
            type: "image",
            props: {
              id: "icon",
              bgcolor: $color("clear"),
              smoothRadius: 5,
              size: $size(30, 30),
              icon: $icon("008", $color("gray"), $size(30, 30)),
            },
            layout(make, view) {
              make.top.inset(2)
              make.centerX.equalTo(view.super)
              make.size.equalTo($size(30,30))
            }
          },]
        }],
      },
      {
        type: "label",
        props: {
          text: "Settings",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(40)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "titleLabel",
            text: "Title",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(65)
          }
        },{
          type: "input",
          props: {
            id: "titleInput",
            bgcolor: $color("white"),
            radius: 0,
            text: (title == undefined)?"":title,
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(40)
          },
          events: {
            changed: function(sender) {
              $("title").text = sender.text
            },
            returned: function(sender) {
              sender.blur()
            }
          }
        },{
          type: "button",
          props: {
            id: "searchButton",
            icon: $icon("023", $color("lightGray"), $size(20, 20)),
            bgcolor: $color("clear"),
            hidden: (type && type == "Folder") ? true : false
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.left.equalTo(view.prev.right).inset(5)
            make.right.inset(15)
            make.height.equalTo(32)
          },
          events: {
            tapped: function(sender) {
              var search = require("scripts/search")
              search.init($("typeDetail").text, function(data) {
                insertAction(source, data)
              })
            }
          }
        }],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(40)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "typeLabel",
            text: "Type",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "typeButton",
            bgcolor: $color("clear"),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: showType,
                handler: function(title, idx) {
                  if(title == "Folder") {
                    $("searchButton").hidden = true
                    $("verifyButton").hidden = true
                    $("contentInput").editable = false
                    if(content && type && type=="Folder") {
                      $("contentInput").text = content
                    } else {
                      $("contentInput").text = new Date().getTime()
                    }
                  } else {
                    $("searchButton").hidden = false
                    $("verifyButton").hidden = false
                  }
                  $("typeDetail").text = title
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              id: "typeDetail",
              text: (type)? type:"Scheme",
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(40)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "iconLabel",
            text: "Icon",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(50)
          }
        },{
          type: "button",
          props: {
            id: "chooseIconButton",
            bgcolor: $color("clear"),
            info: $file.read(iconpath)
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(32)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
          },
          events: {
            tapped: function(sender) {
              $photo.pick({
                format: "data",
                handler: function(resp) {
                  if(resp.data != undefined) {
                    let mimeType = resp.data.info.mimeType
                    let cutedIcon = cutIcon(resp.data.image)
                    if (mimeType.indexOf("png") >= 0) {
                      sender.info = cutedIcon.png
                      $("icon").data = cutedIcon.png
                    } else {
                      sender.info = cutedIcon.jpg(1.0)
                      $("icon").data = cutedIcon.jpg(1.0)
                    }
                    // isIconRevised = true
                  }
                }
              })
            }
          },
          views: [{
            type: "image",
            props: {
              src: "assets/enter.png",
              bgcolor: $color("clear"),
            },
            layout: function(make, view) {
              make.right.inset(0)
              make.centerY.equalTo(view.super)
              make.size.equalTo($size(8, 18))
            },
          },{
            type: "label",
            props: {
              text: "Choose",
              font: $font(15),
              align: $align.right,
              textColor: $color("lightGray"),
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super)
              make.height.equalTo(view.super)
              make.left.inset(0)
              make.right.equalTo(view.prev.left).inset(10)
            }
          }]
        },],
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(120)
          make.left.right.inset(0)
        },
        views: [{
          type: "label",
          props: {
            id: "contentLabel",
            text: "Content",
            align: $align.left,
            font: $font(16),
          },
          layout: function(make, view) {
            //make.centerY.equalTo(view.super)
            make.top.equalTo(view.super).inset(13.5)
            make.height.equalTo(20)
            make.left.inset(15)
            make.width.equalTo(65)
          }
        },{
          type: "text",
          props: {
            id: "contentInput",
            text: (content == undefined)?"":content,
            editable: (type == "Folder")?false:true,
            bgcolor: $color("white"),
            radius: 0,
            type: $kbType.ascii,
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
                    title: "[clipboard]",
                    id: "clipButton",
                    radius: 6,
                    font: $font(14),
                    titleColor: $color("white"),
                    bgcolor: $color("#808B96"),
                    borderWidth: 0.5,
                    borderColor: $color("#cccccc")
                  },
                  layout: function(make, view) {
                    make.top.equalTo($("UndoButton").top);
                    make.width.equalTo(88);
                    make.centerX.equalTo(view.super).offset(0);
                    make.centerY.equalTo(view.super);
                  },
                  events: {
                    tapped: function(sender) {
                      let first = $("contentInput").text.substring(0, $("contentInput").selectedRange.location)
                      let last = $("contentInput").text.substring($("contentInput").selectedRange.location + $("contentInput").selectedRange.length)
                      $("contentInput").text = first + "[clipboard]" + last
                      $("contentInput").selectedRange = $range(first.length + 11, 0)
                    }
                  }
                },
                {
                  type: "button",
                  props: {
                    id: "doneButton",
                    title: "Done",
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
                      $("contentInput").blur()
                      if($("typeDetail").text == "Scheme" || $("typeDetail").text == "Appid") {
                        $("contentInput").text = $("contentInput").text.replace(/\s/g,"")
                      }
                    }
                  }
                }
              ]
            }
          },
          layout: function(make, view) {
            make.centerY.equalTo(view.super)
            make.height.equalTo(110)
            make.left.equalTo(view.prev.right)
            make.right.inset(15)
            //setUrlInputTool()
          }
        },],
      },
      {
        type: "view",
        props: {
          id: "verifyView",
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(1)
          make.height.equalTo(40)
          make.left.right.inset(0)
        },
        views: [{
          type: "button",
          props: {
            id: "verifyButton",
            title: "Check it",
            font: $font(14),
            titleColor: $color("black"),
            bgcolor: $color("#E5E8E8"),
            info: false,
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.height.equalTo(32)
            make.width.equalTo(120)
          },
          events: {
            tapped: function(sender) {
              utils.myOpenContent($("typeDetail").text, $("contentInput").text)
            }
          }
        },],
      },
      {
        type: "label",
        props: {
          id: "descriptLabel",
          text: "Description(Optional)",
          align: $align.left,
          font: $font(16),
        },
        layout: function(make, view) {
          make.top.equalTo(view.prev.bottom).inset(20)
          make.height.equalTo(20)
          make.left.inset(10)
        }
      },
      {
        type: "view",
        props: {
          bgcolor: $color("white"),
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo(view.prev.bottom).inset(10)
          make.height.equalTo(90)
          make.left.right.inset(0)
        },
        views: [{
          type: "text",
          props: {
            id: "descriptInput",
            text: (descript)?descript:"",
            bgcolor: $color("white"),
            radius: 0,
            font: $font(15),
          },
          layout: function(make, view) {
            make.center.equalTo(view.super)
            make.height.equalTo(60)
            make.left.right.inset(15)
          }
        },],
      },
      {
        type: "button",
        props: {
          id: "finishButton",
          title: actionText,
          bgcolor: $color("tint"),
          titleColor: $color("white"),
          circular: true,
          // info: {isfinish: false}
        },
        layout: function(make, view) {
          make.left.right.inset(20)
          make.centerX.equalTo(view.super)
          make.height.equalTo(40)
          make.top.equalTo(view.prev.bottom).inset(30)
        },
        events: {
          tapped: function(sender) {
            if ($("titleInput").text.length == 0 || $("contentInput").text.length == 0 || $("chooseIconButton").info == undefined) {
              ui.showToastView($("editItemView"), mColor.red, "Please Input the Necessary Info")
            } else if ($("descriptInput").text.length > 80) {
              ui.showToastView($("editItemView"), mColor.red, "Description is Too Long")
            } else {
              if(action == "edit") {
                $file.write({ data: $("chooseIconButton").info, path: iconpath })
                updateToSource(source, $("rowsShow"), indexPath, $("titleInput").text, $("typeDetail").text, $("contentInput").text, $("descriptInput").text)
              } else {
                let typepath = "folder/" + source
                if (source == "widget" || source == "inapp") {
                  typepath = source
                }
                let path = "drive://magic-launcher/app-icons/" + typepath + "/" + $("titleInput").text + "_" + $("typeDetail").text + ".png"
                $file.mkdir("drive://magic-launcher/app-icons/" + typepath)
                $file.write({ data: $("chooseIconButton").info, path: path })
                addToSource(source, $("titleInput").text, path, $("typeDetail").text, $("contentInput").text, $("descriptInput").text)
              }
              sync.upload()
              $ui.pop()
            }
          }
        }
      },]
    },
    ]
  })
  if(iconpath != undefined) {
    $("icon").src = iconpath
  }
  $("uploadScroll").resize()
  $("uploadScroll").contentSize = $size(0, 750)
  let um = $("contentInput").runtimeValue().$undoManager()
}

function cutIcon(image) {
  let canvas = $ui.create({type: "view"})
  let canvasSize = 50
  canvas.add({
    type: "image",
    props: {
      image: image,
      frame: $rect(0, 0, canvasSize, canvasSize),
      bgcolor: $color("clear"),
    }
  })
  canvas.frame = $rect(0, 0, canvasSize, canvasSize)
  let snapshot = canvas.snapshot
  return snapshot
}

function insertAction(source, data) {
  $("titleInput").text = data.name
  $("title").text = data.name
  if($("typeDetail").text == "Appid") {
    $("contentInput").text = data.appid
  }
  if($("typeDetail").text == "Script") {
    $("contentInput").text = data.name
    $("chooseIconButton").info = data.icon
    $("icon").data = data.icon
  } else {
    $http.download({
      url: data.icon,
      handler: function(resp) {
        let iconsize = 50
        if(source == "inapp") {
          iconsize = 50
        }
        let icon = resp.data.image.resized($size(iconsize,iconsize)).png
        $("chooseIconButton").info = icon
        $("icon").data = icon
      }
    })
  }
}

function refreshView(source) {
  let rowsShow = "folderrowsShow"
  let rowsShowParent = "folderrowsShowParent"
  let reorderButton = "folderreorderButton"
  let columns = "foldercolumns"
  if(source == "inapp") {
    rowsShow = "inapprowsShow"
    rowsShowParent = "inapprowsShowParent"
    reorderButton = "inappreorderButton"
    columns = "inappcolumns"
  } else if(source == "widget") {
    rowsShow = "widgetrowsShow"
    rowsShowParent = "widgetrowsShowParent"
    reorderButton = "widgetreorderButton"
    columns = "widgetcolumns"
  } 
  if($(rowsShow) != undefined) {
    $(rowsShow).remove()
    $(rowsShowParent).add(genRowsView($(reorderButton).info, utils.getCache(columns), source))
  }
}

module.exports = {
  show: show,
  refreshView: refreshView,
}
