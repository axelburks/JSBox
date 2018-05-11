var constants = require("scripts/constants")
var template = require("scripts/template")
var helper = require("scripts/helper")

var entities = constants.entities
var countries = constants.countries
var entity = entities[0]
var country = countries[0].code

function init() {
  render()
  var link = $context.link || $context.text
  if (link && link.match(/itunes\.apple\.com\/[a-z]+\/app\/?.*?\/id(\d+).*?mt=\d+/)) {
    var result = link.match(/itunes\.apple\.com\/([a-z]+)\/app\/?.*?\/id(\d+).*?mt=\d+/)
    country = result[1]
    var appid = result[2]
    var search_url = `https://itunes.apple.com/lookup?id=${appid}&country=${country}`
    fetchData(search_url).then(function(data){
      showActions(data)
    })
  } else if (link && link.match(/itunes\.apple\.com\/[a-z]+\/story\/?.*?\/id(\d+)/)) {
    var html = ""
    var story_url = link.match(/https?:\/\/itunes\.apple\.com\/[a-z]+\/story\/?.*?\/id(\d+)/)[0]
    if ($context.data) {
      processHtml($context.data.string)
    } else {
      fetchData(story_url, "html").then(function(data){
        processHtml(data)
      })
    }
  } else if (link && link.match(/itunes\.apple\.com\/[a-z]+\/album\/.+?\/\d+/)) {
    var result = link.match(/itunes\.apple\.com\/([a-z]+)\/album\/.+?\/(\d+)/)
    country = result[1]
    var albumid = result[2]
    var search_url = `https://itunes.apple.com/lookup?id=${albumid}&country=${country}`
    if (link.match(/itunes\.apple\.com\/[a-z]+\/album\/.+?\/\d+\?i=(\d+)/)) {
      entity = entities[3]
      var songid = link.match(/itunes\.apple\.com\/[a-z]+\/album\/.+?\/\d+\?i=(\d+)/)[1]
      search_url = `https://itunes.apple.com/lookup?id=${songid}&country=${country}`
    } else {
      entity = { name: $l10n("ALBUM"), code: "album" }
    }
    fetchData(search_url).then(function(data){
      showActions(data)
    })
  } else if (link && link.match(/itunes\.apple\.com\/[a-z]+\/movie\/.+?\/id(\d+)/)) {
    entity = entities[4]
    var movieid = link.match(/itunes\.apple\.com\/[a-z]+\/movie\/.+?\/id(\d+)/)[1]
    var search_url = `https://itunes.apple.com/lookup?id=${movieid}`
    fetchData(search_url).then(function(data){
      showActions(data)
    })
  } else if (link && link.match(/itunes\.apple\.com\/[a-z]+\/podcast\/.+?\/id(\d+)/)) {
    entity = entities[5]
    var result = link.match(/itunes\.apple\.com\/([a-z]+)\/podcast\/.+?\/id(\d+)/)
    country = result[1]
    var podcastid = result[2]
    var search_url = `https://itunes.apple.com/lookup?id=${podcastid}&country=${country}`
    fetchData(search_url).then(function(data){
      showActions(data)
    })
  }
}

function fetchData(url, type) {
  let p = new Promise(function(resolve,reject){
    $ui.loading(true)
    $http.get({
      url: url,
      handler: function(resp) {
        $ui.loading(false)
        if (type == "html") {
          resolve(resp.data)
        } else {
          resolve(resp.data.results[0])
        }
      }
    })
  })
  return p
}

function processHtml(html) {
  var wallpaper_url = html.match(/https:\/\/.+?\/image\/thumb\/.+?\.jpg/)[0]
  var result = html.match(/https?:\/\/itunes\.apple\.com\/([a-z]+)\/app\/?.*?\/id(\d+).*?mt=\d+/)
  if (result) {
    country = result[1]
    var appid = result[2]
    var search_url = `https://itunes.apple.com/lookup?id=${appid}&country=${country}`
    fetchData(search_url).then(function(data){
      showActions(data, wallpaper_url)
    })
  } else {
    showActions(null, wallpaper_url)
  }
}

