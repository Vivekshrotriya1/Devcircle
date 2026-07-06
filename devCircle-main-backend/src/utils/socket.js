const { Server } = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Chat } = require("../models/chat");
const User = require("../models/user");
const { createNotification } = require("./notificationService");

let ioInstance = null;

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const isUserInRoom = async (io, roomId, userId) => {
  const sockets = await io.in(roomId).fetchSockets();
  return sockets.some((roomSocket) => roomSocket.userId?.toString() === userId);
};

const getCookieValue = (cookieHeader, cookieName) => {
  if (!cookieHeader) return "";

  const cookie = cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
};

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5176",
        "https://devcircle-neon.vercel.app" // ✅ FIXED
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = getCookieValue(socket.handshake.headers.cookie, "token");

      if (!token) {
        return next(new Error("Please Login!"));
      }

      const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedObj._id).select(
        "firstName lastName"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.join(socket.userId);

    socket.on("joinChat", async ({ targetUserId }) => {
      const userId = socket.userId;
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(`${socket.user.firstName} joined Room: ${roomId}`);
      socket.join(roomId);

      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        const seenMessageIds = [];
        let hasSeenUpdates = false;

        chat.messages.forEach((message) => {
          if (message.senderId.toString() === targetUserId) {
            if (!message.isSeen) {
              message.isSeen = true;
              hasSeenUpdates = true;
            }
            seenMessageIds.push(message._id.toString());
          }
        });

        if (hasSeenUpdates) {
          await chat.save();
        }

        if (seenMessageIds.length > 0) {
          io.to(roomId).emit("messagesSeen", { messageIds: seenMessageIds });
        }
      } catch (err) {
        console.log("âŒ Seen update error:", err);
      }
    });

    socket.on(
      "sendMessage",
      async ({ targetUserId, text }) => {
        try {
          const userId = socket.userId;
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(`${socket.user.firstName}: ${text}`);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          const isSeen = await isUserInRoom(io, roomId, targetUserId);

          chat.messages.push({
            senderId: userId,
            text,
            isSeen,
          });

          await chat.save();
          const savedMessage = chat.messages[chat.messages.length - 1];

          if (!isSeen) {
            await createNotification({
              receiverId: targetUserId,
              senderId: userId,
              type: "message",
              title: `${socket.user.firstName} sent you a message`,
              message: text,
              actionUrl: `/chat/${userId}`,
              dedupeKey: `message:${userId}`,
              latestMessage: text,
              incrementUnread: true,
              lastMessageAt: savedMessage.createdAt,
            });
          }

          io.to(roomId).emit("messageReceived", {
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            senderId: userId.toString(),
            _id: savedMessage._id.toString(),
            text,
            createdAt: savedMessage.createdAt,
            isSeen: savedMessage.isSeen,
          });
        } catch (err) {
          console.log("❌ Error:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};

const getIO = () => ioInstance;

module.exports = initializeSocket;
module.exports.getIO = getIO;
