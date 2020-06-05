'use strict';

const lodash = require("lodash");

let config = {};
config.production = {
  redis: {
    "pwd": "69qqq4f5w64fwf",
    "database": "0",
    "host": "127.0.0.1",
    "port": "6379",
  },
}
// configuration for running tests
config.test = lodash.merge({}, config.production);
config.test.redis.database = "15";
module.exports = config;
