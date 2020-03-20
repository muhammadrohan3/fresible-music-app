const crypto = require("crypto");

module.exports = (n, tokenType) => (req, res, next) => {
  crypto.randomBytes(n, (err, token) => {
    if (err) next(err);
    token = token.toString("hex");
    req.info.set("schemaData", { token, tokenType });
    next();
  });
};
