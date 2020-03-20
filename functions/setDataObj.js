///Use the set and get methods to mutate this info object;

module.exports = (req, res, next) => {
  let store = {};
  req.info = {
    set: function(key, data) {
      if (!data) return (store = { ...store, [key]: data });
      store =
        typeof data === "object"
          ? { ...store, [key]: { ...(store[key] || {}), ...data } }
          : { ...store, [key]: data };
      return;
    },
    get: function(key) {
      return key ? store[key] : store;
    }
  };
  next();
};
