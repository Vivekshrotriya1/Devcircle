const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["signup", "passwordReset"],
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

otpVerificationSchema.index({ emailId: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
