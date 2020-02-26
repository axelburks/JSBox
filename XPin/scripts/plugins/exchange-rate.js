const fixerKey = "";
let isFixer = /^[a-zA-z0-9]{32}$/.test(fixerKey);

/*
第一行引号内为空或不合法时，使用无需注册的免费 API，数据以 EUROPEAN CENTRAL BANK 每个工作日 CET 时间 16:00 公布的数据为准；
若需要更多、更及时的数据，请前往 https://fixer.io/product 根据个人需求注册并将 Access Key 填入第一行引号内即可使用。免费套餐拥有 1000 次/月的配额，可查询 168 种货币汇率，每小时更新。
*/

const currencyCode = {
  USD: "🇺🇸 美元",
  JPY: "🇯🇵 日元",
  GBP: "🇬🇧 英镑",
  EUR: "🇪🇺 欧元",
  AUD: "🇦🇺 澳元",
  KRW: "🇰🇷 韩元",
  CAD: "🇨🇦 加元",
  CNY: "🇨🇳 人民币",
  TWD: "🇹🇼 新台币",
  HKD: "🇭🇰 港元",
  BTC: "🅱️ 比特币",
  XAG: "🥈 盎司银",
  XAU: "🥇 盎司金",
  XDR: "⭐️ 特别提款权",
  AED: "🇦🇪 阿联酋迪拉姆",
  AFN: "🇦🇫 阿富汗尼",
  ALL: "🇦🇱 阿尔巴尼亚列克",
  AMD: "🇦🇲 亚美尼亚特拉姆",
  //  ANG: "🇮🇱 🇵🇸 荷属安的列斯盾",
  AOA: "🇦🇴 安哥拉宽扎",
  ARS: "🇦🇷 阿根廷比索",
  AWG: "🇦🇼 阿鲁巴岛盾",
  AZN: "🇦🇿 阿塞拜疆马纳特",
  BAM: "🇧🇦 波斯尼亚可兑换马克",
  BBD: "🇧🇧 巴巴多斯元",
  BDT: "🇧🇩 孟加拉国塔卡",
  BGN: "🇧🇬 保加利亚列弗",
  BHD: "🇧🇭 巴林第纳尔",
  BIF: "🇧🇮 布隆迪法郎",
  BMD: "🇧🇲 百慕大元",
  BND: "🇧🇳 文莱元",
  BOB: "🇧🇴 玻利维亚币",
  BRL: "🇧🇷 巴西真正",
  BSD: "🇧🇸 巴哈马元",
  BTN: "🇧🇹 不丹努扎姆",
  BWP: "🇧🇼 博茨瓦纳普拉",
  BYN: "🇧🇾 白俄罗斯卢布",
  //  BYR: "🇧🇾 旧白俄罗斯卢布",
  BZD: "🇧🇿 伯利兹元",
  CDF: "🇨🇩 刚果法郎",
  CHF: "🇱🇮 瑞士法郎",
  CLF: "🇨🇱 智利斯开法",
  CLP: "🇨🇱 智利比索",
  COP: "🇨🇴 哥伦比亚比索",
  CRC: "🇨🇷 哥斯达黎加科朗",
  CUC: "🇨🇺 古巴敞篷车比索",
  CUP: "🇨🇺 古巴比索",
  CVE: "🇨🇻 佛得角埃斯库多",
  CZK: "🇨🇿 捷克克朗",
  DJF: "🇩🇯 吉布提法郎",
  DKK: "🇩🇰 丹麦克朗",
  DOP: "🇩🇴 多米尼加比索",
  DZD: "🇩🇿 阿尔及利亚第纳尔",
  EGP: "🇪🇬 埃及镑",
  ERN: "🇪🇷 厄立特里亚纳克法",
  ETB: "🇪🇹 埃塞俄比亚比尔",
  FJD: "🇫🇯 斐济元",
  FKP: "🇫🇰 弗兰克群岛镑",
  GEL: "🇬🇪 格鲁吉亚拉里",
  GGP: "🇬🇧 根西岛镑",
  GHS: "🇬🇭 加纳赛地",
  GIP: "🇬🇮 直布罗陀镑",
  GMD: "🇬🇲 冈比亚达拉西",
  GNF: "🇬🇳 几内亚法郎",
  GTQ: "🇬🇹 危地马拉格查尔",
  GYD: "🇬🇾 圭亚那元",
  HNL: "🇭🇳 洪都拉斯伦皮拉",
  HRK: "🇭🇷 克罗地亚库纳",
  HTG: "🇭🇹 海地古德",
  HUF: "🇭🇺 匈牙利福林",
  IDR: "🇮🇩 印尼盾",
  ILS: "🇮🇱 以色列谢克尔",
  IMP: "🇬🇧 马恩岛镑",
  INR: "🇮🇳 印度卢比",
  IQD: "🇮🇶 伊拉克第纳尔",
  IRR: "🇮🇷 伊朗里亚尔",
  ISK: "🇮🇸 冰岛克朗",
  JEP: "🇯🇪 泽西岛镑",
  JMD: "🇯🇲 牙买加元",
  JOD: "🇯🇴 约旦第纳尔",
  KES: "🇰🇪 肯尼亚先令",
  KGS: "🇰🇬 吉尔吉斯斯坦索姆",
  KHR: "🇰🇭 瑞尔",
  KMF: "🇰🇲 科摩罗法郎",
  KPW: "🇰🇵 朝鲜元",
  KWD: "🇰🇼 科威特第纳尔",
  KYD: "🇰🇾 开曼群岛元",
  KZT: "🇰🇿 哈萨克斯坦坚戈",
  LAK: "🇱🇦 老挝基普",
  LBP: "🇱🇧 黎巴嫩镑",
  LKR: "🇱🇰 斯里兰卡卢比",
  LRD: "🇱🇷 利比里亚元",
  LSL: "🇱🇸 莱索托洛蒂",
  LTL: "🇱🇹 立陶宛币",
  LVL: "🇱🇻 拉脱维亚拉特",
  LYD: "🇱🇾 利比亚第纳尔",
  MAD: "🇲🇦 摩洛哥迪拉姆",
  MDL: "🇲🇩 摩尔多瓦列伊",
  MGA: "🇲🇬 马达加斯加阿里亚",
  MKD: "🇲🇰 马其顿第纳尔",
  MMK: "🇲🇲 缅甸元",
  MNT: "🇲🇳 蒙古图格里克",
  MOP: "🇲🇴 澳门元",
  MRO: "🇲🇷 毛里塔尼亚乌吉亚",
  MUR: "🇲🇺 毛里求斯卢比",
  MVR: "🇲🇻 马尔代夫卢比",
  MWK: "🇲🇼 马拉维克瓦查",
  MXN: "🇲🇽 墨西哥比索",
  MYR: "🇲🇾 马来西亚林吉特",
  MZN: "🇲🇿 莫桑比克梅蒂卡尔",
  NAD: "🇳🇦 纳米比亚元",
  NGN: "🇳🇬 尼日利亚奈拉",
  NIO: "🇳🇮 尼加拉瓜科多巴",
  NOK: "🇧🇻 挪威克朗",
  NPR: "🇳🇵 尼泊尔卢比",
  NZD: "🇳🇿 新西兰元",
  OMR: "🇴🇲 阿曼里亚尔",
  PAB: "🇵🇦 巴拿马巴波亚",
  PEN: "🇵🇪 秘鲁新索尔",
  PGK: "🇵🇬 巴布亚新几内亚基那",
  PHP: "🇵🇭 菲律宾比索",
  PKR: "🇵🇰 巴基斯坦卢比",
  PLN: "🇵🇱 波兰兹罗提",
  PYG: "🇵🇾 巴拉圭瓜拉尼",
  QAR: "🇶🇦 卡塔尔里亚尔",
  RON: "🇷🇴 罗马尼亚列伊",
  RSD: "🇷🇸 塞尔维亚第纳尔",
  RUB: "🇷🇺 俄罗斯卢布",
  RWF: "🇷🇼 卢旺达法郎",
  SAR: "🇸🇦 沙特里亚尔",
  SBD: "🇸🇧 所罗门元",
  SCR: "🇸🇨 塞舌尔卢比",
  SDG: "🇸🇩 苏丹镑",
  SEK: "🇸🇪 瑞典克朗",
  SGD: "🇸🇬 新加坡元",
  SHP: "🇸🇭 圣赫勒拿镑",
  SLL: "🇸🇱 塞拉利昂利昂",
  SOS: "🇸🇴 索马里先令",
  SRD: "🇸🇷 苏里南元",
  STD: "🇸🇹 圣多美多布拉",
  SVC: "🇸🇻 萨尔瓦多科朗",
  SYP: "🇸🇾 叙利亚镑",
  SZL: "🇸🇿 斯威士兰里兰吉尼",
  THB: "🇹🇭 泰铢",
  TJS: "🇹🇯 塔吉克斯坦索莫尼",
  TMT: "🇹🇲 土库曼斯坦马纳特",
  TND: "🇹🇳 突尼斯第纳尔",
  TOP: "🇹🇴 汤加潘加",
  TRY: "🇹🇷 新土耳其里拉",
  TTD: "🇹🇹 特立尼达多巴哥元",
  TZS: "🇹🇿 坦桑尼亚先令",
  UAH: "🇺🇦 乌克兰赫里纳",
  UGX: "🇺🇬 乌干达先令",
  UYU: "🇺🇾 乌拉圭比索",
  UZS: "🇺🇿 乌兹别克斯坦索姆",
  VEF: "🇻🇪 委内瑞拉波利瓦",
  VND: "🇻🇳 越南盾",
  VUV: "🇻🇺 瓦努阿图",
  WST: "🇼🇸 萨摩亚塔拉",
  //  XAF: "🇬🇶 🇬🇦 🇨🇲 🇨🇬 🇨🇫 🇹🇩 中非金融合作法郎",
  //  XCD: "🇬🇩 🇩🇲 🇦🇮 🇦🇬 🇻🇨 🇲🇸 🇰🇳 🇱🇨 东加勒比元",
  //  XOF: "🇨🇮 🇧🇯 🇧🇫 🇸🇳 🇹🇬 🇲🇱 🇳🇪 🇬🇼 非共体法郎",
  //  XPF: "🇼🇫 🇵🇫 🇳🇨 法国和平法郎",
  YER: "🇾🇪 也门里亚尔",
  ZAR: "🇿🇦 南非兰特",
  ZMK: "🇿🇲 旧赞比亚克瓦查",
  ZMW: "🇿🇲 赞比亚克瓦查",
  ZWL: "🇿🇼 津巴布韦元"
};
const borderWidth = 1.0 / $device.info.screen.scale;
const COLOR = $cache.get($device.isDarkMode ? "dark" : "color");

