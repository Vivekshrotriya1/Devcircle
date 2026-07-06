const nodemailer = require("nodemailer");

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const run = async (subject, body, toEmailId) => {
  if (!isEmailConfigured()) {
    console.log(
      "Email sending skipped. Add EMAIL_USER and EMAIL_PASS to send real emails."
    );
    console.log(`Email to: ${toEmailId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    return { skipped: true, reason: "Email credentials are not configured" };
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: `"DevCircle" <${process.env.EMAIL_USER}>`,
    to: toEmailId,
    subject,
    text: body,
    html: `<h2>${body}</h2>`,
  });
};

module.exports = { run };
