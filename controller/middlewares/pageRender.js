const addToSiteFns = require("../util/addToSiteFns");
const handleResponse = require("../util/handleResponse");

module.exports = ({ req, getStore }) => () => {
  //Gets the siteData key from the store if any
  const { siteData } = getStore();
  let { page, title, template } = siteData;
  //Verifies the actual url of the request to get the route;
  const route = (req.baseUrl ? req.baseUrl + req.path : req.path).substr(1);
  //defaults to using the route as the view if no page was given
  if (!page) siteData.page = route;
  //Gets the title from the route if no title was given.
  if (!title) {
    let itemArr = [];
    let value = page || route;
    //Does the string sanitization in order to get the title
    value.split("-").forEach(item => {
      item = item.endsWith("/") ? item.substr(0, item.length - 1) : item;
      itemArr.push(item[0].toUpperCase() + item.substr(1));
    });
    siteData.title = itemArr.join(" ");
  }
  //Merges the siteData together with the functions at addSiteFns
  const SiteData = { ...siteData, ...addToSiteFns({ getStore, req }) };
  //return Control to the handleResponse Handler
  return handleResponse("render", [template || "pageContainer", SiteData]);
};
