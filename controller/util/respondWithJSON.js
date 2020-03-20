const handleResponse = require("../util/handleResponse");
const idLookUp = require("../util/idLookUp");

module.exports = (getStore, item) => {
  //Response use to be in the form of strings (mostly Errors) and Number (1 ==> Success)
  //I changed how to handle that on the frontend, prior to when I change the response method on each route, I am modifying it here for now

  //THIS checks if the item passed from respond or respondIf handler is an object
  //The array check is to make sure we are not processing an array, in JS as you know it everything is an object
  if (!Array.isArray(item) && typeof item === "object") {
    let { error, success } = item;
    if (error) item = { status: "error", data: error };
    else item = { status: "success", data: success };
  }

  //IF item is an array that means the response to be sent is a data key in the store
  if (Array.isArray(item)) {
    const [key] = item;
    let tempItem = getStore(key);
    if (!tempItem) return handleResponse("error", "RESPOND: key not found");
    if ((id = tempItem["id"])) tempItem["id"] = idLookUp(id);
    tempItem && (item = { status: "success", data: tempItem });
  }

  //IF item is a string, (I put this to not break the former way of sending either a text or number for the frontend to handle by itself)
  if (typeof item !== "object") {
    item = isNaN(item)
      ? { status: "error", data: item }
      : { status: "success", data: item };
  }
  return handleResponse("json", item);
};
