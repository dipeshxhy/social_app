import sharp from 'sharp';
import { Comment } from '../models/comment.model.js';
import { Notification } from '../models/notification.model.js';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import { getIO } from '../utils/socket.js';

const addNewPost = async (req, res) => {
  const { caption } = req.body;
  const image = req.file;

  if (!image) {
    throw APIError.badRequest('Image is required');
  }
  const authorId = req.user._id;
  // image optimization
  let optimizedImageBuffer;

  try {
    optimizedImageBuffer = await sharp(image.buffer)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw APIError.internalServerError('Error occurred while optimizing image');
  }
  // convert optimized image buffer to data uri
  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
  let cloudResponse;
  try {
    cloudResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'posts',
    });
  } catch (error) {
    throw APIError.internalServerError('Error occurred while uploading image to Cloudinary');
  }

  const newPost = await Post.create({
    caption,
    image: cloudResponse.secure_url,
    author: authorId,
  });
  const user = await User.findById(authorId);
  user.posts.push(newPost._id);
  await user.save();
  // populate the author field with user details
  await newPost.populate('author', '-password');

  const io = getIO();
  if (io) {
    io.emit('post:created', newPost);
  }
  const followers = await User.find({ following: authorId }).select('_id');
  if (followers.length > 0) {
    const notificationDocs = followers.map((follower) => ({
      recipient: follower._id,
      sender: authorId,
      type: 'post',
      message: `${user.username} shared a new post.`,
      link: `/profile?user=${authorId}`,
      post: newPost._id,
    }));
    const notifications = await Notification.insertMany(notificationDocs);
    if (io) {
      notifications.forEach((notification) => {
        io.to(String(notification.recipient)).emit('notification:created', notification);
      });
    }
  }

  sendResponse(res, ApiResponse.created('Post created successfully', newPost));
};

// get all post logic
const getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate('author', 'username profilePicture')
    .populate({
      path: 'comments',
      sort: {
        createdAt: -1,
      },
      populate: {
        path: 'author',
        select: 'username profilePicture',
      },
    })
    .sort({ createdAt: -1 });
  sendResponse(res, ApiResponse.ok('Posts retrieved successfully', posts));
};

const getUserPost = async (req, res) => {
  const post = await Post.find({ author: req.user._id })
    .populate('author', 'username profilePicture')
    .populate({
      path: 'comments',
      sort: {
        createdAt: -1,
      },
      populate: {
        path: 'author',
        select: 'username profilePicture',
      },
    })
    .sort({ createdAt: -1 });
  sendResponse(res, ApiResponse.ok('Posts retrieved successfully', post));
};

const likeOrDislikePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }

  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();

  const likedPost = await Post.findById(postId).populate('author', 'username profilePicture');
  const io = getIO();
  if (io) {
    io.emit('post:updated', likedPost);
  }
  if (!isLiked && post.author.toString() !== userId.toString()) {
    const notification = await Notification.create({
      recipient: post.author,
      sender: userId,
      type: 'like',
      message: `${req.user.username} liked your post.`,
      link: '/notifications',
      post: postId,
    });
    const io = getIO();
    if (io) {
      io.to(String(post.author)).emit('notification:created', notification);
    }
  }

  sendResponse(res, ApiResponse.ok('Post like status updated successfully', likedPost));
};

const addCommentToPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  const { text } = req.body;
  if (!text) {
    throw APIError.badRequest('Comment text is required');
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }

  const comment = await Comment.create({
    text,
    author: userId,
    post: postId,
  });
  await comment.populate('author', 'username profilePicture');
  await post.comments.push(comment._id);
  await post.save();

  const io = getIO();
  if (io) {
    io.emit('post:comment-added', { postId, comment });
  }

  if (post.author.toString() !== userId.toString()) {
    const notification = await Notification.create({
      recipient: post.author,
      sender: userId,
      type: 'comment',
      message: `${req.user.username} commented on your post.`,
      link: '/notifications',
      post: postId,
    });
    const io = getIO();
    if (io) {
      io.to(String(post.author)).emit('notification:created', notification);
    }
  }

  sendResponse(res, ApiResponse.created('Comment added successfully', comment));
};

const getCommentsForPost = async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }
  const comments = await Comment.find({ post: postId })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });
  if (!comments || comments.length === 0) {
    return sendResponse(res, ApiResponse.ok('No comments found for this post', []));
  }
  sendResponse(res, ApiResponse.ok('Comments retrieved successfully', comments));
};

// delete post logic
const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }

  if (post.author.toString() !== userId.toString()) {
    throw APIError.forbidden('You are not authorized to delete this post');
  }

  await Post.findByIdAndDelete(postId);
  await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
  await Comment.deleteMany({ post: postId });
  const io = getIO();
  if (io) {
    io.emit('post:deleted', postId);
  }
  sendResponse(res, ApiResponse.ok('Post deleted successfully', null));
};

const bookmarkPost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw APIError.notFound('Post not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw APIError.notFound('User not found');
  }

  const isBookmarked = user.bookmarks.includes(postId);
  if (isBookmarked) {
    await user.updateOne({ $pull: { bookmarks: postId } });
    return sendResponse(
      res,
      ApiResponse.ok('Post removed from bookmarks successfully', {
        type: 'unsaved',
        bookmarks: user.bookmarks,
      }),
    );
  } else {
    await user.updateOne({ $push: { bookmarks: postId } });
    return sendResponse(
      res,
      ApiResponse.ok('Post added to bookmarks successfully', {
        type: 'saved',
        bookmarks: user.bookmarks,
      }),
    );
  }
};

export {
  addCommentToPost,
  addNewPost,
  bookmarkPost,
  deletePost,
  getAllPosts,
  getCommentsForPost,
  getUserPost,
  likeOrDislikePost,
};
