import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { loginUserSchema, registerUserSchema } from '../dto/auth.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validator.js';

const authRouter = Router();

authRouter.route('/register').post(validate(registerUserSchema), authController.register);
authRouter.route('/login').post(validate(loginUserSchema), authController.login);
authRouter.route('/logout').post(protect, authController.logout);
authRouter.route('/me').get(protect, authController.getMe);
export default authRouter;