let symbols = [],
  names = [];
let kb = require("./keyboard"),
  ui = require("../ui"),
  rates = {},
  selectedCurrency = $cache.get("selectedCurrency") || "EUR";

function show() {
  $ui.render({
    props: {
      navBarHidden: 1,
      bgcolor: ui.color.bg,
      statusBarStyle: $device.isDarkMode ? 1 : 0
    },
    views: [
      {
        type: "view",
        props: { alpha: 0 },
        layout: $layout.fillSafeArea,
        views: [
          {
            type: "view",
            props: {
              borderColor: ui.color.border,
              bgcolor: ui.color.widget,
              id: "mainView",
              borderWidth,
              radius: 10
            },
            layout: make => {
              make.left.right.inset(4);
              make.height.equalTo(176);
              make.top.inset(0);
            },
            views: [
              {
                type: "input",
                props: {
                  placeholder: "输入待换算的金额",
                  borderColor: ui.color.border,
                  textColor: ui.color.general,
                  bgcolor: ui.rgba(200),
                  font: $font(14),
                  id: "exrinput",
                  borderWidth,
                  radius: 10,
                  enabled: 0
                },
                layout: (make, view) => {
                  make.top.inset(5);
                  make.height.equalTo(25);
                  make.left.inset(10);
                  make.width.equalTo(view.super).dividedBy(2);
                }
              },
              ui.button({
                name: "x",
                layout: (make, view) => {
                  ui.shadow(view);
                  make.top.inset(6);
                  make.right.inset(10);
                  make.size.equalTo($size(22, 22));
                },
                tap: () => {
                  if ($app.env == 2) $widget.height = 180;
                  ui.back();
                }
              }),
              {
                type: "button",
                props: {
                  title: currencyCode[selectedCurrency],
                  font: $font("bold", 16),
                  borderColor: ui.color.border,
                  titleColor: $color(COLOR),
                  bgcolor: ui.rgba(200),
                  id: "select",
                  borderWidth
                },
                layout: (make, view) => {
                  ui.shadow(view.views[0]);
                  make.height.equalTo(25);
                  make.top.inset(5);
                  make.right.equalTo(view.prev.left).offset(-10);
                  make.left.equalTo(view.prev.prev.right).offset(10);
                },
                events: {
                  tapped(sender) {
                    $device.taptic(0);
                    $ui.menu(names).then(selected => {
                      if ('index' in selected) {
                        let idx = selected.index;
                        $cache.set("selectedCurrency", symbols[idx]);
                        selectedCurrency = symbols[idx];
                        calculate();
                        sender.title = names[idx];
                      }
                    });
                  }
                }
              },
              {
                type: "label",
                props: { bgcolor: ui.color.separator },
                layout: make => {
                  make.top.inset(34);
                  make.right.left.inset(0);
                  make.height.equalTo(borderWidth);
                }
              },
              {
                type: "list",
                props: {
                  id: "exrlist",
                  bgcolor: $device.isDarkMode ? ui.rgba(150) : ui.rgba(200),
                  rowHeight: 28.4,
                  separatorColor: ui.color.separator,
                  template: {
                    props: { bgcolor: $color("clear") },
                    views: [
                      {
                        type: "label",
                        props: {
                          id: "value-label",
                          font: $font($app.env == 2 ? 14 : 16),
                          textColor: ui.color.general,
                          align: $align.right,
                          autoFontSize: 1
                        },
                        layout: (make, view) => {
                          make.centerY.equalTo(view.super);
                          make.width.equalTo(view.super).multipliedBy(0.4);
                          make.right.inset(10);
                        }
                      },
                      {
                        type: "label",
                        props: {
                          id: "name-label",
                          font: $font($app.env == 2 ? 14 : 16),
                          textColor: ui.color.general,
                          autoFontSize: 1
                        },
                        layout: (make, view) => {
                          make.left.inset(10);
                          make.right.equalTo(view.prev.left);
                          make.centerY.equalTo(view.super);
                        }
                      }
                    ]
                  }
                },
                layout: (make, view) => {
                  make.top.equalTo(view.prev.bottom);
                  make.left.right.bottom.inset(0);
                },
                events: {
                  pulled: () => fetch(),
                  didSelect: (sender, indexPath) => {
                    $device.taptic(0);
                    let base = rates[selectedCurrency] || 1.0;
                    let number = Number($("exrinput").text);
                    $clipboard.text = (
                      (number * (rates[symbols[indexPath.row]] || 1.0)) /
                      base
                    ).toFixed(4);
                    ui.toast({ text: "已复制", inset: 38 });
                    ui.blink(sender.cell($indexPath(0, indexPath.row)));
                  }
                }
              }
            ]
          },
          kb.init("dec", "exrinput", calculate)
        ]
      }
    ]
  });
  ui.back(1);
  ui.placeholderTextColor($("exrinput"));
  $delay(0.1, () => ($("exrinput").text = 1.0));
  $("exrlist").beginRefreshing();
  fetch();
}

