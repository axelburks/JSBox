let tel = "";
//上行引号内填入联通号码

let remainFee = "-";

let s1 = 0;
let s2 = 0;
let used = [0, 0, 0];
let quota = [1, 1, 1];
let remain = [1, 1, 1];
let pieData = [[], [], [], []];
let miniData;
let ui = require("../ui");

const textColor = ui.color.general;
const dark = Number($device.isDarkMode);
const color = $color(dark ? "white" : "darkGray");

let feeLabel = $objc("UILabel").invoke("alloc.init");
feeLabel.invoke("setFont", $font(18));
setupfeeLabel("?");

let Micheal = $objc("UILabel").invoke("alloc.init");
let Gabriel = $objc("UILabel").invoke("alloc.init");
let Lucifer = $objc("UILabel").invoke("alloc.init");

let queryTime, callDescription, flowDescription;

function requestData() {
  let details = `https://mina.10010.com/wxapplet/bind/getCombospare/alipay/alipaymini?stoken=&user_id=${tel}`;
  let fee = `https://mina.10010.com/wxapplet/bind/getCurrFare/alipay/alipaymini?stoken=&user_id=${tel}`;
  let basic = `https://mina.10010.com/wxapplet/bind/getIndexData/alipay/alipaymini?user_id=${tel}`;

  $http.get(details).then(resp => {
    if (resp.data != "" && resp.data.woFeePolicy !== null) {
      console.log(resp.data);
      (used = [0, 0, 0]), (quota = [0, 0, 0]), (remain = []);
      let det = resp.data.woFeePolicy;
      queryTime = `截止至 ${resp.data.queryTime}`;
      for (const i in det) {
        if (i == "indexVf") {
          $ui.error("AOBH! Restart or Clear APP Cache!", 3);
          return;
        }
        let allVal = det[i].addUpUpper;
        if (allVal != 0) {
          let type = det[i].elemType,
            useVal = det[i].xUsedValue,
            typeName = det[i].feePolicyName,
            canUseVal = det[i].canUseResourceVal,
            unit = det[i].totalUnitVal;
          if (type == 3) {
            quota[2] += parseFloat(allVal);
            if (canUseVal != 0) {
              if (det[i].canUseUnitVal == "GB") canUseVal = canUseVal * 1024;
              pieData[2].push([typeName, Number(canUseVal), "MB"]);
            }
            if (useVal != 0) {
              if (det[i].usedUnitVal == "GB") useVal = useVal * 1024;
              used[2] += parseFloat(useVal);
              pieData[2].unshift([typeName + " 已用", Number(useVal), "MB"]);
            }
          } else {
            quota[type - 1] += parseInt(allVal);
            used[type - 1] += parseInt(useVal);
            if (canUseVal != 0)
              pieData[type - 1].push([typeName, Number(canUseVal), unit]);
            if (useVal != 0)
              pieData[type - 1].unshift([
                typeName + " 已用",
                Number(useVal),
                unit
              ]);
          }
        }
      }
      used.forEach((ele, i) => remain.push(quota[i] - ele));
      const setUnit = i => {
        if (i < 1024) return i.toFixed(2) + " MB";
        else return (i / 1024).toFixed(2) + " GB";
      };
      callDescription =
        "已用 " +
        used[0] +
        " 分钟 剩余 " +
        remain[0] +
        " 分钟 配额 " +
        quota[0] +
        " 分钟";
      flowDescription =
        "已用 " +
        setUnit(used[2]) +
        "  剩余 " +
        setUnit(remain[2]) +
        "  合计 " +
        setUnit(quota[2]);
      let rFlow = setUnit(remain[2]).split(" ");
      miniData[2][1] = rFlow[0];
      miniData[2][2] = rFlow[1];

      $("α").views[2].text = queryTime;
      $("β").views[2].text = callDescription;
      $("γ").views[2].text = flowDescription;
      s1 = 1;
      updateStatus();
    }
  });
  $http.get(basic).then(resp => {
    if (resp.data != "" && resp.data.dataList !== null) {
      console.log(resp.data);
      let comboName = resp.data.packageName;
      remainFee = resp.data.dataList[0].number;
      comboName.replace("（", "(");
      comboName.replace("）", ")");
      $("α").views[1].text = comboName;
      setupfeeLabel(String(remainFee));
      miniData[1][1] = remainFee;
      miniData[0][1] = resp.data.dataList[2].number;
      s2 = 1;
      updateStatus();
    }
  });
  $http.get(fee).then(resp => {
    if (resp.data != "" && resp.data.fee !== null) {
      console.log(resp.data);
      let fe = resp.data.realfeeinfo[0].itemInfo;
      pieData[3].push(["话费余额", Number(resp.data.balance), "元"]);
      for (const i in fe) {
        if (fe[i].integrateFee != 0)
          pieData[3].unshift([
            fe[i].integrateItemName,
            Number(fe[i].integrateFee),
            "元"
          ]);
      }
    }
  });
}

