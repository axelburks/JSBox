function init() {
  let textContent = "";
  if ($clipboard.text) {
    textContent = $clipboard.text;
  }

  let editor = require("./editor");
  editor.showEditor(textContent);
}

module.exports = {
  init: init
}