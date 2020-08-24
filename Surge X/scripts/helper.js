const app = require("./app");
const data = require("data");
let appData = data.appData;

let funcColor = {
  true: $color("tint"),
  false: $color("lightGray")
};

function findColorKey(obj, value, compare = (a, b) => a.hexCode == b.hexCode) {
  return Object.keys(obj).find(k => compare(obj[k], value)) == "true" ? true : false;
}

async function groupStat(group, check) {
  let group_sel, result;
  if (group == "Outbound") {
    group_sel = await app.surgeController("GET", "outbound", "");
    result = check ? group_sel.mode == check : group_sel.mode;
  } else {
    if (group == "Global") group_sel = await app.surgeController("GET", "global", "");
    else group_sel = await app.surgeController("GET", "policy_groups_select", "?group_name=" + encodeURI(group));
    result = check ? group_sel.policy == check : group_sel.policy;
  }
  return result;
}

async function groupPolicies(group) {
  let group_policies;
  if (group == "Outbound") group_policies = ["direct", "proxy", "rule"];
  else {
    if (group == "Global") {
      let group_all = await app.surgeController("GET", "policies", "");
      group_policies = group_all["proxies"].concat(group_all["policy-groups"]);
    } else {
      let group_all = await app.surgeController("GET", "policy_groups", "");
      group_policies = group_all[group].map(function (item) {
        return item.name;
      });
    }
  }
  return group_policies;
}

async function setGroup(group, sel) {
  if (group == "Outbound") await app.surgeController("POST", "outbound", { "mode": sel });
  else {
    if (group == "Global") group_sel = await app.surgeController("POST", "global", { "policy": sel });
    else await app.surgeController("POST", "policy_groups_select", { "group_name": group, "policy": sel });
  }
}

async function setModule(name, status) {
  await app.surgeController("POST", "modules", { [name]: status });
}

async function isModule(name) {
  let moduleStat = await app.surgeController("GET", "modules", "");
  let enabledNameModule = moduleStat.enabled.indexOf(name) > -1 ? true : false;
  return enabledNameModule;
}

async function setFeature(name, status) {
  await app.surgeController("POST", name, { "enabled": status });
}

async function isFeature(name) {
  let captureStat = await app.surgeController("GET", name, "");
  let enabledCapture = captureStat.enabled;
  return enabledCapture;
}

async function setSwitch(name, status, type) {
  switch (type) {
    case "feature":
      await setFeature(name, status);
      break
    case "module":
      await setModule(name, status);
  }
}

async function isSwitch(name, type) {
  switch (type) {
    case "feature":
      return await isFeature(name);
    case "module":
      return await isModule(name);
  }
}

async function setFunc(name, status) {
  let cFuncName = status ? name : "Default";
  if (appData[cFuncName].group) {
    for (let i = 0; i < appData[cFuncName].group.length; i++) {
      await setGroup(appData[cFuncName].group[i].name, appData[cFuncName].group[i].policy);
    }
  }
  if (appData[cFuncName].switch) {
    for (let i = 0; i < appData[cFuncName].switch.length; i++) {
      await setSwitch(appData[cFuncName].switch[i].name, appData[cFuncName].switch[i].status, appData[cFuncName].switch[i].type);
    }
  }
}

async function isFunc(name) {
  if (appData[name].group) {
    let cGroupData = appData[name].group;
    for (let i = 0; i < cGroupData.length; i++) {
      if ((await groupStat(cGroupData[i].name, cGroupData[i].policy)) == false) return false;
    }
  }
  if (appData[name].switch) {
    let cSwitchData = appData[name].switch;
    for (let j = 0; j < cSwitchData.length; j++) {
      if ((await isSwitch(cSwitchData[j].name, cSwitchData[j].type)) != cSwitchData[j].status) return false;
    }
  }
  return true;
}

async function fillDataSource() {
  $("loadingView").start();
  $("funcView").data = await Promise.all(Object.keys(appData).map(async function (item) {
    return { funcButton: { title: item, bgcolor: funcColor[(await isFunc(item))] } }
  }));

  $("switchView").data = await Promise.all(appData["Default"].switch.map(async function (item) {
    return {
      switchSwitch: { on: await isSwitch(item.name, item.type), info: { name: item.name, type: item.type } },
      switchLabel: { text: item.label },
    }
  }));

  $("selectView").data = await Promise.all(appData["Default"].group.map(async function (item) {
    return {
      selectLabel: { text: item.name },
      selectButton: { title: await groupStat(item.name), info: item.name },
    }
  }));
  $("loadingView").stop();
}

module.exports = {
  funcColor: funcColor,
  findColorKey: findColorKey,
  groupPolicies: groupPolicies,
  setGroup: setGroup,
  setFunc: setFunc,
  isFunc: isFunc,
  setSwitch: setSwitch,
  fillDataSource: fillDataSource,
}