var helper = require('scripts/helper')
var schedule_date = null

function init(item_id) {
  var item = null
  var conTitle = "Add New Scheduled"
  if (item_id) {
    conTitle = "View Scheduled"
    item = helper.getItem(item_id)
  }
  viewSet(conTitle, item_id, item)
  if (item_id) {
    $("receiver").text = item.receiver
    $("message").text = item.message
    $("date").text = new Date(item.date).toLocaleString().replace(/\:00$/, "")
    $("date").textColor = $color("black")
    schedule_date = item.date
    $("repeat").text = item.repeat
    if (item.repeat != "Off") {
      $("repeat").textColor = $color("black")
    }
    $("save").updateLayout(function(make) {
      make.centerX.equalTo(75)
      make.right.inset(50)
      make.height.equalTo(35)
    })
    $("delete").updateLayout(function(make) {
      make.width.equalTo($("save").width)
      make.height.equalTo(35)
    })
  }
}

function viewSet(conTitle, item_id, item) {
  $ui.push({
    props: {
      title: "Detail"
    },
    views: [{
        type: "label",
        props: {
          id: "conTitle",
          text: conTitle,
          align: $align.center,
          font: $font("bold", 16),
          textColor: $color("white"),
          bgcolor: $color("tint"),
        },
        layout: function(make, view) {
          make.left.top.right.inset(0)
          make.height.equalTo(35)
        }
      },
      {
        type: "label",
        props: {
          id: "label_rev",
          text: "Receiver : ",
          align: $align.left
        },
        layout: function(make, view) {
          make.top.equalTo($("conTitle").bottom).offset(28)
          make.left.inset(15)
          make.height.equalTo(22)
        }
      },
      {
        type: "text",
        props: {
          id: "receiver",
          type: $kbType.phone,
          bgcolor: $rgba(100, 100, 100, 0.1),
          radius: 5
        },
        layout: function(make) {
          make.top.equalTo($("conTitle").bottom).offset(20)
          make.left.equalTo($("label_rev").right).offset(5)
          make.right.inset(15)
          make.height.equalTo($("label_rev").height).multipliedBy(5)
        }
      },
      {
        type: "button",
        props: {
          id: "addContactsButton",
          type: $btnType.contactAdd,
          icon: $icon("104", $rgba(100, 100, 100, 0.2), $size(20, 20)),
          bgcolor: $color("clear"),
        },
        layout: function(make) {
          make.top.equalTo($("label_rev").bottom).offset(10)
          make.left.equalTo($("label_rev").left)
          make.right.equalTo($("label_rev").right)
        },
        events: {
          tapped: function(sender) {
            $contact.pick({
              multi: true,
              handler: function(selected) {
                addContacts(selected)
              }
            })
          }
        }
      },
      {
        type: "label",
        props: {
          id: "label_message",
          text: "Message : ",
          align: $align.left
        },
        layout: function(make, view) {
          make.top.equalTo($("receiver").bottom).offset(20)
          make.left.equalTo($("label_rev").left)
        }
      },
      {
        type: "text",
        props: {
          id: "message",
          bgcolor: $rgba(100, 100, 100, 0.1),
          radius: 5
        },
        layout: function(make) {
          make.top.equalTo($("receiver").bottom).offset(12)
          make.left.equalTo($("receiver").left)
          make.right.equalTo($("receiver").right)
          make.height.equalTo($("label_message").height).multipliedBy(12)
        }
      },
      {
        type: "label",
        props: {
          id: "label_date",
          text: "Date : ",
          align: $align.left
        },
        layout: function(make, view) {
          make.top.equalTo($("message").bottom).offset(20)
          make.left.equalTo($("label_rev").left)
        }
      },
      {
        type: "label",
        props: {
          id: "date",
          text: "Tap to Select",
          textColor: $color("gray"),
          align: $align.center,
          bgcolor: $rgba(100, 100, 100, 0.1),
          radius: 5,
        },
        layout: function(make) {
          make.top.equalTo($("message").bottom).offset(12)
          make.left.equalTo($("receiver").left)
          make.right.equalTo($("receiver").right)
          make.height.equalTo($("label_date").height).multipliedBy(1.6)
        },
        events: {
          tapped: function(sender) {
            var date_init = new Date()
            if (item_id) {
              var date_init = new Date(item.date)
            }
            $picker.date({
              props: {
                date: date_init,
                min: new Date()
              },
              handler: function(selected) {
                sender.textColor = $color("black")
                schedule_date = selected.setSeconds(0)
                sender.text = new Date(schedule_date).toLocaleString().replace(/\:00$/, "")
              }
            })
          }
        }
      },
      {
        type: "label",
        props: {
          id: "label_repeat",
          text: "Repeat : ",
          align: $align.left
        },
        layout: function(make, view) {
          make.top.equalTo($("date").bottom).offset(20)
          make.left.equalTo($("label_rev").left)
        }
      },
      {
        type: "label",
        props: {
          id: "repeat",
          text: "Off",
          textColor: $color("gray"),
          align: $align.center,
          bgcolor: $rgba(100, 100, 100, 0.1),
          radius: 5,
        },
        layout: function(make) {
          make.top.equalTo($("date").bottom).offset(12)
          make.left.equalTo($("receiver").left)
          make.right.equalTo($("receiver").right)
          make.height.equalTo($("label_repeat").height).multipliedBy(1.6)
        },
        events: {
          tapped: function(sender) {
            $picker.data({
              props: {
                items: [
                  ["Off", "Every Hour", "Every Day", "Every Month", "Every Year"]
                ]
              },
              handler: function(seleted) {
                if (seleted[0] == "Off") {
                  sender.textColor = $color("gray")
                } else {
                  sender.textColor = $color("black")
                }
                sender.text = seleted[0]
              }
            })
          }
        }
      },
      {
        type: "button",
        props: {
          id: "save",
          title: "Save",
          bgcolor: $rgba(100, 100, 100, 0.9),
          align: $align.center
        },
        layout: function(make, view) {
          make.centerX.equalTo(view.super)
          make.top.equalTo($("repeat").bottom).offset(30)
          make.width.equalTo($device.info.screen.width - 200)
        },
        events: {
          tapped: function(sender) {
            saveButtonAction(item_id)
          }
        }
      },
      {
        type: "button",
        props: {
          id: "delete",
          title: "Delete",
          bgcolor: $rgba(205, 55, 0, 0.7),
          align: $align.center
        },
        layout: function(make, view) {
          make.left.inset(50)
          make.top.equalTo($("repeat").bottom).offset(30)
          make.height.equalTo(0)
        },
        events: {
          tapped: function(sender) {
            deleteButtonAction(item_id)
          }
        }
      },
    ]
  })
}

