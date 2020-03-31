const valExtractor = require("../util/valExtractor");
const setStoreIf = ({ getStore, setStore }) => (
  key,
  booleanStatus,
  destinationKey,
  destinationValue,
  containerKey
) => {
  const keyValue = getStore(key);
  let destValue = destinationValue;
  let status = keyValue;
  if (typeof keyValue === "object") {
    if (Array.isArray(keyValue)) status = keyValue.length;
    else status = Object.keys(keyValue).length;
  }
  if (Boolean(status) !== booleanStatus) return;
  if (Array.isArray(destinationValue))
    destValue = valExtractor(getStore(), destinationValue);
  if (containerKey)
    return setStore(containerKey, { [destinationKey]: destValue });
  return setStore(destinationKey, destValue);
};

module.exports = setStoreIf;