const updateStatus = () => {
  if (s1 === 1 && s2 === 1) {
    $delay(0.0, () => {
      $("super")
        .runtimeValue()
        .$layoutSubviews();
      ui.guide(2, "长按查看明细统计");
    });

    $("banner").views[0].text = queryTime;
    reloadProgress($("β"), 0);
    reloadProgress($("γ"), 2);
    setupMiniLabel(miniData[0], Micheal);
    setupMiniLabel(miniData[1], Gabriel);
    setupMiniLabel(miniData[2], Lucifer);
  }
};

function setupfeeLabel(fee) {
  let feeText = `话费余额 ${fee} 元`;
  let string = $objc("NSMutableAttributedString").invoke(
    "alloc.initWithString",
    feeText
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSFont",
    $font("Georgia-Bold", 20),
    $range(feeText.indexOf(fee), fee.length)
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSColor",
    textColor,
    $range(0, string.invoke("length"))
  );
  feeLabel.invoke("setAttributedText", string);
}

function setupMiniLabel(arr, miniLabel) {
  let miniText = `${arr[0]}\n ${arr[1]} ${arr[2]}`;
  let string = $objc("NSMutableAttributedString").invoke(
    "alloc.initWithString",
    miniText
  );
  string.invoke(
    "setAlignment:range:",
    $align.center,
    $range(0, string.invoke("length"))
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSFont",
    $font("HiraMinProN-W3", 20),
    $range(miniText.indexOf(arr[0]), arr[0].length)
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSFont",
    $font("Georgia-Bold", 18),
    $range(miniText.indexOf(arr[1]), arr[1].length)
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSFont",
    $font("HiraMinProN-W3", 16),
    $range(miniText.indexOf(arr[2]), arr[2].length)
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSColor",
    color,
    $range(0, string.invoke("length"))
  );
  string.invoke(
    "addAttribute:value:range:",
    "NSColor",
    textColor,
    $range(miniText.indexOf(arr[1]), arr[1].length)
  );
  let para = $objc("NSMutableParagraphStyle").invoke("alloc.init");
  para.invoke("setParagraphSpacing", 5);
  para.invoke("setAlignment", $align.center);
  string.invoke(
    "addAttribute:value:range:",
    "NSParagraphStyle",
    para,
    $range(0, string.invoke("length"))
  );
  miniLabel.invoke("setAttributedText", string);
}

let isBack = 0;
const backToMainView = () => {
  isBack = 1;
  ui.back();
};

