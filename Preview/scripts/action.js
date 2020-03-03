let safariStr = "", textStr = "", linkStr = "", popItems = [];

function init() {
  let textContent = "";
  if ($context.textItems) {
    for (let i in $context.textItems) {
      textContent = textContent + (i < $context.textItems.length - 1 ? $context.textItems[i] + "\n" : $context.textItems[i]);
      textStr = textStr + (i < $context.textItems.length - 1 ? $context.textItems[i] + "\n" : $context.textItems[i]);
    }
    popItems.push({type: "Plain Text", value: textStr});
  }
  if ($context.linkItems) {
    textContent = textContent ? textContent + "\n\n" : "";
    for (let i in $context.linkItems) {
      if ($context.linkItems[i].indexOf("file:///")) {
        textContent = textContent + $context.linkItems[i] + "\n";
        linkStr = linkStr + $context.linkItems[i] + "\n";
        popItems.push({type: "Link Item", value: linkStr});
      }
    }
  }
  if ($context.safari) {
    textContent = textContent + ($context.safari.items.selection && $context.safari.items.selection.text ? $context.safari.items.selection.text + "\n\n" : "");
    textContent = textContent + ($context.safari.items.title ? $context.safari.items.title + "\n" + $context.safari.items.baseURI : "");
    safariStr = textContent;
    popItems.push({type: "Safari Content", value: safariStr}, {type: "HTML Source", value: $context.safari.items.source});
  }

  let editor = require("./editor");
  editor.showEditor(textContent, popItems);
}

module.exports = {
  init: init
}