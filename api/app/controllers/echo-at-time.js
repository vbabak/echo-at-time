'use strict'

const requiredProperties = require("../helpers/required-properties");
const EchoMessageStorage = require('../helpers/storage/echo-message-storage');
const TimeValidator = require('../helpers/validators/time');
const MessageValidator = require('../helpers/validators/message');

let EchoAtTimeController = {};

EchoAtTimeController.create = async function(ctx, next) {
  let redisClient = ctx.dbredis;
  let data = ctx.request.body;
  requiredProperties(data, ["time", "message"]);

  let time = parseInt(data.time);
  TimeValidator.validate(time);

  let message = data.message;
  MessageValidator.validate(message);

  let storage = new EchoMessageStorage(redisClient);
  let result = await storage.save(time, message);

  let resp = { success: result };
  ctx.body = resp;
  ctx.status = 201;
};

module.exports = EchoAtTimeController;
