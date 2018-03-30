module.exports = {
  run: shu
}

var schemes = require("/scripts/schemes")

function shu() {
  if ($app.env == $env.action) {
    var file = $context.data
    if (file && file.fileName) {
      var fileName = file.fileName;
      if (fileName.match(/.+\.(zip|ipa)$/i)) {
        schemes.extract(file)
      } else {
        $ui.error("Not supported file types!")
        schemes.delayClose(1.4)
      }
    } else {
      $ui.error("No file input!")
      schemes.delayClose(1.4)
    }
  } else {
    $ui.error("Please Run through Action Extension!")
    schemes.delayClose(1.4)
  }
}
