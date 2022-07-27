const bcrypt = require("bcryptjs");

module.exports = (req, res, next) =>
  bcrypt.genSalt(10, function(err, salt) {
    let { password } = req.body;
    bcrypt.hash(password, salt, async function(err, hash) {
      if (err) next(err);
      if (hash) req.body.password = hash;
      next();
    });
  });
