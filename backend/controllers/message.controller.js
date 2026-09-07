// for chatting

import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { sendResponse } from '../utils/apiResponse.js';

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
  await Promise.all([conversation.save(), newMessage.save()]);
  // socket.io for real time data

  sendResponse(res, ApiResponse.created('Message sent successfully', newMessage));
};

const getMessages = async (req, res) => {
  const receiverId = req.params.id;
  const senderId = req.user._id;

  const conversation = await Conversation.find({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    return sendResponse(res, ApiResponse.ok('No messages found', []));
  }

  // Check if the user is a participant in the conversation
  if (!conversation.participants.includes(senderId)) {
    throw APIError.forbidden('You are not a participant in this conversation');
  }

  sendResponse(res, ApiResponse.ok('Messages retrieved successfully', conversation.messages));
};

export { sendMessage, getMessages };
