const addUserToStore = ({ req, setStore }) => () => setStore("user", req.user);

module.exports = { addUserToStore };
