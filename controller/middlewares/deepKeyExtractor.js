const extractor = require("../util/valExtractor");
const handleResponse = require("../util/handleResponse");

module.exports = ({ req, setStore, getStore }) => (
  source,
  keyRoute,
  destination,
  jumpOnError
) => {
  //representation ==> KEYROUTE MUST BE AN ARRAY,
  //Let's say the source is is "STORE" and you want nested property
  // store = { schemaResult: { package: {id: 1}}}, you want the id, keyRoute should be ['schemaResult','package']
  //keys set to null will return the whole props, alias should be an array like the keys and its optional
  try {
    if (!Array.isArray(keyRoute))
      return handleResponse(
        "error",
        "deepKeyExtractor: KEYROUTE SHOULD BE AN ARRAY"
      );
    source = source.toLowerCase();
    let sourceObj = "";
    if (source === "store") sourceObj = getStore();
    if (source === "req") sourceObj = req;
    const resultVal = extractor(sourceObj, keyRoute);
    if (!resultVal && !jumpOnError)
      return handleResponse("error", "deepKeyExtractor: key not found");
    return setStore(destination, resultVal);
  } catch (e) {
    return handleResponse("error", e);
  }
};