exports.show = () => {
  requestData();
  setupfeeLabel("?");
  miniData = [
    ["剩余語音", "?", "分"],
    ["話費余額", "?", "元"],
    ["流量剩余", "?", "TB"]
  ];
  setupMiniLabel(miniData[0], Micheal);
  setupMiniLabel(miniData[1], Gabriel);
  setupMiniLabel(miniData[2], Lucifer);
  $ui.render({
    props: {
      id: "super",
      bgcolor: ui.color.bg,
      navBarHidden: 1,
      statusBarStyle: dark
    },
    events: {
      layoutSubviews: view => {
        if ($widget.mode == 0) {
          //          $("∑").alpha = 0;
          $("∑").hidden = 1;
          $ui.animate({
            duration: 0.3,
            animation: () => {
              $("banner").updateLayout((make, view) => {
                make.bottom
                  .equalTo(view.super.top)
                  .offset(view.super.frame.height);
                make.height.equalTo(view.super.frame.height);
              });
              $("banner").relayout();
              if ($("blur")) $("blur").alpha = 0;
            },
            completion: () => {
              if ($("blur")) $("blur").remove();
            }
          });
        } else {
          if ($app.env == 2) {
            $("banner").updateLayout((make, view) => {
              make.bottom.equalTo(view.super.top);
            });
            $("∑").hidden = 0;
            $delay(0.0, () => {
              $("super")
                .runtimeValue()
                .invoke("setNeedsLayout");
              $ui.animate({
                duration: 0.8,
                animation: () => {
                  if (!isBack) $("∑").alpha = 1;
                }
              });
            });
          }

          let H = $("∑").frame.height;
          let W = $("∑").frame.width;
          let h = H * 0.3;
          let w = W - 40;
          for (let v in $("∑").views) {
            $("∑").views[v].frame = $rect(20, H * 0.05 + v * h, w, h);
          }

          const getSize = (t, i) =>
            $text.sizeThatFits({ text: t, width: 520.1314, font: $font(i) });

          let ff = 50;
          let gf =
            $("Δ").frame.width == 0 ? $rect(0, 6, 110, 24) : $("Δ").frame;
          let _w1 = w - gf.width - 5;
          let tef = $("α").views[1].text;
          let _1f = getSize(tef, 25);
          if (_1f.width > _w1) {
            while (getSize(tef, ff / 2).width > _w1) ff--;
            _1f = getSize(tef, ff / 2);
          }
          $("α").views[1].font = $font(ff / 2).rawValue();

          $("α").views[1].frame = $rect(
            w - _1f.width,
            h * 0.4 + 12 - _1f.height,
            _1f.width,
            _1f.height
          );

          let stf = 24;
          let _w2 = w - 80;
          let tes = $("β").views[2].text;
          let tet = $("γ").views[2].text;
          let _2s = getSize(tes, 12);
          let _2t = getSize(tet, 12);
          let widthest = Math.max(_2s.width, _2t.width);
          if (widthest > _w2) {
            while (
              getSize(widthest == _2s.width ? tes : tet, stf / 2).width > _w2
            )
              stf--;
          }
          _2s = getSize(tes, stf / 2);
          _2t = getSize(tet, stf / 2);
          let fz = $font(stf / 2).rawValue();
          $("α").views[2].font = fz;
          $("β").views[2].font = fz;
          $("γ").views[2].font = fz;

          let v0 = $rect(0, (h * 2) / 3 - 4, w, 8);
          const rectV2 = (x, y) => $rect(w - x, (h * 2) / 3 - 9 - y, x, y);
          $("β").views[0].frame = v0;
          $("β").views[2].frame = rectV2(_2s.width, _2s.height);
          $("γ").views[0].frame = v0;
          $("γ").views[2].frame = rectV2(_2t.width, _2t.height);
        }
      }
    },
    views: [
      {
        type: "view",
        props: { id: "banner" },
        layout: (make, view) => {
          make.left.right.inset(0);
          make.bottom.equalTo(view.super.top);
        },
        views: [
          {
            type: "label",
            props: {
              text: "査詢中, 請稍候…",
              font: $font("HiraMinProN-W3", 12),
              textColor: color
            },
            layout: (make, view) => {
              make.centerX.equalTo(view.super);
              make.top.inset(1);
            }
          },
          {
            type: "runtime",
            props: { view: Micheal, lines: 2, align: $align.center },
            layout: (make, view) => {
              make.height.equalTo(view.super);
              make.width.equalTo(view.super).dividedBy(3);
              make.left.top.inset(0);
            }
          },
          separateLine(),
          {
            type: "runtime",
            props: { view: Gabriel, lines: 2, align: $align.center },
            layout: (make, view) => {
              make.height.equalTo(view.super);
              make.width.equalTo(view.super).dividedBy(3);
              make.center.equalTo(view.super);
            }
          },
          separateLine(),
          {
            type: "runtime",
            props: { view: Lucifer, lines: 2, align: $align.center },
            layout: (make, view) => {
              make.height.equalTo(view.super);
              make.width.equalTo(view.super).dividedBy(3);
              make.right.top.inset(0);
            }
          }
        ]
      },
      {
        type: "view",
        props: { id: "∑" },
        layout: (make, view) => {
          if ($app.env == 1) {
            make.top.equalTo(view.super.safeArea);
            make.height.equalTo(180);
          } else {
            make.top.equalTo(view.prev.bottom);
            make.bottom.equalTo(view.super.top).offset(180);
          }
          make.left.right.inset(0);
        },
        events: {
          ready: () => {
            if ($app.env == 1)
              $delay(0.0, () => {
                $("super")
                  .runtimeValue()
                  .$layoutSubviews();
              });
            earliestLoadAnimate(0.3, $("β").views[0].views[0]);
            earliestLoadAnimate(0.9, $("γ").views[0].views[0]);
          }
        },
        views: [
          {
            type: "views",
            props: { id: "α" },
            views: [
              {
                type: "runtime",
                props: { id: "Δ", view: feeLabel },
                layout: (make, view) => {
                  make.centerY.equalTo(view.super).offset(-5);
                  make.left.inset(0);
                  make.height.equalTo(24);
                }
              },
              {
                type: "label",
                props: { text: "查询中, 请稍候…", textColor }
              },
              {
                type: "label",
                props: { textColor },
                layout: make => make.right.bottom.inset(0)
              }
            ],
            events: {
              longPressed: () => {
                $app.env == 2 && ($widget.height = 240);
                s1 == 1 && s2 == 1 && showPie("余额明细", pieData[3]);
              },
              tapped: () => backToMainView()
            }
          },
          {
            type: "views",
            props: { id: "β" },
            views: useProgress("语音时长", 0),
            events: {
              longPressed: () => {
                $app.env == 2 && ($widget.height = 240);
                s1 == 1 && s2 == 1 && showPie("语音明细", pieData[0]);
              },
              tapped: () => backToMainView()
            }
          },
          {
            type: "views",
            props: { id: "γ" },
            views: useProgress("流量使用", 0.9),
            events: {
              longPressed: () => {
                $app.env == 2 && ($widget.height = 240);
                s1 == 1 && s2 == 1 && showPie("余额明细", pieData[2]);
              },
              tapped: () => backToMainView()
            }
          }
        ]
      }
    ]
  });
  $app.tips("长按返回 XPin,\n在统计视图中轻点右上角返回。");
};

