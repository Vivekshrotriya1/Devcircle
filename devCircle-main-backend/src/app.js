const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();
require("./utils/cronjob");

const app = express();

/* ---------------- CORS CONFIGURATION ---------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://devcircle-neon.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

/* Handle preflight requests */
app.options("*", cors());

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cookieParser());

/* ---------------- ROUTES ---------------- */

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

/* ---------------- SOCKET SERVER ---------------- */

const initializeSocket = require("./utils/socket");
const server = http.createServer(app);
initializeSocket(server);

/* ---------------- DATABASE + SERVER ---------------- */

connectDB()
  .then(() => {
    console.log("Database connection established...");

    const PORT = process.env.PORT || 7777;

    server.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });