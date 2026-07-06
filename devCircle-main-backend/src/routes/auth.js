const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");

const signupOtpStore = new Map();
const passwordResetOtpStore = new Map();
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const normalizeEmail = (emailId = "") => emailId.trim().toLowerCase();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const getSignupOtpRecord = (emailId) => {
  const record = signupOtpStore.get(emailId);

  if (!record) return null;

  if (record.expiresAt < Date.now()) {
    signupOtpStore.delete(emailId);
    return null;
  }

  return record;
};

const getPasswordResetOtpRecord = (emailId) => {
  const record = passwordResetOtpStore.get(emailId);

  if (!record) return null;

  if (record.expiresAt < Date.now()) {
    passwordResetOtpStore.delete(emailId);
    return null;
  }

  return record;
};

authRouter.post("/signup/send-otp", async (req, res) => {
  try {
    const emailId = normalizeEmail(req.body.emailId);

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      throw new Error("Email is already registered!");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    signupOtpStore.set(emailId, {
      otpHash,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      verified: false,
      attempts: 0,
    });

    const emailResult = await sendEmail.run(
      "Your DevCircle signup OTP",
      `Your DevCircle signup OTP is ${otp}. It will expire in 10 minutes.`,
      emailId
    );

    res.send({
      message: emailResult?.skipped
        ? "Email service is not configured. Use this OTP for local testing."
        : "OTP sent successfully!",
      devOtp: emailResult?.skipped ? otp : undefined,
    });
  } catch (err) {
    console.error("Send signup OTP failed:", err);
    res.status(400).send("ERROR : Unable to send OTP. Please try again later.");
  }
});

authRouter.post("/signup/verify-otp", async (req, res) => {
  try {
    const emailId = normalizeEmail(req.body.emailId);
    const otp = String(req.body.otp || "").trim();

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new Error("Please enter a valid 6 digit OTP!");
    }

    const record = getSignupOtpRecord(emailId);
    if (!record) {
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    if (record.attempts >= 5) {
      signupOtpStore.delete(emailId);
      throw new Error("Too many incorrect attempts. Please request a new OTP.");
    }

    const isOtpValid = await bcrypt.compare(otp, record.otpHash);
    if (!isOtpValid) {
      record.attempts += 1;
      throw new Error("Invalid OTP!");
    }

    record.verified = true;
    res.send({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, password } = req.body;
    const emailId = normalizeEmail(req.body.emailId);
    const otpRecord = getSignupOtpRecord(emailId);

    if (!otpRecord?.verified) {
      throw new Error("Please verify your email OTP before signing up!");
    }

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    //   Creating a new instance of the User model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    signupOtpStore.delete(emailId);
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "none", // required for cross-site cookies
      secure: true,  // required for cross-site cookies
    });

    res.json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const emailId = normalizeEmail(req.body.emailId);

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("No account found with this email!");
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    passwordResetOtpStore.set(emailId, {
      otpHash,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      verified: false,
      attempts: 0,
    });

    const emailResult = await sendEmail.run(
      "Your DevCircle password reset OTP",
      `Your DevCircle password reset OTP is ${otp}. It will expire in 10 minutes.`,
      emailId
    );

    res.send({
      message: emailResult?.skipped
        ? "Email service is not configured. Use this OTP for local testing."
        : "OTP sent successfully!",
      devOtp: emailResult?.skipped ? otp : undefined,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const emailId = normalizeEmail(req.body.emailId);
    const otp = String(req.body.otp || "").trim();

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new Error("Please enter a valid 6 digit OTP!");
    }

    const record = getPasswordResetOtpRecord(emailId);
    if (!record) {
      throw new Error("OTP has expired. Please request a new OTP.");
    }

    if (record.attempts >= 5) {
      passwordResetOtpStore.delete(emailId);
      throw new Error("Too many incorrect attempts. Please request a new OTP.");
    }

    const isOtpValid = await bcrypt.compare(otp, record.otpHash);
    if (!isOtpValid) {
      record.attempts += 1;
      throw new Error("Invalid OTP!");
    }

    record.verified = true;
    res.send({ message: "OTP verified successfully!" });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/forgot-password/reset", async (req, res) => {
  try {
    const emailId = normalizeEmail(req.body.emailId);
    const { password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }

    if (!validator.isStrongPassword(password || "")) {
      throw new Error("Please enter a strong Password!");
    }

    const record = getPasswordResetOtpRecord(emailId);
    if (!record?.verified) {
      throw new Error("Please verify your OTP before resetting password!");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("No account found with this email!");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    passwordResetOtpStore.delete(emailId);

    res.send({ message: "Password reset successfully!" });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
     httpOnly: true,
    sameSite: "none", // required for cross-site cookies
    secure: true,     // required for HTTPS
  });
  res.send("Logout Successful!!");
});

module.exports = authRouter;
