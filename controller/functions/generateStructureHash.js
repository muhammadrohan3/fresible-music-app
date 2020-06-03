module.exports = (structure = {}, Callbacks) => (sourceHash = {}, dataItem) => {
  const _generateHash = (hash = {}, dataItem = {}, structure, level = 1) => {
    const { key, props, children } = structure;
    let keyValue = hash[dataItem[key]] || {};
    keyValue.level = level;
    props.forEach((prop) => {
      const { name, key, cb, defaultValue } = prop;
      let value;
      if (defaultValue) value = defaultValue;
      else if (Array.isArray(key)) {
        let tempVal;
        key.forEach((k) => (tempVal = tempVal ? tempVal[k] : dataItem[k]));
        value = tempVal;
      } else {
        value = dataItem[key];
      }
      if (cb) {
        keyValue[name] = Callbacks[cb](keyValue[name], dataItem, name, value);
      } else keyValue[name] = value;
    });
    if (children)
      keyValue.children = _generateHash(
        keyValue.children,
        dataItem,
        children,
        level + 1
      );
    hash[dataItem[key]] = keyValue;
    return hash;
  };
  return _generateHash(sourceHash, dataItem, structure);
};
