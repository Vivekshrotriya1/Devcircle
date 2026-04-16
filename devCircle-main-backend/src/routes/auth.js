const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();

    // 🔥 Generate token
    const token = await savedUser.getJWT();

    // ✅ OPTIONAL: keep cookie (not needed anymore)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // 🔥 IMPORTANT CHANGE (send token)
    res.json({
      message: "User Added successfully!",
      data: savedUser,
      token, // ✅ THIS FIXES YOUR ISSUE
    });

  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = await user.getJWT();

    // ✅ OPTIONAL: keep cookie (not required anymore)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // 🔥 IMPORTANT CHANGE
    res.json({
      message: "Login successful",
      user,
      token, // ✅ send token to frontend
    });

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
