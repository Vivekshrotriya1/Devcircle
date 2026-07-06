const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Notification = require("../models/notification");

const notificationRouter = express.Router();

notificationRouter.get("/notifications", userAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiverId: req.user._id,
    })
      .populate("senderId", "firstName lastName photoUrl")
      .sort({ lastMessageAt: -1 });

    res.json({ data: notifications });
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

notificationRouter.patch(
  "/notifications/read/:senderUserId",
  userAuth,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          receiverId: req.user._id,
          senderId: req.params.senderUserId,
          type: "message",
        },
        {
          $set: {
            isRead: true,
            unreadCount: 0,
          },
        },
        { new: true }
      );

      res.json({ data: notification });
    } catch (err) {
      res.status(500).send("ERROR: " + err.message);
    }
  }
);

notificationRouter.patch(
  "/notifications/read-by-id/:notificationId",
  userAuth,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.notificationId,
          receiverId: req.user._id,
        },
        {
          $set: {
            isRead: true,
            unreadCount: 0,
          },
        },
        { new: true }
      ).populate("senderId", "firstName lastName photoUrl");

      res.json({ data: notification });
    } catch (err) {
      res.status(500).send("ERROR: " + err.message);
    }
  }
);

module.exports = notificationRouter;
