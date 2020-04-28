const handleResponse = require("../util/handleResponse");

const isAdmin = ({ req }) => () => {
  const { user } = req;
  if (user.role !== "subscriber") return;
  return handleResponse("redirect", "/");
};

module.exports = { isAdmin };
