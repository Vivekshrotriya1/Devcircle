const express = require("express");
const crypto = require("crypto");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const {
  membershipAmount,
  membershipDurationInMonths,
} = require("../utils/constants");
const { createNotification } = require("../utils/notificationService");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const isPremiumActive = (user) =>
  user.isPremium &&
  (!user.membershipExpiresAt || user.membershipExpiresAt > new Date());

const getMembershipExpiryDate = (membershipType) => {
  const expiresAt = new Date();
  expiresAt.setMonth(
    expiresAt.getMonth() + membershipDurationInMonths[membershipType]
  );
  return expiresAt;
};

const activatePremiumMembership = async (payment) => {
  const user = await User.findOne({ _id: payment.userId });
  if (!user) return null;

  user.isPremium = true;
  user.membershipType = payment.notes.membershipType;
  user.membershipExpiresAt = getMembershipExpiryDate(
    payment.notes.membershipType
  );
  await user.save();

  await createNotification({
    receiverId: user._id,
    type: "premium",
    title: `Premium ${payment.notes.membershipType} activated`,
    message: `Your ${payment.notes.membershipType} membership is active.`,
    actionUrl: "/premium",
    dedupeKey: `premium:${payment._id}`,
  });

  return user;
};

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const activePremium = isPremiumActive(req.user);

    if (!membershipAmount[membershipType]) {
      return res.status(400).json({ msg: "Invalid membership type." });
    }

    if (activePremium && req.user.membershipType === "gold") {
      return res.status(400).json({ msg: "Gold premium is already active." });
    }

    if (activePremium && req.user.membershipType === membershipType) {
      return res
        .status(400)
        .json({ msg: `${membershipType} premium is already active.` });
    }

    if (
      activePremium &&
      req.user.membershipType === "silver" &&
      membershipType !== "gold"
    ) {
      return res.status(400).json({ msg: "You can only upgrade to Gold." });
    }

    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
      },
    });

    // Save it in my database
    console.log(order);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {

    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
});

paymentRouter.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed." });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ msg: "Payment order not found." });
    }

    payment.status = "captured";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    const user = await activatePremiumMembership(payment);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    return res.json({ msg: "Premium activated.", user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {



    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    console.log("Valid Webhook Signature");

    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;

    const eventType = req.body.event;

    if (
      eventType === "payment.captured" &&
      paymentDetails.status === "captured"
    ) {
      const payment = await Payment.findOne({
        orderId: paymentDetails.order_id,
      });
      if (payment) {
        payment.status = paymentDetails.status;
        payment.paymentId = paymentDetails.id;
        await payment.save();

        const user = await activatePremiumMembership(payment);
        if (user) {
          console.log("User upgraded to premium");
        }
      }
    }

    // const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    // payment.status = paymentDetails.status;
    // await payment.save();
    // console.log("Payment saved");

    // const user = await User.findOne({ _id: payment.userId });
    // user.isPremium = true;
    // user.membershipType = payment.notes.membershipType;
    // console.log("User saved");

    // await user.save();
    // console.log("User upgraded to premium");


    // ye pahale se tha*************

    // Update the user as premium

    // if (req.body.event == "payment.captured") {
    // }
    // if (req.body.event == "payment.failed") {
    // }

    // return success response to razorpay

    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});






paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  if (
    req.user.isPremium &&
    req.user.membershipExpiresAt &&
    req.user.membershipExpiresAt <= new Date()
  ) {
    req.user.isPremium = false;
    req.user.membershipType = undefined;
    req.user.membershipExpiresAt = undefined;
    await req.user.save();
  }

  return res.json({ ...req.user.toJSON() });
});

module.exports = paymentRouter;
