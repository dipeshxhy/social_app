import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw APIError.unauthorized('You are not logged in! Please log in to get access.');
  }
  try {
    // Verify token and get user data
    const decoded = await User.verifyJWT(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw APIError.unauthorized('The user belonging to this token no longer exists.');
    }
    const userObject = await user.toObject();
    delete userObject.password;

    req.user = userObject;
    next();
  } catch (err) {
    throw APIError.unauthorized('Invalid token or expired token. Please log in again.');
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw APIError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};
export { protect, restrictTo };
