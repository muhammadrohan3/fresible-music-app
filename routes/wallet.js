const router = require("express").Router();

const {
  USER,
  SCHEMADATA,
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SAMEAS,
  ACCOUNTVERIFY,
  SITEDATA
} = require("../constants");

module.exports = Controller => {
  const {
    generateToken,
    schemaQueryConstructor,
    updateSchemaData,
    addToSchema,
    fromReq,
    pageRender,
    fromStore,
    copyKeyTo,
    sameAs,
    respond,
    respondIf,
    redirectIf,
    redirect,
    urlFormer,
    sendMail
  } = Controller;

  // This GET route renders the confirm-account page
  router.get("/", addToSchema(SITEDATA, { page: "wallet" }), pageRender());

  return router;
};
