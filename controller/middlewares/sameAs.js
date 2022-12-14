const { SAMEAS } = require("../../constants");

const sameAs = ({ getStore, setStore }) => (key, value, source) => {
  let item;
  //If a source is provided, set item as the source
  if (source) item = getStore(source)[key];
  //else use the provided key as source
  else item = getStore(key);
  if (typeof value === "object")
    return setStore(SAMEAS, Boolean(item) === Boolean(value));

  return setStore(SAMEAS, item === value);
};

module.exports = { sameAs };
