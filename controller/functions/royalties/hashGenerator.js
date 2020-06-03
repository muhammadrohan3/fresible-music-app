const generateStructureHash = require("../generateStructureHash");

class Callbacks {
  static sumCount(currentValue, dataItem, name, value) {
    return (currentValue || 0) + value;
  }

  static typeSumCount(currentValue, dataItem, name, value) {
    const { type, count } = dataItem;
    let countValue = 0;
    if (name === "streams" && type === "stream") countValue = count;
    if (name === "downloads" && type === "download") countValue = count;
    return (currentValue || 0) + countValue;
  }

  static analyticsTypeStoreGen(currentValue = [], dataItem, name, value) {
    const {
      storeId,
      store: { store },
      count,
    } = dataItem;
    if (name === "streams" && value === "stream") {
      return [...currentValue, { storeId, store, count }];
    }
    if (name === "downloads" && value === "download") {
      return [...currentValue, { storeId, store, count }];
    }
    return currentValue;
  }
}

module.exports = (structure) => generateStructureHash(structure, Callbacks);
