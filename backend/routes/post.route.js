import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';

const postRouter = Router();

postRouter
  .route('/')
  .post(protect, upload.single('image'), postController.addNewPost)
  .get(protect, postController.getAllPosts);

postRouter.route('/userPost/all').get(protect, postController.getUserPost);
postRouter.route('/:id/like').patch(protect, postController.likeOrDislikePost);
postRouter.route('/:id/comment').post(protect, postController.addCommentToPost);
postRouter.route('/:id/comment/all').get(protect, postController.getCommentsForPost);
postRouter.route('/delete/:id').delete(protect, postController.deletePost);
postRouter.route('/:id/bookmark').patch(protect, postController.bookmarkPost);

export default postRouter;
