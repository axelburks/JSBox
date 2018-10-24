let content = $context.link || $context.text || $app.env == $env.safari ? $context.safari.items.baseURI : $clipboard.text
ShortenLinks(content)

async function ShortenLinks(str_url) {
  let selectedLink = null
  let links = $detector.link(str_url)
  if (links.length >= 1) {
    if (links.length == 1) {
      selectedLink = links[0];
    } else {
      selectedLink = await $ui.menu({ items: links })
      selectedLink = selectedLink.title
    }
    if (selectedLink) {
      $http.shorten({
        url: selectedLink,
        handler: function(url) {
          if (url) {
            $clipboard.set({
              "type": "public.plain-text",
              "value": url
            })
            $ui.toast("Copid Success!", 1)
          } else {
            $clipboard.set({
              "type": "public.plain-text",
              "value": "Original Content:" + selectedLink
            })
            $ui.error("Shorten Failed!", 1)
          }
          delayClose(0.8)
        }
      })
    } else {
      delayClose(0.8)
    }
  } else { 
    $ui.error("Please Input Correct URL!", 1)
    delayClose(0.8)
  }
}

function delayClose(time) {
  $thread.main({
    delay: time,
    handler: function () {
      if ($app.env == $env.action || $app.env == $env.safari) {
        $context.close()
      } else if ($app.env != $env.app) {
        $app.close()
      }
    }
  })
}