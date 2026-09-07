import { createSlice } from '@reduxjs/toolkit';
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
  },
  reducers: {
    // action
    setAuthUser: (state, action) => {
      console.log(action.payload);
      state.user = action.payload;
    },
  },
});
export const { setAuthUser } = authSlice.actions;
export default authSlice.reducer;
