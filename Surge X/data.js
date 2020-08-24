exports.appData = {
  "Default": {
    group: [
      { name: "Outbound", policy: "rule" },
      { name: "Global", policy: "X-Man" },
      { name: "X-Man", policy: "🇲🇴 澳门 CTM 01" },
      { name: "XCross", policy: "SSID" },
      { name: "", policy: "XCross" },
      { name: "WiFi-Fall", policy: "MO-CTM" },
      { name: "XGo", policy: "DIRECT" },
      { name: "XDeny", policy: "REJECT" },
    ],
    switch: [
      { name: "capture", status: false, label: "Capture", type: "feature" },
      { name: "🔥 HTTPS", status: false, label: "Https Mod", type: "module" },
      { name: "💊 iTunes", status: false, label: "iTunes Mod", type: "module" },
      { name: "WiFi Access", status: false, label: "Access Mod", type: "module" },
    ],
  },
  "Cap All": {
    group: null,
    switch: [
      { name: "capture", status: true, label: "Capture", type: "feature" },
      { name: "🔥 HTTPS", status: true, label: "Https Mod", type: "module" },
    ],
  },
  "Charles": {
    group: [
      { name: "X-Man", policy: "Charles-http" },
      { name: "XGo", policy: "X-Man" },
    ],
    switch: null,
  },
  "Proxy": {
    group: [
      { name: "Outbound", policy: "proxy" },
      { name: "Global", policy: "XCross" },
    ],
    switch: null,
  },
}