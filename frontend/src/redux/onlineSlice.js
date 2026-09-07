import { createSlice } from '@reduxjs/toolkit';

const onlineSlice = createSlice({
  name: 'online',
  initialState: {
    users: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.users = action.payload;
    },
    setUserOnline: (state, action) => {
      const id = String(action.payload);
      if (id && !state.users.includes(id)) {
        state.users.push(id);
      }
    },
    setUserOffline: (state, action) => {
      const id = String(action.payload);
      state.users = state.users.filter((userId) => userId !== id);
    },
  },
});

export const { setOnlineUsers, setUserOnline, setUserOffline } = onlineSlice.actions;
export default onlineSlice.reducer;