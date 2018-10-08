/*
1.App 内支持发送、接收、删除内容
2.Today widget 支持发送剪贴板内容(Line 18 处可自行修改回原方式)
3.Action Extension 支持自动识别发送 Note, Link，File 类型
4.Safari Extension 运行增加获取当前页面标题、链接、选中内容
5.Note 类型检测到链接时自动转换为 Link 类型，接收自动打开链接
6.指定接收设备，避免发送端安装 App 的情况下也收到通知
7.AppStore 链接自动转换为 ASO100 页面（支持 PC 查看美区等商店内容且数据更全面，Line 345 处可自行删除取消转换）
*/

var timeout = 3
var accesstoken = getToken()
var device = getDevice()
var device_num = 1
if (Array.isArray(device)) {
  device_num = device.length
}

  // 从 Today Widget 启动
if ($app.env == $env.today) {
  if (accesstoken) {
    // pushbullet：全部功能 / pushbulletCnt：发送内容
    //pushbullet(accesstoken, device)
    pushbulletCnt($clipboard.text, accesstoken, device, device_num)
  } else {
    var message = {
      title: "Access Token Missing 😅",
      message: "Execute This Script In JSBox App For More Information.",
      actions: [{
          title: "Run in JSBox",
          handler: function() {
            $app.openURL("jsbox://run?name=" + $addin.current.name.split(".js")[0])
          }
        },
        {
          title: "Cancel",
          handler: function() {
            $app.close()
          }
        }
      ]
    }
    $ui.alert(message)
  }
}
// 从应用内启动
if ($app.env == $env.app) {
  if (accesstoken) {
    pushbullet(accesstoken, device, device_num)
  } else {
    settingConfig()
  }
}
// 从 Action Entension 启动
if ($app.env == $env.action) {
  if (accesstoken) {
    pushbulletAction(accesstoken, device, device_num)
  } else {
    settingConfig()
  }
}
// 从 Safari 启动
if ($app.env == $env.safari) {
  if (accesstoken) {
    pushbulletSafari(accesstoken, device, device_num)
  } else {
    settingConfig()
  }
}

function pushbullet(accesstoken, device, device_num) {
  let auto_input = $context.query.Pushbullet_Content
  if (auto_input) {
    auto_input = decodeURIComponent(auto_input)
    pushbulletCnt(auto_input, accesstoken, device, device_num, "toHomescreen")
  } else {
    $ui.menu({
      items: ["Send ⬆️", "Get ⬇️", "Delete 🗑"],
      handler: function(title, idx) {
        if (idx == 0) {
          pushbulletCnt($clipboard.text, accesstoken, device, device_num)
        } else if (idx == 1) {
          getItem(accesstoken)
        } else if (idx == 2) {
          $ui.alert({
            title: "Delete Confirm 🗑",
            message: "One Or All?",
            actions: [{
                title: "One",
                handler: function() {
                  deleteItem(accesstoken)
                }
              }, {
                title: "All",
                handler: function() {
                  $ui.loading("Loading...")
                  $http.request({
                    method: "DELETE",
                    url: "https://api.pushbullet.com/v2/pushes",
                    header: {
                      "Access-Token": accesstoken
                    },
                    timeout: timeout,
                    handler: function(resp) {
                      toast(resp)
                      delayClose()
                    }
                  })
                }
              },
              {
                title: "Cancel",
                handler: function() {
                  $app.close()
                }
              }
            ]
          })
        }
      },
      finished: function(cancelled) {
        if (cancelled) {
          $app.close()
        }
      }
    })
  }
}

function pushbulletCnt(content, accesstoken, device, device_num, redirect) {
  if (!content || content == "") {
    $ui.error("Clipboard is Empty!", 1)
    delayClose(redirect)
  } else {
    let patt = /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
    let result = null;
    if ((result = patt.exec(content)) != null) {
      sendLink(content, result[0], null, accesstoken, device, device_num, redirect)
    } else {
      sendNote(content, accesstoken, device, device_num, redirect)
    }
  }
}

function pushbulletSafari(accesstoken, device, device_num) {
  var link = $context.safari.items.baseURI
  var title = $context.safari.items.title
  var selection = $context.safari.items.selection.text
  sendLink(title, link, selection, accesstoken, device, device_num)
}

