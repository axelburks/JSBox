let ui = require("../ui");
const engines = [
  {
    name: "谷歌搜索",
    pattern: "https://images.google.com/searchbyimage?image_url="
  },
  {
    name: "百度搜索",
    pattern: "http://image.baidu.com/n/pc_search?queryImageUrl="
  },
  {
    name: "搜狗搜索",
    pattern: "http://pic.sogou.com/ris?flag=1&nr=true&query="
  }
]

function lastImage(search){
  $photo.fetch({
    count:1,
    handler:function(image){
      if(image){
        searchImage(image[0].jpg(1.0), search)
      } else {
        $ui.loading(false)
      }
    }
  })
}

function pickImage(search) {
  $photo.pick({
    handler: function(resp) {
      var image = resp.image
      if (image) {
        searchImage(image.jpg(1.0), search)
      } else {
        $ui.loading(false)
      }
    }
  })
}

function searchImage(data, search) {
  $ui.loading(true)
  if (search) {
    $ui.toast("图片上传中",10)
  } else {
    $ui.toast("Uploading to SMMS",10)
  }
  $http.upload({
    url: "https://sm.ms/api/v2/upload",
    files: [{"data": data, "name": "smfile"}],
    handler: function(resp) {
      $ui.loading(false)
      if (resp.data.code == "image_repeated" || resp.data.code == "success") {
        let url = resp.data.code == "image_repeated" ? resp.data.images : resp.data.data.url
        $clipboard.text = url      
        // showEngines(url)
        if (search) {
          $app.openURL("https://images.google.com/searchbyimage?image_url="+$text.URLEncode(url))
          $app.close()
        } else {
          $ui.toast("URL Saved to Clip")
        }
      } else {
        $ui.toast(resp.data)
      }
    }
  })
}

function showEngines(url) {
  $ui.menu({
    items: engines.map(function(item) { return item.name }),
    handler: function(title, idx) {
      var pattern = engines[idx].pattern
      $app.openURL(pattern + $text.URLEncode(url))
      $app.close()
    }
  })
}

function run(search=true){
  var inputData = $context.data
  var inputLink = $context.link
  var clipData = $clipboard.image
  var clipLink = $clipboard.link

  if (inputData) {
    searchImage(inputData, search)
    } else if (inputLink) {
      showEngines(inputLink)
    } else if (clipData || clipLink) {
      $ui.menu({
        items: ["剪贴板", "最后一张","选择图片"],
        handler: function(title, idx) {
          switch(idx){
            case 0: 
              if(clipLink){
                $app.openURL("https://images.google.com/searchbyimage?image_url="+$text.URLEncode(clipLink))
              } else{
                searchImage(clipData, search)
              }         
              break
            case 1:
              lastImage(search)
              break
            case 2:
              pickImage(search)
              break
          }
        }
      })
    } else {
      $ui.menu({
        items:["最后一张","选择图片"],
        handler:function(title, idx){
          idx == 0 ? lastImage(search) : pickImage(search)
        }
      })
    }
}

module.exports = {
  run:run
}
