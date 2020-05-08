const valExtractor = require("./valExtractor");

module.exports = (source, setStore) => (key, items, destination, aliases) => {
  items = items || [];
  aliases = aliases || [];
  const routeToDataInSource = typeof key === "string" ? [key] : key;
  const keyValue = valExtractor(source, routeToDataInSource);
  const destinationValue = items.length
    ? items.reduce((previous, currentKey, index) => {
        if (!keyValue[currentKey]) return previous;
        const prop = aliases[index] || currentKey;
        return { ...previous, [prop]: keyValue[currentKey] };
      }, {})
    : keyValue;
  return setStore(destination, destinationValue);
};
