var constants = require("scripts/constants")
var template = require("scripts/template")
var helper = require("scripts/helper")

var entities = constants.entities
var countries = constants.countries
var entity = entities[0]
var country = countries[0]

function init() {
  // 获取当前播放音乐
  
}

function fetchData(url) {
  var p = new Promise(function(resolve,reject){
    $ui.loading(true)
    $http.get({
      url: url,
      handler: function(resp) {
        $ui.loading(false)
        var result = resp.data.results[0]
        resolve(result)
      }
    })
  })
  return p
}

function showActions(data) {

  const ACTIONS = {
    GET_ICON: $l10n("GET_ICON"),
    GET_SCREENSHOTS: $l10n("GET_SCREENSHOTS"),
    GET_IPAD_SCREENSHOTS: $l10n("GET_IPAD_SCREENSHOTS"),
    SHOW_DETAILS: $l10n("SHOW_DETAILS"),
    APP_PREVIEW: $l10n("APP_PREVIEW"),
    APP_VERSIONID: $l10n("APP_VERSIONID"),
    SHARE_MEDIA: $l10n("SHARE_MEDIA"),
    PRICE_TREND: $l10n("PRICE_TREND"), 
    OPEN_APP_STORE: $l10n("OPEN_APP_STORE"),
    OPEN_COLLECTION: $l10n("OPEN_COLLECTION"),
    OPEN_ARTIST_VIEW: $l10n("OPEN_ARTIST_VIEW"),
    OPEN_TRACK_VIEW: $l10n("OPEN_TRACK_VIEW"),
    OPEN_PREVIEW: $l10n("OPEN_PREVIEW"),
  }

  var items = [ACTIONS.GET_ICON, ACTIONS.SHOW_DETAILS, ACTIONS.OPEN_COLLECTION, ACTIONS.OPEN_ARTIST_VIEW, ACTIONS.OPEN_TRACK_VIEW, ACTIONS.OPEN_PREVIEW, ACTIONS.SHARE_MEDIA]
  
  var handler = function(action) {
    var item = data
    if (action === ACTIONS.GET_ICON) {
      helper.getIcon(item)
    } else if (action === ACTIONS.SHOW_DETAILS) {
      helper.showDetails(item)
    } else if (action === ACTIONS.SHARE_MEDIA) {
      helper.shareMedia(item)
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

module.exports = {
  init: init
}