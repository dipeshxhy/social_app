// for chatting

import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { Notification } from '../models/notification.model.js';
import APIError from '../utils/apiError.js';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import { getIO } from '../utils/socket.js';

const sendMessage = async (req, res) => {
  const receiverId = req.params.id;
  const { message } = req.body;
  const senderId = req.user._id;

  // Validate input
  if (!receiverId || !message) {
    throw APIError.badRequest('Receiver ID and message are required');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      messages: [],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  conversation.messages.push(newMessage._id);
  await conversation.save();

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('senderId', 'username profilePicture')
    .populate('receiverId', 'username profilePicture');

  const notification = await Notification.create({
    recipient: receiverId,
    sender: senderId,
    type: 'message',
    message: `${req.user.username} sent you a message.`,
    link: '/messages',
    conversation: conversation._id,
  });

  const io = getIO();
  if (io) {
    io.to(String(senderId)).emit('message:created', populatedMessage);
    io.to(String(receiverId)).emit('message:created', populatedMessage);
    io.to(String(receiverId)).emit('notification:created', notification);
  }

  sendResponse(res, ApiResponse.created('Message sent successfully', populatedMessage));
};

const getMessages = async (req, res) => {
  const receiverId = req.params.id;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate({
    path: 'messages',
    populate: [
      { path: 'senderId', select: 'username profilePicture' },
      { path: 'receiverId', select: 'username profilePicture' },
    ],
    options: { sort: { createdAt: 1 } },
  });
  if (!conversation) {
    return sendResponse(res, ApiResponse.ok('No messages found', []));
  }

  sendResponse(res, ApiResponse.ok('Messages retrieved successfully', conversation.messages));
};

export { getMessages, sendMessage };
