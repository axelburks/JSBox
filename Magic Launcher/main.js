let app = require('scripts/app')
let widget = require('scripts/widget')
let today = require('scripts/today')
console.info($device.info.model)
if ($app.env == $env.today) {
  if($app.widgetIndex == -1 || $app.widgetIndex == 1) {
    today.show()
  } else {
    widget.show()
  }
} else {
  app.show()
}
