let store = {};
const setStore = (key, data) => {
  if (!data) return (store = { ...store, [key]: data });
  if (Array.isArray(data))
    return (store = { ...store, [key]: [...(store[key] || []), ...data] });

  if (typeof data === "object")
    return (store = { ...store, [key]: { ...(store[key] || {}), ...data } });
  return (store = { ...store, [key]: data });
};

const getStore = (key) => (key ? store[key] : store);

export { setStore, getStore };
