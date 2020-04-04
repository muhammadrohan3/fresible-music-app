const redirectConstruct = require("../util/redirectConstruct");
const handleResponse = require("../util/handleResponse");
const valExtractor = require("../util/valExtractor");

const redirect = ({ getStore }) => (route, routeObjRoute, useKeys) => {
  routeObjRoute = Array.isArray(routeObjRoute)
    ? routeObjRoute
    : [routeObjRoute];
  const routeObj = valExtractor(getStore(), routeObjRoute);
  return handleResponse(
    "redirect",
    redirectConstruct(route, routeObj, useKeys)
  );
};

const redirectIf = ({ getStore }) => (
  key,
  condition,
  route,
  routeObjRoute,
  useKeys
) => {
  let t;
  t = (t = getStore(key)) && typeof t === "object" ? Object.keys(t).length : t;
  routeObjRoute = Array.isArray(routeObjRoute)
    ? routeObjRoute
    : [routeObjRoute];
  const routeObj = valExtractor(getStore(), routeObjRoute);
  if (!(Boolean(t) === condition)) return;
  return handleResponse(
    "redirect",
    redirectConstruct(route, routeObj, useKeys)
  );
};

module.exports = { redirect, redirectIf };
