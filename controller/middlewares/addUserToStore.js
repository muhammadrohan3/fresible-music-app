module.exports = ({ req, setStore }) => () => setStore("user", req.user);
