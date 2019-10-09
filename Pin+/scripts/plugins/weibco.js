const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

let ui = require("../ui");

function show(content) {
  let weico_link = content.match(
      /https?:\/\/weibointl\.api\.weibo\.[^\s]+\?weibo_id=(\d+)/i
    ),
    weibo_link = content.match(
      /https?:\/\/(m\.weibo\.cn|weibo\.com)\/([a-zA-Z0-9]+\/?(\w+))/i
    ),
    tweet_link = content.match(
      /https?:\/\/(mobile\.)?twitter\.com\/(\w+)\/status\/(\d{18,19})/i
    ),
    urlTest = /sinaimg.cn/.test(content);
  if (weico_link) {
    let url = weico_link[0],
      id = weico_link[1],
      link = "https://m.weibo.cn/status/" + id;
    $ui.alert({
      title: "Copy or Open it?",
      message: content.replace(url, link),
      actions: [
        {
          title: "Safari",
          style: "Cancel",
          handler: () => {
            $app.openURL(link);
          }
        },
        {
          title: "Copy",
          handler: () => {
            saveToClip(link);
          }
        }
      ]
    });
  } else if (weibo_link) {
    let _id = /\D/.test(weibo_link[2]); //存在weibo.com/加10位数字格式的用户url
    let id = _id ? weibo_link[3] : weibo_link[2];
    if (/\/u\/|\/profile\//.test(content) || !_id) {
      userUrl(id);
    } else {
      if (!/^\d+$/.test(id)) id = mid2id(id);
      $ui.alert({
        title: "Open or Convert it?",
        message: "Open it in Client or copy desktop Link",
        actions: [
          {
            title: "Client",
            style: "Cancel",
            handler: () => {
              let link = "weibointernational://detail?weiboid=" + id;
              if (!$app.openURL(link))
                $app.openURL("sinaweibo://detail?mblogid=" + id);
            }
          },
          {
            title: "Convert",
            handler: () => {
              $http.get("https://m.weibo.cn/status/" + id).then(resp => {
                let numId = id2mid(id),
                  sc = resp.data.match(/"id": (\d{10})/);
                saveToClip("https://weibo.com/" + sc[1] + "/" + numId);
              });
            }
          }
        ]
      });
    }
  } else if (tweet_link) {
    if (tweet_link[2] == "user") return;
    let id = tweet_link[3];
    let url = "https://twitter.com/user/status/" + id;
    saveToClip(url);
  } else if (!urlTest) {
    if ($detector.link(content) != "")
      ui.toast({ text: "Not Weico OR Weibo (Picture) URL!", icon: "225" });
    else {
      let x = encodeURIComponent(content);
      if (!$app.openURL("weibointernational://search?keyword=" + x))
        $app.openURL("sinaweibo://searchall?q=" + x);
    }
  } else {
    let link = main(content);
    $ui.alert({
      title: "Copy or Open it?",
      message: "Original User URL is " + content.replace(content, link),
      actions: [
        {
          title: "Client",
          style: "Cancel",
          handler: () => {
            let uid = findUid(content);
            userUrl(uid);
          }
        },
        {
          title: "Copy",
          handler: () => {
            saveToClip(main(content));
          }
        }
      ]
    });
  }
}

const userUrl = uid =>
  $http.get({
    url: "https://m.weibo.cn/api/container/getIndex?type=uid&value=" + uid,
    handler: resp => {
      let data = resp.data.data.userInfo;
      let urlWeico = "weibointernational://search?keyword=";
      let x = encodeURI(data.screen_name);
      if (!$app.openURL(urlWeico + x))
        $app.openURL("sinaweibo://userinfo?uid=" + uid);
    }
  });

const saveToClip = link => {
  let dataManager = require("../data-manager");
  dataManager.copyAndSaveText(link);
  ui.toast({ text: "Copied Success!" });
};
/**
 * mid字符转换为id
 * @param {String} mid 微博URL字符，如 "wr4mOFqpbO"
 * @return {String} 微博id，如 "201110410216293360"
 */
function mid2id(mid) {
  let id = "";
  for (
    let i = mid.length - 4;
    i > -4;
    i = i - 4 //从最后往前以4字节为一组读取URL字符
  ) {
    let offset1 = i < 0 ? 0 : i,
      offset2 = i + 4,
      str = mid.substring(offset1, offset2);

    str = decodeBase62(str).toString();
    if (offset1 > 0) {
      //若不是第一组则不足7位补0
      while (str.length < 7) {
        str = "0" + str;
      }
    }
    id = str + id;
  }
  return id;
}
/**
 * id转换为mid字符
 * @param {String} id 微博id，如 "201110410216293360"
 * @return {String} 微博mid字符，如 "wr4mOFqpbO"
 */
function id2mid(id) {
  let mid = "";
  for (
    let i = id.length - 7;
    i > -7;
    i = i - 7 //从最后往前以7字节为一组读取id
  ) {
    let offset1 = i < 0 ? 0 : i,
      offset2 = i + 7,
      num = id.substring(offset1, offset2);
    num = encodeBase62(num);
    if (offset1 > 0) {
      //若不足4位补0
      while (num.length < 4) {
        num = "0" + num;
      }
    }
    mid = num + mid;
  }
  return mid;
}

//----------------------
function encodeBase62(int10) {
  let s62 = "",
    r = 0;
  while (int10 != 0) {
    r = int10 % 62;
    s62 = alphabet[r] + s62;
    int10 = Math.floor(int10 / 62);
  }
  return s62;
}

function decodeBase62(number) {
  let out = 0,
    len = number.length - 1;
  for (let t = 0; t <= len; t++) {
    out = out + alphabet.indexOf(number.substr(t, 1)) * Math.pow(62, len - t);
  }
  return out;
}
//----------------------

const decode16Unit = num => parseInt(num, 16);

function decode(number) {
  if (number.startsWith("00")) return decodeBase62(number);
  else return decode16Unit(number);
}

function findNumber(url) {
  let lastIndexOfSlash = url.lastIndexOf("/"),
    number = url.substr(lastIndexOfSlash + 1, 8);
  return number;
}

const findUid = url => decode(findNumber(url));

const constructHomePageUrl = uid => "https://weibo.com/u/" + uid;

function main(url) {
  let uid = findUid(url),
    homePageUrl = constructHomePageUrl(uid);
  return homePageUrl;
}

module.exports = { show: show };
