const { SAMEAS } = require("../../constants");
const valExtractor = require("../util/valExtractor");
const valueIsIn = ({ getStore, setStore }) => (key, values = [], source) => {
  source = Array.isArray(source) ? source : [source];
  const sourceValue = valExtractor(getStore(), source);
  if (!sourceValue || !sourceValue[key])
    throw new Error("VALUE_IS_IN: sourceValue not found in store");
  if (values.includes(sourceValue[key])) return setStore(SAMEAS, true);
  return setStore(SAMEAS, false);
};

module.exports = valueIsIn;
