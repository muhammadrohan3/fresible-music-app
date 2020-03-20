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
    fromReq("user", ["profileActive"], TEMPKEY),
    sameAs("profileActive", 0, TEMPKEY),
    redirectIf(SAMEAS, false, "/"),
    pageRender()
  );

  /// This POST route submits user profile details
  router.post(
    "/",
    schemaDataConstructor("body"),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(USERPROFILE),
    respondIf(
      SCHEMARESULT,
      false,
      `Error occured submitting your profile... retry`
    ),
    resetKey(SCHEMADATA),
    schemaQueryConstructor("user", ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 1 }),
    updateSchemaData(USER),
    respondIf(SCHEMAMUTATED, false, `Error occured, please retry.`),
    respond(1)
  );

  return router;
};
