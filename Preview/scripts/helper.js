function parseJson(string) {
  try {
    return JSON.parse(string);
  } catch (error) {
    $ui.error($l10n("FORMAT_ERROR"));
    return null;
  }
}

function renderJson(json) {
  let string = JSON.stringify(json, replacer, 2);
  $("codeContent").text = string;
}

function replacer(key, value) {
  if (/^https?%3A(%2F%2F|\/\/)/.test(value)) {
    return decodeURIComponent(value);
  }
  return value;
}

module.exports = {
  parseJson: parseJson,
  renderJson: renderJson
}
