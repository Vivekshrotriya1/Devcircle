// This is a simple example for testing Socket.IO message delivery
const io = require("socket.io-client");

const socket = io("https://devcircle.onrender.com", { withCredentials: true });

let sent = 0;
let received = 0;
const totalMessages = 100;

socket.on("connect", () => {
  socket.emit("joinChat", { firstName: "Test", userId: "1", targetUserId: "2" });

  // Send messages
  for (let i = 0; i < totalMessages; i++) {
    socket.emit("sendMessage", {
      firstName: "Test",
      lastName: "User",
      userId: "1",
      targetUserId: "2",
      text: `Test message ${i}`,
    });
    sent++;
  }
});

socket.on("messageReceived", (msg) => {
  received++;
  if (received === totalMessages) {
    console.log(`Delivery Accuracy: ${(received / sent) * 100}%`);
    socket.disconnect();
  }
});