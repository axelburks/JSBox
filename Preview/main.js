if ($app.env == $env.app) {
  let app = require('scripts/app');
  app.init();
} else {
  let action = require('scripts/action');
  action.init();
}