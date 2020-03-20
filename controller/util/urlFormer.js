const idLookUp = require("./idLookUp");

module.exports = (route, obj, req) => {
  let paramList = [];
  if (req) route = `${req.protocol}://${req.get("host")}${route}`;
  if (!obj) return route;
  let id = obj["id"];
  if (id) obj["id"] = idLookUp(id);
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop) && obj[prop])
      paramList.push(`${prop}=${obj[prop]}`);
  }
  return `${route}?${paramList.join("&")}`;
};
