import { Comment } from '../models/comment.model.js';
import { Message } from '../models/message.model.js';
import { Notification } from '../models/notification.model.js';
import { Post } from '../models/post.model.js';
import { Story } from '../models/story.model.js';
import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import { getIO } from '../utils/socket.js';

const getDashboardStats = async (req, res) => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalPosts,
    totalStories,
    totalComments,
    totalMessages,
    totalNotifications,
    newUsersThisWeek,
    newPostsThisWeek,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Story.countDocuments(),
    Comment.countDocuments(),
    Message.countDocuments(),
    Notification.countDocuments(),
    User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    Post.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
  ]);

  const recentUsers = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(5);

  sendResponse(res, ApiResponse.ok('Admin stats retrieved successfully', {
    counts: {
      totalUsers,
      totalPosts,
      totalStories,
      totalComments,
      totalMessages,
      totalNotifications,
      newUsersThisWeek,
      newPostsThisWeek,
    },
    recentUsers,
  }));
};

const getAllUsers = async (req, res) => {
  const { q } = req.query;

  const filter = { _id: { $ne: req.user._id } };
  if (q) {
    filter.$or = [
      { username: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(200);

  sendResponse(res, ApiResponse.ok('Users retrieved successfully', users));
};

const toggleUserRole = async (req, res) => {
  const targetUserId = req.params.id;

  if (targetUserId === req.user._id.toString()) {
    throw APIError.badRequest('You cannot change your own role');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw APIError.notFound('User not found');
  }

  targetUser.role = targetUser.role === 'admin' ? 'user' : 'admin';
  await targetUser.save();

  const userObject = targetUser.toObject();
  delete userObject.password;

  sendResponse(
    res,
    ApiResponse.ok(
      `${targetUser.username} is now ${targetUser.role === 'admin' ? 'an admin' : 'a regular user'}`,
      userObject,
    ),
  );
};

const deleteUser = async (req, res) => {
  const targetUserId = req.params.id;

  if (targetUserId === req.user._id.toString()) {
    throw APIError.badRequest('You cannot delete your own account');
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw APIError.notFound('User not found');
  }

  await Promise.all([
    Post.deleteMany({ author: targetUserId }),
    Comment.deleteMany({ author: targetUserId }),
    Story.deleteMany({ author: targetUserId }),
    User.updateMany(
      { $or: [{ followers: targetUserId }, { following: targetUserId }] },
      { $pull: { followers: targetUserId, following: targetUserId } },
    ),
  ]);

  await User.findByIdAndDelete(targetUserId);

  sendResponse(res, ApiResponse.ok('User deleted successfully', null));
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username profilePicture email')
    .sort({ createdAt: -1 })
    .limit(200);
  sendResponse(res, ApiResponse.ok('Posts retrieved successfully', posts));
};

const deletePost = async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }

  await Post.findByIdAndDelete(postId);
  await User.findByIdAndUpdate(post.author, { $pull: { posts: postId } });
  await Comment.deleteMany({ post: postId });
  await Notification.deleteMany({ post: postId });

  const io = getIO();
  if (io) {
    io.emit('post:deleted', postId);
  }

  sendResponse(res, ApiResponse.ok('Post deleted successfully', null));
};

export { deletePost, deleteUser, getAllPosts, getAllUsers, getDashboardStats, toggleUserRole };