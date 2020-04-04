const router = require("express").Router();

const {
  SCHEMADATA,
  SCHEMAMUTATED,
  SCHEMAQUERY,
  SCHEMARESULT,
  USER,
  USERPROFILE,
  SAMEAS,
  TEMPKEY
} = require("../constants");

module.exports = Controller => {
  const {
    seeStore,
    fromReq,
    redirectIf,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
    createSchemaData,
    addToSchema,
    pageRender,
    sameAs,
    respond,
    respondIf,
    resetKey
  } = Controller;

  /// This GET route renders the complete-profile page
  router.get(
    "/",
    sameAs("profileActive", 2, USER),
    redirectIf(SAMEAS, false, "/"),
    pageRender()
  );

  /// This POST route submits user profile details
  router.post(
    "/",
    schemaDataConstructor("body"),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(USERPROFILE),
    respondIf(SCHEMARESULT, false, "Error: could not create profile"),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    schemaQueryConstructor("user", ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 3 }),
    updateSchemaData(USER),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error: could not make changes to account."
    ),
    respond(1)
  );

  return router;
};
