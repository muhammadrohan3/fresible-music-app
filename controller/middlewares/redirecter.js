const redirectConstruct = require("../util/redirectConstruct");
const handleResponse = require("../util/handleResponse");

const redirect = ({ getStore }) => (route, objKey, useKeys) =>
  handleResponse(
    "redirect",
    redirectConstruct(route, getStore(objKey), useKeys)
  );

const redirectIf = ({ getStore }) => (
  key,
  condition,
  route,
  objKey,
  useKeys
) => {
  let t;
  t = (t = getStore(key)) && typeof t === "object" ? Object.keys(t).length : t;
  if (!(Boolean(t) === condition)) return;
  return handleResponse(
    "redirect",
    redirectConstruct(route, objKey && getStore(objKey), useKeys)
  );
};

module.exports = { redirect, redirectIf };
