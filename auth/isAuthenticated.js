module.exports = (req, res, next) => {
  if (req.path === "/account") {
    if (req.user) res.redirect("/");
    else next();
  } else req.user ? next() : res.redirect("/account");
};
