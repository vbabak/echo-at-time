'use strict';

const errorMessages = require("../config/error-messages");
const ApplicationError = require("./application-error");
function requiredProperties(data, properties_list) {
  if (typeof data != "object") {
    throw new ApplicationError(errorMessages.PAYLOAD_INCORRECT, 400);
  }
  for (let prop of properties_list) {
    if (!(prop in data)) {
      throw new ApplicationError(errorMessages.PAYLOAD_PARAMETER_MISSING(prop), 400);
    }
  }
}

module.exports = requiredProperties;
