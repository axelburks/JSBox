$app.strings = {
  "en": {
    "MAIN_TITLE": "Clips",
    "PLACEHOLDER": "Please input text here",
    "COPIED": "Copied"
  },
  "zh-Hans": {
    "MAIN_TITLE": "文本收藏夹",
    "PLACEHOLDER": "输入要收藏的内容",
    "COPIED": "已复制"
  }
}

var clips = $cache.get("clips") || []

if ($app.env == $env.today) {
  $ui.menu({
    items: clips,
    handler: function(title, idx) {
      $clipboard.copy({
        text: title,
        locally:true,
        ttl: 300
      })
      $device.taptic()
      $ui.toast($l10n("COPIED"))
    }
  })
  return
}

$ui.render({
  props: {
    title: $l10n("MAIN_TITLE")
  },
  views: [
    {
      type: "input",
      props: {
        placeholder: $l10n("PLACEHOLDER")
      },
      layout: function(make) {
        make.top.left.right.inset(10)
        make.height.equalTo(32)
      },
      events: {
        returned: function(sender) {
          insertItem(sender.text)
          sender.blur()
          sender.text = ""
        }
      }
    },
    {
      type: "list",
      props: {
        id: "list",
        reorder: true,
        actions: [{
          title: "delete",
          handler: function(sender, indexPath) {
            deleteItem(indexPath)
          }
        }]
      },
      layout: function(make) {
        make.left.bottom.right.equalTo(0)
        make.top.equalTo($("input").bottom).offset(10)
      },
      events: {
        didSelect: function(sender, indexPath, title) {
          $clipboard.copy({
            text: title,
            locally:true,
            ttl: 300
          })
          $device.taptic()
          $ui.toast($l10n("COPIED"))
        },
        reorderMoved: function(from, to) {
          clips.move(from.row, to.row)
        },
        reorderFinished: function() {
          saveItems()
        }
      }
    }
  ]
})

var listView = $("list")
listView.data = clips

function insertItem(text) {
  clips.unshift(text)
  listView.insert({
    index: 0,
    value: text
  })
  saveItems()
}

function deleteItem(indexPath) {
  var text = clips[indexPath.row]
  var index = clips.indexOf(text)
  if (index >= 0) {
    clips.splice(index, 1)
    saveItems()
  }
}

function saveItems() {
  $cache.set("clips", clips)
}