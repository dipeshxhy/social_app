import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { notificationParamsSchema } from '../dto/notification.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateParams } from '../middlewares/validator.js';

const notificationRouter = Router();

notificationRouter.route('/').get(protect, notificationController.getMyNotifications);
notificationRouter.route('/clear').delete(protect, notificationController.clearNotifications);
notificationRouter
  .route('/:id/read')
  .patch(
    protect,
    validateParams(notificationParamsSchema),
    notificationController.markNotificationRead,
  );

export default notificationRouter;
