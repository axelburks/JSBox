let model_list = {
  "iPhone": "iPhone",
  "iPad": "iPad",
  "MacBookPro14,1": "MBP13",
  "Default": "Mac",
}

let prefs_conf, password, device_list, current_url
let current_device = Object.keys(model_list).filter( item => $device.info.model.indexOf(item) != -1)
current_device = current_device.length > 0 ? current_device[0] : model_list["Default"]
genConfig()

let feature_list = {
  "mitm": "/v1/features/mitm",
  "capture": "/v1/features/capture",
  "rewrite": "/v1/features/rewrite",
  "scripting": "/v1/features/scripting",
  "system_proxy": "/v1/features/system_proxy",
  "enhanced_mode": "/v1/features/enhanced_mode",

  "outbound": "/v1/outbound",  // Obtain or Change the outbound mode. Possible modes: direct, proxy, rule. body: {"mode":"rule"}
  "global": "/v1/outbound/global",  // Obtain or change the default policy for global outbound mode. body: {"policy":"ProxyA"}

  "policies": "/v1/policies",  // List all policies
  "policies_detail": "/v1/policies/detail",  // Obtain the detail of policy
  "policies_test": "/v1/policies/test",  // Test policies with a URL

  "policy_groups": "/v1/policy_groups",  // List all policy groups and their options
  "policy_groups_test_results": "/v1/policy_groups/test_results",  // Obtain the test result of a url-test/fallback/load-balance group
  "policy_groups_select": "/v1/policy_groups/select",  // Obtain the option of a select group | Change the option of a select group
  "policy_groups_test": "/v1/policy_groups/test",  // Test a group immediately

  "requests_recent": "/v1/requests/recent",  // List recent requests
  "requests_active": "/v1/requests/active",  // List all active requests
  "requests_kill": "/v1/requests/kill",  // Kill an active request

  "profiles_current": "/v1/profiles/current",  // Obtain the text content of the current profile. If 'sensitive' is false, all passwords field will be masked
  "profiles_reload": "/v1/profiles/reload",  // Execute profile reloading immediately
  "profiles_switch": "/v1/profiles/switch",  // Switch to another profile

  "dns": "/v1/dns",  // Obtain the current DNS cache content.
  "dns_flush": "/v1/dns/flush",  // Flush the DNS cache.
  "dns_delay": "/v1/test/dns_delay",  // Test the DNS delay.

  "modules": "/v1/modules",  // List the available and enabled modules. | Enable or disable modules.

  "scripting_list": "/v1/scripting",  // List all the scripts.
  "scripting_evaluate_mock": "/v1/scripting/evaluate",  // Evaluate a script with a mock environment.
  "scripting_evaluate_cron": "/v1/scripting/cron/evaluate",  // Evaluate a cron script immediately.

  "stop": "/v1/stop",  // Shutdown Surge engine. If Always On is enabled on Surge iOS, the Surge engine will restart.
  "events": "/v1/events",  // Obtain the content of the event center.
  "rules": "/v1/rules",  // Obtain the list of rules.
  "traffic": "/v1/traffic",  // Obtain traffic information.
  "log_level": "/v1/log/level",  // Change the log level for the current session.
}

function genConfig() {
  prefs_conf = $prefs.all()
  password = $prefs.get("api.pwd")
  device_list = JSON.parse($file.read("prefs.json").string).groups[1].items.map( item => item.key ).map( item => item.replace("device.", "") )
  current_url = prefs_conf["device." + current_device].replace(/.+(:\d+$)/i, '127.0.0.1$1')
}

async function getDeviceURL() {
  // return $("deviceButton").title == current_device ? current_url : prefs_conf["device." + $("deviceButton").title]
  if ($("deviceTab").index == device_list.indexOf(current_device)) {
    return current_url
  } else {
    var prefs_conf_other_device = prefs_conf["device." + device_list[$("deviceTab").index]]
    var is_url_regex = /^(https?:\/\/.+)(:\d+)$/
    if (is_url_regex.test(prefs_conf_other_device)) {
      prefs_conf_other_device = prefs_conf_other_device.match(is_url_regex)
      prefs_conf_other_device_ip = (await $http.get(prefs_conf_other_device[1])).data
      prefs_conf_other_device_port = prefs_conf_other_device[2]
      prefs_conf_other_device = prefs_conf_other_device_ip + prefs_conf_other_device_port
    }
    return prefs_conf_other_device
  }
}

async function surgeController(type, feature, info) {
  let surge_url = "https://" + $("deviceLabel").text + feature_list[feature]
  let surge_body = null
  // console.log(surge_url)

  if (type == "GET") {
    surge_url = surge_url + info
  } else {
    surge_body = info
  }

  let surgeData = await $http.request({
    method: type,
    timeout: 4,
    url: surge_url,
    header: {
      "X-Key": password,
      "Accept": "*/*"
    },
    body: surge_body
  });
  // if (surge_url.match(/system_proxy/)) {
  //   console.log(surgeData)
  // }
  // console.log(surgeData)
  if (!surgeData.data) {
    // console.log(surge_url)
    $ui.error("Error: " + surgeData.error.localizedDescription)
    return false
  }
  surgeData = surgeData.data
  if (type == "GET") {
    return surgeData
  } else {
    if (surgeData) {
      return true
    } else {
      console.log(surgeData)
      return false
    }
  }
}

module.exports = {
  genConfig: genConfig,
  device_list: device_list,
  current_device: current_device,
  current_url: current_url,
  getDeviceURL: getDeviceURL,
  surgeController: surgeController
}