function init(item) {
  let helper = require("scripts/helper")
  $ui.loading(true)
  $http.get({
    url: `https://api.unlimapps.com/v1/apple_apps/${item.trackId}/versions`,
    handler: function(resp) {
      $ui.loading(false)
      let data = resp.data
      let dic = {}
      let time_list = []
      for (let i = 0; i < data.length; i++) {
        let time_id = data[i].external_identifier
        time_list.push(time_id)
        dic[time_id] = {
          "external_identifier": data[i].external_identifier,
          "bundle_version": data[i].bundle_version,
          "updated_at": new Date(data[i].created_at).toLocaleDateString(),
        }
      }
      time_list.sort(sortNumber)
      $ui.menu({
        items: time_list.map(function(timestamp) {
          return "Version:" + dic[timestamp].bundle_version + "    Date:" + dic[timestamp].updated_at
        }),
        handler: function(title, idx) {
          $clipboard.text = dic[time_list[idx]].external_identifier
          $ui.alert({
            title: "ID Copied Success",
            message: "Version: " + dic[time_list[idx]].bundle_version + "\nID: " + dic[time_list[idx]].external_identifier,
            actions: [{
              title: "OK",
              handler: function() {
                helper.delayClose(0.2)
              }
            }]
          })
        }
      })
    }
  })
}

function sortNumber(a, b) {
  return b - a
}

module.exports = {
  init: init
}