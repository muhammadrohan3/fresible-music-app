const ejs = require("ejs");
const transporter = require("./config");
const getMailTemplate = require("../public/path/getMailTemplate");

module.exports = ({ subject, email, template, variables }) => {
  return new Promise((resolve, reject) =>
    ejs.renderFile(getMailTemplate(template), variables, (err, data) => {
      if (err) throw new Error(err);
      const mailOptions = {
        from: '"Fresible Music" <music@fresible.com>', // sender address
        to: email, // list of receivers
        subject, // Subject line
        html: data // html body
      };
      console.log("SENDING MAIL TO: ", email);
      transporter
        .sendMail(mailOptions)
        .then(status => (status ? resolve(true) : resolve(false)))
        .catch(e => reject(e));
    })
  );
};
