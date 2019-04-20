let utils = require('scripts/utils')

function sync() {
  let dataDir = "drive://magic-launcher/data.json"
  if($device.info.model == "iPhone11,6") {
    if(!$file.exists("drive://magic-launcher/")) {
      $file.mkdir("drive://magic-launcher/")
    }
    if(utils.getCache("inappItems", []).length > 0 || utils.getCache("widgetItems", []).length > 0) {
      $file.write({
        data: $data({string: getAllDataString()}),
        path: dataDir
      })
    } else {
      if($file.exists(dataDir)) {
        setAllData($file.read(dataDir).string)
      }
    }
  } else {
    if($file.exists(dataDir)) {
      setAllData($file.read(dataDir).string)
    }
  }
}

function upload() {
  if(utils.getCache("inappItems", []).length > 0 || utils.getCache("widgetItems", []).length > 0) {
    let dataDir = "drive://magic-launcher/data.json"
    if(!$file.exists("drive://magic-launcher/")) {
      $file.mkdir("drive://magic-launcher/")
    }
    $file.write({
      data: $data({string: getAllDataString()}),
      path: dataDir
    })
  }
}

function download() {
  if(utils.getCache("inappItems", []).length <= 0 && utils.getCache("widgetItems", []).length <= 0) {
    let dataDir = "drive://magic-launcher/data.json"
    if(!$file.exists("drive://magic-launcher/")) {
      $file.mkdir("drive://magic-launcher/")
    }
    if($file.exists(dataDir)) {
      setAllData($file.read(dataDir).string)
    }
  }
}

function getAllDataString() {
  let engine = $objc("BBEngine").$shared();
  let diskCache = engine.$global().$cache().$cache().$diskCache();
  let metadata = diskCache.$metadata();
  let keys = metadata.$allKeys();

  let allCache = new Object();
  for (var idx=0; idx<keys.$count(); ++idx) {
    let key = keys.$objectAtIndex(idx).rawValue();
    allCache[key] = $cache.get(key)
  }

  // let data = {
  //   inappcolumns: utils.getCache("inappcolumns"),
  //   widgetcolumns: utils.getCache("widgetcolumns"),
  //   inappshowMode: utils.getCache("inappshowMode"),
  //   widgetshowMode: utils.getCache("widgetshowMode"),
  //   openBroswer: utils.getCache("openBroswer"),
  //   pullToClose: utils.getCache("pullToClose"),
  //   staticHeight: utils.getCache("staticHeight"),
  //   inappItems: utils.getCache("inappItems", []),
  //   widgetItems: utils.getCache("widgetItems", []),
  // }
  return JSON.stringify(allCache)
}

function setAllData(dataString) {
  let data = JSON.parse(dataString)
  for(var key in data) {
    console.info(key)
    if($device.info.model == "iPad8,1" && key == "inappcolumns") {
      $cache.set("inappcolumns", utils.getCache("inappcolumns"))
    } else if($device.info.model == "iPad8,1" && key == "widgetcolumns") {
      $cache.set("widgetcolumns", utils.getCache("widgetcolumns"))
    } else {
      $cache.set(key, data[key])
    }
  }
  
  // $cache.set("inappcolumns", data.inappcolumns)
  // $cache.set("widgetcolumns", data.widgetcolumns)
  // $cache.set("inappshowMode", data.inappshowMode)
  // $cache.set("widgetshowMode", data.widgetshowMode)
  // $cache.set("openBroswer", data.openBroswer)
  // $cache.set("pullToClose", data.pullToClose)
  // $cache.set("staticHeight", data.staticHeight)
  // $cache.set("inappItems", data.inappItems)
  // $cache.set("widgetItems", data.widgetItems)
}

module.exports = {
  sync: sync,
  upload: upload,
  download: download,
}
