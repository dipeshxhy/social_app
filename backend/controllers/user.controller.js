import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/dataUri';

const getProfile = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    throw APIError.notFound('User not found');
  }
  const userObject = user.toObject();
  delete userObject.password;
  ApiResponse.ok('User profile retrieved successfully', userObject);
};

// edit profile
const editProfile = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw APIError.unauthorized('User not authenticated');
  }
  const { bio, gender } = req.body;
  const profilePicture = req.file;
  let cloudResponse;
  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await cloudinary.uploader.upload(fileUri);
  }
  user.profilePicture = cloudResponse.secure_url || user.profilePicture;
  user.bio = bio || user.bio;
  user.gender = gender || user.gender;
  await user.save();
  const userObject = user.toObject();
  delete userObject.password;
  ApiResponse.ok('Profile updated successfully', userObject);
};

export { getProfile, editProfile };
