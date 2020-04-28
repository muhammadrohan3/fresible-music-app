const valExtractor = require("../util/valExtractor");

const copyKeyTo = ({ getStore, setStore }) => (item, dest, alias) => {
  let key = alias || item;
  return setStore(dest, { [key]: getStore(item) });
};

const cloneKeyData = ({ getStore, setStore }) => (key, destinationKey) => {
  const keyValue = valExtractor(getStore(), key);
  if (!keyValue) return;
  setStore(destinationKey, "");
  setStore(destinationKey, keyValue);
  return;
};

module.exports = { copyKeyTo, cloneKeyData };
