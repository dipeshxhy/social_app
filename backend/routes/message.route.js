import { Router } from 'express';

const messageRouter = Router();
import * as messageController from '../controllers/message.controller.js';
import { messageParamsSchema, sendMessageSchema } from '../dto/message.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate, { validateParams } from '../middlewares/validator.js';

messageRouter
  .route('/send/:id')
  .post(
    protect,
    validateParams(messageParamsSchema),
    validate(sendMessageSchema),
    messageController.sendMessage,
  );
messageRouter
  .route('/all/:id')
  .get(protect, validateParams(messageParamsSchema), messageController.getMessages);

export default messageRouter;
