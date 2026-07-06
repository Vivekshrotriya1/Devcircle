const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");
const OtpVerification = require("../models/otpVerification");

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const OTP_PURPOSE = {
  SIGNUP: "signup",
  PASSWORD_RESET: "passwordReset",
};

const normalizeEmail = (emailId = "") => emailId.trim().toLowerCase();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const createOtpRecord = async (emailId, purpose, otpHash) => {
  return OtpVerification.findOneAndUpdate(
    { emailId, purpose },
    {
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      verified: false,
      attempts: 0,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const getOtpRecord = async (emailId, purpose) => {
  const record = await OtpVerification.findOne({ emailId, purpose });
  if (!record) return null;

  if (record.expiresAt.getTime() < Date.now()) {
    await OtpVerification.deleteOne({ _id: record._id });
    return null;
  }

  return record;
};

const deleteOtpRecord = (emailId, purpose) =>
  OtpVerification.deleteOne({ emailId, purpose });

const verifyOtpRecord = async (emailId, purpose, otp) => {
  const record = await getOtpRecord(emailId, purpose);
  if (!record) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await deleteOtpRecord(emailId, purpose);
    throw new Error("Too many incorrect attempts. Please request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(otp, record.otpHash);
  if (!isOtpValid) {
    record.attempts += 1;
    await record.save();
    throw new Error("Invalid OTP!");
  }

  record.verified = true;
  await record.save();
};

const sendOtpEmail = async ({ emailId, purpose, subject, body }) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const emailResult = await sendEmail.run(subject, body(otp), emailId);

  await createOtpRecord(emailId, purpose, otpHash);

  return { emailResult, otp };
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

    const { emailResult, otp } = await sendOtpEmail({
      emailId,
      purpose: OTP_PURPOSE.SIGNUP,
      subject: "Your DevCircle signup OTP",
      body: (otp) =>
        `Your DevCircle signup OTP is ${otp}. It will expire in 10 minutes.`,
    });

    res.send({
      message: emailResult?.skipped
        ? "Email service is not configured. Use this OTP for local testing."
        : "OTP sent successfully!",
      devOtp: emailResult?.skipped ? otp : undefined,
    });
  } catch (err) {
    console.error("Send signup OTP failed:", err);
    res.status(400).send("ERROR : " + err.message);
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

    await verifyOtpRecord(emailId, OTP_PURPOSE.SIGNUP, otp);
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
    const otpRecord = await getOtpRecord(emailId, OTP_PURPOSE.SIGNUP);

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
    await deleteOtpRecord(emailId, OTP_PURPOSE.SIGNUP);
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

    const { emailResult, otp } = await sendOtpEmail({
      emailId,
      purpose: OTP_PURPOSE.PASSWORD_RESET,
      subject: "Your DevCircle password reset OTP",
      body: (otp) =>
        `Your DevCircle password reset OTP is ${otp}. It will expire in 10 minutes.`,
    });

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

    await verifyOtpRecord(emailId, OTP_PURPOSE.PASSWORD_RESET, otp);
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

    const record = await getOtpRecord(emailId, OTP_PURPOSE.PASSWORD_RESET);
    if (!record?.verified) {
      throw new Error("Please verify your OTP before resetting password!");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("No account found with this email!");
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await deleteOtpRecord(emailId, OTP_PURPOSE.PASSWORD_RESET);

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
