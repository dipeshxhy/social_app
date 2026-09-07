import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: [],
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((post) => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = {
          ...state.posts[index],
          ...updatedPost,
        };
      }
    },
    appendComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find((item) => item._id === postId);
      if (post) {
        post.comments = [comment, ...(post.comments || [])];
      }
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
  },
});

export const { addPost, appendComment, removePost, setPosts, updatePost } = postSlice.actions;
export default postSlice.reducer;
