"use strict";

const ValidatorBase = require("./validator.base");
const errorMessages = require("../../config/error-messages");
const ApplicationError = require("../application-error");

class TimeValidator extends ValidatorBase {
  static validate(v) {
    let d;
    try {
      d = new Date(v);
    } catch (e) {
      throw new ApplicationError(errorMessages.TIME_NOT_MICROSEC, 400);
    }
    if (d.toString() == "Invalid Date") {
      throw new ApplicationError(errorMessages.TIME_NOT_MICROSEC, 400);
    }
    let currdate = new Date();
    if (d.getFullYear() < currdate.getFullYear()) {
      throw new ApplicationError(errorMessages.TIME_NOT_MICROSEC, 400);
    }
  }
}

module.exports = TimeValidator;
