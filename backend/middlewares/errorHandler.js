import { StatusCodes } from 'http-status-codes';
import APIError from '../utils/apiError.js';

const sendErrorResponse = (res, statusCode, message, stack) => {
  res.status(statusCode).json({
    success: false,
    msg: message,
    ...(process.env.NODE_ENV === 'development' && { stack }),
  });
};

export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong, try again later';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);

    statusCode = StatusCodes.BAD_REQUEST;
    message = messages.join(', ');
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = StatusCodes.NOT_FOUND;
    message = `Resource not found with id of ${err.value}`;
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const pattern = /index:\s+([a-zA-Z0-9_]+)_1/;
    const match = err.message.match(pattern);

    if (match) {
      const fieldName = match[1];

      message = `Duplicate value for field '${fieldName}' entered, please choose another value`;
    } else {
      message = 'Duplicate field value entered';
    }

    statusCode = StatusCodes.BAD_REQUEST;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token, please login again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired, please login again';
  }

  // Your custom APIError
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  sendErrorResponse(res, statusCode, message, err.stack);
};
