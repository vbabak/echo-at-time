'use strict'

let errorMessages = {};
errorMessages.NOT_A_TEST_ENV = "Tests must be started in 'test' environment";
errorMessages.REDIS_NOT_A_TEST_DB = "Set non-default '0' database for 'redis' to run tests";
errorMessages.PAYLOAD_INCORRECT = "incorrect payload";
errorMessages.PAYLOAD_PARAMETER_MISSING = p => `"${p}" is required`;
errorMessages.TIME_NOT_MICROSEC = '"time" must be in microsec';
errorMessages.MESSAGE_EXCEEDS_LIMIT = l => `'"message" exceeds limit of ${l}`;

module.exports = errorMessages;