function showActions(data, wallpaper) {

  const ACTIONS = {
    GET_ICON: $l10n("GET_ICON"),
    GET_SCREENSHOTS: $l10n("GET_SCREENSHOTS"),
    GET_IPAD_SCREENSHOTS: $l10n("GET_IPAD_SCREENSHOTS"),
    GET_TODAY_WALLPAPER: $l10n("GET_TODAY_WALLPAPER"),
    SHOW_DETAILS: $l10n("SHOW_DETAILS"),
    APP_PREVIEW: $l10n("APP_PREVIEW"),
    APP_VERSIONID: $l10n("APP_VERSIONID"),
    TRANSLATE: $l10n("TRANSLATE"),
    SHARE_MEDIA: $l10n("SHARE_MEDIA"),
    OPEN_APP_STORE: $l10n("OPEN_APP_STORE"),
    OPEN_COLLECTION: $l10n("OPEN_COLLECTION"),
    OPEN_ARTIST_VIEW: $l10n("OPEN_ARTIST_VIEW"),
    OPEN_TRACK_VIEW: $l10n("OPEN_TRACK_VIEW"),
    OPEN_PREVIEW: $l10n("OPEN_PREVIEW"),
  }

  var items = []

  if (entity.code.match(/software|iPadSoftware|macSoftware/)) {
    items = [ACTIONS.GET_ICON, ACTIONS.GET_SCREENSHOTS, ACTIONS.SHOW_DETAILS, ACTIONS.TRANSLATE, ACTIONS.APP_PREVIEW]
    if (entity.code.match(/^software|iPadSoftware/)) {
      items.splice(4, 0, ACTIONS.APP_VERSIONID)
    }
    if (wallpaper) {
      items.splice(2, 0, ACTIONS.GET_TODAY_WALLPAPER)
    }
    if (data == null && wallpaper) {
      items = [ACTIONS.GET_TODAY_WALLPAPER]
    } else if (data.ipadScreenshotUrls && data.ipadScreenshotUrls.length > 0) {
      items.splice(2, 0, ACTIONS.GET_IPAD_SCREENSHOTS)
    }
  } else if (entity.code === "podcast") {
    items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.SHARE_MEDIA]
  } else if (entity.code === "album") {
    items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_ARTIST_VIEW, ACTIONS.SHARE_MEDIA]
  } else {
    items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_COLLECTION, ACTIONS.OPEN_ARTIST_VIEW, ACTIONS.OPEN_PREVIEW, ACTIONS.SHARE_MEDIA]
  }
  
  var handler = function(action) {
    var item = data
    if (action === ACTIONS.GET_ICON) {
      helper.getIcon(item)
    } else if (action === ACTIONS.GET_SCREENSHOTS) {
      helper.getScreenshots(item)
    } else if (action === ACTIONS.GET_IPAD_SCREENSHOTS) {
      helper.getIpadScreenshots(item)
    } else if (action === ACTIONS.GET_TODAY_WALLPAPER) {
      helper.getTodayWallpaper(wallpaper)
    } else if (action === ACTIONS.SHOW_DETAILS) {
      helper.showDetails(item)
    } else if (action === ACTIONS.APP_PREVIEW) {
      helper.showPreview(item, country)
    } else if (action === ACTIONS.APP_VERSIONID) {
      helper.showVersionID(item)
    } else if (action === ACTIONS.TRANSLATE) {
      helper.translateDetail(item)
    } else if (action === ACTIONS.SHARE_MEDIA) {
      helper.shareMedia(item, "extension", "AppleMusic")
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

  var finished = function(cancelled) {
    if (cancelled) {
      $context.close()
    }
  }

  $ui.menu({ items: items, handler: handler, finished: finished })
}

function render() {
  $ui.render({
    props: {
      title: "iTunes Utilities"
    },
    views: [
      {
        type: "label",
        props: {
          id: "conTitle",
          align: $align.center,
          font: $font("bold", 18),
          lines:0
        },
        layout: function(make, view) {
          make.left.top.right.inset(10)
        }
      },
      {
        type: "image",
        props: {
          id: "conImage",
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("conTitle").bottom).offset(10)
          make.size.equalTo($size(150, 150))
        }
      },
      {
        type: "label",
        props: {
          id: "conLink",
          align: $align.center,
          lines:0
        },
        layout: function(make, view) {
          make.top.equalTo($("conImage").bottom).offset(10)
          make.left.right.inset(10)
        }
      },
    ]
  })
  if ($context.text) {
    $("conTitle").text = $context.text
  }
  if ($context.image) {
    $("conImage").data = $context.image.jpg(0.8)
  } else {
    $("conImage").src = "assets/apple.jpg"
  }
  if ($context.link) {
    $("conLink").text = $context.link
  }
}

module.exports = {
  init: init
}