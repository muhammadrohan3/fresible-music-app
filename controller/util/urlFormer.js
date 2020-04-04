const idLookUp = require("./idLookUp");

module.exports = (route, obj, req) => {
  let paramList = [];
  if (route.includes("{")) {
    if (req) route = `${req.protocol}://${req.get("host")}`;
    const routeParams = route.split(/\/\{|\}\/\{|\}\//);
    routeParams.forEach(r => {
      if (!r) return;
      if (!obj.hasOwnProperty(r))
        throw new Error("URLFORMER: object missing route key " + r);
      const keyValue = obj[r];
      route.replace(`{${r}}`, keyValue);
    });
    return route;
  }
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
