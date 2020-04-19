const router = require("express").Router();

const {
  USER,
  SCHEMADATA,
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SAMEAS,
  TEMPKEY,
  ACCOUNTVERIFY,
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
    redirectIf(SAMEAS, true, "/confirm-account/proceed"),
    fromReq(USER, ["email"], "siteData"),
    pageRender()
  );

  // This POST route creates a token in the DB and send a mail containing the token to the user to verify their email address
  router.post(
    "/",
    fromReq(USER, null, TEMPKEY),
    sameAs("isVerified", true, TEMPKEY),
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
    redirectIf(SCHEMAMUTATED, false, "/"),
    redirect("/")
  );

  // This GET route is internally called to do some checks and update the DB if necessary
  router.get(
    "/proceed",
    sameAs("profileActive", 2, USER),
    redirectIf(SAMEAS, false, "/"),
    addToSchema(SCHEMADATA, { profileActive: 3 }),
    schemaQueryConstructor(USER, ["id"]),
    updateSchemaData(USER),
    redirect("/")
  );

  return router;
};
