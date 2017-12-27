/*
脚本工具箱合集
1.点击 ⚙️ 进入设置项
2.可在设置内关闭开关或者直接在首页左滑删除
3.支持拖动排序，检索（支持非连续关键字检索）

作者联系：https://t.me/axel_burks
*/

const
  DeviceSIZE = $device.info.screen,
  LocalDataPath = "drive://ToolBox.json";

var 
  extensions = $cache.get("extensions") || []

if ($app.env != $env.app) {
  $ui.menu({
    items: extensions,
    handler: function(title, idx) {
      $app.openExtension(title)
    }
  })
  return
}

$ui.render({
  props: {
    id: "Main",
    title: "Tool Box"
  },
  views: [
    {
      type: "input",
      props: {
        id: "inputView",
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
          if(listView.data.length != extensions.length){
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
        make.left.equalTo($("inputView").right).offset(5)
        make.height.equalTo($("inputView"))
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
            type: "button",
            props: {
              id: "ext",
              titleColor: $color("black"),
              //titleEdgeInsets: $insets(0, 0, 0, 0),
              imageEdgeInsets: $insets(0, 0, 0, 50),
              //contentEdgeInsets: $insets(0, 100, 0, 0),
              bgcolor: $rgba(100, 100, 100, 0.1),
              align: $align.center
            },
            layout: function (make, view) {
              make.left.right.inset(10)
              make.top.inset(5)
              make.width.equalTo(DeviceSIZE.width - 40)
              make.height.equalTo(40)
            },
            events: {
              tapped: function(sender) {
                $addin.run(sender.title)
              }
            }
            
          }
          // {
          //   type: "label",
          //   props: {
          //     id: "title",
          //     font: $font("bold", 18),
          //     autoFontSize: true,
          //     bgcolor: $rgba(100, 100, 100, 0.2),
          //     radius: 2
          //   },
          //   layout: function (make) {
          //     var preView = $("icon")
          //     make.left.equalTo(preView.right).offset(0)
          //     make.height.equalTo(20)
          //     make.top.inset(8)
          //     make.right.inset(5)
          //   }
          // }
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
        make.top.equalTo($("inputView").bottom).offset(10)
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

var addins = $addin.list
var ext_icon = new Object()
for (var i = 0; i < addins.length; i++) {
  ext_icon[addins[i].name.replace('.js', '')] = addins[i].icon.replace('.png', '').replace('icon_', '')
}
var listView = $("list")
updateItem(extensions)

function updateItem(data) {
  var temp = []
  count = data.length
  for (var id = 0; id < count; id++) {
    ext_name = data[id]
    temp.push({
      ext: {
        icon: $icon(ext_icon[ext_name], $color("darkGray"), $size(20, 20)),
        title: ext_name
      }
      // title: {
      //   text: ext_name
      // }
    })
  }
  listView.data = temp  
}

function insertItem(text) {
  extensions.unshift(text)
  listView.insert({
    index: 0,
    value: {ext:{
      icon: $icon(ext_icon[text], $color("darkGray"), $size(20, 20)),
      title: text
    }}
  })
  saveItems()
}

function deleteItem(indexPath) {
  var text = extensions[indexPath.row]
  var index = extensions.indexOf(text)
  if (index >= 0) {
    extensions.splice(index, 1)
    saveItems()
  }
}

function selectItem() {
  $ui.push({
    props: {
      title: "设置"
    },
    views: [
      {
        type: "label",
        props: {
          text: "请选择添加扩展",
          align: $align.center,
          font: $font("bold", 18),
          textColor: $color("white"),
          bgcolor: $color("tint"),
        },
        layout: function(make, view) {
          make.left.top.right.inset(0)
          make.height.equalTo(45)
        }
      },
      {
        type: "list",
        props: {
          template: [
            {
              type: "label",
              props: {
                id: "label"
              },
              layout: function(make) {
                make.left.right.inset(10)
                make.top.bottom.equalTo(0)
              }
            },
            {
              type: "switch",
              props: {
                id: "switch"
              },
              layout: function(make, view) {
                make.centerY.equalTo(view.super)
                make.right.inset(10)
              },
              events: {
                changed: function(sender) {
                  var name = $file.extensions[sender.info]
                  var index = extensions.indexOf(name)
                  if (index === -1) {
                    insertItem(name)
                  } else {
                    extensions.splice(index, 1)
                    saveItems()
                  }
                  updateItem(extensions)
                }
              }
            }
          ],
          data: $file.extensions.map(function(item, index) { 
            return {
              label: { text: item },
              switch: { on: extensions.indexOf(item) != -1, info: index }
            }
          })
        },
        layout: function(make) {
          make.left.bottom.right.equalTo(0)
          make.top.equalTo($("label").bottom).offset(1)
        },
        events: {
          didSelect(sender, indexPath) {
          }
        }
      }
    ]
  })
}

function saveItems() {
  $cache.set("extensions", extensions)
}

function searchItem(query) {
  function isContain(element) {
    var rex = query.split("").join(".*")
    return new RegExp(rex,"i").test(element)
  }
  var result = extensions.filter(isContain)
  updateItem(result)
}

Array.prototype.move = function(from, to) {
  var object = this[from]
  this.splice(from, 1)
  this.splice(to, 0, object)
}