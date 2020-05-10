const nodemailer = require("nodemailer");
module.exports = nodemailer.createTransport({
  host: process.env.SITE_EMAIL_HOST,
  port: process.env.SITE_EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.SITE_EMAIL_ACCOUNT,
    pass: process.env.SITE_EMAIL_PASSWORD,
  },
});
