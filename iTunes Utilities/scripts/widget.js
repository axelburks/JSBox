//Set your region of Apple Music: us cn hk gb jp
let country = "cn"
let helper = require("scripts/helper")
let netease_api = 'http://api.able.cat/music/?t=wy&id='
let qqmusic_api = 'http://api.able.cat/music/?t=qq&id='

function init() {
  preGetNowPlaying()
  $thread.background({
    delay: 0.1,
    handler: function() {
      getNowPlaying()
    }
  })
}

function preGetNowPlaying() {
  var Player = $objc("MPMusicPlayerController").invoke("systemMusicPlayer")
  Player.invoke("nowPlayingItem")
}

function getNowPlaying() {
  $ui.toast("Waiting...")
  let Player = $objc("MPMusicPlayerController").invoke("systemMusicPlayer")
  let state = Player.invoke("playbackState")
  let song = Player.invoke("nowPlayingItem")
  if (state == 1 && song) {
    let title = song.invoke("valueForKey", "title").rawValue()
    let artist = song.invoke("valueForKey", "artist").rawValue()
    let albumTitle = song.invoke("valueForKey", "albumTitle").rawValue()
    let playbackStoreID = song.invoke("valueForKey", "playbackStoreID").rawValue()
    if (playbackStoreID != "0") {
      processMusic("AppleMusic", playbackStoreID)
      //$app.openURL("jsbox://run?name=" + encodeURIComponent($addin.current.name) + "&from=itunes_widget&platform=AppleMusic&songid=" + playbackStoreID + "&songtitle=" + $text.URLEncode(title) + "&songartist=" + $text.URLEncode(artist))
    } else {
      processMusic("NetEase", playbackStoreID, title, artist)
      //$app.openURL("jsbox://run?name=" + encodeURIComponent($addin.current.name) + "&from=itunes_widget&platform=NetEase&songid=" + playbackStoreID + "&songtitle=" + $text.URLEncode(title) + "&songartist=" + $text.URLEncode(artist))
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
    searchMusic(platform, songtitle, songartist)
  }
}

function searchMusic(platform, songtitle, songartist) {
  let searchAPI = netease_api
  if (platform == "QQMusic") {
    searchAPI = qqmusic_api
  }
  $http.get({
    url: searchAPI + $text.URLEncode(songtitle + " " + songartist),
    handler: function (res) {
      if (res.data.count  > 0) {
        let data = res.data.data
        for (let i=0; i<res.data.count; i++) {
          if (data[i].title == songtitle && songartist.indexOf(data[i].singer.match(/[^;\/\s\\]+/)[0]) > -1) {
            helper.shareMedia(data[i], "widget", platform)
            break
          } else if (i == res.data.count - 1) {
            if (platform != "QQMusic") {
              searchMusic("QQMusic", songtitle, songartist)
            } else {
              let song = {
                "title": songtitle,
                "artist": songartist
              }
              helper.shareMedia(song, "widget", "None")
            }
          }
        }
      } else {
        if (platform != "QQMusic") {
          searchMusic("QQMusic", songtitle, songartist)
        } else {
          let song = {
            "title": songtitle,
            "artist": songartist
          }
          helper.shareMedia(song, "widget", "None")
        }
      }
    }
  })
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