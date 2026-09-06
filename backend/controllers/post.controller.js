import sharp from 'sharp';
import { ApiResponse, sendResponse } from '../utils/apiResponse.js';
import cloudinary from '../utils/cloudinary.js';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';

const addNewPost = async (req, res) => {
  const { caption } = req.body;
  const image = req.file;

  if (!image) {
    throw APIError.badRequest('Image is required');
  }
  const authorId = req.user._id;
  // image optimization
  let optimizedImageBuffer;

  try {
    optimizedImageBuffer = await sharp(image.buffer)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw APIError.internalServerError('Error occurred while optimizing image');
  }
  // convert optimized image buffer to data uri
  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
  let cloudResponse;
  try {
    cloudResponse = await cloudinary.uploader.upload(fileUri, {
      folder: 'posts',
    });
  } catch (error) {
    throw APIError.internalServerError('Error occurred while uploading image to Cloudinary');
  }

  const newPost = await Post.create({
    caption,
    image: cloudResponse.secure_url,
    author: authorId,
  });
  const user = await User.findById(authorId);
  user.posts.push(newPost._id);
  await user.save();
  // populate the author field with user details
  await newPost.populate('author', '-password');
  sendResponse(res, ApiResponse.created('Post created successfully', newPost));
};

export { addNewPost };
