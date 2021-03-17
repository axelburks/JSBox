const app = require("./scripts/app")
const helper = require("./scripts/helper")
const dark = Number($device.isDarkMode);

let viewBlank = 10
let viewRadius = 5
let buttonHeight = 40
let view_width = $device.info.screen.width
let searchViewHeight = 35;
let codeContentHeight = $device.info.screen.height - 90;
let codeSearchHeight = codeContentHeight - searchViewHeight;
let search_result = [], search_result_index = 0;

function showSearchView() {
  $device.taptic(0);
  search_result = [];
  search_result_index = 0;
  $("search_input").text = "";
  if ($("searchView").hidden) {
    $("searchView").updateLayout(function(make) {make.height.equalTo(searchViewHeight)});
    $("searchView").hidden = false;
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeSearchHeight)});
    $("search_input").focus();
  } else {
    $("codeContent").blur();
    $("search_input").blur();
    $("search_input").text = "";
    $("search_count").text = "0/0";
    $("searchView").hidden = true;
    $("searchView").updateLayout(function(make) {make.height.equalTo(0)});
    $("codeContent").updateLayout(function(make) {make.height.equalTo(codeContentHeight)});
  }
}


$ui.render({
  props: {
    title: "Surge X",
    theme: "auto",
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
      type: "tab",
      props: {
        id: "deviceTab",
        cornerRadius: 2 * viewRadius,
        items: app.device_list,
        index: app.device_list.indexOf(app.current_device),
      },
      events: {
        changed: async function (sender) {
          $device.taptic(0)
          $("deviceButton").title = app.device_list[sender.index]
          $("deviceLabel").text = await app.getDeviceURL()
          await helper.fillDataSource()
        }
      },
      layout: function (make, view) {
        make.left.right.top.inset(viewBlank)
        make.height.equalTo(buttonHeight)
      },
    },
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
            bgcolor: $rgba(100, 100, 100, 0.6),
          },
          events: {
            tapped: async function (sender) {
              $device.taptic(0)
              let codeContent = await helper.showProfile()
              $ui.push({
                props: {
                  title: "Profile",
                  theme: "auto",
                  navButtons: [
                    {
                      symbol: "magnifyingglass.circle",
                      handler: sender => showSearchView()
                    },
                  ]
                },
                views: [
                  {
                    type: "view",
                    props: {
                      id: "searchView",
                      hidden: true
                    },
                    layout: function(make, view) {
                      make.top.equalTo(view.super);
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
                          bgcolor: $color("#C0C0C0")
                        },
                        layout: function(make, view) {
                          make.top.equalTo(view.super.top).inset(5);
                          make.right.inset(viewBlank);
                          make.width.equalTo(35);
                          make.height.equalTo(27);
                        },
                        events: {
                          tapped: function(sender) {
                            if (search_result.length > 0) {
                              $device.taptic(0);
                              $("codeContent").blur();
                              search_result_index = (search_result_index == search_result.length - 1) ? 0 : search_result_index + 1;
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
                          bgcolor: $color("#C0C0C0")
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
                          bgcolor: dark ? $color("darkGray") : $color("#E0E0E0"),
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
                          darkKeyboard: dark ? true : false,
                        },
                        layout: function(make, view) {
                          make.top.equalTo(view.prev.top);
                          make.right.equalTo(view.prev.left).inset(5);
                          make.height.equalTo(view.prev.height);
                          make.left.inset(viewBlank);
                        },
                        events: {
                          didBeginEditing: function(sender) {
                            search_result = [];
                            search_result_index = 0;
                            $("search_count").text = "0/0";
                          },
                          returned: function(sender) {
                            if (sender.text.length > 0) {
                              search_result = [];
                              search_result_index = 0;
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
                      }
                    ]
                  },
                  {
                    type: "code",
                    props: {
                      id: "codeContent",
                      font: $font(15),
                      editable: false,
                      language: "ini",
                      lineNumbers: true,
                      adjustInsets: true,
                      theme: dark ? "vs2015" : "vs",
                      darkKeyboard: dark ? true : false,
                      textColor: dark ? $color("white") : $color("black"),
                      bgcolor: dark ? $color("#1e1e1e") : $color("#f2f3f4"),
                      tintColor: dark ? $color("#0a85ff") : $color("black"),
                      text: codeContent.profile,
                      accessoryView: {
                        type: "view",
                        props: {
                          height: 0
                        }
                      }
                    },
                    layout: function (make, view) {
                      make.top.equalTo(view.prev.bottom);
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
                  }
                ]
              });
            },
            longPressed: async function (info) {
              $device.taptic(0)
              let sender = info.sender
              let selPop = await $ui.popover({
                sourceView: sender,
                sourceRect: sender.bounds,
                directions: $popoverDirection.up,
                size: $size(240, 44 * app.device_list.length),
                items: app.device_list,
                dismissed: () => { },
              })
              sender.title = selPop.title
              $("deviceTab").index = selPop.index
              $("deviceLabel").text = await app.getDeviceURL()
              await helper.fillDataSource()
            }
          },
          layout: function (make, view) {
            make.top.bottom.right.equalTo(view.super).inset(0)
            make.width.equalTo(150)
          }
        },
        {
          type: "label",
          props: {
            id: "deviceLabel",
            text: app.current_url,
            theme: "auto",
            align: $align.center,
          },
          events: {
            tapped: async function (sender) {
              $clipboard.text = sender.text
              $ui.toast("Copied: " + sender.text, 1)
            }
          },
          layout: function (make, view) {
            make.top.bottom.equalTo(view.prev)
            make.right.equalTo(view.prev.left)
            make.left.equalTo(view.super)
          }
        },
      ],
      layout: function (make, view) {
        make.left.right.inset(viewBlank)
        make.top.equalTo(view.prev.bottom).inset(viewBlank)
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
                  $("loadingView").start()
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
                style: dark ? $blurStyle.chromeMaterialDark : $blurStyle.chromeMaterialLight
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
                theme: "auto",
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
                style: dark ? $blurStyle.chromeMaterialDark : $blurStyle.chromeMaterialLight
              },
              layout: $layout.fill
            },
            {
              type: "label",
              props: {
                id: "selectLabel",
                autoFontSize: true,
                align: $align.left,
              },
              layout: function (make, view) {
                make.left.top.right.equalTo(view.super).inset(viewBlank)
              }
            },
            {
              type: "button",
              props: {
                id: "selectButton",
                titleColor: dark ? $color("white") : $color("black"),
                bgcolor: dark ? $rgba(100, 100, 100, 0.1) : $rgba(100, 100, 100, 0.05),
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
        style: 0,
        cornerRadius: 2 * viewRadius,
        smoothCorners: true,
        color: $color("black"),
        loading: true
      },
      layout: function (make, view) {
        make.center.equalTo(view.super)
      }
    }
  ],
})

await helper.fillDataSource()