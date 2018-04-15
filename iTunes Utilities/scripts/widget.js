//Set your region of Apple Music: us cn hk gb jp
let country = "cn"
let helper = require("scripts/helper")
let netease_api = 'http://music.able.cat/download/api/?id='

function init() {
  let Player = $objc("MPMusicPlayerController").invoke("systemMusicPlayer")
  let song = Player.invoke("nowPlayingItem")
  if (song) {
    let title = song.invoke("valueForKey", "title").rawValue()
    let artist = song.invoke("valueForKey", "artist").rawValue()
    let albumTitle = song.invoke("valueForKey", "albumTitle").rawValue()
    let playbackStoreID = song.invoke("valueForKey", "playbackStoreID").rawValue()
    if (playbackStoreID != "0") {
      $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&from=itunes_widget&platform=AppleMusic&songid=" + playbackStoreID + "&songtitle=" + $text.URLEncode(title) + "&songartist=" + $text.URLEncode(artist))
    } else {
      $app.openURL("jsbox://run?name=" + encodeURI($addin.current.name) + "&from=itunes_widget&platform=NetEase&songid=" + playbackStoreID + "&songtitle=" + $text.URLEncode(title) + "&songartist=" + $text.URLEncode(artist))
    }
  } else {
    $ui.error("Nothing Played", 1)
  }
}

function processMusic(platform, songid, songtitle, songartist) {
  if (platform == "AppleMusic") {
    let search_url = `https://itunes.apple.com/lookup?id=${songid}&country=${country}`
    fetchData(search_url).then(function(data){
      helper.shareMedia(data, "widget", "AppleMusic")
    })
  } else {
    $http.get({
      url: netease_api + $text.URLEncode(songtitle + " " + songartist),
      handler: function (res) {
        if (res.data.count  > 0) {
          let data = res.data.data
          for (let i=0; i<res.data.count; i++) {
            if (data[i].title == songtitle && songartist.indexOf(data[i].singer.match(/[^;\/\s\\]+/)[0]) > -1) {
              helper.shareMedia(data[i], "widget", "NetEase")
              break
            } else if (i == res.data.count - 1) {
              let song = {
                "title": songtitle,
                "artist": songartist
              }
              helper.shareMedia(song, "widget", "None")
            }
          }
        } else {
          let song = {
            "title": songtitle,
            "artist": songartist
          }
          helper.shareMedia(song, "widget", "None")
        }
      }
    })
  }
}

function fetchData(url) {
  let p = new Promise(function(resolve,reject){
    $ui.loading(true)
    $http.get({
      url: url,
      handler: function(resp) {
        $ui.loading(false)
        resolve(resp.data.results[0])
      }
    })
  })
  return p
}

module.exports = {
  init: init,
  processMusic: processMusic
}