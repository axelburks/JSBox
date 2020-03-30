let time_label = $("time_label");
showTime();
function showTime() {
  var date = new Date();
  var time1 = date.getTime().toString();
  var time2 = time1.substring(time1.length-3);
  time_label.text = date.getHours()+ ":" + date.getMinutes() + ":" + date.getSeconds();
  setTimeout(cycleTime, time2);
}
function cycleTime() {
  var date = new Date();
  time_label.text = date.getHours()+ ":" + date.getMinutes() + ":" + date.getSeconds();
  setTimeout(cycleTime, 100);
}
