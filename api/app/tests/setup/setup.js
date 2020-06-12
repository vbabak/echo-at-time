'use strict';
const errorMessages = require("../../config/error-messages");
const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV !== "test") {
  throw new Error(errorMessages.NOT_A_TEST_ENV);
}

const dbconfig = require("../../config/database")[NODE_ENV];
const REDIS_TEST_DB_NAME = dbconfig.redis.database;

if (REDIS_TEST_DB_NAME == "0") {
  throw new Error(errorMessages.REDIS_NOT_A_TEST_DB);
}

const app = require('../../app');

async function setup() {
  await app.context.dbredis.cmd("flushdb");
  await app.context.dbredis.quit();
}

module.exports = setup;
