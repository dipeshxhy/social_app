import sharp from 'sharp';
import { Notification } from '../models/notification.model.js';
import { Story } from '../models/story.model.js';
import { User } from '../models/user.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import { getIO } from '../utils/socket.js';

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

const addStory = async (req, res) => {
  const image = req.file;
  if (!image) {
    throw APIError.badRequest('Image is required');
  }
  const authorId = req.user._id;

  let optimizedImageBuffer;
  try {
    optimizedImageBuffer = await sharp(image.buffer)
      .resize(1080, 1920, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw APIError.internal('Error occurred while optimizing image');
  }

  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
  let cloudResponse;
  try {
    cloudResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'stories',
    });
  } catch (error) {
    throw APIError.internal('Error occurred while uploading image to Cloudinary');
  }

  const story = await Story.create({
    image: cloudResponse.secure_url,
    author: authorId,
  });
  await story.populate('author', 'username profilePicture');

  const io = getIO();
  if (io) {
    io.emit('story:created', story);
  }

  const followers = await User.find({ following: authorId }).select('_id');
  if (followers.length > 0) {
    const notificationDocs = followers.map((follower) => ({
      recipient: follower._id,
      sender: authorId,
      type: 'post',
      message: `${req.user.username} added a new story.`,
      link: '/',
    }));
    const notifications = await Notification.insertMany(notificationDocs);
    if (io) {
      notifications.forEach((notification) => {
        io.to(String(notification.recipient)).emit('notification:created', notification);
      });
    }
  }

  sendResponse(res, ApiResponse.created('Story created successfully', story));
};

const getAllStories = async (req, res) => {
  const cutoff = new Date(Date.now() - STORY_TTL_MS);

  const stories = await Story.find({ createdAt: { $gte: cutoff } })
    .populate('author', 'username profilePicture')
    .sort({ createdAt: -1 });

  sendResponse(res, ApiResponse.ok('Stories retrieved successfully', stories));
};

const markStoryViewed = async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) {
    throw APIError.notFound('Story not found');
  }

  if (!story.viewers.includes(userId)) {
    story.viewers.push(userId);
    await story.save();
  }

  sendResponse(res, ApiResponse.ok('Story marked as viewed', story));
};

const deleteStory = async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user._id;

  const story = await Story.findById(storyId);
  if (!story) {
    throw APIError.notFound('Story not found');
  }
  if (story.author.toString() !== userId.toString()) {
    throw APIError.forbidden('You are not authorized to delete this story');
  }

  await Story.findByIdAndDelete(storyId);

  const io = getIO();
  if (io) {
    io.emit('story:deleted', storyId);
  }

  sendResponse(res, ApiResponse.ok('Story deleted successfully', null));
};

export { addStory, deleteStory, getAllStories, markStoryViewed };