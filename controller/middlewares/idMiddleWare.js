const idLookUp = require("../util/idLookUp");

const idMiddleWare = ({ getStore, req }) => (prop, source, key) => {
  let sourceObj = !source ? req[prop || "query"] : getStore(prop);
  if (key && Array.isArray(key)) {
    key.forEach((id) => {
      let num = sourceObj[id];
      num && (sourceObj[id] = idLookUp(num));
    });
  } else {
    let id = sourceObj[key || "id"];
    if (id) sourceObj[key || "id"] = idLookUp(id);
  }
  return;
};

module.exports = { idMiddleWare };
