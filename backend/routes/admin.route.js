import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { adminPostIdParamSchema, adminUserIdParamSchema } from '../dto/admin.dto.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validateParams } from '../middlewares/validator.js';

const adminRouter = Router();

adminRouter.use(protect, restrictTo('admin'));

adminRouter.route('/stats').get(adminController.getDashboardStats);
adminRouter.route('/users').get(adminController.getAllUsers);
adminRouter
  .route('/users/:id/role')
  .patch(validateParams(adminUserIdParamSchema), adminController.toggleUserRole);
adminRouter
  .route('/users/:id')
  .delete(validateParams(adminUserIdParamSchema), adminController.deleteUser);
adminRouter.route('/posts').get(adminController.getAllPosts);
adminRouter
  .route('/posts/:id')
  .delete(validateParams(adminPostIdParamSchema), adminController.deletePost);

export default adminRouter;