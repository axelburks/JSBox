let ui = require("../ui");

function detect(content) {
  let livelink0 = content.match(/https?:\/\/live.bilibili.com\/(\d+)/i),
    livelink1 = content.match(
      /https?:\/\/live.bilibili.com\/[a-zA-Z0-9]+?\/(\d+)/i
    ),
    videolink0 = content.match(
      /https?:\/\/(m\.bilibili\.com|www\.bilibili\.com)\/[a-zA-Z0-9]+?\/av(\d+)/i
    ),
    videolink1 = content.match(/https?:\/\/b23\.tv\/av(\d+)/i);
  if (/^(av)?\d{1,8}$/i.test(content)) {
    if (/^av/i.test(content)) getAVC(content.replace(/av/i, ""));
    else
      $ui.menu({
        items: ["直播", "视频"],
        handler: (title, idx) => {
          idx == 0 ? getLVC(content) : getAVC(content);
        }
      });
  } else if (livelink0) getLVC(livelink0[1]);
  else if (livelink1) getLVC(livelink1[1]);
  else if (videolink0) getAVC(videolink0[2]);
  else if (videolink1) getAVC(videolink1[1]);
  else ui.toast({ text: "URL 或者内容输入有误", icon: "225" });
}

function getLVC(id) {
  $http.get({
    url:
      "https://api.live.bilibili.com/room/v1/RoomStatic/get_room_static_info?room_id=" +
      id,
    handler: resp => {
      if (resp.data.message == "success") saveImage(resp.data.data.user_cover);
      else ui.toast({ text: "封面获取失败", icon: "225" });
    }
  });
}

function getAVC(id) {
  $http.get({
    url: `https://api.imjad.cn/bilibili/v2/?aid=${id}`,
    handler: resp => {
      let data = resp.data;
      if (data.code === 0) saveImage(data.data.pic);
      else ui.toast({ text: "封面获取失败", icon: "225" });
    }
  });
}

function saveImage(imgUrl) {
  $http.download({
    url: imgUrl,
    handler: resp => {
      $photo.save({
        data: resp.data,
        handler: success => {
          $ui.loading(false);
          if (success == 1) ui.toast({ text: "封面保存成功" });
          else ui.toast({ text: "封面保存失败", icon: "225" });
        }
      });
    }
  });
}

module.exports = { detect: detect };
