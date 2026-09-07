import { Notification } from '../models/notification.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';

const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: -1 });

  sendResponse(res, ApiResponse.ok('Notifications retrieved successfully', notifications));
};

const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    throw APIError.notFound('Notification not found');
  }

  sendResponse(res, ApiResponse.ok('Notification marked as read', notification));
};

const clearNotifications = async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  sendResponse(res, ApiResponse.ok('Notifications cleared successfully', []));
};

export { clearNotifications, getMyNotifications, markNotificationRead };
