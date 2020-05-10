const ejs = require("ejs");
const sgMail = require("@sendgrid/mail");
// const transporter = require("./config");
const getMailTemplate = require("../public/path/getMailTemplate");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = ({ subject, email, template, variables }) => {
  return new Promise((resolve, reject) =>
    ejs.renderFile(getMailTemplate(template), variables, (err, data) => {
      if (err) throw new Error(err);
      const mailOptions = {
        from: "Fresible Music <music@fresible.com>", // sender address
        to: email, // list of receivers
        subject, // Subject line
        html: data, // html body
      };
      console.log("SENDING MAIL TO: ", email);
      // transporter
      //   .sendMail(mailOptions)
      //   .then((status) => (status ? resolve(true) : resolve(false)))
      //   .catch((e) => reject(e));

      sgMail
        .send(mailOptions)
        .then((res) => resolve(res))
        .catch((e) => reject(e.response ? e.response.body : e));
    })
  );
};
