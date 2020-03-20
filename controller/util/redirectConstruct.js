const handleResponse = require("./handleResponse");
const organizeData = require("./organizeData");
const urlFormer = require("./urlFormer");

module.exports = (route, params, useKeys) => {
  //PARAM is a key to a property in the store;
  //useKeys is an array containing the url key items;
  try {
    if (!params) return route;
    if (useKeys && !Array.isArray(useKeys))
      return handleResponse(
        "error",
        "REDIRECTCONSTRUCT: useKeys should be an array"
      );
    params = organizeData(params, useKeys, null, true);
    if (!params) throw new Error("REDIRECT: Object not found in store");
    return urlFormer(route, params);
  } catch (err) {
    throw new Error(err);
  }
};
