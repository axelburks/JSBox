$include("scripts/define")

if ($app.env == $env.app) {
  if ($context.query.from && $context.query.from == "itunes_widget") {
    let widget = require("scripts/widget")
    widget.processMusic($context.query.platform, $context.query.songid, $context.query.songtitle, $context.query.songartist)
  } else {
    var app = require('scripts/app')
    app.render()
  }

} else if ($app.env == $env.action) {
  $thread.background({
    delay: 0.2,
    handler: function() {
      var extension = require('scripts/extension')
      extension.init()
    }
  })
} else if ($app.env == $env.today) {
  var widget = require('scripts/widget')
  widget.init()
} else {
  $ui.error("Not Supported Types!", 1)
  $delay(1, function() {
    $app.close()
  })
}
