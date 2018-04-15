var Detail = require('scripts/Detail')
var helper = require('scripts/helper')
const DeviceSIZE = $device.info.screen

function init() {
  render()
  if ($context.query.from && $context.query.from == "schedule_ms_widget") {
    helper.sendItem("notify", 0, $context.query.schedule_ms_id)
  }
}

function render() {
  $ui.render({
    props: {
      id: "Main",
      title: "Schedule Message"
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
          placeholder: "Search"
        },
        layout: function (make, view) {
          make.top.equalTo(view.prev).inset(15)
          make.height.equalTo(40)
          make.left.inset(10)
          make.right.inset(50)
        },
        events: {
          didBeginEditing: function(sender) {
            helper.updateItem($cache.get("messages"), "init")
          },
          returned: function (sender) {
            if (sender.text) {
              sender.blur()
              helper.searchItem(sender.text)
            } else {
              sender.blur()
              helper.updateItem($cache.get("messages"), "search")
            }
          }
        }
      },
      {
        type: "button",
        props: {
          //title: "➕",
          icon: $icon("104", $rgba(100, 100, 100, 0.4), $size(25, 25)),
          align: $align.center,
          bgcolor: $rgba(0, 0, 0, 0)
        },
        layout: function(make, view) {
          make.top.equalTo($("inputView").top)
          make.right.inset(10)
          make.left.equalTo($("inputView").right).offset(5)
          make.height.equalTo($("inputView"))
        },
        events: {
          tapped(sender) {
            Detail.init()
          }
        }
      },
      {
        type: "list",
        props: {
          id: "list",
          rowHeight: 170,
          separatorHidden: true,
          template: [
            {
              type: "view",
              props: {
                id: "itemView",
                bgcolor: $rgba(100, 100, 100, 0.1),
                radius: 8
              },
              layout: function (make, view) {
                make.left.right.inset(10)
                make.top.inset(5)
                make.width.equalTo(DeviceSIZE.width - 40)
                make.height.equalTo(160)
              }
            },
            {
              type: "button",
              props: {
                id: "edit",
                icon: $icon("030", $rgba(0, 0, 0, 0.1), $size(15, 15)),
                bgcolor: $color("clear")
              },
              layout: function (make, view) {
                var preView = $("itemView")
                make.top.equalTo(preView.top).offset(0)
                make.right.equalTo(preView.right).inset(10)
                make.height.equalTo(preView.height)
                make.width.equalTo(15)
              }
            },
            {
              type: "label",
              props: {
                id: "content_receiver",
                textColor: $color("black"),
                bgcolor: $color("clear"),
                align: $align.left,
              },
              layout: function (make) {
                var preView = $("itemView")
                make.top.equalTo(preView.top).offset(15)
                make.left.equalTo(preView.left).inset(15)
                make.right.equalTo($("edit").left).inset(5)
              }
            },
            {
              type: "label",
              props: {
                id: "content_date",
                font: $font(13),
                textColor: $color("lightGray"),
                bgcolor: $color("clear"),
                align: $align.left,
              },
              layout: function (make) {
                make.left.equalTo($("content_receiver").left)
                make.right.equalTo($("edit").left).inset(5)
                make.bottom.equalTo($("itemView").bottom).inset(15)
                make.height.equalTo(15)
              }
            },
            {
              type: "text",
              props: {
                id: "content_message",
                textColor: $color("black"),
                bgcolor: $color("clear"),
                insets: $insets(0, 0, 0, 0),
                align: $align.left,
                editable: false
              },
              layout: function (make) {
                var preView = $("content_receiver")
                make.top.equalTo(preView.bottom).offset(7)
                make.left.equalTo($("itemView").left).offset(10)
                make.right.equalTo(preView.right)
                make.bottom.equalTo($("content_date").top).inset(7)
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
                make.top.equalTo(preView.top)
                make.left.equalTo(preView.left)
                make.height.equalTo(preView.height)
                make.right.equalTo(preView.right)
              },
              events: {
                tapped: function(sender) {
                  Detail.init(sender.title)
                }
              }
            },
          ],
          actions: [
            {
              title: "Send",
              handler: function(sender, indexPath) {
                helper.sendItem("list", indexPath.row)
              }
            }
          ]
        },
        layout: function(make) {
          make.left.bottom.right.equalTo(0)
          make.top.equalTo($("inputView").bottom).offset(10)
        }
      }
    ]
  })
  helper.updateItem($cache.get("messages"), "init")
}

module.exports = {
  init: init
}