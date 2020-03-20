const schemaConstructor = require("../util/schemaConstructor");

module.exports = ({ req, setStore }) => () => {
  const { user } = req;
  if (!user) return;
  return schemaConstructor(
    { setStore },
    user,
    ["firstName", "avatar", "role", "id"],
    "siteData",
    [
      "loggedInUserFirstName",
      "loggedInUserAvatar",
      "loggedInUserRole",
      "loggedInUserId"
    ]
  );
};
