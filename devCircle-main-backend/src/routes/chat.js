const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const Notification = require("../models/notification");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    let hasSeenUpdates = false;
    let unreadCount = 0;
    chat.messages.forEach((message) => {
      if (message.senderId._id.toString() === targetUserId && !message.isSeen) {
        unreadCount += 1;
        message.isSeen = true;
        hasSeenUpdates = true;
      }
    });

    if (hasSeenUpdates) {
      await chat.save();
    }

    await Notification.findOneAndUpdate(
      {
        receiverId: userId,
        senderId: targetUserId,
      },
      {
        $set: {
          isRead: true,
          unreadCount: 0,
        },
      }
    );

    const chatData = chat.toJSON();
    res.json({ ...chatData, unreadCount });
  } catch (err) {
    console.error(err);
  }
});

module.exports = chatRouter;
// this is chats.js
