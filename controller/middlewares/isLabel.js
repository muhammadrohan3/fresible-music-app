const handleResponse = require("../util/handleResponse");

const isLabel = ({ req }) => () => {
  const { user } = req;
  if (user.type === "label") return;
  return handleResponse("redirect", "/profile");
};

module.exports = isLabel;
