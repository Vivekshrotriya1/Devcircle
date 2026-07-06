import { createSlice } from "@reduxjs/toolkit";

const getNotificationSenderId = (notification) => {
  const sender = notification?.senderId;
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  if (sender._id) return sender._id;
  if (sender.$oid) return sender.$oid;
  return sender.toString();
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    setNotifications: (state, action) => action.payload || [],
    upsertNotification: (state, action) => {
      const notification = action.payload;
      if (!notification) return state;

      const filteredNotifications = state.filter(
        (currentNotification) =>
          currentNotification._id !== notification._id &&
          currentNotification.dedupeKey !== notification.dedupeKey
      );

      return [notification, ...filteredNotifications];
    },
    markNotificationRead: (state, action) => {
      const senderUserId = action.payload;

      return state.map((notification) =>
        getNotificationSenderId(notification) === senderUserId
          ? { ...notification, isRead: true, unreadCount: 0 }
          : notification
      );
    },
    markNotificationReadById: (state, action) => {
      const notificationId = action.payload;

      return state.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true, unreadCount: 0 }
          : notification
      );
    },
    clearNotifications: () => [],
  },
});

export const {
  setNotifications,
  upsertNotification,
  markNotificationRead,
  markNotificationReadById,
  clearNotifications,
} = notificationSlice.actions;

export { getNotificationSenderId };

export default notificationSlice.reducer;
