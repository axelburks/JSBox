var entities = [
  { name: $l10n("SOFTWARE"), code: "software" },
  { name: $l10n("IPAD"), code: "iPadSoftware" },
  { name: $l10n("MACOS"), code: "macSoftware" },
  { name: $l10n("MUSIC"), code: "musicTrack" },
  { name: $l10n("MOVIE"), code: "movie" },
  { name: $l10n("PODCAST"), code: "podcast" },
]

var countries = [
  { name: "🇺🇸 US", code: "us" },
  { name: "🇨🇳 CN", code: "cn" },
  { name: "🇭🇰 HK", code: "hk" },
  { name: "🇬🇧 UK", code: "gb" },
  { name: "🇯🇵 JP", code: "jp" }
]

var currencies = {
  "us" : "$",
  "cn" : "￥",
  "hk" : "HK$",
  "gb" : "￡",
  "jp" : "JPY￥"
}

var month = {
  "一月" : "1",
  "二月" : "2",
  "三月" : "3",
  "四月" : "4",
  "五月" : "5",
  "六月" : "6",
  "七月" : "7",
  "八月" : "8",
  "九月" : "9",
  "十月" : "10",
  "十一月" : "11",
  "十二月" : "12"
}

module.exports = {
  entities: entities,
  countries: countries,
  currencies: currencies,
  month, month
}