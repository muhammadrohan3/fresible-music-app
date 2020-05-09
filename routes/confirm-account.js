const router = require("express").Router();

const {
  USER,
  SCHEMADATA,
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SAMEAS,
  TEMPKEY,
  ACCOUNTVERIFY,
  SITEDATA,
  PAGEDATA
} = require("../constants");

module.exports = (Controller) => {
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
    sendMail,
  } = Controller;

  // This GET route renders the confirm-account page
  router.get(
    "/",
    sameAs("isVerified", true, USER),
    redirectIf(SAMEAS, true, "/"),
    fromReq(USER, ["email"], [SITEDATA, PAGEDATA]),
    pageRender()
  );

  // This POST route creates a token in the DB and send a mail containing the token to the user to verify their email address
  router.post(
    "/",
    fromReq(USER, null, TEMPKEY),
    sameAs("isVerified", 0, TEMPKEY),
    respondIf(SAMEAS, true, "User already verified"),
    generateToken(10, SCHEMADATA),
    schemaQueryConstructor(USER, ["email"]),
    addToSchema(SCHEMADATA, { tokenType: "verify" }),
    updateSchemaData(USER),
    respondIf(SCHEMAMUTATED, false, "Could not set token, retry..."),
    urlFormer("/confirm-account/vtc", SCHEMADATA),
    sendMail(ACCOUNTVERIFY),
    respond(1)
  );

  router.get(
    "/vtc",
    schemaQueryConstructor("query", ["token"]),
    redirectIf(SCHEMAQUERY, false, "/"),
    addToSchema(SCHEMADATA, { isVerified: 1 }),
    updateSchemaData(USER),
    redirect("/")
  );

  return router;
};
