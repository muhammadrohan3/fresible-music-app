const urlFormer = require("./urlFormer");

module.exports = ({ getStore, req }) => {
  const activeSwitch = name => {
    const { comp } = getStore("siteData");
    return name === comp ? "action__item--active" : "";
  };
  const isAdminPage = req.originalUrl.includes("fmadmincp");
  const pathname = req.baseUrl + req.path;
  const data = {
    ...req.app.locals,
    activeSwitch,
    baseUrl: urlFormer("", null, req),
    pageUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    pathname,
    query: req.query,
    url: url => (isAdminPage ? `/fmadmincp${url}` : url),
    isAdminPage,
    pagination: p => p && urlFormer(pathname, { ...req.query, p })
  };

  return { Fns: data };
};
