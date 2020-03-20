module.exports = ({ getStore, setStore }) => (item, dest, alias) => {
  let key = alias || item;
  return setStore(dest, { [key]: getStore(item) });
};
