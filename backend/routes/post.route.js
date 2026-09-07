import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { addCommentSchema, addNewPostSchema, objectIdSchema } from '../dto/post.dto.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';
import validate, { validateParams } from '../middlewares/validator.js';

const postRouter = Router();

postRouter
  .route('/')
  .post(protect, upload.single('image'), validate(addNewPostSchema), postController.addNewPost)
  .get(protect, postController.getAllPosts);

postRouter.route('/userPost/all').get(protect, postController.getUserPost);
postRouter
  .route('/:id/like')
  .patch(protect, validateParams(objectIdSchema), postController.likeOrDislikePost);
postRouter
  .route('/:id/comment')
  .post(
    protect,
    validateParams(objectIdSchema),
    validate(addCommentSchema),
    postController.addCommentToPost,
  );
postRouter
  .route('/:id/comment/all')
  .get(protect, validateParams(objectIdSchema), postController.getCommentsForPost);
postRouter
  .route('/delete/:id')
  .delete(protect, validateParams(objectIdSchema), postController.deletePost);
postRouter
  .route('/:id/bookmark')
  .patch(protect, validateParams(objectIdSchema), postController.bookmarkPost);

export default postRouter;
