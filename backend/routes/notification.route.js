import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const notificationRouter = Router();

notificationRouter.route('/').get(protect, notificationController.getMyNotifications);
notificationRouter.route('/clear').delete(protect, notificationController.clearNotifications);
notificationRouter.route('/:id/read').patch(protect, notificationController.markNotificationRead);

export default notificationRouter;
