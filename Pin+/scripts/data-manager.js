let _sync, _list,
  ui = require("./ui");

const local = "assets/text-items.json";
const cloud = "drive://Pin+/text-items.json";

const getTextItems = (isCloud = _list) => JSON.parse($file.read(isCloud ? cloud : local).string);
const setTextItems = (data, isCloud = _list) =>
  $file.write({
    data: $data({ string: JSON.stringify(data) }),
    path: isCloud ? cloud : local
  });
const saveTextItems = data => {
  setTextItems(data, _list);
  _sync == 2 && setTextItems(data, !_list);
};
const mergeData = () => {
  let x = new Set([...getTextItems(0), ...getTextItems(1)]);
  return [...x];
};

function init() {
  _sync = $cache.get("sync");
  _list = $cache.get("list");
  //若是自动同步模式，合并本地和云端
  if (_sync == 2) {
    let x = mergeData();
    saveTextItems(x);
  }
  //检查并记录剪贴板文本
  let t = $clipboard.text || "";
  let tmp = getTextItems();
  if (t.length > 0) {
    tmp.unshift(t);
    tmp = [...new Set(tmp)];
    saveTextItems(tmp);
  }
  //将记录数据填入list
  $("itemlist").data = [];
  tmp = tmp.map(i => {
    let flag = i.indexOf("\n") >= 0;
    return { itemtext: {
      text: i,
      textColor: flag? ui.color.general_n:ui.color.general
    } };
  });
  $("itemlist").data = tmp;
}

function copyAndSaveText(text) {
  if (!text) return;
  $clipboard.set({ type: "public.plain-text", value: text });
  let items = getTextItems();
  items.unshift(text);
  saveTextItems([...new Set(items)]);
  $("itemlist") && $("itemlist").insert({ index: 0, value: { itemtext: { text: text } } });
  $app.env == 2 && $("i2clip") && ($("i2clip").text = text);
}

module.exports = {
  init: init,
  mergeData: mergeData,
  getTextItems: getTextItems,
  setTextItems: setTextItems,
  saveTextItems: saveTextItems,
  copyAndSaveText: copyAndSaveText,
};