function pushbulletAction(accesstoken, device, device_num) {
  var re = /^file:\/\//i;
  if ($context.link && !re.test($context.link)) {
    sendLink($context.text || $context.link, $context.link, null, accesstoken, device, device_num)
  } else if ($context.text) {
    var link = $context.text.match(/https?:\/\/[^\s]+/i)
    if (link) {
      link = link[0]
      sendLink($context.text || link, link, null, accesstoken, device, device_num)
    } else {
      sendNote($context.text, accesstoken, device, device_num)
    }
  } else if ($context.data) {
    var file = $context.data
    $ui.toast("Setting URL for file...")
    $ui.loading("Loading...")
    file_name = file.fileName
    $http.request({
      method: "POST",
      url: "https://api.pushbullet.com/v2/upload-request",
      header: {
        "Access-Token": accesstoken,
      },
      body: {
        file_name: file_name
      },
      timeout: timeout,
      handler: function(resp) {
        toast(resp)
        var upload_url = resp.data.upload_url
        var file_url = resp.data.file_url
        if (file_url.indexOf("pushbulletusercontent.com/") != -1) {
          $ui.toast("file_url SUCCEEDED 💡")
        } else {
          $ui.toast("file_url FAILED ❌")
          $app.close()
        }
        $ui.toast("File Uploading...")
        $ui.loading("Loading...")
        $http.request({
          method: "POST",
          url: upload_url,
          form: {
            file: file
          },
          timeout: 30,
          handler: function(resp) {
            toast(resp)
            sendFile(file_url, file_name, accesstoken, device, device_num)
          }   
        })
      }
    })
  }
}

async function sendFile(file_url, file_name, accesstoken, device, device_num) {
  $ui.loading("Loading...")
  for (let i = 0; i < device_num; i++) {
    let resp = await $http.request({
      method: "POST",
      url: "https://api.pushbullet.com/v2/pushes",
      header: {
        "Access-Token": accesstoken,
      },
      body: {
        device_iden: device[i],
        type: "file",
        file_url: file_url,
        file_name: file_name,
      },
      timeout: timeout
    })
    toast(resp)
    if (i == device_num - 1) {
      delayClose(redirect)
    }
  }
}

async function sendNote(note, accesstoken, device, device_num, redirect) {
  $ui.loading(note)
  for (let i = 0; i < device_num; i++) {
    let resp = await $http.request({
      method: "POST",
      url: "https://api.pushbullet.com/v2/pushes",
      header: {
        "Access-Token": accesstoken,
        "Content-Type": "application/json"
      },
      body: {
        device_iden: device[i],
        type: "note",
        body: note
      },
      timeout: timeout
    })
    toast(resp)
    if (i == device_num - 1) {
      delayClose(redirect)
    }
  }
}

async function sendLink(title, link, selection, accesstoken, device, device_num, redirect) {
  //Convert iOS App Store urls to ASO100 ⬇️
  var patt = /itunes\.apple\.com\/(\w+)\/app\/.*?\?mt=(?!12).*/;
  var result = null;
  if ((result = patt.exec(link)) != null) {
    var regex = /.+id(\d+).*/;
    var appid = regex.exec(link)[1];
    link = "https://www.qimai.cn/app/baseinfo/appid/" + appid + "/country/" + result[1];
  }
  //End ⬆️
  $ui.loading(link)
  for (let i = 0; i < device_num; i++) {
    let resp = await $http.request({
      method: "POST",
      url: "https://api.pushbullet.com/v2/pushes",
      header: {
        "Access-Token": accesstoken,
        "Content-Type": "application/json"
      },
      body: {
        device_iden: device[i],
        type: "link",
        title: title,
        body: selection,
        url: link,
      },
      timeout: timeout
    })
    toast(resp)
    if (i == device_num - 1) {
      delayClose(redirect)
    }
  }
}

