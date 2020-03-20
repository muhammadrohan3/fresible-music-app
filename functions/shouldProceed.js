module.exports = (key, status, message, href) => (req, res, next) => {
  // type status should be boolean, try and wrap your head around the below expression;
  if (!req.info.get(key) === status)
    message ? res.json(message) : res.redirect(href);
  else next();
};
