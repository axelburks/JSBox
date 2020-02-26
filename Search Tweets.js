// https://twitter.com/search-advanced

let moment = require('moment');
let user = getUser();

let view_blank = 8;
let view_height = 30;
let label_width = 50;
let user_width = ($device.info.screen.width - label_width - 3.5 * view_blank) / 2;

$ui.render({
  views: [
    {
      type: "label",
      props: {
        id: "filter_label",
        text: "Filter:",
        align: $align.left
      },
      layout: (make, view) => {
        make.left.top.inset(view_blank);
        make.width.equalTo(label_width);
        make.height.equalTo(view_height);
      }
    },
    {
      type: "label",
      props: {
        text: "From:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(5);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "To:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "@:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "All:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "Exact:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "Any:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "None:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "Tag:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "Since:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "label",
      props: {
        text: "Until:",
        align: $align.left
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      }
    },
    {
      type: "tab",
      props: {
        id: "filter_type",
        items: ["Anyone", "Following"]
      },
      layout: (make, view) => {
        make.top.right.inset(view_blank);
        make.left.equalTo($("filter_label").right).offset(view_blank);
        make.height.equalTo(view.prev);
      }
    },
    {
      type: "button",
      props: {
        id: "user_from_button",
        title: user,
        bgcolor: $color("gray")
      },
      layout: (make, view) => {
        make.width.equalTo(user_width);
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.right.height.equalTo(view.prev);
      },
      events: {
        tapped: sender => { $("user_from").text = ($("user_from").text == user) ? "" : user }
      }
    },
    {
      type: "input",
      props: {
        id: "user_from",
        text: user
      },
      layout: (make, view) => {
        make.left.equalTo($("filter_type").left);
        make.right.equalTo(view.prev.left).inset(view_blank);
        make.top.height.equalTo(view.prev);
      }
    },
    {
      type: "button",
      props: {
        id: "user_to_button",
        title: user,
        bgcolor: $color("gray")
      },
      layout: (make, view) => {
        make.width.equalTo(user_width);
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.height.equalTo(view.prev);
        make.right.equalTo($("filter_type").right);
      },
      events: {
        tapped: sender => { $("user_to").text = ($("user_to").text == user) ? "" : user }
      }
    },
    {
      type: "input",
      props: {
        id: "user_to",
      },
      layout: (make, view) => {
        make.left.equalTo($("filter_type").left);
        make.right.equalTo(view.prev.left).inset(view_blank);
        make.top.height.equalTo(view.prev);
      }
    },
    {
      type: "button",
      props: {
        id: "user_at_button",
        title: user,
        bgcolor: $color("gray")
      },
      layout: (make, view) => {
        make.width.equalTo(user_width);
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.height.equalTo(view.prev);
        make.right.equalTo($("filter_type").right);
      },
      events: {
        tapped: sender => { $("user_at").text = ($("user_at").text == user) ? "" : user }
      }
    },
    {
      type: "input",
      props: {
        id: "user_at",
      },
      layout: (make, view) => {
        make.left.equalTo($("filter_type").left);
        make.right.equalTo(view.prev.left).inset(view_blank);
        make.top.height.equalTo(view.prev);
      }
    },
    {
      type: "input",
      props: {
        id: "query_all",
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo($("filter_type"));
      },
      events: {
        ready: sender => { sender.focus() }
      }
    },
    {
      type: "input",
      props: {
        id: "query_exact",
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo($("filter_type"));
      }
    },
    {
      type: "input",
      props: {
        id: "query_any",
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo($("filter_type"));
      }
    },
    {
      type: "input",
      props: {
        id: "query_none",
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo($("filter_type"));
      }
    },
    {
      type: "input",
      props: {
        id: "query_tag",
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo($("filter_type"));
      }
    },
    {
      type: "button",
      props: {
        icon: $icon("023", $color("white"), $size(20, 20))
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.right.inset(view_blank);
        make.width.equalTo(user_width / 2);
        make.height.equalTo(2 * view_height + view_blank);
      },
      events: {
        tapped: sender => {
          $app.openURL("https://mobile.twitter.com/search?q=" + schemeParam());
          $app.env == $env.app ? $app.close() : $context.close();
        },
        longPressed: sender => {
          $safari.open({
            url: "https://mobile.twitter.com/search?q=" + schemeParam(),
            handler: function() {
              $app.env == $env.app ? $app.close() : $context.close();
            }
          });
        }
      }
    },
    {
      type: "input",
      props: {
        id: "query_since"
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.top);
        make.right.equalTo(view.prev.left).inset(view_blank);
        make.left.height.equalTo($("filter_type"));
      },
      events: {
        tapped: sender => {
          sender.focus();
          sender.blur();
          $picker.date({props: {mode: 1, date: sender.text ? new Date(sender.text) : new Date()}}).then(seldate => {
            sender.text = seldate ? moment(new Date(seldate)).format('YYYY-MM-DD') : sender.text;
          })
        },
        doubleTapped: sender => { sender.text = "" },
        returned: sender => { sender.blur() }
      }
    },
    {
      type: "input",
      props: {
        id: "query_until"
      },
      layout: (make, view) => {
        make.top.equalTo(view.prev.bottom).inset(view_blank);
        make.left.right.width.height.equalTo(view.prev);
      },
      events: {
        tapped: sender => {
          sender.focus();
          sender.blur();
          $picker.date({props: {mode: 1, date: sender.text ? new Date(sender.text) : new Date()}}).then(seldate => {
            sender.text = seldate ? moment(new Date(seldate)).format('YYYY-MM-DD') : sender.text;
          })
        },
        doubleTapped: sender => { sender.text = "" },
        returned: sender => { sender.blur() }
      }
    }
  ]
});

$delay(1, () => {
  user = getUser();
  $("user_from").text = user;
  $("user_from_button").title = user;
  $("user_to_button").title = user;
  $("user_at_button").title = user;
});

function getUser() {
  let twitter_url = $context.link || ($context.safari && $context.safari.items.baseURI) || $clipboard.link || "";
  return /https:\/\/(mobile\.)?twitter\.com/.test(twitter_url) ? twitter_url.split("/")[3] : "";
}

function schemeParam() {
  let adv_arr = [];  
  $("user_from").text.length > 0 && adv_arr.push(`(from:${$("user_from").text})`);
  $("user_to").text.length > 0 && adv_arr.push(`(to:${$("user_to").text})`);
  $("user_at").text.length > 0 && adv_arr.push(`(@${$("user_at").text})`);
  $("query_all").text.length > 0 && adv_arr.push($("query_all").text);
  $("query_exact").text.length > 0 && adv_arr.push(`"${$("query_exact").text}"`);
  $("query_any").text.length > 0 && adv_arr.push(`(${$("query_any").text.split(' ').join(' OR ')})`);
  $("query_none").text.length > 0 && adv_arr.push($("query_none").text.split(' ').map(x => `-${x}`).join(' '));
  $("query_tag").text.length > 0 && adv_arr.push(`(${$("query_tag").text.split(' ').map(x => `#${x}`).join(' OR ')})`);
  $("query_since").text.length > 0 && adv_arr.push(`since:${$("query_since").text}`);
  $("query_until").text.length > 0 && adv_arr.push(`until:${$("query_until").text}`);
  let adv_str = adv_arr.join(' ');
  let query_str = encodeURIComponent(adv_str);
  let filter_str = ($("filter_type").index == 0) ? "" : "&pf=on";

  let scheme = `${query_str}${filter_str}`;
  return scheme;
}
