import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';

// 1. Register a New Account Engine Block
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(APIError.conflict('User with this email already exists'));
    }

    const user = await User.create({ username, email, password });

    const userObject = user.toObject();
    delete userObject.password;

    return sendResponse(res, ApiResponse.created('User registered successfully', userObject));
  } catch (error) {
    return next(error);
  }
};

// 2. Process Credentials Authentication Flow
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly populate their posts if your frontend requires it immediately
    const user = await User.findOne({ email }).populate('posts');
    if (!user) {
      return next(APIError.unauthorized('Invalid email or password'));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(APIError.unauthorized('Invalid email or password'));
    }

    const token = user.generateJWT();

    // ⚡ Bulletproof Production Cookie parameters matching Vercel/Render layers
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userObject = user.toObject();
    delete userObject.password;

    return sendResponse(res, ApiResponse.ok(`Welcome back, ${userObject.username}!`, userObject));
  } catch (error) {
    return next(error);
  }
};

// 3. Terminate Active User Storage Session
export const logout = async (req, res, next) => {
  try {
    // ⚡ MUST mirror initialization parameters precisely to clear properly across domains
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return sendResponse(res, ApiResponse.ok('You have been logged out successfully', null));
  } catch (error) {
    return next(error);
  }
};

// 4. Scrape Verified Session Parameters
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(APIError.unauthorized('User not authenticated'));
    }

    return sendResponse(res, ApiResponse.ok('Profile retrieved successfully', user));
  } catch (error) {
    return next(error);
  }
};
