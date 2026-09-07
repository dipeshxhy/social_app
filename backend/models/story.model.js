import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Story = mongoose.model('Story', storySchema);