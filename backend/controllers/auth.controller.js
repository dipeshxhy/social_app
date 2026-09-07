import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';

// 1. Account Registration
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // ⚡ Safely intercepted inside the local catch block below
      throw APIError.conflict('User with this email already exists');
    }

    const user = await User.create({ username, email, password });

    const userObject = user.toObject();
    delete userObject.password;

    sendResponse(res, ApiResponse.created('User registered successfully', userObject));
  } catch (error) {
    // ⚡ Rethrowing forces the exception up to your global APIError interceptor layer
    throw error;
  }
};

// 2. Authentication Flow
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw APIError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw APIError.unauthorized('Invalid email or password');
    }

    const token = user.generateJWT();

    // High-security Cross-Domain Production Cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ⚡ FIX: Removed the unused, crash-prone asynchronous loop completely

    const userObject = user.toObject();
    delete userObject.password;

    sendResponse(res, ApiResponse.ok(`Welcome back, ${userObject.username}!`, userObject));
  } catch (error) {
    throw error;
  }
};

// 3. Clean Cross-Site Cookie Erasure
const logout = async (_, res) => {
  try {
    // ⚡ FIX: Supplied identical cross-domain markers to force browsers to drop the token completely
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    sendResponse(res, ApiResponse.ok('You have been logged out successfully', null));
  } catch (error) {
    throw error;
  }
};

// 4. Session State Reader
const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw APIError.unauthorized('User not authenticated');
    }

    sendResponse(res, ApiResponse.ok('Profile retrieved successfully', user));
  } catch (error) {
    throw error;
  }
};

export { getMe, login, logout, register };
