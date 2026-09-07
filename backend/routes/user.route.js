import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { editUserSchema, userIdParamsSchema } from '../dto/user.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';
import validate, { validateParams } from '../middlewares/validator.js';

const userRouter = Router();
userRouter.route('/suggested').get(protect, userController.getSuggestedUsers);
userRouter.route('/online').get(protect, userController.getOnlineUsers);
userRouter
  .route('/:id')
  .get(protect, validateParams(userIdParamsSchema), userController.getProfile);
userRouter
  .route('/profile/edit')
  .patch(
    protect,
    upload.single('profilePicture'),
    validate(editUserSchema),
    userController.editProfile,
  );
userRouter
  .route('/:id/followorunfollow')
  .post(protect, validateParams(userIdParamsSchema), userController.followOrUnfollowUser);

export default userRouter;
