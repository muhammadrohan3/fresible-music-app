const { SCHEMARESULT } = require("../../constants");
const handleResponse = require("../util/handleResponse");

module.exports = ({ req, setStore, getStore }) => (prop = SCHEMARESULT) => {
  const { id } = getStore(prop);
  if (!id)
    return handleResponse("error", `LOGIN USER: id key not found in ${prop}`);
  return req.login({ id }, e =>
    e ? handleResponse("error", e) : setStore("loggedIn", true)
  );
};
