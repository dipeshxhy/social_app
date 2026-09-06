import { StatusCodes } from 'http-status-codes';
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
  }
  static badRequest(message) {
    return new APIError(message, StatusCodes.BAD_REQUEST);
  }
  static conflict(message) {
    return new APIError(message, StatusCodes.CONFLICT);
  }
  static notFound(message) {
    return new APIError(message, StatusCodes.NOT_FOUND);
  }
  static unauthorized(message) {
    return new APIError(message, StatusCodes.UNAUTHORIZED);
  }
  static forbidden(message) {
    return new APIError(message, StatusCodes.FORBIDDEN);
  }

  static internal(message) {
    return new APIError(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default APIError;
