const tokenGenerator = require("../util/tokenGenerator");

//LOL I JUST FELT LIKE MAKING THIS A ONE-LINER (IF IT'S STILL HERE: ITS NOT THAT COMPLICATED);
module.exports = ({ setStore }) => async (n, key, token) =>
  setStore(
    key || "token",
    (token = await tokenGenerator(n)) && (key ? { token } : token)
  );
