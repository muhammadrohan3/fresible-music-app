const schemaConstructor = require("../util/schemaConstructor");

const addSiteDefaultData = ({ req, setStore }) => () => {
  const { user } = req;
  if (!user) return;
  return schemaConstructor(
    { setStore },
    user,
    ["firstName", "avatar", "role", "id", "type"],
    "siteData",
    [
      "loggedInUserFirstName",
      "loggedInUserAvatar",
      "loggedInUserRole",
      "loggedInUserId",
      "loggedInAccountType",
    ]
  );
};

module.exports = { addSiteDefaultData };
