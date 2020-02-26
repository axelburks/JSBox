let _sync, _list, ui = require("./ui");

const local = "assets/text-items.json";
const cloud = "drive://XPin/text-items.json";
!$file.exists(local) && $file.write({
  data: $data({ string: JSON.stringify([]) }),
  path: local
});

const getTextItems = (isCloud = _list) =>
  JSON.parse($file.read(isCloud ? cloud : local).string);
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

function init(triggerAction) {
  _sync = $cache.get("sync");
  _list = $cache.get("list");
  //若是自动同步模式，合并本地和云端
  if (_sync == 2) {
    let x = mergeData();
    saveTextItems(x);
  }
  //检查并记录剪贴板文本
  let t = (triggerAction == "RefreshList" || JSON.stringify($clipboard.items).indexOf('org.nspasteboard.ConcealedType') < 0) && $clipboard.text ? $clipboard.text : "";
  let tmp = getTextItems();
  if (t.length > 0) {
    tmp.unshift(t);
    tmp = [...new Set(tmp)];
    saveTextItems(tmp);
  }
  addTextToList(tmp);
}

function copyAndSaveText(text) {
  if (!text) return;
  $clipboard.set({ type: "public.plain-text", value: text });
  let items = getTextItems();
  items.unshift(text);
  items = [...new Set(items)];
  saveTextItems(items);
  $("itemlist") && addTextToList(items);
  $app.env == 2 && $("i2clip") && ($("i2clip").text = text);
}

function addTextToList(items) {
  //将记录数据填入list
  $("itemlist").data = [];
  items = items.map(i => {
    let flag = i.indexOf("\n") >= 0;
    return { itemtext: {
      text: i,
      textColor: flag? ui.color.general_n:ui.color.general
    } };
  });
  $("itemlist").data = items;
}

module.exports = {
  init: init,
  mergeData: mergeData,
  getTextItems: getTextItems,
  setTextItems: setTextItems,
  saveTextItems: saveTextItems,
  copyAndSaveText: copyAndSaveText
};
