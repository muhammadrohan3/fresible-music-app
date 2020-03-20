const organizeData = require("./organizeData");
const handleResponse = require("./handleResponse");

module.exports = (
  { setStore },
  source,
  items,
  destination,
  aliases,
  dontSet
) => {
  try {
    if (!source)
      return handleResponse(
        "error",
        "schemaConstructor: Data source not found"
      );
    if (!items) return setStore(destination, source);
    return setStore(destination, organizeData(source, items, aliases, true));
  } catch (e) {
    return handleResponse("error", e);
  }
};