function deleteButtonAction(item_id) {
  $ui.alert({
    title: "Alert",
    message: "Are you sure to delete?",
    actions: [{
      title: "Delete",
      style: "Cancel",
      handler: function() {
        helper.deleteNotify(item_id)
        var allItems = $cache.get("messages")
        delete allItems[item_id]
        helper.updateItem(allItems, "init")
        $cache.set("messages", allItems)
        $ui.pop()
      }
    },
    {
      title: "Cancel"
    }]
  })
}

function saveButtonAction(item_id) {
  if ($("receiver").text != "" && $("message").text != "" && $("date").text != "Tap to Select") {
    var phone_list = []
    var contacts_nameList = $("receiver").text.split(",")
    for (var i = 0; i < contacts_nameList.length; i++) {
      name2phone(contacts_nameList[i]).then(function(data){
        phone_list.push(data)
      })
    }
    var save_id = new Date().getTime()
    if (item_id) {
      save_id = item_id
      helper.deleteNotify(item_id)
    }
    $push.schedule({
      title: "Scheduled MS To: " + $("receiver").text,
      body: $("message").text,
      date: schedule_date,
      script: $addin.current.name.split(".js")[0],
      query: {
        "from": "schedule_ms_widget",
        "schedule_ms_id": save_id
      },
      handler: function(notify_result) {
        var data = {
          "notify_id": notify_result.id,
          "receiver": $("receiver").text,
          "phonelist": phone_list.join(","),
          "message": $("message").text,
          "date": schedule_date,
          "repeat": $("repeat").text
        }
        helper.saveItem(save_id, data)
        helper.updateItem($cache.get("messages"))
        $ui.pop()
      }
    })
  } else {
    $ui.error("Please fill in all the fields!", 1)
  }
}

function name2phone(name) {
  var index = null
  if (name.match(/\[\d\]/)) {
    index = name.match(/\[(\d)\]/)[1]
    name = name.replace(/\[\d\]/,"")
  }
  var p = new Promise(function(resolve, reject){
    if (name.match(/^[\d\s]+$/)) {
      resolve(name)
    } else {
      $contact.fetch({
        key: name,
        handler: function(contacts) {
          for (var i=0; i<contacts.length; i++) {
            var searchedName = ""
            if (contacts[i].familyName && contacts[i].givenName) {
              searchedName = contacts[i].familyName + " " + contacts[i].givenName
            } else {
              searchedName = contacts[i].familyName + contacts[i].givenName
            }
            if (searchedName == name) {
              var phoneNumber = ""
              if (index) {
                phoneNumber = contacts[i].phoneNumbers[index].content
              } else {
                phoneNumber = contacts[i].phoneNumbers[0].content
              }
              resolve(phoneNumber)
            }
          }
        }
      })
    }
  })
  return p
}

function addContacts(items) {
  var contacts = ""
  var error = ""
  if ($("receiver").text != "") {
    contacts = $("receiver").text + ","
  }
  for (var i = 0; i < items.length; i++) {
    var name = ""
    if (items[i].familyName && items[i].givenName) {
      name = items[i].familyName + " " + items[i].givenName
    } else {
      name = items[i].familyName + items[i].givenName
    }
    if (items[i].phoneNumbers.length > 0) {
      if (items[i].phoneNumbers.length > 1) {
        var menu_items = []
        for (var j = 0; j < items[i].phoneNumbers.length; j++) {
          menu_items.push(name + "(" + items[i].phoneNumbers[j].label + ") | " + items[i].phoneNumbers[j].content)
        }
        multiPhones(menu_items, name)
      } else {
        if (contacts.indexOf(name) == -1) {
          contacts = contacts + name + ","
        }
      }
    } else {
      error = error + name + ","
    }
  }
  if (error.length > 0) {
    error = error.substring(0, error.lastIndexOf(','))
    $ui.alert({
      title: "Error",
      message: "Some contacts you choose do not have phone numbers:\n\n" + error
    })
  }
  contacts = contacts.substring(0, contacts.lastIndexOf(','))
  $("receiver").text = contacts
}

function multiPhones(menu_items, name) {
  $ui.menu({
    items: menu_items,
    handler: function(title, idx) {
      var contacts = ""
      if ($("receiver").text != "") {
        contacts = $("receiver").text + ","
      }
      name = name + "[" + idx + "]"
      if (contacts.indexOf(name) == -1) {
        contacts = contacts + name + ","
      }
      contacts = contacts.substring(0, contacts.lastIndexOf(','))
      $("receiver").text = contacts
    },
    finished: function(cancelled) {

    }
  })
}


module.exports = {
  init: init
}