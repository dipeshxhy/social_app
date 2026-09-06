import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const userRouter = Router();
userRouter.route('/:id').get(userController.getProfile);

export default userRouter;
