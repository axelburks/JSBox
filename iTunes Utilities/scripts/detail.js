function show(item) {
  if ($app.env == $env.action) {
    $ui.push({
      props: {
        title: item.trackCensoredName
      },
      views: [
        {
          type: "text",
          props: {
            text: JSON.stringify(item, null, 2),
            font: $font("Menlo-Regular", 15),
            editable: false,
          },
          layout: $layout.fill
        }
      ]
    })
  } else {
    $ui.push({
      props: {
        title: item.trackCensoredName
      },
      views: [
        {
          type: "view",
          layout: $layout.fill,
          events: {
            ready: function(sender) {
              var frame = $ui.window.frame
              var codeView = $objc("HOCodeView").invoke("alloc").invoke("initWithFrame:lang:style:showLineNumber:", {x: 0, y: 0, width: frame.width, height: frame.height-64}, "json", "atom-one-light", 0)
              codeView.invoke("render", JSON.stringify(item, null, 2))
              codeView.invoke("setEditable", false)
              codeView.invoke("setInputAccessoryView", null)
              sender.runtimeValue().invoke("addSubview", codeView)
            }
          }
        }
      ]
    })
  }
  $app.listen({
    exit: function() {
      $context.close()
    }
  })
}


module.exports = {
  show: show
}