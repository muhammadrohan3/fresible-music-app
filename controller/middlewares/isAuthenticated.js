const handleResponse = require("../util/handleResponse");

const isAuthenticated = ({ req }) => (route, base) => {
  const noAuth = ["/getReleaseLinks", "/confirm-account/vtc"];
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

module.exports = { isAuthenticated };
