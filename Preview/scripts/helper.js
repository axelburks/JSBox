function parseJson(string) {
  try {
    return JSON.parse(string);
  } catch (error) {
    $ui.error($l10n("FORMAT_ERROR"));
    return null;
  }
}

function renderJson(json) {
  
  var string = JSON.stringify(json, null, 2);
  var theme = "atom-one-light.min.css";
  var html = "<html><link rel='stylesheet' href='local://assets/" + theme + "'><style>*{margin:0;padding:0;font-size:24px;word-wrap:break-word;word-break:break-all;white-space:pre-wrap;}</style><script src='local://assets/highlight.min.js'></script><script>hljs.initHighlightingOnLoad();</script><pre><code class='hljs'>" + string + "</code></pre></html>";
  var view = {
    props: { title: $l10n("MAIN_TITLE") },
    views: [
      {
        type: "web",
        props: {
          id: "jsonWebview",
          html: html
        },
        layout: function(make, view) {
          make.left.top.right.equalTo(0);
          make.bottom.inset(50);
        }
      },
      {
        type: "button",
        props: { title: $l10n("EDIT") },
        layout: function(make, view) {
          make.left.bottom.right.inset(12);
          make.height.equalTo(32);
        },
        events: {
          tapped: function() {
            $("jsonWebview").eval({
              script: "document.body.contentEditable='true';document.designMode='on';",
              handler: function(result, error) {
            
              }
            })
          }
        }
      }
    ]
  };

  $ui.push(view);
}

module.exports = {
  parseJson: parseJson,
  renderJson: renderJson
}