function earliestLoadAnimate(t, view) {
  $delay(t, () => {
    $ui.animate({
      duration: 1.2,
      velocity: 0,
      damping: 1,
      options: 25,
      animation: () => {
        view.value = 1;
        view.relayout();
      }
    });
  });
}

function reloadProgress(id, t) {
  $ui.animate({
    duration: 0.6,
    delay: 0.3,
    animation: () => {
      id.views[0].views[0].alpha = 0;
      id.views[0].views[0].remove();
    },
    completion: () => {
      id.views[0].add({
        type: "progress",
        props: {
          radius: 2,
          progressColor: $color("#4DD964"),
          trackColor: $color("clear")
        },
        layout: (make, view) => {
          make.top.left.right.inset(1.6);
          make.height.equalTo(4.8);
          make.centerY.equalTo(view.super);
        },
        events: {
          ready: sender => {
            let val = remain[t] / quota[t];
            if (val < 0.2) sender.progressColor = $color("red");
            $delay(0.0, () => {
              $ui.animate({
                duration: 1.2,
                velocity: 0,
                damping: 0,
                animation: () => {
                  sender.value = val;
                  sender.relayout();
                }
              });
            });
          }
        }
      });
    }
  });
}

function separateLine() {
  return {
    type: "label",
    props: { radius: 1, bgcolor: color },
    layout: (make, view) => {
      make.width.equalTo(1);
      make.height.equalTo(view.super).multipliedBy(0.6);
      make.left.equalTo(view.prev.right).offset(-0.5);
      make.centerY.equalTo(view.super);
    }
  };
}

