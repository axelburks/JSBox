let ui = require('scripts/ui')
let utils = require('scripts/utils')

// setupWidgetView()

function setupWidgetView() {
  let items = ui.addButtonMore(utils.getCache("widgetItems", []))
  let columns = utils.getCache("widgetcolumns")
  let itemHeight = 35
  let view = {
    props: {
      title: "Magic Launcher",
    },
    views: [{
      type: "matrix",
      props: {
        id: "widgetrowsShow",
        columns: columns, //横行个数
        itemHeight: itemHeight, //图标到字之间得距离
        spacing: 8, //每个边框与边框之间得距离
        template: ui.genTemplate("widget"),
        data: items,
      },
      layout: $layout.fill,
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          // utils.myOpenContent(data.type, data.content)
          if(data.type == "Folder") {
            pushFolderView(data.content)
          } else {
            utils.myOpenContent(data.type, data.content)
          }
        }
      }
    }]
  }
  $ui.render(view)
}

function pushFolderView(folderID) {
  let items = ui.addButtonMore(utils.getCache(folderID, []))
  let columns = utils.getCache("widgetcolumns") - 1
  let itemHeight = 35
  let view = {
    props: {
      //title: "Magic Launcher",
      navBarHidden: true,
    },
    views: [{
      type: "matrix",
      props: {
        id: "folderrowsShow",
        columns: columns, //横行个数
        itemHeight: itemHeight, //图标到字之间得距离
        spacing: 8, //每个边框与边框之间得距离
        template: ui.genTemplate(folderID),
        data: items,
      },
      //layout: $layout.fill,
      layout: function(make, view) {
        make.top.right.bottom.inset(0)
        make.left.inset(35)
      },
      events: {
        didSelect(sender, indexPath, data) {
          $device.taptic(1)
          // utils.myOpenContent(data.type, data.content)
          if(data.type == "Folder") {
            pushFolderView(data.content)
          } else {
            utils.myOpenContent(data.type, data.content)
          }
        }
      }
    },{
            type: "button",
            props: {
              id: "closebtn",
              title: "◁",
              titleColor: $color("tint"),
              radius: 0,
              bgcolor: $rgba(232,232,232,1),
              //icon: $icon("225", $color("tint"), $size(20, 20))
            },
            layout: function(make, view) {
              make.top.bottom.left.inset(0);
              make.width.equalTo(30)
              //make.left.inset(6);
            },
            events: {
              tapped(sender) {
                $device.taptic(0);
                $ui.pop(view)
              }
            }
          }]
  }
  $ui.push(view)
}

module.exports = {
  show: setupWidgetView,
  pushFolderView: pushFolderView
}
