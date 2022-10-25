# JSBox Apps
Apps by Axel Burks on JSBox.

## What's JSBox?
JSBox is an Integrated Development Environment for JavaScript. You can learn to code JavaScript here, as we provide tons of utilities to enhance the development experience.

## Apps
| Name  |  Notes | Installation  |
|---|---|---|
| Extract Scheme | Extract URL Scheme from ipa file  |   |
| iTunes Utilities | Some useful utilities for apple contents, such as price history, get verison id, get icon or screenshots, search for more area stores, search iPhone/iPad/Mac/AppleTV apps  |   |
| Magic Launcher | Launch apps from wieget or in jsbox  |   |
| Preview | Preview share contents with extension  |   |
| Schedule Message | Send message in schedule  |   |
| Surge X | Surge Controller for Surge  |   |
| Time | Show current time with style hh:mm:ss  |   |
| XPin | Clipboard Manager with action support  |   |
| Boom | Quickly input keyboard extension  |   |
| Clip Editor | Clip Editor with advanced action and syntax  |   |
| Downloader | A file downloader on iOS  |   |
| Emoji | Search or show emoji with words  |   |
| Installer | JSBox scripts installler  |   |
| IPA Installer | Tool for installing ipa on iOS  |   |
| Pushbullet | Pushbullet Client with extension and widget support  |   |
| Search Tweets | Tweet advanced search tool  |   |
| Shorten | Shorten URL  |   |
| SM.MS | Upload pics to smms  |   |
| Thunder | Download files in Thunder  |   |
| Tool Box | JSBox scripts manager  |   |
| Weico | Transfer webo link between webo and weico style  |   |
| XQRcode | Generate and recognize qrcode with camera and share extension  |   |

# Devlepment
## Installation
- [jsbox-cli-plus](https://github.com/Fndroid/jsbox-cli-plus): Another CLI version of JSBox VSCode extension
```bash
npm i -g jsbox-cli-plus
```
- [jsbox_pc_debuger](https://github.com/Fndroid/jsbox_pc_debuger): JSBox logging utility on your PC
```bash
npm i -g jsbox-logger
```
- [hpagent](https://github.com/delvedor/hpagent): Http and https agent for [got](https://github.com/sindresorhus/got) used in [jsbox-cli-plus](https://github.com/Fndroid/jsbox-cli-plus)
```bash
npm i -g hpagent
# remove ip style restriction
sed -i 's#!net.isIP(hostIP)#1 == 2#' /opt/homebrew/lib/node_modules/jsbox-cli-plus/dist/index.js
# add proxy support
sed -i 's#const got = require("got");#const got = require("got");\nconst { HttpProxyAgent } = require("hpagent")\nconst agent = new HttpProxyAgent({ proxy: process.env.http_proxy || process.env.HTTP_PROXY })#;s#got.post(`http://${host}/upload`, {#got.post(`http://${host}/upload`, {\n        agent: agent,#' /opt/homebrew/lib/node_modules/jsbox-cli-plus/dist/actions.js
```

## Settings
```sh
# set jsbox host
jsbox set 192.168.1.1

# show current host
jsbox host

# watch a file or dir
jsbox watch
jsbox watch ./dist
jsbox watch ./index.js

# watch current dir and log to chrome
jsbox watch --logger
jsbox watch -l

# build current dir, and output to .output
jsbox build

# build to specified dir
jsbox build ./dist

# build to specified dir and file
jsbox build ./dist -o ./dist/output.box
```