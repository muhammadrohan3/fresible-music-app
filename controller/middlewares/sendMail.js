const handleResponse = require("../util/handleResponse");
const sendMail = require("../../mails");

module.exports = ({ setStore, getStore }) => async (
  type,
  mailInfo,
  who = "user"
) => {
  try {
    const status = sendMail(type, mailInfo, who, getStore());
    if (typeof status === "string") return handleResponse("error", status);
    return setStore("mailStatus", status);
  } catch (err) {
    if (err) console.log("MAILERROR: ", err);
    return setStore("mailStatus", false);
  }
};
