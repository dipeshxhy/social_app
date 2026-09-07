import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    messageUnreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload.map((item) => ({
        ...item,
        id: item.id || item._id,
      }));
    },
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.items = state.items.slice(0, 50);
    },
    markAllNotificationsRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        read: true,
      }));
    },
    incrementMessageUnreadCount: (state) => {
      state.messageUnreadCount += 1;
    },
    clearMessageUnreadCount: (state) => {
      state.messageUnreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  clearNotifications,
  clearMessageUnreadCount,
  incrementMessageUnreadCount,
  markAllNotificationsRead,
  setNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
