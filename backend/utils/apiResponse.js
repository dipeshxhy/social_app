import { StatusCodes } from 'http-status-codes';
class ApiResponse {
  constructor(message, data, statusCode) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
  static created(message, data) {
    return new ApiResponse(message, data, StatusCodes.CREATED);
  }
  static ok(message, data) {
    return new ApiResponse(message, data, StatusCodes.OK);
  }
  static conflict(message) {
    return new APIError(message, StatusCodes.CONFLICT);
  }
  static noContent(message, data) {
    return new ApiResponse(message, data, StatusCodes.NO_CONTENT);
  }
}
const sendResponse = (res, apiResponse) => {
  res.status(apiResponse.statusCode).json({
    success: apiResponse.success,
    message: apiResponse.message,
    data: apiResponse.data,
  });
};
export { ApiResponse, sendResponse };
