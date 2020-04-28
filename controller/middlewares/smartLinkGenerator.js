const smartLinkGenerator = ({ getStore, setStore }) => (key) =>
  setStore("url", `http://fresible.link/${getStore(key)["slug"]}`);

module.exports = { generateSmartLink: smartLinkGenerator };
