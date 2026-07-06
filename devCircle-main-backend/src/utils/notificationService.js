const Notification = require("../models/notification");

const populateNotification = (query) =>
  query.populate("senderId", "firstName lastName photoUrl");

const emitNotification = (receiverId, notification) => {
  const { getIO } = require("./socket");
  const io = getIO();
  if (io) {
    io.to(receiverId.toString()).emit("notificationReceived", notification);
  }
};

const createNotification = async ({
  receiverId,
  senderId = null,
  type,
  title,
  message,
  actionUrl = "",
  dedupeKey,
  latestMessage = "",
  incrementUnread = false,
  lastMessageAt = new Date(),
}) => {
  const update = {
    $set: {
      senderId,
      type,
      title,
      message,
      actionUrl,
      latestMessage,
      isRead: false,
      lastMessageAt,
    },
    $setOnInsert: {
      receiverId,
      dedupeKey,
    },
  };

  if (incrementUnread) {
    update.$inc = { unreadCount: 1 };
  } else {
    update.$set.unreadCount = 1;
  }

  const notification = await populateNotification(
    Notification.findOneAndUpdate({ receiverId, dedupeKey }, update, {
      upsert: true,
      new: true,
    })
  );

  emitNotification(receiverId, notification);
  return notification;
};

module.exports = {
  createNotification,
};
