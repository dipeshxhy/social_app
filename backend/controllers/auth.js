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

export { register };
