const url_former = require("../util/urlFormer");

const urlFormer = ({ getStore, setStore, req }) => (
  route,
  source,
  shouldUseReq = true
) => {
  //shouldUseReq param for some urls that doesn't require the domain url inclusive.
  let objParam = getStore(source);
  if (objParam)
    setStore("url", url_former(route, objParam, shouldUseReq && req));
  return;
};

module.exports = { urlFormer };
