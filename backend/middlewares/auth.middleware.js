import User from '../../modules/user/user.model.js';
import APIError from '../utils/apiError.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    throw APIError.unAuthorized('You are not logged in! Please log in to get access.');
  }
  try {
    // Verify token and get user data
    const decoded = User.verifyJWT(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw APIError.unAuthorized('The user belonging to this token no longer exists.');
    }
    if (user.changedPasswordAfter(decoded.iat)) {
      throw APIError.unAuthorized('User recently changed password! Please log in again.');
    }
    const userObject = user.toObject();
    delete userObject.password; // Remove password from user object
    req.user = userObject; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    throw APIError.unAuthorized('Invalid token or expired token. Please log in again.');
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw APIError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};
export { protect, restrictTo };
