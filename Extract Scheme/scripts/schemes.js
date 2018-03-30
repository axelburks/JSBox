module.exports = {
  extract: extract,
  delayClose:delayClose
}

var namelist = new Array

function extract(file) {
  $archiver.unzip({
    file: file,
    dest: "temp",
    handler: function(success) {
      if (success) {
        var schemes = extract_scheme("temp")
        $ui.menu({
          items: schemes,
          handler: function(title, idx) {
            $ui.toast("Copied Success", 1)
            $clipboard.set({
              "type": "public.plain-text",
              "value": title + "://"
            })
            delete_dir("temp", 0.5)
          },
          finished: function(cancelled) {
            if (cancelled) {
              delete_dir("temp", 0.5)
            }
          }
        })
      } else {
        $ui.error("Unzip File Failed!")
        delete_dir("temp", 1.4)
      }
    }
  })
}

function filelist(folder) {
  var contents = $file.list(folder)
  for (var i = 0; i< contents.length; i++) {
    contents.splice(i,1,folder + "/" + contents[i])
    namelist = namelist.concat(contents[i])
    if ($file.isDirectory(contents[i])) {
      filelist(contents[i])
    }
  }
  return namelist
}

function extract_plist_data(path) {
  var list = filelist(path)
  var plist = null
  var plist_data = null
  namelist = null
  for (var i = 0; i< list.length; i++) {
    if (list[i].match(/^.+\.app\/Info\.plist$/)) {
      if (plist == null || list[i].length < plist.length) {
        var file = $file.read(list[i])
        plist_data = $objc("NSPropertyListSerialization").invoke("propertyListWithData:options:format:error:", file, 2, null, null).rawValue()
        plist = list[i]
      }
    }
  }
  return plist_data
}

function extract_scheme(path) {
  var plist_data = extract_plist_data(path)
  if (plist_data == null) {
    $ui.error("No Info.plist in File!")
    delete_dir(path, 1.4)
  } else {
    var schemes = new Array
    if (plist_data.CFBundleURLTypes) {
      for (var i = 0; i< plist_data.CFBundleURLTypes.length; i++) {
        schemes.push(plist_data.CFBundleURLTypes[i].CFBundleURLSchemes[0])
      }
      return schemes
    } else {
      $ui.alert({
        title: "Error",
        message: "The App don't have schemes",
        actions: [{
          title: "OK",
          style: "Cancel",
          handler: function() {
            delete_dir(path, 0.5)
          }
        }]
      })
    }
  }
}

function delete_dir(path, delay) {
  var success = $file.delete(path)
  if (success) {
    delayClose(delay)
  } else {
    $ui.alert({
      title: "Error",
      message: "Delete the " + path + " folder failed.\nPlease delete it by yourself in JSBox.",
      actions: [{
        title: "OK",
        style: "Cancel",
        handler: function() {
          delayClose(0.3)
        }
      }]
    })
  }
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
        $app.close()
      }
    }
  })
}