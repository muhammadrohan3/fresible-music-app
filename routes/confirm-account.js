const router = require("express").Router();

const {
  USER,
  SCHEMADATA,
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SAMEAS,
  ACCOUNTVERIFY
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
  router.get(
    "/",
    fromReq("user", null, "tempKey"),
    sameAs("isVerified", true, "tempKey"),
    redirectIf(SAMEAS, true, "/confirm-account/proceed"),
    fromReq("user", ["email"], "siteData"),
    pageRender()
  );

  // This POST route creates a token in the DB and send a mail containing the token to the user to verify their email address
  router.post(
    "/",
    fromReq("user", null, "tempKey"),
    sameAs("isVerified", true, "tempKey"),
    respondIf(SAMEAS, true, "User already verified"),
    generateToken(10, SCHEMADATA),
    schemaQueryConstructor("user", ["email"]),
    addToSchema(SCHEMADATA, { tokenType: "verify" }),
    updateSchemaData("user"),
    respondIf(SCHEMAMUTATED, false, "Could not set token, retry..."),
    urlFormer("/confirm-account/vtc", SCHEMADATA),
    sendMail(ACCOUNTVERIFY),
    respond(1)
  );

  router.get(
    "/vtc",
    schemaQueryConstructor("query", ["token"], null, 1),
    redirectIf(SCHEMAQUERY, false, "/"),
    addToSchema(SCHEMADATA, { isVerified: 1 }),
    updateSchemaData(USER),
    redirectIf(SCHEMAMUTATED, false, "/"),
    redirect("/")
  );

  // This GET route is internally called to do some checks and update the DB if necessary
  router.get(
    "/proceed",
    fromReq("user", ["profileActive"], "tempKey"),
    sameAs("profileActive", 3, "tempKey"),
    redirectIf(SAMEAS, false, "/"),
    addToSchema(SCHEMADATA, { profileActive: 4 }),
    schemaQueryConstructor("user", ["id"]),
    updateSchemaData("user"),
    redirect("/")
  );

  return router;
};
