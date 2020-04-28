const tokenGenerator = require("../util/tokenGenerator");

//LOL I JUST FELT LIKE MAKING THIS A ONE-LINER (IF IT'S STILL HERE: ITS NOT THAT COMPLICATED);
const generateToken = ({ setStore }) => async (n, key, token) =>
  setStore(
    key || "token",
    (token = await tokenGenerator(n)) && (key ? { token } : token)
  );

module.exports = { generateToken };
