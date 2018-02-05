/*
 Pushbullet
    支持从剪切板发送和接收 Push
    Send:
         TodayWidget:
                Clipboard
         Action Extension:
                File 📝
         Safari:
                Link 🔗
    Get:
         TodayWidget or in App:
                Note, Link 🔗, File 📝
    Delete:
         One or All
    
  by Nicked 
     https://t.me/nicked
*/

timeout = 3
// 从 Today Widget 启动
if ($app.env == $env.today) {
  var accesstoken = getToken()
  var device = getDevice()
  if (accesstoken) {
    // 执行 pushbullet
    //pushbullet(accesstoken, device)
    pushbulletClip(accesstoken, device)
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
  var accesstoken = getToken();
  var device = getDevice()
  if (accesstoken) {
    pushbullet(accesstoken, device)
  } else {
    settingConfig()
  }
}
// 从 Action Entension 启动
if ($app.env == $env.action) {
  var accesstoken = getToken()
  var device = getDevice()
  if (accesstoken) {
    pushbulletAction(accesstoken, device)
  } else {
    settingConfig()
  }
}
// 从 Safari 启动
if ($app.env == $env.safari) {
  var accesstoken = getToken()
  var device = getDevice()
  if (accesstoken) {
    pushbulletSafari(accesstoken, device)
  } else {
    settingConfig()
  }
}

function pushbullet(accesstoken, device) {
  $ui.menu({
    items: ["Send ⬆️", "Get ⬇️", "Delete 🗑"],
    handler: function(title, idx) {
      if (idx == 0) {
        pushbulletClip(accesstoken, device)
      } else if (idx == 1) {
        $ui.loading("Loading...")
        $http.request({
          method: "GET",
          url: "https://api.pushbullet.com/v2/pushes?active=true",
          header: {
            "Access-Token": accesstoken
          },
          timeout: timeout,
          handler: function(resp) {
            toast(resp)
            var push = resp.data.pushes
            if (push.length == 0) {
              $ui.alert("NO PUSHES ❌")
              $app.close()
            } else {
              $ui.menu({
                items: push.map(function(item) {
                  if (item.type == "note") {
                    if (item.body.indexOf("\n") >= 0) {
                      return item.body.trim().split("\n")[0] + "...(👀 Multi-Lines)"
                    } else {
                      return item.body
                    }
                  } else if (item.type == "link") {
                    mkd = "[" + item.body + "]" + "(" + item.url + ")"
                    if (item.title) {
                      return "🔗:" + item.title
                    } else {
                      return "🔗:" + mkd
                    }

                  } else {
                    var filename = item.file_url
                    return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)

                  }
                }),
                handler: function(title, idx) {
                  if (push[idx].type == "link") {

                    $clipboard.text = "[" + push[idx].body + "]" + "(" + push[idx].url + ")"
                    var title = "Link and Note Copied 📌"

                    selectResult(title, $clipboard.text, push[idx].url)

                  } else if (push[idx].type == "note") {
                    $clipboard.text = push[idx].body
                    var link = $detector.link(push[idx].body)
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

                    var url = push[idx].file_url
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

function pushbulletClip(accesstoken, device) {
  if ($clipboard.text == "") {
    $ui.alert({
      title: "WARNING",
      message: "Clipboard is EMPTY ❌",
      actions: [{
        title: "Cancel",
        handler: function() {
          $app.close()
        }
      }]
    })
  } else {
    if ($clipboard.link) {
      sendLink($clipboard.text.replace($clipboard.link, '') || $clipboard.link, $clipboard.link, null, accesstoken, device)
    } else {
      sendNote($clipboard.text, accesstoken, device)
    }
  }
}

function pushbulletSafari(accesstoken, device) {
  var link = $context.safari.items.baseURI
  var title = $context.safari.items.title
  var selection = $context.safari.items.selection.text
  sendLink(title, link, selection, accesstoken, device)
}

function pushbulletAction(accesstoken, device) {
  var re = /^file:\/\//i;
  if ($context.link && !re.test($context.link)) {
    sendLink($context.text || $context.link, $context.link, null, accesstoken, device)
  } else if ($context.text) {
    var link = $context.text.match(/https?:\/\/[^\s]+/i)
    if (link) {
      link = link[0]
      sendLink($context.text.replace(link, '') || link, link, null, accesstoken, device)
    } else {
      sendNote($context.text, accesstoken, device)
    }
  } else {
    var file = $context.data
    $ui.toast("Setting URL...")
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
            $ui.loading("Loading...")
            $http.request({
              method: "POST",
              url: "https://api.pushbullet.com/v2/pushes",
              header: {
                "Access-Token": accesstoken,
              },
              body: {
                device_iden: device,
                type: "file",
                file_url: file_url,
                file_name: file_name,
              },
              timeout: timeout,
              handler: function(resp) {
                toast(resp)
                delayClose()
              }
            })
  
          }
  
        })
      }
    })
  }
}

function sendNote(note, accesstoken, device) {
  $ui.loading("Loading...")
  $http.request({
    method: "POST",
    url: "https://api.pushbullet.com/v2/pushes",
    header: {
      "Access-Token": accesstoken,
      "Content-Type": "application/json"
    },
    body: {
      device_iden: device,
      type: "note",
      body: note
    },
    timeout: timeout,
    handler: function(resp) {
      toast(resp)
      delayClose()
    }
  })
}

function sendLink(title, link, selection, accesstoken, device) {
  $ui.loading("Loading...")
  var patt = /itunes\.apple\.com\/(\w+)\/app\//;
  var result;
  if ((result = patt.exec(link)) != null) {
    var regex = /.+id(\d+).*/;
    var appid = regex.exec(link)[1];
    link = "https://www.qimai.cn/app/baseinfo/appid/" + appid + "/country/" + result[1];
  }
  $http.request({
    method: "POST",
    url: "https://api.pushbullet.com/v2/pushes",
    header: {
      "Access-Token": accesstoken,
      "Content-Type": "application/json"
    },
    body: {
      device_iden: device,
      type: "link",
      title: title,
      body: selection,
      url: link,
    },
    timeout: timeout,
    handler: function(resp) {
      toast(resp)
      delayClose()
    }
  })
}

function deleteItem(accesstoken) {
  $ui.loading("Loading...")
  $http.request({
    method: "GET",
    url: "https://api.pushbullet.com/v2/pushes?active=true",
    header: {
      "Access-Token": accesstoken
    },
    timeout: timeout,
    handler: function(resp) {
      $ui.loading(false)
      var push = resp.data.pushes
      if (push.length == 0) {
        $ui.alert("NO PUSHES❌")
        $app.close()
      } else {
        $ui.menu({
          items: push.map(function(item) {
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
              var filename = item.file_url
              return "📝:" + filename.substr(filename.lastIndexOf('/') + 1)
            }
          }),
          handler: function(title, idx) {
            var iden = push[idx].iden
            $http.request({
              method: "DELETE",
              url: "https://api.pushbullet.com/v2/pushes/" + iden,
              header: {
                "Access-Token": accesstoken
              },
              timeout: timeout,
              handler: function(resp) {
                toast(resp)
                deleteItem(accesstoken)
              }
            })
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
      return file.string
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
    if (file.string) {
      return file.string
    } else {
      return 0
    }
  } else {
    return 0
  }
}

function toast(resp) {
  if (resp.response) {
    $ui.toast("Request Succeeded💡")
    $ui.loading(false)
  } else {
    $ui.toast("Request Timeout, Try Again Later ❌")
    $ui.loading(false)
    delayClose()
  }

}

function delayClose() {
  $thread.main({
    delay: 0.8,
    handler: function() {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else {
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
          text: "\nYou can specify a device with the identity.\nPlease input nothing if you want to send to all.",
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