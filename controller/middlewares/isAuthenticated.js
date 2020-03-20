const handleResponse = require("../util/handleResponse");

module.exports = ({ req }) => (route, base) => {
  const noAuth = ["/getReleaseLinks"];
  let baseRoute = req.baseUrl + req.path;
  route = (base && base + route) || route;
  for (let p of noAuth) {
    if (req.path.startsWith(p)) return;
  }
  if (req.user)
    return baseRoute.startsWith(route)
      ? handleResponse("redirect", base || "/")
      : null;
  return baseRoute.startsWith(route) ? null : handleResponse("redirect", route);
};
