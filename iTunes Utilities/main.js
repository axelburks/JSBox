$include("scripts/define")

if ($app.env == $env.app) {
  var app = require('scripts/app')
  app.render()
} else if ($app.env == $env.action) {
  var extension = require('scripts/extension')
  extension.init()
} else if ($app.env == $env.today) {
  var music = require('scripts/widget')
  widget.init()
} else {
  $ui.error("Not Supported Types!", 1)
  $delay(1, function() {
    $app.close()
  })
}
