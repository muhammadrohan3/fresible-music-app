const extractor = require("../util/valExtractor");

module.exports = ({ getStore }) => keyRoute =>
  process.env.NODE_ENV !== "production" &&
  console.log(
    "STOREDATA: ",
    keyRoute ? extractor(getStore(), keyRoute) : getStore()
  );
