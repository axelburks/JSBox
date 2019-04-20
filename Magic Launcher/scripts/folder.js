function showFolderView(folderID) {
  var coffeeViews = {
    type: "blur",
    props: {
      id: "coffeeBlur",
      alpha: 0,
      style: 3
    },
    views: [{
      type: "image",
      props: {
        id: "coffeeImg",
        smoothRadius: 15,
        src: "assets/Coffee/Coffee.png"
      },
      views: [],
      layout: function (make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(300, 323))
      },
      events: {
        tapped: function (sender) {
        }
      }
    }],
    layout: $layout.fill,
    events: {
      tapped: function (sender) {
        $ui.animate({
          duration: 0.3,
          animation: function () {
            $("coffeeBlur").alpha = 0
            $("coffeeImg").scale(1)
          }
        })
      }
    }
  }
  $("mainView").add(coffeeViews)
  $ui.animate({
    duration: 0.3,
    animation: function () {
      $("coffeeBlur").alpha = 1
      $("coffeeImg").scale(1.1)
    }
  })
}

module.exports = {
  showFolderView: showFolderView
}