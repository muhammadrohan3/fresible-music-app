const organizeData = require("../util/organizeData");

const addSiteDefaultData = ({ req, setStore }) => () => {
  const { user } = req;
  if (!user) return;
  const data = organizeData(
    user,
    ["firstName", "avatar", "role", "id", "type"],
    [
      "loggedInUserFirstName",
      "loggedInUserAvatar",
      "loggedInUserRole",
      "loggedInUserId",
      "loggedInAccountType",
    ],
    true
  );
  setStore("siteData", data);
};

module.exports = { addSiteDefaultData };
