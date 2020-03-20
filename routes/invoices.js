const router = require("express").Router();
const { USERCONTACT, SCHEMADATA, SITEDATA } = require("../constants");

module.exports = Controller => {
  const {
    seeStore,
    addToSchema,
    fromReq,
    pageRender,
    copyKeyTo,
    respond,
    respondIf,
    sendMail,
    schemaDataConstructor
  } = Controller;

  router.use(addToSchema(SITEDATA, { template: "invoice/index" }));

  // THis GET route renders the contact us page
  router.get("/", pageRender());
  return router;
};
