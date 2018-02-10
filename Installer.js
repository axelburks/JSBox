/*
脚本安装器
- 支持文件分享安装
- 支持 Safari 分享安装
- 支持复制链接运行脚本安装
- 支持长按官方链接或 .js 链接分享安装
- 重名文件检测询问处理，可用来保留多个不同版本的脚本
- 默认进入设置脚本名称状态，可用来删除版本号等不需要的字符，覆盖安装后无需每次重复设置取消脚本显示在不必要的位置
- 仅推荐给某些具有强迫症的用户使用，比如我，hhhhh

作者联系：https://t.me/axel_burks
*/


$app.strings = {
  "en": {
    "ERROR": "Running Error",
    "STILL": "Still Install",
    "Existed": "Already Existed",
    "ANOTHER": "Please input another name",
    "CANCEL": "Cancel",
    "REPLACE": "Replace",
    "RENAME": "Rename",
    "STILL_INSTALL": "Not a .js file.\nAre you still want to install it?",
    "CANNOTOPEN": "Please Run The Script From Share Extension!",
    "NOTSUPPORT": "Not Supported Type!",
    "SUCCESS": "Installed"
  },
  "zh-Hans": {
    "ERROR": "运行错误",
    "STILL": "继续安装",
    "Existed": "文件已存在",
    "ANOTHER": "请输入其他名称",
    "CANCEL": "取消",
    "REPLACE": "覆盖",
    "RENAME": "重命名",
    "STILL_INSTALL": "非 js 文件，\n仍然安装？",
    "CANNOTOPEN": "请通过分享扩展运行此脚本！",
    "NOTSUPPORT": "不支持此类型！",
    "SUCCESS": "已安装"
  }
}

// 从应用内启动
if ($app.env == $env.app) {
  if ($clipboard.link && $clipboard.link.indexOf(".js") > 0) {
    installfromLink($clipboard.link);
  } else {
    $ui.error("Not Supported URL!")
    delayClose(1.4)
  }
}
// 从 Action Entension 启动
else if ($app.env == $env.action) {
  var contextText = $context.text;
  var file = $context.data;

  if ($context.text && $context.text.indexOf(".js") > 0) {
    var link = $context.text.match(/https?:\/\/[^\s]+/i);
    if (link) {
      link = link[0];
      installfromLink(link);
    } else {
      $ui.error("Not Supported URL!")
      delayClose(1)
    }
  } else if (file && file.fileName) {
    var fileName = file.fileName;
    if (fileName.indexOf(".js") == -1) {
      error(fileName, file);
    } else {
      renameFile(fileName, file);
    }
  } else {
    $ui.alert({
      title: $l10n("ERROR"),
      message: $l10n("NOTSUPPORT"),
      actions: [{
        title: "OK",
        style: "Cancel",
        handler: function() {
          delayClose(0.8)
        }
      }]
    })
  }
}
// 从 Safari 启动
else if ($app.env == $env.safari) {
  var link = $context.safari.items.baseURI;
  if (link.indexOf(".js") > 0) {
    installfromLink(link);
  } else {
    $ui.error("Not Supported URL!")
    delayClose(1)
  }
}

function renameFile(name, data, icon) {
  $input.text({
    type: $kbType.default,
    text: name.replace('.js',''),
    handler: function(text) {
      installfromFile(text + '.js', data, icon);
    }
  })
}

function installfromFile(fileName, file, icon) {
  var addins = $addin.list
  var addins_list = ""
  for (var i = 0; i < addins.length; i++) {
    addins_list = addins_list + "||" + addins[i].name + "||";
  }
  if (addins_list.indexOf("||" + fileName + "||") > -1) {
    warning(addins_list, fileName, file, icon)
  } else {
    install(fileName, file, icon)
  }
}

function installfromLink(link) {
  var script_url = link.match(/url=(https?[^\s]+?\.js)/i)
  if (script_url) {
    script_url = $text.URLDecode(script_url[1]);
  } else {
    script_url = link.match(/https?:\/\/[^\s]+/i)[0];
  }
  var script_name = link.match(/&name=([^&\s]+)/);
  var script_icon = link.match(/&icon=([^&\s]+)/);
  script_name = script_name ? $text.URLDecode(script_name[1]):$text.URLDecode(link.match(/https?:\/\/.+\/(.+)\.js/i)[1]);
  script_icon = script_icon ? script_icon[1]:"icon_124.png";

  $ui.loading(true);
  $http.download({
    url: script_url,
    progress: function (bytesWritten, totalBytes) {
      var percentage = bytesWritten * 1.0 / totalBytes
    },
    handler: function(resp) {
      $ui.loading(false)
      renameFile(script_name, resp.data, script_icon)
    }
  })
}

function error(name, data, icon) {
  $ui.alert({
    title: $l10n("ERROR"),
    message: $l10n("STILL_INSTALL"),
    actions: [{
      title: $l10n("CANCEL"),
      style: "Cancel",
      handler: function() {
        delayClose(0.8);
      }
    },
    {
      title: $l10n("STILL"),
      handler: function() {
        renameFile(name + ".js", data, icon);
      }
    }]
  })  
}

function warning(list, name, data, icon) {
  $ui.alert({
    title: $l10n("Existed"),
    message: name,
    actions: [{
        title: $l10n("CANCEL"),
        style: "Cancel",
        handler: function() {
          delayClose(0.5);
        }
      },
      {
        title: $l10n("REPLACE"),
        handler: function() {
          install(name, data, icon);
        }
      },
      {
        title: $l10n("RENAME"),
        handler: function() {
          renameFile(name, data, icon);
        }
      }
    ]
  })
}

function install(name, data, icon) {
  $addin.save({
    name: name,
    data: data,
    icon: icon
  })
  $ui.toast($l10n("SUCCESS"), 1)
  delayClose(1.5)
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