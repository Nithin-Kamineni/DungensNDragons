"use strict";
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
class BaseError extends Error {
  constructor(errorCode, parentError, customMessage, httpErrorCode) {
    super(errorCode, { cause: parentError });
    this.errorCode = errorCode;
    this.parentError = parentError;
    this.customMessage = customMessage;
    this.httpErrorCode = httpErrorCode;
    Error.captureStackTrace(this);
  }
  getErrorResponseObject = () => {
    return { error_code: this.errorCode, message: this.customMessage };
  };

  respondWithError = (resp) => {
    resp.status(this.httpErrorCode || StatusCodes.INTERNAL_SERVER_ERROR).send(this.getErrorResponseObject());
  };
}

module.exports = BaseError;