function getItem(accesstoken, last_cursor) {
  $ui.loading("Loading...")
  let cursor_param = ""
  if (last_cursor) {
    cursor_param = `&cursor=${last_cursor}`
  }
  $http.request({
    method: "GET",
    url: `https://api.pushbullet.com/v2/pushes?active=true&limit=500${cursor_param}`,
    header: {
      "Access-Token": accesstoken
    },
    timeout: timeout,
    handler: function(resp) {
      $ui.loading(false)
      let pushes = resp.data.pushes
      let cursor = resp.data.cursor
      if (pushes.length == 0 && !cursor) {
        $ui.alert("NO PUSHES❌")
        $app.close()
      } else if (pushes.length == 0 && cursor) {
        getItem(accesstoken, cursor)
      } else {
        let list = pushes.map(function(item) {
          if (item.type == "note") {
            if (item.body.indexOf("\n") >= 0) {
              return item.body.trim().split("\n")[0] + "...↩️"
            } else {
              return item.body
            }
          } else if (item.type == "link") {
            if (item.body) {
              return "🔗:" + item.body
            } else if (item.title) {
              return "🔗:" + item.title
            } else {
              return "🔗:" + item.url
            }

          } else {
            var filename = item.file_url
            return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)
          }
        })
        if (cursor) {
          list.push("➤ ➤ Next Page ➤ ➤")
        }
        $ui.menu({
          items: list,
          handler: function(title, idx) {
            if (title == "➤ ➤ Next Page ➤ ➤") {
              getItem(accesstoken, cursor)
            } else if (pushes[idx].type == "link") {
              if (pushes[idx].body) {
                $clipboard.text = "[" + pushes[idx].body + "]" + "(" + pushes[idx].url + ")"
              } else if (pushes[idx].title) {
                $clipboard.text = "[" + pushes[idx].title + "]" + "(" + pushes[idx].url + ")"
              } else {
                $clipboard.text = pushes[idx].url
              }
              var title = "Link and Note Copied 📌"
              selectResult(title, $clipboard.text, pushes[idx].url)
            } else if (pushes[idx].type == "note") {
              $clipboard.text = pushes[idx].body
              var link = $detector.link(pushes[idx].body)
              if (link.length == 1) {
                var title = "Note Copied 📌"
                var message = "Find 🔗: " + link
                selectResult(title, message, link)
              } else if (link.length > 1) {
                $ui.toast("Note Copied 📌 Multi-Links Dectected 🔗")
                $ui.menu({
                  items: link,
                  handler: function(title, idx) {
                    $clipboard.text = link[idx]
                    selectResult2("Link Copied 📌", link[idx])
                  }
                })
              } else {
                $ui.toast("Copied 📌")
                delayClose()
              }
            } else {
              var title = "Pushbullet File 📝"
              var url = pushes[idx].file_url
              $clipboard.text = url
              $ui.toast("File URL Copied 📌")
              selectResult2(title, url)
            }
          },
          finished: function(cancelled) {
            if (cancelled) {
              $app.close()
            }
          }
        })
      }
    }
  })
}

function deleteItem(accesstoken, last_cursor) {
  $ui.loading("Loading...")
  let cursor_param = ""
  if (last_cursor) {
    cursor_param = `&cursor=${last_cursor}`
  }
  $http.request({
    method: "GET",
    url: `https://api.pushbullet.com/v2/pushes?active=true&limit=500${cursor_param}`,
    header: {
      "Access-Token": accesstoken
    },
    timeout: timeout,
    handler: function(resp) {
      $ui.loading(false)
      let pushes = resp.data.pushes
      let cursor = resp.data.cursor
      if (pushes.length == 0 && !cursor) {
        $ui.alert("NO PUSHES❌")
        $app.close()
      } else if (pushes.length == 0 && cursor) {
        deleteItem(accesstoken, cursor)
      } else {
        let list = pushes.map(function(item) {
          if (item.type == "note") {
            return item.body.replace(/\n/g," ")
          } else if (item.type == "link") {
            if (item.body) {
              return "🔗:[" + item.body.replace(/\n/g,"") + "]" + "(" + item.title.replace(/\n/g,"") + ")"
            } else if (item.title) {
              return "🔗:[" + item.title.replace(/\n/g,"") + "]" + "(" + item.url + ")"
            } else {
              return "🔗:" + item.url
            }
          } else {
            let filename = item.file_url
            return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)
          }
        })
        if (cursor) {
          list.push("➤ ➤ Next Page ➤ ➤")
        }
        $ui.menu({
          items: list,
          handler: function(title, idx) {
            if (title == "➤ ➤ Next Page ➤ ➤") {
              deleteItem(accesstoken, cursor)
            } else {
              let iden = pushes[idx].iden
              $http.request({
                method: "DELETE",
                url: "https://api.pushbullet.com/v2/pushes/" + iden,
                header: {
                  "Access-Token": accesstoken
                },
                timeout: timeout,
                handler: function(resp) {
                  toast(resp)
                  deleteItem(accesstoken, last_cursor)
                }
              })
            }
          },
          finished: function(cancelled) {
            if (cancelled) {
              $app.close()
            }
          }
        })
      }
    }
  })
}

function getToken() {
  if ($file.exists("pushbullet.txt")) {
    var file = $file.read("pushbullet.txt")
    if (file.string) {
      return file.string.replace(/(\r|\n)/gi, "")
    } else {
      return 0
    }
  } else {
    return 0
  }
}

function getDevice() {
  if ($file.exists("device.txt")) {
    var file = $file.read("device.txt")
    if (file.string && file.string != "") {
      let devices = file.string.replace(/(\r|\n)/gi, "").split(",")
      return devices
    } else {
      return ""
    }
  } else {
    return ""
  }
}

function toast(resp) {
  if (resp.response.statusCode == 400) {
    console.info(resp.response)
    console.info(resp.data)
    $ui.toast("Error! Please check the console log!")
    $ui.loading(false)
  } else if (resp.response) {
    $ui.toast("Request Succeeded💡")
    $ui.loading(false)
  } else {
    $ui.toast("Request Timeout, Try Again Later ❌")
    $ui.loading(false)
    $app.close()
  }
}

