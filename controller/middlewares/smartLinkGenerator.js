module.exports = ({ getStore, setStore }) => key =>
  setStore("url", `http://fresible.link/${getStore(key)["slug"]}`);
