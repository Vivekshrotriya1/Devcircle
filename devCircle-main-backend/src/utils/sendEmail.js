const nodemailer = require("nodemailer");

const isEmailConfigured = () =>
  Boolean(
    (process.env.EMAIL_USER && process.env.EMAIL_PASS) ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );

class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.cause = cause;
  }
}

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const run = async (subject, body, toEmailId) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new EmailDeliveryError(
        "Email service is not configured. Add EMAIL_USER/EMAIL_PASS or SMTP_HOST/SMTP_USER/SMTP_PASS in your deployment environment."
      );
    }

    console.log(
      "Email sending skipped. Add EMAIL_USER and EMAIL_PASS to send real emails."
    );
    console.log(`Email to: ${toEmailId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    return { skipped: true, reason: "Email credentials are not configured" };
  }

  const transporter = createTransporter();

  try {
    return await transporter.sendMail({
      from: `"DevCircle" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER
      }>`,
      to: toEmailId,
      subject,
      text: body,
      html: `<h2>${body}</h2>`,
    });
  } catch (err) {
    throw new EmailDeliveryError(
      "Unable to send email. Please check the email credentials configured on the server.",
      err
    );
  }
};

module.exports = { run, EmailDeliveryError };
