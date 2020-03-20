const urlFormer = require("../util/urlFormer");

module.exports = ({ getStore, setStore, req }) => (
  route,
  source,
  shouldUseReq = true
) => {
  //shouldUseReq param for some urls that doesn't require the domain url inclusive.
  let objParam = getStore(source);
  if (objParam)
    setStore("url", urlFormer(route, objParam, shouldUseReq && req));
  return;
};
