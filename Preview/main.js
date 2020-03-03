if ($app.env == $env.app) {
  let app = require('scripts/app');
  app.init();
} else {
  // Fix keyboard inset with code view
  $define({type:'BBCodeView',events:{_keyboardDidShowNotification:e=>{$thread.main(()=>{if(self.$isFirstResponder()){const t=e.$userInfo().$objectForKey('UIKeyboardFrameEndUserInfoKey').$CGRectValue().height,o=self.$convertRect_toView(self.$bounds(),null),s=o.y+o.height,n=$objc('UIApplication').$sharedApplication().$keyWindow().$frame().height-t,i=Math.max(0,s-n);self.$setBottomInset(i),self.$__adjustTextContainerInsets()}self.$setContentInsetAdjustmentBehavior(2),self.$scrollToCaretRectVisible()})}}});

  let action = require('scripts/action');
  action.init();
}