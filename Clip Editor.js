$ui.render({
  props: {
    title: "Clip Editor"
  },
  views: [
    {
      type: "text",
      props: {
        id: "clipContent",
        type: $kbType.default,
        bgcolor: $rgba(100, 100, 100, 0.1),
        font: $font(15),
        radius: 10
      },
      layout: function(make) {
        make.top.right.left.inset(10);
        make.height.equalTo(200);
      },
      events: {
        ready: function(sender) {
          if ($clipboard.text && $clipboard.text != "") {
            sender.text = $clipboard.text;
            sender.focus();
          }
        }
      }
    },
    {
      type: "button",
      props: {
        id: "saveButton",
        title: "Save",
        bgcolor: $color("tint")
      },
      layout: function(make) {
        make.top.equalTo($("clipContent").bottom).inset(10);
        make.right.inset(10);
        make.width.equalTo(100);
      },
      events: {
        tapped: function(sender) {
          saveClip($("clipContent").text);
        }
      }
    },
    {
      type: "button",
      props: {
        id: "cancelButton",
        title: "Cancel",
        bgcolor: $color("gray")
      },
      layout: function(make) {
        make.top.equalTo($("saveButton").top);
        make.right.equalTo($("saveButton").left).inset(10);
        make.width.equalTo(100);
      },
      events: {
        tapped: function(sender) {
          $app.close();
        }
      }
    },
    {
      type: "button",
      props: {
        id: "undoButton",
        title: "⃔",
        bgcolor: $rgba(100, 100, 100, 0.3)
      },
      layout: function(make) {
        make.top.equalTo($("saveButton").top);
        make.left.inset(10);
        make.width.equalTo(40);
      },
      events: {
        tapped: function(sender) {
          if (um.$canUndo()) {
            um.$undo();
          } else {
            $ui.error("Nothing to Undo!", 1);
          }
        }
      }
    },
    {
      type: "button",
      props: {
        id: "redoButton",
        title: "⃕",
        bgcolor: $rgba(100, 100, 100, 0.3)
      },
      layout: function(make) {
        make.top.equalTo($("saveButton").top);

        make.left.equalTo($("undoButton").right).inset(10);
        make.width.equalTo($("undoButton").width);
      },
      events: {
        tapped: function(sender) {
          if (um.$canRedo()) {
            um.$redo();
          } else {
            $ui.error("Nothing to Redo!", 1);
          }
        }
      }
    }
  ]
});
let um = $("clipContent")
  .runtimeValue()
  .$undoManager();

function saveClip(text) {
  $clipboard.text = text;
  $ui.toast("Saved");
  $("clipContent").blur();
  delayClose();
}

function delayClose() {
  $thread.main({
    delay: 0.8,
    handler: function() {
      $app.close();
    }
  });
}