function useProgress(title, dly = 0.0) {
  return [
    {
      type: "label",
      props: {
        radius: 3,
        borderWidth: 1.5,
        bgcolor: $color("clear"),
        borderColor: dark ? $color("#A2A2A2") : $rgba(100, 100, 100, 0.25)
      },
      views: [
        {
          type: "progress",
          props: {
            radius: 2,
            progressColor: $color("#4DD964"),
            trackColor: $color("clear")
          },
          layout: (make, view) => {
            make.centerY.equalTo(view.super);
            make.left.right.inset(1.6);
            make.height.equalTo(4.8);
          }
        }
      ]
    },
    {
      type: "label",
      props: { text: title, font: $font(18), textColor },
      layout: (make, view) => {
        make.size.equalTo($size(75, 20));
        make.left.inset(0);
        make.bottom.equalTo(view.prev.top).offset(-4.5);
      }
    },
    { type: "label", props: { font: $font(12), textColor } }
  ];
}

function showPie(qName, pie) {
  $ui.window.add({
    type: "blur",
    props: {
      style: dark ? 3 : 1,
      radius: 10,
      borderWidth: 0.4,
      borderColor: $rgba(100, 100, 100, 0.25)
    },
    layout: (make, view) => {
      make.left.right.inset(4);
      make.top.equalTo(view.super.safeAreaTop).offset(4);
      make.bottom.equalTo(view.super.safeAreaBottom).inset(4);
    },
    views: [
      {
        type: "chart",
        props: { options: getPieData(qName, pie) },
        layout: (make, view) => {
          make.center.equalTo(view.super);
          make.width.equalTo(view.super);
          make.height.equalTo(240);
        },
        events: {
          ready: sender => {
            sender.views[0].transparent = 1;
            sender.views[0].bounces = 0;
            sender.userInteractionEnabled = 1;
          }
        }
      },
      ui.button({
        name: "x",
        layout: (make, view) => {
          make.size.equalTo($size(22, 22));
          make.top.right.inset(6);
          ui.shadow(view);
        },
        tap: () => {
          if ($app.env == 2) $widget.height = 180;
          $ui.animate({
            duration: 0.4,
            animation: () => ($("blur").alpha = 0),
            completion: () => $("blur").remove()
          });
        }
      })
    ]
  });
}

function getPieData(qName, pieData) {
  return {
    title: {
      text: qName,
      left: "center",
      top: 10,
      textStyle: { color: textColor.hexCode }
    },
    legend: {
      type: "scroll",
      orient: "vertical",
      width: 50,
      right: 20,
      bottom: 10,
      height: 140,
      formatter: x => {
        if (!x) return "";
        if (x.length > 8) x = x.slice(0, 7) + "...";
        return x;
      },
      tooltip: { show: 1 },
      itemWidth: 10,
      itemHeight: 10,
      pageIcons: {
        vertical: ["M0,0L12,-10L12,10z", "M0,0L-12,-10L-12,10z"]
      },
      pageIconSize: [12, 12],
      pageButtonGap: 6,
      textStyle: { textSize: 10, color: ui.color.general.hexCode }
    },
    tooltip: {
      confine: 1,
      trigger: "item",
      formatter: y => {
        return (
          "<div class='showBox'>" +
          y.marker +
          y.seriesName +
          " " +
          y.value[1] +
          " " +
          y.value[2] +
          "<br/>" +
          y.name +
          "</div>"
        );
      },
      textStyle: { fontSize: 12 }
    },
    dataset: { source: pieData },
    series: [
      {
        type: "pie",
        name: qName,
        radius: 54,
        containLabel: 1,
        center: ["36%", "60%"],
        avoidLabelOverlap: 1,
        stillShowZeroSum: 0,
        itemStyle: {
          normal: {
            shadowBlur: 200,
            shadowColor: "rgba(100, 100, 100, 0.5)"
          }
        },
        label: {
          normal: {
            formatter(z) {
              let text = z.name;
              return text.length < 4
                ? text
                : `${text.slice(0, 4)}\n${text.slice(4)}`;
            },
            textStyle: {
              textShadowColor: "rgba(255, 255, 255, 1)",
              textShadowBlur: 15,
              align: "left",
              fontSize: 8,
              color: textColor.hexCode
            }
          }
        }
      }
    ]
  };
}
