const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

require("dotenv").config();
require("./utils/cronjob");

const app = express();

/* ---------------- CORS CONFIGURATION ---------------- */

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5176",
  "https://devcircle-neon.vercel.app",
];

// ✅ Single source of truth for CORS
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Handle preflight requests (IMPORTANT)
app.options("*", cors(corsOptions));

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
    console.log("✅ Database connection established...");

    const PORT = process.env.PORT || 7777;

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });