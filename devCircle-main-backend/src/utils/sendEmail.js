const nodemailer = require("nodemailer");

const getEnv = (key) => (process.env[key] || "").trim();

const getGmailAppPassword = () => getEnv("EMAIL_PASS").replace(/\s/g, "");

const buildEmailErrorMessage = (err) => {
  if (err.code === "EAUTH" || err.responseCode === 535) {
    return "Gmail rejected EMAIL_USER or EMAIL_PASS. Use a fresh 16-character Gmail App Password from the same Gmail account, then redeploy Render.";
  }

  if (["ECONNECTION", "ETIMEDOUT", "ESOCKET"].includes(err.code)) {
    return "Server could not connect to Gmail SMTP. Try setting EMAIL_PORT=587 on Render and redeploy.";
  }

  return "Unable to send email. Please check the email settings on Render and see the Render logs for the Gmail response.";
};

const isEmailConfigured = () =>
  Boolean(
    (getEnv("EMAIL_USER") && getGmailAppPassword()) ||
      (getEnv("SMTP_HOST") && getEnv("SMTP_USER") && getEnv("SMTP_PASS"))
  );

class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.cause = cause;
  }
}

const createTransporter = () => {
  if (getEnv("SMTP_HOST")) {
    return nodemailer.createTransport({
      host: getEnv("SMTP_HOST"),
      port: Number(getEnv("SMTP_PORT") || 587),
      secure: getEnv("SMTP_SECURE") === "true",
      auth: {
        user: getEnv("SMTP_USER"),
        pass: getEnv("SMTP_PASS"),
      },
    });
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: Number(getEnv("EMAIL_PORT") || 587),
    secure: getEnv("EMAIL_PORT") === "465",
    requireTLS: true,
    auth: {
      user: getEnv("EMAIL_USER"),
      pass: getGmailAppPassword(),
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
        getEnv("EMAIL_FROM") || getEnv("EMAIL_USER") || getEnv("SMTP_USER")
      }>`,
      to: toEmailId,
      subject,
      text: body,
      html: `<h2>${body}</h2>`,
    });
  } catch (err) {
    console.error("Email delivery failed:", {
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });

    throw new EmailDeliveryError(
      buildEmailErrorMessage(err),
      err
    );
  }
};

module.exports = { run, EmailDeliveryError };
