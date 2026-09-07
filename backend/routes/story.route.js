import { Router } from 'express';
import * as storyController from '../controllers/story.controller.js';
import { storyParamsSchema } from '../dto/story.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';
import { validateParams } from '../middlewares/validator.js';

const storyRouter = Router();

storyRouter
  .route('/')
  .post(protect, upload.single('image'), storyController.addStory)
  .get(protect, storyController.getAllStories);

storyRouter
  .route('/:id/view')
  .patch(protect, validateParams(storyParamsSchema), storyController.markStoryViewed);
storyRouter
  .route('/:id')
  .delete(protect, validateParams(storyParamsSchema), storyController.deleteStory);

export default storyRouter;