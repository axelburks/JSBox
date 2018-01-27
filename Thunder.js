/*
跳转迅雷 App下载 Http(s)、Magnet、thunder 协议链接
1.通过 share extension 运行，直接下载链接内容
2.主程序内直接运行，自动填充剪贴板链接
3.通过 url scheme 运行

作者联系：https://t.me/axel_burks
*/

var content = $context.query.downloadUrl || $context.text || ($clipboard.text ? $clipboard.text : null)
if(content != null){
	var url = content.match(/^(https?:\/\/|magnet:)[^\s]+/i)[0]
	var thunder_url = content.match(/^thunder:\/\/[^\s]+/i)
	if (url) {
		$clipboard.clear()
		var scheme = "thunder://" + $text.base64Encode(url)
		$app.openURL(scheme)
		if ($context.text)
			$context.close()
	} else if(thunder_url){
		$app.openURL(thunder_url)
	}else {
		$ui.alert({
			title: "Warning",
			message: "请使用正确的地址！",
			actions: [{
				title: "OK",
				style: "Cancel",
				handler: function() {
					if ($context.text)
						$context.close()
					$system.home()
				}
			}]
		})
	}
}
