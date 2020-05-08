const dataJson = (obj) => JSON.parse(JSON.stringify(obj));

module.exports = (obj, keys, aliases, isObj) => {
  //keys should be an array;
  //condition that checks if the obj param needs to be parsed;
  const data = isObj ? obj : dataJson(obj);
  if (!keys || !data) return data;
  if (!Array.isArray(keys))
    throw new Error(
      `ORGANIZE DATA: keys ${(obj, keys, aliases, isObj)} should be an array`
    );
  if (aliases && !Array.isArray(aliases))
    throw new Error("ORGANIZE DATA: aliases should be an array");
  let newData = {};
  keys.forEach((key, i) => {
    if (data.hasOwnProperty(key)) {
      const item = data[key];
      newData = { ...newData, [(aliases && aliases[i]) || key]: item };
    }
  });
  return newData;
};
