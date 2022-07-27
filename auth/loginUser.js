const passport = require("passport");

module.exports = (req, res, next) =>
  passport.authenticate("local", function(err, user, info) {
    const loginStatus = req.info.get("login");
    if (err) return next(err);
    if (!user) return res.json(loginStatus);
    req.login(user, err => (err ? next(err) : null));
    res.json(loginStatus);
    next();
  })(req, res, next);
