import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/dataUri.js';
import { getIO } from '../utils/socket.js';

const getProfile = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId)
    .populate('followers', 'username profilePicture bio')
    .populate('following', 'username profilePicture bio');
  if (!user) {
    throw APIError.notFound('User not found');
  }
  const userObject = user.toObject();
  delete userObject.password;
  sendResponse(res, ApiResponse.ok('Profile retrieved successfully', userObject));
};

// edit profile
const editProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw APIError.unauthorized('User not authenticated');
  }
  const { bio, gender } = req.body;
  const profilePicture = req.file;
  let cloudResponse;
  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await cloudinary.uploader.upload(fileUri);
  }
  if (cloudResponse?.secure_url) {
    user.profilePicture = cloudResponse.secure_url;
  }
  user.bio = bio || user.bio;
  user.gender = gender || user.gender;

  await user.save();
  await user.populate('followers', 'username profilePicture bio');
  await user.populate('following', 'username profilePicture bio');
  const userObject = user.toObject();
  delete userObject.password;
  sendResponse(res, ApiResponse.ok('Profile updated successfully', userObject));
};

// suggested user logic
const getSuggestedUsers = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw APIError.unauthorized('User not authenticated');
  }
  const suggestedUsers = await User.find({ _id: { $ne: user._id } })
    .select('-password')
    .limit(10);
  if (!suggestedUsers || suggestedUsers.length === 0) {
    throw APIError.notFound('currently do not have any users');
  }

  sendResponse(res, ApiResponse.ok('Suggested users retrieved successfully', suggestedUsers));
};

// follow and unfollow logic
const followOrUnfollowUser = async (req, res) => {
  const userIdToFollow = req.params.id;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw APIError.unauthorized('User not authenticated');
  }

  if (user._id.toString() === userIdToFollow) {
    throw APIError.badRequest('You cannot follow yourself');
  }

  const userToFollow = await User.findById(userIdToFollow);
  if (!userToFollow) {
    throw APIError.notFound('User to follow not found');
  }

  // Check if already following
  if (user.following.includes(userIdToFollow)) {
    await Promise.all([
      User.updateOne({ _id: user._id }, { $pull: { following: userIdToFollow } }),
    ]);
    await Promise.all([
      User.updateOne({ _id: userIdToFollow }, { $pull: { followers: user._id } }),
    ]);
    return sendResponse(res, ApiResponse.ok(`You have unfollowed ${userToFollow.username}`, null));
  }

  // Add to following and followers
  await Promise.all([
    User.updateOne({ _id: user._id }, { $push: { following: userIdToFollow } }),
    User.updateOne({ _id: userIdToFollow }, { $push: { followers: user._id } }),
  ]);

  const notification = await Notification.create({
    recipient: userIdToFollow,
    sender: user._id,
    type: 'follow',
    message: `${user.username} started following you.`,
    link: `/profile?user=${user._id}`,
  });

  const io = getIO();
  if (io) {
    io.to(String(userIdToFollow)).emit('notification:created', notification);
  }

  sendResponse(res, ApiResponse.ok(`You are now following ${userToFollow.username}`, null));
};

export { editProfile, followOrUnfollowUser, getProfile, getSuggestedUsers };
