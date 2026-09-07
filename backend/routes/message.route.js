import { Router } from 'express';

const messageRouter = Router();
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

messageRouter.route('/send/:id').post(protect, messageController.sendMessage);
messageRouter.route('/all/:id').get(protect, messageController.getMessages);

export default messageRouter;
