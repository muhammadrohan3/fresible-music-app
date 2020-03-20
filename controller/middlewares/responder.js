const respondWithJson = require("../util/respondWithJSON");

//The conditional respond
const respondIf = ({ getStore }) => (key, condition, message) => {
  if (!(Boolean(getStore(key)) === condition)) return;
  return respondWithJson(getStore, message);
};

//The respond middleware
const respond = ({ getStore }) => message => respondWithJson(getStore, message);

module.exports = { respond, respondIf };
