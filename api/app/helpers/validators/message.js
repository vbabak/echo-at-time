"use strict";

const ValidatorBase = require("./validator.base");
const errorMessages = require("../../config/error-messages");
const ApplicationError = require("../application-error");

class MessageValidator extends ValidatorBase {
  validate(v) {
    let s = new String(v);
    let limit = 2048;
    if (s.length > limit) {
      throw new ApplicationError(errorMessages.MESSAGE_EXCEEDS_LIMIT(limit));
    }
  }
}

module.exports = MessageValidator;
