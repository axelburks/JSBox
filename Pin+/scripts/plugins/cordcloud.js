//在下方的mail和pwd分别填入账号和密码
const mail = "";
const pwd = "";

let ui = require("../ui");
let allData = [];

function login() {
  $http.request({
    method: "POST",
    url: "https://www.cordcloud.org/auth/login",
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: {
      "email": mail,
      "passwd": pwd,
      "remember-me": "week"
    },
    handler: resp => {
      if (resp.response.statusCode == 200) {
        if (resp.data.msg == "邮箱或者密码错误")
          ui.toast({ text: "邮箱或者密码错误", icon: "225" });
        else checkin();
      } else ui.toast({ text: "登录失败", icon: "009" });
    }
  });
}

function checkin() {
  $http.post({
    url: "https://www.cordcloud.org/user/checkin",
    handler: resp => {
      if (resp.data.msg) dataResults(resp.data.msg);
      else login();
    }
  });
}

function dataResults(checkInResult) {
  if (checkInResult.match(/您似乎已经续命过了/))
    $("checkInR").text = "今儿已经签完了^_^";
  else {
    $("checkInR").text = checkInResult.replace(/\./, "") + "😎";
    let checkIn = checkInResult.match(/\d{1,3}/);
    $cache.set("check", checkIn[0]);
  }
  let checkcache = $cache.get("check");
  if (checkcache === undefined) checkcache = "? ";
  $http.get({
    url: "https://www.cordcloud.org/user",
    handler: resp => {
      let usedData = resp.data.match(
        /(已用\s\d.+?%|>已用(里程|流量)|>\s已用流量)[^B]+/
      );
      usedData = usedData[0].match(/\d\S*(K|G|M|T)/);
      let restData = resp.data.match(
        /(剩余\s\d.+?%|>剩余(里程|流量)|>\s剩余流量)[^B]+/
      );
      restData = restData[0].match(/\d\S*(K|G|M|T)/);
      let todayData = resp.data.match(
        /(今日\s\d.+?%|>今日(里程|流量)|>\s今日流量)[^B]+/
      );
      todayData = todayData[0].match(/\d\S*(K|G|M|T)/);
      if (todayData === null) todayData = ["0.00", "B"];
      allData.push(
        {
          Data: "剩余流量",
          Statistic: restData[0] + "B"
        },
        {
          Data: "已用总计",
          Statistic: usedData[0] + "B"
        },
        {
          Data: "签到获得",
          Statistic: checkcache + "MB"
        },
        {
          Data: "今日用量",
          Statistic: todayData[0] + "B"
        }
      );
      allData.forEach((i, idx) => {
        $("content").add(ResultsView(i.Data, idx));
        $("content2").add(ResultsView2(i.Statistic, idx));
      });
    }
  });
}

function ipcheck() {
  $http.get({
    url: "http://clientapi.ipip.net/ip.php?a=location",
    handler: resp => {
      let ip = resp.data.ip,
        loc = resp.data.loc;
      $http.get({
        url: "http://ip-api.com/json",
        header: { "User-Agent": "curl/1.0" },
        handler: resp => {
          let proxy = resp.data.query;
          $http.get({
            url: "http://freeapi.ipip.net/" + proxy,
            handler: resp => {
              let message1 = "代理 IP: " + proxy + " " + resp.data.join(""),
                message2 = "直连 IP: " + ip + " " + loc;
              if (proxy == ip)
                $("ipCheckResult").text = message2.replace(/直连 /, "");
              else $("ipCheckResult").text = message1 + "\n" + message2;
            }
          });
        }
      });
    }
  });
}

function main() {
  $ui.window.add({
    type: "blur",
    props: {
      //bgcolor: ENV == 2 && !VER ? $rgba(255, 255, 255, 0.28) : ENV == 1 ? $color("white") : $color("clear"),
      alpha: 0,
      id: "bg",
      radius: 10,
      borderColor: ui.color.border,
      style: $device.isDarkMode ? 3 : 1,
      borderWidth: 1.0 / $device.info.screen.scale
    },
    views: [
      {
        type: "image",
        props: {
          id: "logo",
          src: "https://www.cordcloud.org/favicon.ico",
          bgcolor: $color("clear")
        },
        layout: make => {
          make.top.left.inset(25);
          make.size.equalTo($size(40, 40));
        }
      },
      {
        type: "label",
        props: {
          id: "checkInR",
          font: $font(24),
          autoFontSize: 1,
          align: $align.center,
          textColor: ui.color.title
        },
        layout: (make, view) => {
          make.left.right.inset(30);
          make.top.inset(28);
          ui.shadow(view, ui.color.title);
        }
      },
      {
        type: "view",
        props: {
          id: "content"
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(20);
          make.left.right.inset(0);
        }
      },
      {
        type: "view",
        props: {
          id: "content2"
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(30);
          make.left.right.inset(0);
        }
      },
      {
        type: "label",
        props: {
          id: "ipCheckResult",
          font: $font(10),
          lines: 0,
          autoFontSize: 1,
          align: $align.right,
          textColor: ui.color.title
        },
        layout: (make, view) => {
          make.top.equalTo(view.prev.bottom).offset(30);
          make.right.inset(20);
          ui.shadow(view, ui.color.title);
        }
      }
    ],
    layout: ui.safeGeneralLayout(),
    events: {
      tapped: () => ui.appear(0)
    }
  });
  ui.appear(1);
  ipcheck();
  login();
}

function ResultsView(title, num) {
  return {
    type: "view",
    layout: (make, view) => {
      ui.shadow(view, ui.color.title);
      make.top.bottom.inset(0);
      make.width.equalTo(view.super.frame.width / 4);
      make.left.equalTo((view.super.frame.width / 4) * num);
    },
    views: [
      {
        type: "label",
        props: {
          text: title,
          align: $align.center,
          font: $font(20),
          textColor: ui.color.title
        },
        layout: make => {
          make.top.left.right.inset(0);
        }
      }
    ]
  };
}

function ResultsView2(title, num) {
  return {
    type: "view",
    layout: (make, view) => {
      ui.shadow(view, ui.color.title);
      make.top.bottom.inset(0);
      make.width.equalTo(view.super.frame.width / 4);
      make.left.equalTo((view.super.frame.width / 4) * num);
    },
    views: [
      {
        type: "label",
        props: {
          text: title,
          align: $align.center,
          font: $font(20),
          textColor: ui.color.title
        },
        layout: make => make.top.left.right.inset(0)
      }
    ]
  };
}

exports.show = () => {
  if ($device.networkType == 0) ui.toast({ text: "网络连接失败", icon: "009" });
  else main();
};
