import { StatusCodes } from 'http-status-codes';
class ApiResponse {
  constructor(msg, data, statusCode) {
    this.success = true;
    this.msg = msg;
    this.data = data;
    this.statusCode = statusCode;
  }
  static created(msg, data) {
    return new ApiResponse(msg, data, StatusCodes.CREATED);
  }
  static ok(msg, data) {
    return new ApiResponse(msg, data, StatusCodes.OK);
  }
  static noContent(msg, data) {
    return new ApiResponse(msg, data, StatusCodes.NO_CONTENT);
  }
}
const sendResponse = (res, apiResponse) => {
  res.status(apiResponse.statusCode).json({
    success: apiResponse.success,
    msg: apiResponse.msg,
    data: apiResponse.data,
  });
};
export { ApiResponse, sendResponse };
