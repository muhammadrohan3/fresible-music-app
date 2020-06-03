const convertHashToList = (dataHash) => {
  const prepare = (currentDataHash = {}) => {
    const list = Object.values(currentDataHash).map((data) => {
      const { children } = data;
      if (children) {
        data["children"] = prepare(children);
      }
      return data;
    });
    return list;
  };
  console.log("IT CAME: ");
  return prepare(dataHash);
};

module.exports = {
  convertHashToList,
};
