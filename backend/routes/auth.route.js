import { Router } from 'express';

const authRouter = Router();
import * as authController from '../controllers/auth.js';
import validate from '../middlewares/validator.js';
import { registerUserSchema } from '../dto/auth.dto.js';

authRouter.route('/register').post(validate(registerUserSchema), authController.register);
export default authRouter;
