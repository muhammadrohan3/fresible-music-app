const handleResponse = require("../util/handleResponse");

module.exports = ({ req }) => () => {
  const { user } = req;
  if (user.role !== "subscriber") return;
  return handleResponse("redirect", "/");
};
