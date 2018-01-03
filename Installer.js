$app.strings = {
  "en": {
    "MAIN_TITLE": "Installer",
    "EMPTY_TIPS": "Please import script use AirDrop or File Sharing",
    "IMPORT_DELETE": "Import & Delete",
    "DELETE_DIRECTLY": "Delete Directly",
    "ERROR": "Running Error",
    "OK": "OK",
    "Existed": "Already Existed",
    "ANOTHER": "Please input another name",
    "CANCEL": "Cancel",
    "REPLACE": "Replace",
    "RENAME": "Rename",
    "STILL_INSTALL": "Not a .js file.\nAre you still want to install it?",
    "SUCCESS": "Installed"
  },
  "zh-Hans": {
    "MAIN_TITLE": "脚本安装器",
    "EMPTY_TIPS": "请通过 AirDrop 或文件共享导入脚本",
    "IMPORT_DELETE": "导入后删除",
    "DELETE_DIRECTLY": "直接删除",
    "ERROR": "运行错误",
    "OK": "好的",
    "Existed": "文件已存在",
    "ANOTHER": "请输入其他名称",
    "CANCEL": "取消",
    "REPLACE": "覆盖",
    "RENAME": "重命名",
    "STILL_INSTALL": "非 js 文件，\n仍然安装？",
    "SUCCESS": "已安装"
  }
}

var file = $context.data

if (file && file.fileName) {
  var fileName = file.fileName
  if (fileName.indexOf(".js") == -1) {
    error(fileName, file)
  } else {
    var addins = $addin.list
    var addins_list = ""
    for (var i = 0; i < addins.length; i++) {
      addins_list = addins_list + addins[i].name + "|"
    }
    if (addins_list.indexOf(fileName) > -1) {
      warning(addins_list, fileName, file)
    } else {
      install(fileName, file)
    }
  }
  return
}

var scheme = "inbox://";
var files = $file.list(scheme) || []

$ui.render({
  props: {
    title: $l10n("MAIN_TITLE")
  },
  views: [{
    type: "list",
    props: {
      data: files
    },
    layout: $layout.fill,
    events: {
      didSelect: function(sender, indexPath) {
        var name = files[indexPath.row]
        var path = scheme + name
        function _delete() {
          $file.delete(path)
          sender.delete(indexPath)
        }
        $ui.menu({
          items: [$l10n("IMPORT_DELETE"), $l10n("DELETE_DIRECTLY")],
          handler: function(title, idx) {
            if (idx == 0) {
              install(name, $file.read(path))
              _delete()
            } else if (idx == 1) {
              _delete()
            }
          }
        })
      }
    }
  }, {
    type: "label",
    props: {
      hidden: files.length > 0,
      text: $l10n("EMPTY_TIPS"),
      lines: 0,
      align: $align.center
    },
    layout: function(make, view) {
      make.left.right.top.bottom.inset(20)
    }
  }]
})


function error(name, data) {
  $ui.alert({
    title: $l10n("ERROR"),
    message: $l10n("STILL_INSTALL"),
    actions: [{
      title: $l10n("CANCEL"),
      style: "Cancel",
      handler: function() {
        $context.close()
        $app.close()
      }
    },
    {
      title: $l10n("OK"),
      handler: function() {
        install(name + ".js", data)
      }
    }]
  })  
}

function warning(list, name, data) {
  $ui.alert({
    title: $l10n("Existed"),
    message: name,
    actions: [{
        title: $l10n("CANCEL"),
        style: "Cancel",
        handler: function() {
          $context.close()
          $app.close()
        }
      },
      {
        title: $l10n("REPLACE"),
        handler: function() {
          install(name, data)
        }
      },
      {
        title: $l10n("RENAME"),
        handler: function() {
          var new_name = "0"
          $input.text({
            type: $kbType.default,
            placeholder: name.replace('.js',''),
            handler: function(text) {
              new_name = text
              // if (list.indexOf(new_name) > -1) {
              //   $ui.alert({
              //     title: $l10n("Existed"),
              //     message: $l10n("ANOTHER"),
              //     actions: [{
              //       title: $l10n("OK"),
              //       style: "Cancel",
              //       handler: function() {
              //         $input.text({
              //           type: $kbType.default,
              //           placeholder: name.replace('.js',''),
              //           handler: function(new_text) {
              //             new_name = new_text
              //           }
              //         })
              //       }
              //     }]
              //   })
              // }
              install(new_name, data)
            }
          })          
        }
      }
    ]
  })
}

function install(name, data) {
  $addin.save({
    name: name,
    data: data
  })
  $ui.toast($l10n("SUCCESS"), 1)
  $delay(1.5, function() {
    $context.close()
    $app.close()
  })
}

