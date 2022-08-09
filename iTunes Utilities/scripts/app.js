var constants = require("scripts/constants")
var template = require("scripts/template")
var helper = require("scripts/helper")

var entities = constants.entities
var countries = constants.countries
var entity = entities[0]
var country = countries[0]
var results = []

function search(text) {
  $ui.loading(true)
  $http.get({
    url: `https://itunes.apple.com/search?term=${encodeURIComponent(text)}&entity=${entity.code}&country=${country.code}`,
    handler: function(resp) {
      $ui.loading(false)
      results = resp.data.results.slice(0, 20)
      $("result-list").data = results.map(function(item) {
        return template.convert(item)
      })
    }
  })
}

function showActions(index) {

  const ACTIONS = {
    GET_ICON: $l10n("GET_ICON"),
    GET_SCREENSHOTS: $l10n("GET_SCREENSHOTS"),
    GET_IPAD_SCREENSHOTS: $l10n("GET_IPAD_SCREENSHOTS"),
    SHOW_DETAILS: $l10n("SHOW_DETAILS"),
    APP_PREVIEW: $l10n("APP_PREVIEW"),
    APP_VERSIONID: $l10n("APP_VERSIONID"),
    RSS_LINK: $l10n("RSS_LINK"),
    TRANSLATE: $l10n("TRANSLATE"),
    SHARE_MEDIA: $l10n("SHARE_MEDIA"),
    OPEN_APP_STORE: $l10n("OPEN_APP_STORE"),
    OPEN_COLLECTION: $l10n("OPEN_COLLECTION"),
    OPEN_ARTIST_VIEW: $l10n("OPEN_ARTIST_VIEW"),
    OPEN_TRACK_VIEW: $l10n("OPEN_TRACK_VIEW"),
    OPEN_PREVIEW: $l10n("OPEN_PREVIEW"),
  }

  var items = []

  if (entity.code.match(/software|iPadSoftware|macSoftware|tvSoftware/)) {
    items = [ACTIONS.GET_ICON, ACTIONS.GET_SCREENSHOTS, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_APP_STORE, ACTIONS.TRANSLATE, ACTIONS.RSS_LINK, ACTIONS.APP_PREVIEW]
    if (entity.code.match(/^software|iPadSoftware/)) {
      items.splice(5, 0, ACTIONS.APP_VERSIONID)
    }
    if (results[index].ipadScreenshotUrls && results[index].ipadScreenshotUrls.length > 0) {
      items.splice(2, 0, ACTIONS.GET_IPAD_SCREENSHOTS)
    }
  } else if (entity.code === "podcast") {
    items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_COLLECTION, ACTIONS.SHARE_MEDIA]
  } else {
    items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_COLLECTION, ACTIONS.OPEN_ARTIST_VIEW, ACTIONS.OPEN_TRACK_VIEW, ACTIONS.OPEN_PREVIEW, ACTIONS.SHARE_MEDIA]
  }
  
  var handler = function(action) {
    var item = results[index]
    if (action === ACTIONS.GET_ICON) {
      helper.getIcon(item)
    } else if (action === ACTIONS.GET_SCREENSHOTS) {
      helper.getScreenshots(item)
    } else if (action === ACTIONS.GET_IPAD_SCREENSHOTS) {
      helper.getIpadScreenshots(item)
    } else if (action === ACTIONS.SHOW_DETAILS) {
      helper.showDetails(item)
    } else if (action === ACTIONS.APP_PREVIEW) {
      helper.showPreview(item, country.code)
    } else if (action === ACTIONS.APP_VERSIONID) {
      helper.showVersionID(item)
    } else if (action === ACTIONS.RSS_LINK) {
      if (entity.code.match(/software|iPadSoftware/)) {
        helper.genRSSHubURL(country.code, "iOS", item);
      } else if (entity.code.match(/macSoftware/)) {
        helper.genRSSHubURL(country.code, "mac", item);
      } else {
        $ui.error("Not supported app type");
      }
    } else if (action === ACTIONS.TRANSLATE) {
      helper.translateDetail(item)
    } else if (action === ACTIONS.SHARE_MEDIA) {
      helper.shareMedia(item, "app", "AppleMusic")
    } else if (action === ACTIONS.OPEN_APP_STORE) {
      helper.openAppStore(country, item)
    } else if (action === ACTIONS.OPEN_COLLECTION) {
      helper.openCollection(item)
    } else if (action === ACTIONS.OPEN_ARTIST_VIEW) {
      helper.openArtistView(item)
    } else if (action === ACTIONS.OPEN_TRACK_VIEW) {
      helper.openTrackView(item)
    } else if (action === ACTIONS.OPEN_PREVIEW) {
      helper.openPreview(item)
    }
  }

  $ui.menu({ items: items, handler: handler })
}

module.exports.render = function render() {
  $ui.render({
    props: {
      title: $l10n("ITUNES_SEARCH")
    },
    views: [
      {
        type: "tab",
        props: {
          items: entities.map(function(item) { return item.name })
        },
        layout: function(make, view) {
          make.left.top.inset(10)
          make.right.inset(60)
        },
        events: {
          changed: function(sender) {
            entity = entities[sender.index]
            var searchBar = $("search-bar")
            searchBar.blur()
            search(searchBar.text)
          }
        }
      },
      {
        type: "button",
        props: {
          title: country.name.substring(0,4),
          font: $font(13),
          titleColor: $color("tint"),
          radius: 4,
          bgcolor: $color("white"),
          borderColor: $color("tint"),
          borderWidth: 1
        },
        layout: function(make, view) {
          make.right.inset(10)
          make.top.bottom.equalTo($("tab"))
          make.left.equalTo($("tab").right).offset(8)
        },
        events: {
          tapped: function(sender) {
            $ui.menu({
              items: countries.map(function(item) { return item.name }),
              handler: function(title, idx) {
                sender.title = title.substring(0,4)
                country = countries[idx]
                var searchBar = $("search-bar")
                searchBar.blur()
                search(searchBar.text)
              }
            })
          }
        }
      },
      {
        type: "input",
        props: {
          id: "search-bar",
          placeholder: $l10n("SEARCH")
        },
        layout: function(make, view) {
          make.left.right.inset(10)
          make.top.equalTo($("tab").bottom).offset(10)
          make.height.equalTo(32)
        },
        events: {
          ready: function(sender) {
            sender.focus()
          },
          returned: function(sender) {
            sender.blur()
            search(sender.text)
          }
        }
      },
      {
        type: "list",
        props: {
          id: "result-list",
          template: template.list,
          rowHeight: 100
        },
        layout: function(make, view) {
          make.top.equalTo($("search-bar").bottom).offset(10)
          make.left.bottom.right.equalTo(0)
        },
        events: {
          didSelect: function(sender, indexPath) {
            showActions(indexPath.row)
          }
        }
      }
    ]
  })
}