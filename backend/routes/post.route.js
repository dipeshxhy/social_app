import { Router } from 'express';

const postRouter = Router();
import * as postController from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.js';

postRouter
  .route('/')
  .post(protect, upload.single('image', postController.addNewPost))
  .get(protect, postController.getAllPosts);

postRouter.route('/userPost/all').get(protect, postController.getUserPost);
postRouter.route('/:id/like').get(protect, postController.likeOrDislikePost);
postRouter.route('/:id/comment').get(protect, postController.addCommentToPost);
postRouter.route('/:id/comment/all').get(protect, postController.getCommentsForPost);
postRouter.route('/:id/comment/all').get(protect, postController.getCommentsForPost);
postRouter.route('/delete/:id').delete(protect, postController.deletePost);
postRouter.route('/:id/bookmark').delete(protect, postController.bookmarkPost);

export default postRouter;
