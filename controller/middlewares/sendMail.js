const handleResponse = require("../util/handleResponse");
const send_mail = require("../../mails");

const sendMail = ({ setStore, getStore }) => async (
  type,
  mailInfo,
  who = "user"
) => {
  try {
    const status = send_mail(type, mailInfo, who, getStore());
    if (typeof status === "string") return handleResponse("error", status);
    return setStore("mailStatus", status);
  } catch (err) {
    if (err) console.log("MAILERROR: ", err);
    return setStore("mailStatus", false);
  }
};

module.exports = { sendMail };
