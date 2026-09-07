import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { editUserSchema } from '../dto/user.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';
import validate from '../middlewares/validator.js';

const userRouter = Router();
userRouter.route('/suggested').get(protect, userController.getSuggestedUsers);
userRouter.route('/:id').get(protect, userController.getProfile);
userRouter
  .route('/profile/edit')
  .patch(
    protect,
    upload.single('profilePicture'),
    validate(editUserSchema),
    userController.editProfile,
  );
userRouter.route('/:id/followorunfollow').post(protect, userController.followOrUnfollowUser);

export default userRouter;
