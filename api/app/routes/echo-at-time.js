'use strict'

const EchoAtTimeController = require("../controllers/echo-at-time");

module.exports = function(router) {
  router.post('/echoAtTime', EchoAtTimeController.create);
};
