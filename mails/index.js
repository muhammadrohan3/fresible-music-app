const extractor = require("../controller/util/valExtractor");
const sendMail = require("./sendMail");
const myEmitter = require("../Events");
const userSchema = require("./user");
const adminSchema = require("./admin");

const analyzer = (template, mailInfo = {}, store) => {
  const mailObj = {};
  for (let item of template) {
    const { name, value, children } = item;
    const customVal = mailInfo[name] || "";
    let tempVar;
    if (children) {
      let response = analyzer(children, mailInfo[name], store);
      if (typeof response === "string") return response;
      mailObj[name] = response;
    } else {
      if (!value && !customVal) return `Value not found for ${name}`;
      if (typeof value === "string") mailObj[name] = value;
      else if ((tempVar = customVal && extractor({ ...store }, customVal)))
        mailObj[name] = tempVar;
      else if ((tempVar = value && extractor({ ...store }, value)))
        mailObj[name] = tempVar;
      else return `${name} value couldn't be found`;
    }
  }
  return mailObj;
};

module.exports = (type, mailInfo, who, store) => {
  const template = (!who || who.toLowerCase() === "user"
    ? userSchema
    : adminSchema)[type];
  if (!template) return "MAILER: NO TEMPLATE FOUND";
  const schema = analyzer(template, mailInfo, store);
  if (typeof schema === "string") return schema;
  myEmitter.emit("sendmail", schema, sendMail);
  return true;
};
