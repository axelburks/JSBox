var ui = require('scripts/ui')
var countries = [
  { name: "🇺🇸 US", code: "us" },
  { name: "🇨🇳 CN", code: "cn" },
  { name: "🇭🇰 HK", code: "hk" },
  { name: "🇬🇧 UK", code: "gb" },
  { name: "🇯🇵 JP", code: "jp" },
  { name: "🇦🇺 AU", code: "au" },
  { name: "🇳🇿 NZ", code: "nz" }
]
var addins = $addin.list

function init(type, completionHandler) {
  if(type == "Script") {
    $ui.push({
      props: {
        id: "searchView",
        title: "Search Script in JSBox",
        navBarHidden: true,
        statusBarStyle: 0
      },
      views: [
        {
          type: "input",
          props: {
            id: "search-input",
            placeholder: "Script Name"
          },
          layout: function(make, view) {
            make.left.right.inset(10)
            make.height.equalTo(32)
            if($device.info.version >= "11"){
              make.top.equalTo(view.super.safeAreaTop).inset(20)
            } else {
              make.top.inset(20)
            }
          },
          events: {
            ready: function(sender) {
              $delay(0.5, function() {
                sender.focus()
              })
            },
            // didBeginEditing: function(sender) {
            //   if (listView.data.length != extensions.length) {
            //     updateItem(extensions)
            //   }
            // },
            changed: function(sender) {
              if (sender.text) {
                searchScript(sender.text)
              } else {
                updateItem(addins)
              }
            },
            returned: function (sender) {
              if (sender.text) {
                sender.blur()
                searchScript(sender.text)
              } else {
                sender.blur()
                updateItem(addins)
              }
            }
          }
        },
        {
          type: "list",
          props: {
            id: "script-list",
            template: require("scripts/template").scriptlist,
            rowHeight: 45,
          },
          layout: function(make, view) {
            make.top.equalTo($("search-input").bottom).offset(10)
            make.left.bottom.right.equalTo(0)
          },
          events: {
            didSelect: function(sender, indexPath, data) {
              completionHandler({
                "name": data["script-name-label"]["text"],
                "icon": data["script-icon-image"]["data"]
              })
              $ui.pop()
            }
          }
        }
      ]
    })
    updateItem(addins)

  } else {
    let country = countries[0]
    $ui.push({
      props: {
        id: "searchView",
        title: "Search in App Store",
        navBarHidden: true,
        statusBarStyle: 0
      },
      views: [
        {
          type: "input",
          props: {
            id: "search-input",
            placeholder: "App Name"
          },
          layout: function(make, view) {
            make.right.inset(60)
            make.left.inset(10)
            make.height.equalTo(32)
            if($device.info.version >= "11"){
              make.top.equalTo(view.super.safeAreaTop).inset(20)
            } else {
              make.top.inset(20)
            }
          },
          events: {
            ready: function(sender) {
              $delay(0.5, function() {
                sender.focus()
              })
            },
            returned: function(sender) {
              sender.blur()
              searchApp(sender.text, country)
            }
          }
        },
        {
          type: "button",
          props: {
            title: country.name.substring(0,4),
            font: $font(14),
            titleColor: $color("tint"),
            radius: 4,
            bgcolor: $color("white"),
            borderColor: $color("lightGray"),
            borderWidth: 1
          },
          layout: function(make, view) {
            make.right.inset(10)
            make.height.equalTo(30)
            make.top.equalTo($("search-input").top).inset(1)
            make.left.equalTo($("search-input").right).offset(8)
          },
          events: {
            tapped: function(sender) {
              $ui.menu({
                items: countries.map(function(item) { return item.name }),
                handler: function(title, idx) {
                  sender.title = title.substring(0,4)
                  country = countries[idx]
                  var searchBar = $("search-input")
                  searchBar.blur()
                  searchApp(searchBar.text, country)
                }
              })
            }
          }
        },
        {
          type: "list",
          props: {
            id: "search-list",
            template: require("scripts/template").applist,
            rowHeight: 72
          },
          layout: function(make, view) {
            make.top.equalTo($("search-input").bottom).offset(10)
            make.left.bottom.right.equalTo(0)
          },
          events: {
            didSelect: function(sender, indexPath, data) {
              completionHandler({
                "name": data["app-name-label"]["text"],
                "appid": data["bundle-id-label"]["text"],
                "icon": data["app-icon-image"]["src"]
              })
              $ui.pop()
            }
          }
        }
      ]
    })
  }
}

function searchApp(text, country) {
  $ui.loading(true)
  $http.get({
    url: `https://itunes.apple.com/search?term=${encodeURI(text)}&country=${country.code}&entity=software`,
    handler: function(resp) {
      $ui.loading(false)
      var results = resp.data.results.slice(0, 10)
      $("search-list").data = results.map(function(item) {
        return {
          "app-icon-image": { src: item.artworkUrl100 },
          "app-name-label": { text: item.trackCensoredName },
          "bundle-id-label": { text: item.bundleId }
        }
      })
    }
  })
}

function updateItem(data) {
  let temp = []
  let count = data.length
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      temp.push({
        "script-icon-image": { data: cutIcon(data[i].iconImage).png },
        "script-name-label": { text: data[i].displayName },
      })
    }
  } else {
    temp = []
    ui.showToastView($("searchView"), $color("#E74C3C"), "No Script Named This", 0.5)
  }
  $("script-list").data = temp
}

function searchScript(query) {
  function isContain(element) {
    let script_name = element.displayName
    var rex = query.split("").join(".*")
    return new RegExp(rex,"i").test(script_name)
  }
  var result = addins.filter(isContain)
  updateItem(result)
}

function cutIcon(image) {
  let canvas = $ui.create({type: "view"})
  let canvasSize = 50
  canvas.add({
    type: "image",
    props: {
      image: image,
      frame: $rect(10, 10, canvasSize-20, canvasSize-20),
      bgcolor: $color("clear"),
    }
  })
  canvas.frame = $rect(0, 0, canvasSize, canvasSize)
  let snapshot = canvas.snapshot
  return snapshot
}

module.exports = {
  init: init
}
