const bcrypt = require("bcryptjs");
const handleResponse = require("../util/handleResponse");

module.exports = ({ getStore, setStore }) => async () => {
  try {
    //Get the password to compare from store;
    const passwordToCompare = getStore("passwordToCompare")["password"];
    //Get the fetched user password
    const { password } = getStore("schemaResult");
    const resp = await bcrypt.compare(passwordToCompare, password);
    //resp contains a boolean of true or false;
    return setStore("loginChecked", resp);
  } catch (err) {
    return handleResponse("error", err);
  }
};
