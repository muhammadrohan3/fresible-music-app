const { SAMEAS } = require("../../constants");

module.exports = ({ getStore, setStore }) => (key, value, source) => {
  let item;
  //If a source is provided, set item as the source
  if (source) item = getStore(source)[key];
  //else use the provided key as source
  else item = getStore(key);
  return setStore(SAMEAS, item === value);
};
