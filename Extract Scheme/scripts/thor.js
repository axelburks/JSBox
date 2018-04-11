module.exports = {
  run: thor
}

var schemes = require("/scripts/schemes")
var thor_sniffer = "thor://sniffer.gui/launch?filter_name=Dump%20IPA"
var thor_url = "https://itunes.apple.com/app/id1210562295?mt=8"

function thor() {
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
  } else if ($app.env == $env.app || $app.env == $env.today) {
    var thor = $app.openURL(thor_sniffer)
    if (thor) {
      $app.listen({
        resume: function() {
          $ui.menu({
            title: "test",
            items: ["App Store", "TestFlight"],
            handler: function(title, idx) {
              if (idx == 0) {
                $app.openURL("itms-apps://search.itunes.apple.com/WebObjects/MZSearch.woa/wa/search?media=software&term=")
              } else {
                $app.openURL("itms-beta://")
              }
              $app.listen({
                resume: function() {
                  $app.openURL("thor://session.gui/active")
                  $app.listen({
                    resume: function() {
                      $app.openURL("thor://sniffer.gui/shutdown")
                      $app.listen({
                        resume: function() {
                          $app.openURL("surge3:///toggle?autoclose=true")
                          schemes.delayClose(0.8)
                        }
                      })
                    }
                  })
                }
              })
            },
            finished: function(cancelled) {
              if (cancelled) {
                schemes.delayClose(0.5)
              }
            }
          })
        }
      })
    } else {
      $ui.alert({
        title: "Error",
        message: "Thor is NOT installed on the device",
        actions: [{
          title: "OK",
          style: "Cancel",
          handler: function() {
            schemes.delayClose(0.5)
          }
        },
        {
          title: "Get Thor",
          handler: function() {
            $app.openURL(thor_url)
            schemes.delayClose(0.5)
          }
        }]
      })
    }
  }
}
