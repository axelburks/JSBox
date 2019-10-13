# JSBox

# Installation
npm install -g jsbox-cli-plus
npm install -g jsbox-logger

JSBox 引入模块
将socketLogger.js(https://github.com/Fndroid/jsbox_pc_debuger/raw/master/jsboxModule/socketLogger.js)导入JSBox的脚本模块下（方便下次使用）

# Getting Started

## 设置手机端 Host IP

$ jsbox set 192.168.1.1
查看当前的 Host IP

$ jsbox host
监听一个目录或文件

## 监听当前目录
$ jsbox watch

## 监听当前目录并输出日志到 Chrome
$ jsbox watch --logger
$ jsbox watch -l

## 监听指定目录
$ jsbox watch ./dist

## 监听指定文件
$ jsbox watch ./index.js
构建一个 JSBox 应用

## 构建当前目录, 默认生成到 .output
$ jsbox build

## 构建指定目录
$ jsbox build ./dist

## 自定义输出路径
$ jsbox build ./dist -o ./dist/output.box
