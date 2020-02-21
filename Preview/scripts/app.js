function init() {
  let textContent = "";
  if ($clipboard.text) {
    textContent = $clipboard.text;
  }

  let editor = require("./editor");
  editor.show(textContent);
}

module.exports = {
  init: init
}