function calculate() {
  let base = rates[selectedCurrency] || 1.0,
    number = Number($("exrinput").text);
  $("exrlist").data = symbols.map((symbol, idx) => {
    return {
      "name-label": { text: names[idx] },
      "value-label": {
        text:
          ((number * (rates[symbol] || 1.0)) / base).toFixed(4) + " " + symbol
      }
    };
  });
}

function fetch() {
  const url = isFixer
    ? `http://data.fixer.io/api/latest?access_key=${fixerKey}&format=1`
    : "https://api.exchangeratesapi.io/latest";
  $http.get({
    url: url,
    handler: resp => {
      if (resp && resp.response.statusCode == 200) {
        $("exrlist").endRefreshing();
        $delay(0.3, () => {
          if (resp.data.error) {
            if (resp.data.error.code == 104)
              ui.toast({
                text: "额度已用完，更换接口查询中",
                inset: 38,
                icon: "225"
              });
            else if (resp.data.error.code == 101)
              ui.toast({
                text: "API Key 错误，更换接口查询中",
                inset: 38,
                icon: "225"
              });
            else
              ui.toast({
                text: "错误，更换接口查询中",
                inset: 38,
                icon: "225"
              });
            $delay(1, () => {
              isFixer = false;
              $("exrlist").beginRefreshing();
              fetch();
            });
          } else {
            ui.toast({ text: "刷新成功", inset: 38 });
            rates = resp.data.rates || {};
            if (rates != {}) rates["EUR"] = 1.0;
            if (!rates[selectedCurrency]) {
              selectedCurrency = "EUR";
              $cache.remove("selectedCurrency");
              $("select").title = currencyCode.EUR;
            }
            for (let i in currencyCode) {
              if (i in rates) {
                symbols.push(i);
                names.push(currencyCode[i]);
              }
            }
            calculate();
            !isFixer && ui.guide(4, "查看设置→说明配置查询 160+ 币种汇率");
          }
        });
      }
    }
  });
}

module.exports = { show: show };
