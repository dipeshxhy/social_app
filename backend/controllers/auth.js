import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const register = async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw APIError.conflict('User with this email already exists');
  }
  const user = await User.create({ username, email, password });
  const userObject = user.toObject();
  delete userObject.password;
  ApiResponse.created('User registered successfully', userObject);
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw APIError.unauthorized('Invalid email or password');
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw APIError.unauthorized('Invalid email or password');
  }
  const userObject = user.toObject();
  delete userObject.password;
  const token = user.generateJWT();
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: 'strict', // Adjust based on your frontend domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  ApiResponse.ok(`welcome back, ${userObject.username}!`, userObject);
};
const logout = async (_, res) => {
  res.clearCookie('token', '', {
    maxAge: 0,
  });
  ApiResponse.ok('You have been logged out successfully', null);
};

export { register, login, logout };