function delayClose(redirect) {
  $thread.main({
    delay: 0.8,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
        if (redirect && redirect == "toHomescreen") {
          $system.home();
        }
        $app.close()
      }
    }
  })
}

function selectResult(title, message, url, quicklook = 0) {
  $ui.alert({
    title: title,
    message: message,
    actions: [{
        title: "Open",
        handler: function() {
          $app.openURL(url)
          delayClose()
        }
      },
      {
        title: "Preview",
        handler: function() {
          if (quicklook == 0) {
            $safari.open({
              url: url,
              handler: function() {
                $app.close()
              }
            })
          } else {
            $http.download({
              url: url,
              handler: function(resp) {
                $quicklook.open({
                  data: resp.data,
                  handler: function() {
                    $app.close()
                  }
                })
              }
            })

          }

        }
      },
      {
        title: "Copy URL",

        handler: function() {
          $clipboard.text = url
          $ui.toast("Copied 📌")
          delayClose()
        }
      },
      {
        title: "Cancel",
        handler: function() {
          $app.close()
        }
      }
    ]
  })
}

function settingConfig() {
  $ui.render({
    props: {
      title: "Pushbullet"
    },
    views: [{
        type: "text",
        props: {
          id: "message_token",
          text: "\nInput your access token to use the API.",
          font: $font(16),
          editable: 0
        },
        layout: function(make) {
          make.left.top.right.inset(5)
          make.height.equalTo(55)
        }
      },
      {
        type: "input",
        props: {
          id: "accesstoken",
          placeholder: "Paste Your Access Token",
          align: $align.center,
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("message_token")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          returned: function(sender) {
            $("input").blur()

          }
        }
      },
      {
        type: "text",
        props: {
          id: "message_device",
          text: "\nYou can specify one or more devices(split with ',') with the identity.\nPlease input nothing if you want to send to all.",
          font: $font(16),
          editable: 0
        },
        layout: function(make) {
          var preView = $("accesstoken")
          make.top.equalTo(preView.bottom).inset(5)
          make.left.right.inset(5)
          make.height.equalTo(70)
        }
      },
      {
        type: "input",
        props: {
          id: "device",
          placeholder: "Paste Your Device Identity",
          align: $align.center,
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("message_device")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          returned: function(sender) {
            $("input").blur()

          }
        }
      },
      {
        type: "button",
        props: {
          id: "submit",
          title: "Submit",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("device")
          make.top.equalTo(preView.bottom).inset(30)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            handleButtonSubmit()
          }
        }
      },
      {
        type: "button",
        props: {
          id: "register",
          title: "Create Access Token on Pushbullet.com",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("submit")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            $app.openURL("https://www.pushbullet.com/#settings/account")
          }
        }
      },
      {
        type: "button",
        props: {
          id: "setting",
          title: "More Information",
          font: $font(15)
        },
        layout: function(make) {
          var preView = $("register")
          make.top.equalTo(preView.bottom).inset(10)
          make.left.right.inset(10)
          make.height.equalTo(30)
        },
        events: {
          tapped: function() {
            $ui.preview({
              url: "http://telegra.ph/PushbulletAccessToken-09-17"
            })
          }
        }
      }
    ]
  })
}

function handleButtonSubmit() {
  var accesstoken = $("accesstoken").text
  var deviceiden = $("device").text
  if (accesstoken == '') {
    $ui.toast("Input Access Token.")
  } else {
    $ui.loading("CONNECTING...")
    $http.request({
      method: "GET",
      url: "https://api.pushbullet.com/v2/pushes?active=true",
      header: {
        "Access-Token": accesstoken
      },
      timeout: timeout,
      handler: function(resp) {

        $ui.loading(false)
        if (!resp.response) {
          $ui.toast("Request Timeout, Try Again Later ❌")
        } else if (resp.response.statusCode == 200) {
          $ui.toast("Verifying Succeeded💡")
          $file.write({
            data: $data({
              string: accesstoken
            }),
            path: "pushbullet.txt"
          })
          $file.write({
            data: $data({
              string: deviceiden
            }),
            path: "device.txt"
          })
          $("accesstoken").blur()
          $app.close()
        } else {
          $("accesstoken").text = ""
          $ui.toast("Wrong Access Token, Try Again Later ❌")
          $("accesstoken").focus()
        }
      }
    })
  }
}

function selectResult2(title, url) {
  $ui.alert({
    title: title,
    message: url,
    actions: [{
      title: "Preview",
      handler: function() {
        $safari.open({
          url: url,

        })
      }
    }, {
      title: "Cancel",
      handler: function() {
        $app.close()
      }
    }]
  })
}
