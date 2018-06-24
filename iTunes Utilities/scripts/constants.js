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
  { name: "🇯🇵 JP", code: "jp" },
  { name: "🇦🇺 AU", code: "au" },
  { name: "🇳🇿 NZ", code: "nz" }
]

var currencies = {
  "us" : "$",
  "cn" : "￥",
  "hk" : "$",
  "gb" : "$",
  "jp" : "$",
  "au" : "$",
  "nz" : "$"
}

var langs = {
  "us" : "en",
  "cn" : "zh-Hans-CN",
  "hk" : "en",
  "gb" : "en",
  "jp" : "en",
  "au" : "en",
  "nz" : "en"
}

module.exports = {
  entities: entities,
  countries: countries,
  currencies: currencies,
  langs, langs
}