const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["message", "connection_request", "request_accepted", "premium"],
      required: true,
      default: "message",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionUrl: {
      type: String,
      default: "",
      trim: true,
    },
    dedupeKey: {
      type: String,
      required: true,
    },
    latestMessage: {
      type: String,
      default: "",
      trim: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiverId: 1, dedupeKey: 1 }, { unique: true });
notificationSchema.index({ receiverId: 1, isRead: 1, lastMessageAt: -1 });

notificationSchema.statics.prepareIndexes = async function () {
  await this.collection.updateMany(
    { dedupeKey: { $exists: false } },
    [
      {
        $set: {
          type: { $ifNull: ["$type", "message"] },
          title: { $ifNull: ["$title", "New message"] },
          message: { $ifNull: ["$message", "$latestMessage"] },
          actionUrl: {
            $ifNull: [
              "$actionUrl",
              {
                $cond: [
                  { $ne: ["$senderId", null] },
                  { $concat: ["/chat/", { $toString: "$senderId" }] },
                  "",
                ],
              },
            ],
          },
          dedupeKey: {
            $cond: [
              { $ne: ["$senderId", null] },
              { $concat: ["message:", { $toString: "$senderId" }] },
              { $concat: ["notification:", { $toString: "$_id" }] },
            ],
          },
        },
      },
    ]
  );

  try {
    await this.collection.dropIndex("receiverId_1_senderId_1");
  } catch (err) {
    if (err.codeName !== "IndexNotFound" && err.code !== 27) {
      throw err;
    }
  }

  await this.syncIndexes();
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
