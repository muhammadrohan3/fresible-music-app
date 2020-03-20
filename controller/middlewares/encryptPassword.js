const bcrypt = require("bcryptjs");
module.exports = ({ setStore, getStore }) => (key, value) => {
  return new Promise((resolve, reject) =>
    bcrypt.genSalt(10, (err, salt) => {
      if (err) reject(err);
      let password = getStore(key)[value];
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        setStore(key, { [value]: hash });
        resolve(true);
      });
    })
  );
};
