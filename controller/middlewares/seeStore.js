const extractor = require("../util/valExtractor");

const seeStore = ({ getStore }) => (keyRoute) =>
  process.env.NODE_ENV !== "production" &&
  console.log(
    "STOREDATA: ",
    keyRoute ? extractor(getStore(), keyRoute) : getStore()
  );

module.exports = { seeStore };
