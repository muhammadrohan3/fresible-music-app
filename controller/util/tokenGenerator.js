const crypto = require("crypto");

module.exports = n =>
  new Promise((resolve, reject) =>
    crypto.randomBytes(n, (err, token) => {
      if (err) reject(err);
      if (token) resolve(token.toString("hex"));
    })
  );
