const valExtractor = require("../util/valExtractor");

const copyKeyTo = ({ getStore, setStore }) => (
  sourceKey,
  destinationKey,
  alias
) => {
  const sourceRoute = typeof sourceKey === "string" ? [sourceKey] : sourceKey;
  //converts the destinationKey to an array (denoting the route to the destination)
  const destinationRoute =
    typeof destinationKey === "string" ? [destinationKey] : destinationKey;
  const key = alias || sourceRoute[sourceRoute.length - 1]; //get the last item in the array
  const sourceValue = valExtractor(getStore(), sourceRoute);
  return setStore(destinationRoute, { [key]: sourceValue });
};

const cloneKeyData = ({ getStore, setStore }) => (key, destinationKey) => {
  const keyValue = valExtractor(getStore(), key);
  if (!keyValue) return;
  setStore(destinationKey, "");
  setStore(destinationKey, keyValue);
  return;
};

module.exports = { copyKeyTo, cloneKeyData };
