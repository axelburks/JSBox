function init(item, country) {
  preview("", item, country)
}

function preview(deviceuid, item, country) {
  let moment = require('moment')
  let constants = require("scripts/constants")
  let month = constants.month
  let currency = constants.currencies[country]
  $ui.loading(true)
  $http.request({
    method: "POST",
    url: "http://mobile.appzapp.net/Service/Mobile5.asmx/GetAppDetailsLogDevice",
    header: {
      "Content-Type": "application/json",
      "User-Agent": "AppZappUniversal/6.8.2 CFNetwork/901.1 Darwin/17.5.0"
    },
    body: {
      "storeKey": country,
      "langKey": "zh-Hans-CN",
      "appID": item.trackId,
      "isIpad": "false",
      "deviceuid": deviceuid
    },
    handler: function(resp) {
      let data = JSON.parse(resp.data.d)
      let content = ""
      let price_list = []
      let lowest_price = "( No Price Change )"
      let device_list = ["iPhone", "iPad", "iPhone & iPad", "Mac"]
      let device_type = device_list[data.Device - 1]
      let title = data.Title.match(/^.+(?=\s[-—－–])|^.+(?=[-—－–])|^.+/)[0]
      //let price = data.Price
      let price = currency + item.price
      let activities = data.Activities
      let description = data.Description
      let whatsnew = data.WhatsNew
      for (let i = 0; i < activities.length; i++) {
        let date = activities[i].DateWithYear
        if (date.match(/(\d+)\s(.+)月\s(\d+)/)) {
          let date_init = date.match(/(\d+)\s(.+月)\s(\d+)/)
          date = date.replace(date_init[2], month[date_init[2]])
          date = moment(date, "DD MMM YY").format('YYYY-MM-DD')
        } else if (date.match(/(\d+)\s(\d+)\s(\d+)/)) {
          date = moment(date, "DD MM YY").format('YYYY-MM-DD')
        } else if (date.match(/(\d+)\s(\w+)\s(\d+)/)) {
          date = moment(date, "DD MMM YY").format('YYYY-MM-DD')
        }
        if (activities[i].Type.match(/Update|New/)) {
          let version = activities[i].Version
          let update = `<div class="container" name="Upgrade">
          <div class="box">
          <div class="date">
          <p>${date}</p>
          </div>
          <div class="content">
          <p><span style="color: rgba(237,108,0,0.8);">Upgrade</span> : Version ${version}</p>
          </div>
          </div>
          <div class="border">
          </div>
          </div>`
          content = content + update
        } else {
          price_list.push(activities[i].PriceFrom)
          price_list.push(activities[i].PriceTo)
          let pricefrom = activities[i].PriceFrom
          let priceto = activities[i].PriceTo
          if (activities[i].Type.match(/PriceIncrease/)) {
            let increase = `<div class="container" name="PriceInc">
            <div class="box">
            <div class="date">
            <p>${date}</p>
            </div>
            <div class="content">
            <p><span style="color: rgba(244,67,54,0.8);">Price Increase</span> : ${currency}${pricefrom} → ${currency}${priceto}</p>
            </div>
            </div>
            <div class="border">
            </div>
            </div>`
            content = content + increase
          } else if (activities[i].Type.match(/PriceDrop/)) {
            let drop = `<div class="container" name="PriceDrop">
            <div class="box">
            <div class="date">
            <p>${date}</p>
            </div>
            <div class="content">
            <p><span style="color: rgba(76,175,80,0.8);">Price Drop</span> : ${currency}${pricefrom} → ${currency}${priceto}</p>
            </div>
            </div>
            <div class="border">
            </div>
            </div>`
            content = content + drop
          }
        }
      }
      if (price_list.length > 0) {
        let min = Math.min.apply(null, price_list)
        lowest_price = `(Lowest Price: ${currency}${min})`
      }
      let detail = `<div class="container" name="Detail">
      <div class="box">
      <div class="detail">
      <p>WhatsNew：</p>
      </div>
      <div class="content">
      <p><br>${whatsnew}</p>
      </div>
      </div>
      <div class="border">
      </div>
      </div>
      
      <div class="container" name="Detail">
      <div class="box">
      <div class="detail">
      <p>Description：</p>
      </div>
      <div class="content">
      <p><br>${description}</p>
      </div>
      </div>
      <div class="border">
      </div>
      </div>`
      content = content + detail
      let html = `<html>
      <head>
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
      <title>App Preview</title>
      <style>
      h1 {padding: 0.5em 0 0.5em 0;text-align: center;font-size: 50pt;font-weight: 600;margin: 0;}
      body {font-family: sans-serif;}
      a {text-decoration: none;color: #444;}
      p {margin: 1rem 0;}
      .menu {margin: 0 0 3em 2%;}
      .main {padding: 0 5%;}
      .box {padding: 0 5%;}
      .date {font-size: 20pt;margin-bottom: 1rem;padding-left: 0.8rem;border-left: 0.3rem solid #999;color: #444;}
      .detail {font-size: 30pt;margin-top: 3rem;margin-bottom: 1rem;padding-left: 0.8rem;border-left: 0.3rem solid #999;color: #1FBD80;}
      .content {font-size: 25pt;padding-left: 1.1rem;}
      .border {height: 3px;width: 95%;margin-left: auto;margin-right: auto;background-color: #ddd;background-image: repeating-linear-gradient(-45deg, #fff, #fff 4px, transparent 4px, transparent 10px);}
      .container:last-of-type .border {display: none;}
      .link {border-radius: 6px;height: 77px;line-height: 80px;display: inline-block;font-size: 20pt;border-bottom: 3px solid rgba(233,233,233,1);padding-left: 32px;padding-right: 32px;margin: 0.5em 1em;background: rgba(233,233,233,1);background-size: 40px 39px;box-shadow: 0px 2px 8px 0px rgba(158, 158, 158, 0.5);transition: border-color 0.5s;-webkit-transition: border-color 0.5s;-moz-transition: border-color 0.5s;-ms-transition: border-color 0.5s;-o-transition: border-color 0.5s;}
      .footer {margin: 5em 0}
      </style>
      <script language="javascript">
      window.onload=function(){
      $PriceInc=document.getElementsByName("PriceInc");
      $PriceDrop=document.getElementsByName("PriceDrop");
      $Upgrade=document.getElementsByName("Upgrade");
      $Detail=document.getElementsByName("Detail");
      $AllDOM=getElementsByClassName("container");
      $PriceInc_flag=1;
      $PriceDrop_flag=1;
      $Upgrade_flag=1;
      $Detail_flag=1;
      document.getElementById("PriceInc").style.borderBottom="3px solid rgba(244,67,54,0.8)";
      document.getElementById("PriceDrop").style.borderBottom="3px solid rgba(76,175,80,0.8)";
      document.getElementById("Upgrade").style.borderBottom="3px solid rgba(237,108,0,0.8)";
      document.getElementById("Detail").style.borderBottom="3px solid rgba(128,128,128,0.8)";
      Init();
      }
      
      function getElementsByClassName(n){
      var classElements = [],allElements = document.getElementsByTagName('*');
      for (var i=0; i< allElements.length; i++ ){
      if (allElements[i].className == n ){
      classElements[classElements.length] = allElements[i];
      }}
      return classElements;
      }
      
      function borderDisplayReset(){
      if($PriceInc.length>0) $PriceInc[$PriceInc.length-1].getElementsByTagName("div")[3].style.display="";
      if($PriceDrop.length>0) $PriceDrop[$PriceDrop.length-1].getElementsByTagName("div")[3].style.display="";
      if($Upgrade.length>0) $Upgrade[$Upgrade.length-1].getElementsByTagName("div")[3].style.display="";
      if($Detail.length>0) $Detail[$Detail.length-1].getElementsByTagName("div")[3].style.display="";
      }
      
      function borderDisplaySet(){
      for(var i=$AllDOM.length-1;i>=0;i--){
      if($AllDOM[i].style.display!='none'){
      $AllDOM[i].getElementsByTagName("div")[3].style.display="none";
      break;
      }}}
      
      function PriceInc(){
      borderDisplayReset();
      if($Detail_flag){
      document.getElementById("Detail").style.borderBottom="";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="none";
      }
      $Detail_flag=0;
      }
      if($PriceInc_flag){
      document.getElementById("PriceInc").style.borderBottom="";
      for(var i=0;i<$PriceInc.length;i++){
      $PriceInc[i].style.display="none";
      }
      $PriceInc_flag=0;
      }else{
      document.getElementById("PriceInc").style.borderBottom="3px solid rgba(244,67,54,0.8)";
      for(var i=0;i<$PriceInc.length;i++){
      $PriceInc[i].style.display="";
      }
      $PriceInc_flag=1;
      }
      borderDisplaySet();
      }
      
      function PriceDrop(){
      borderDisplayReset();
      if($Detail_flag){
      document.getElementById("Detail").style.borderBottom="";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="none";
      }
      $Detail_flag=0;
      }
      if($PriceDrop_flag){
      document.getElementById("PriceDrop").style.borderBottom="";
      for(var i=0;i<$PriceDrop.length;i++){
      $PriceDrop[i].style.display="none";
      }
      $PriceDrop_flag=0;
      }else{
      document.getElementById("PriceDrop").style.borderBottom="3px solid rgba(76,175,80,0.8)";
      for(var i=0;i<$PriceDrop.length;i++){
      $PriceDrop[i].style.display="";
      }
      $PriceDrop_flag=1;
      }
      borderDisplaySet();
      }
      
      function Upgrade(){
      borderDisplayReset();
      if($Detail_flag){
      document.getElementById("Detail").style.borderBottom="";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="none";
      }
      $Detail_flag=0;
      }
      if($Upgrade_flag){
      document.getElementById("Upgrade").style.borderBottom="";
      for(var i=0;i<$Upgrade.length;i++){
      $Upgrade[i].style.display="none";
      }
      $Upgrade_flag=0;
      }else{
      document.getElementById("Upgrade").style.borderBottom="3px solid rgba(237,108,0,0.8)";
      for(var i=0;i<$Upgrade.length;i++){
      $Upgrade[i].style.display="";
      }
      $Upgrade_flag=1;
      }
      borderDisplaySet();
      }
      
      function Detail(){
      borderDisplayReset();
      if($Detail_flag){
      document.getElementById("Detail").style.borderBottom="";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="none";
      }
      document.getElementById("PriceInc").style.borderBottom="3px solid rgba(244,67,54,0.8)";
      for(var i=0;i<$PriceInc.length;i++){
      $PriceInc[i].style.display="";}
      document.getElementById("PriceDrop").style.borderBottom="3px solid rgba(76,175,80,0.8)";
      for(var i=0;i<$PriceDrop.length;i++){
      $PriceDrop[i].style.display="";}
      $Detail_flag=0;
      $PriceInc_flag=1;
      $PriceDrop_flag=1;
      }else{
      if($PriceInc_flag){
      document.getElementById("PriceInc").style.borderBottom="";
      for(var i=0;i<$PriceInc.length;i++){
      $PriceInc[i].style.display="none";
      }
      $PriceInc_flag=0;
      }
      if($PriceDrop_flag){
      document.getElementById("PriceDrop").style.borderBottom="";
      for(var i=0;i<$PriceDrop.length;i++){
      $PriceDrop[i].style.display="none";
      }
      $PriceDrop_flag=0;
      }
      if($Upgrade_flag){
      document.getElementById("Upgrade").style.borderBottom="";
      for(var i=0;i<$Upgrade.length;i++){
      $Upgrade[i].style.display="none";
      }
      $Upgrade_flag=0;
      }
      document.getElementById("Detail").style.borderBottom="3px solid rgba(128,128,128,0.8)";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="";
      }
      $Detail_flag=1;
      }
      borderDisplaySet();
      }
      
      function Init(){
      borderDisplayReset();
      if($Upgrade_flag){
      document.getElementById("Upgrade").style.borderBottom="";
      for(var i=0;i<$Upgrade.length;i++){
      $Upgrade[i].style.display="none";
      }
      $Upgrade_flag=0;
      }
      if($Detail_flag){
      document.getElementById("Detail").style.borderBottom="";
      for(var i=0;i<$Detail.length;i++){
      $Detail[i].style.display="none";
      }
      $Detail_flag=0;
      borderDisplaySet();
      }
      }
      
      </script>
      </head>
      
      <body>
      <h1>${title}<div class="content">${price} ${lowest_price}<br>${device_type}</div></h1>
      
      <div class="main">
      
      <div class="menu">
      <span class="link" id="PriceDrop" style="color: rgba(76,175,80,0.8);" onclick="PriceDrop();">Drop</span>
      <span class="link" id="PriceInc" style="color: rgba(244,67,54,0.8);" onclick="PriceInc();">Increase</span>
      <span class="link" id="Upgrade" style="color: rgba(237,108,0,0.8);" onclick="Upgrade();">Upgrade</span>
      <span class="link" id="Detail" style="color: rgba(128,128,128,0.8);" onclick="Detail();">Detail</span>
      </div>
      
      ${content}
      
      </div>
      
      <div class="footer">
      </div>`
      $ui.loading(false)
      $ui.push({
        props: {
          title: "Preview"
        },
        views: [{
          type: "web",
          props: {
            html: html
          },
          layout: $layout.fill,
        }]
      })
      $app.listen({
        exit: function() {
          $context.close()
        }
      })
    }
  })
}

module.exports = {
  init: init
}