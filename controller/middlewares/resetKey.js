const resetKey = ({ setStore }) => (key) => {
  key = Array.isArray(key) ? key : [key];
  key.forEach((k) => setStore(k, undefined));
  return;
};

module.exports = { resetKey };
