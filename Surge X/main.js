const app = require("./scripts/app")
const helper = require("./scripts/helper")
// const DeviceSIZE = $device.info.screen

let viewBlank = 10
let viewRadius = 5
let buttonHeight = 40

$ui.render({
  props: {
    title: "Surge X",
    navButtons: [
      {
        symbol: "arrow.2.squarepath",
        handler: sender => $addin.restart()
      },
      {
        symbol: "gear",
        handler: sender => $prefs.open(() => {
          app.genConfig()
          helper.fillDataSource()
        })
      },
    ]
  },
  views: [
    {
      type: "view",
      props: {
        bgcolor: $rgba(100, 100, 100, 0.1),
        cornerRadius: 2 * viewRadius,
      },
      views: [
        {
          type: "button",
          props: {
            id: "deviceButton",
            title: app.current_device,
            cornerRadius: 0,
            bgcolor: $color("darkGray"),
          },
          events: {
            tapped: async function(sender) {
              $device.taptic(0)
              let selPop = await $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.up,
                size: $size(240, 44 * app.device_list.length),
                items: app.device_list,
                dismissed: () => {},
              })
              sender.title = selPop.title
              $("deviceLabel").text = app.getDeviceURL()
              await helper.fillDataSource()
            }
          },
          layout: function (make, view) {
            make.top.bottom.left.equalTo(view.super).inset(0)
            make.width.equalTo(150)
          }
        },
        {
          type: "label",
          props: {
            id: "deviceLabel",
            text: app.current_url,
            textColor: $color("black"),
            align: $align.center,
          },
          events: {
            tapped: async function(sender) {
              $clipboard.text = sender.text
              $ui.toast("Copied: " + sender.text, 1)
            }
          },
          layout: function (make, view) {
            make.top.bottom.equalTo(view.prev)
            make.right.equalTo(view.super.right).inset(viewBlank)
            make.left.equalTo(view.prev.right).inset(viewBlank / 2)
          }
        },
      ],
      layout: function(make) {
        make.left.right.top.inset(viewBlank)
        make.height.equalTo(buttonHeight)
      },
    },
    {
      type: "matrix",
      props: {
        id: "funcView",
        bgcolor: $rgba(100, 100, 100, 0.1),
        cornerRadius: viewRadius,
        columns: 4,
        itemHeight: buttonHeight,
        spacing: viewBlank,
        template: {
          views: [
            {
              type: "button",
              props: {
                id: "funcButton",
              },
              layout: $layout.fill,
              events: {
                tapped: async function (sender) {
                  $device.taptic(0)
                  let original = helper.findColorKey(helper.funcColor, sender.bgcolor)
                  await helper.setFunc(sender.title, !original)
                  await helper.fillDataSource()
                }
              }
            },
          ]
        },
      },
      layout: function (make, view) {
        make.left.right.inset(viewBlank)
        make.top.equalTo(view.prev.bottom).inset(viewBlank)
        make.height.equalTo(2 * (viewBlank + buttonHeight) + viewBlank)
      }
    },
    {
      type: "matrix",
      props: {
        id: "switchView",
        bgcolor: $rgba(100, 100, 100, 0.1),
        cornerRadius: viewRadius,
        columns: 2,
        itemHeight: buttonHeight + viewBlank,
        spacing: viewBlank,
        template: {
          views: [
            {
              type: "blur",
              props: {
                cornerRadius: viewRadius,
                style: 15
              },
              layout: $layout.fill
            },
            {
              type: "switch",
              props: {
                id: "switchSwitch",
              },
              layout: function (make, view) {
                make.right.equalTo(view.super).inset(viewBlank)
                make.centerY.equalTo(view.super)
              },
              events: {
                changed: async function (sender) {
                  await helper.setSwitch(sender.info.name, sender.on, sender.info.type)
                  await helper.fillDataSource()
                }
              }
            },
            {
              type: "label",
              props: {
                id: "switchLabel",
                textColor: $color("black"),
                autoFontSize: true,
                align: $align.center
              },
              layout: function (make, view) {
                make.left.equalTo(view.super).inset(viewBlank)
                make.right.equalTo(view.prev.left).inset(viewBlank)
                make.centerY.equalTo(view.super)
              }
            },
          ]
        },
      },
      layout: function (make, view) {
        make.left.right.inset(viewBlank)
        make.top.equalTo(view.prev.bottom).inset(viewBlank)
        make.height.equalTo(3 * (viewBlank + (viewBlank + buttonHeight)) + viewBlank)
      }
    },
    {
      type: "matrix",
      props: {
        id: "selectView",
        bgcolor: $rgba(100, 100, 100, 0.1),
        cornerRadius: viewRadius,
        columns: 2,
        itemHeight: 2 * buttonHeight,
        spacing: viewBlank,
        template: {
          views: [
            {
              type: "blur",
              props: {
                cornerRadius: viewRadius,
                style: 15
              },
              layout: $layout.fill
            },
            {
              type: "label",
              props: {
                id: "selectLabel",
                autoFontSize: true,
                align: $align.left
              },
              layout: function (make, view) {
                make.left.top.right.equalTo(view.super).inset(viewBlank)
              }
            },
            {
              type: "button",
              props: {
                id: "selectButton",
                titleColor: $color("black"),
                bgcolor: $rgba(100, 100, 100, 0.05)
              },
              layout: function (make, view) {
                make.top.equalTo(view.prev.bottom).inset(viewBlank)
                make.left.right.equalTo(view.prev)
              },
              events: {
                tapped: async function (sender) {
                  let get_policies = await helper.groupPolicies(sender.info)
                  let sel_result = await $ui.menu(get_policies)
                  await helper.setGroup(sender.info, sel_result.title)
                  await helper.fillDataSource()
                }
              }
            },
          ]
        },
      },
      layout: function (make, view) {
        make.left.right.bottom.inset(viewBlank)
        make.top.equalTo(view.prev.bottom).inset(viewBlank)
      }
    },
    {
      type: "spinner",
      props: {
        id: "loadingView",
        cornerRadius: viewRadius,
        style: 0,
        loading: true
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
      }
    }
  ],
})

await helper.fillDataSource()