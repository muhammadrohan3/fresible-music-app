const router = require("express").Router();

const {
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SCHEMARESULT,
  SCHEMAINCLUDE,
  SAMEAS,
  RELEASE,
  TRACK,
  ALBUM,
  ALBUMTRACK,
  VIDEO,
  USER,
  USERPACKAGE,
  USERPROFILE,
  PACKAGE,
  STORE,
  COMPDATA,
  SCHEMADATA,
  SITEDATA,
  NEWRELEASE,
  PAGEDATA,
  LABELARTIST,
  TEMPKEY
} = require("../constants");

module.exports = Controller => {
  const {
    isLabel,
    seeStore,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
    deleteSchemaData,
    getOneFromSchema,
    getAllFromSchema,
    bulkCreateSchema,
    addToSchema,
    createSchemaData,
    fromReq,
    pageRender,
    fromStore,
    addMusicCompSwitcher,
    resetKey,
    copyKeyTo,
    idMiddleWare,
    sameAs,
    deepKeyExtractor,
    respond,
    respondIf,
    redirectIf,
    redirect,
    urlFormer,
    sendMail,
    isValueIn,
    setStoreIf,
    addMusic_structureReleaseType,
    addMusic_structureSubs,
    addMusic_checkIncompleteCreation
  } = Controller;

  router.use(isLabel());

  router.get(
    "/",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getAllFromSchema(LABELARTIST),
    redirectIf(SCHEMARESULT, false, "/profile"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "artists/index", title: "Artists" }),
    pageRender()
  );

  router.get(
    "/add-artist",
    addToSchema(SITEDATA, { page: "artists/add-artist", title: "Add Artist" }),
    pageRender()
  );

  router.post(
    "/add-artist",
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: request incomplete, try again"),
    fromReq("user", ["id"], SCHEMADATA, ["userId"]),
    createSchemaData(LABELARTIST),
    respondIf(SCHEMARESULT, false, "Error: could not create new artist"),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    sameAs("profileActive", 3, USER),
    redirectIf(SAMEAS, true, "/artists/add-artist/proceed", [TEMPKEY]),
    respond(1)
  );

  //This route is called if the user is still activating his/her profile
  router.get(
    "/add-artist/proceed",
    fromReq("query", ["id"], TEMPKEY),
    respondIf(TEMPKEY, false, "Error: internal error, try again"),
    sameAs("profileActive", 3, USER),
    respondIf(SAMEAS, false, [TEMPKEY]),
    schemaQueryConstructor(USER, ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 4 }),
    updateSchemaData(USER),
    respond([TEMPKEY])
  );

  router.get(
    "/:id",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    schemaQueryConstructor("params", ["id"]),
    getOneFromSchema(LABELARTIST),
    redirectIf(SCHEMARESULT, false, "/artists"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "artists/profile", title: "Artist Profile" }),
    pageRender()
  );

  router.get(
    "/:id/edit-profile",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    schemaQueryConstructor("params", ["id"]),
    getOneFromSchema(LABELARTIST),
    redirectIf(SCHEMARESULT, false, "/artists"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "artists/edit-profile",
      title: "Edit Artist Profile"
    }),
    seeStore([SITEDATA]),
    pageRender()
  );

  router.post(
    "/:id/edit-profile",
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: request incomplete, try again"),
    schemaQueryConstructor("params", ["id"]),
    schemaDataConstructor("user", ["id"], ["userId"]),
    updateSchemaData(LABELARTIST),
    respondIf(SCHEMAMUTATED, false, "Error: could not update artist"),
    respond(1)
  );

  // router.get(
  //   "/:id/releases",
  //   schemaQueryConstructor("user", ["id"], ["userId"]),
  //   schemaQueryConstructor("params", ["id"], ["artistId"]),
  //   getAllFromSchema(RELEASE),
  //   redirectIf(SCHEMARESULT, false, "/{id}", [SCHEMAQUERY]),
  //   copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
  //   addToSchema(SITEDATA, { page: "submissions", title: "Artist Releases" }),
  //   pageRender()
  // );

  // router.get(
  //   "/:id/subscriptions",
  //   schemaQueryConstructor("user", ["id"], ["userId"]),
  //   schemaQueryConstructor("params", ["id"], ["artistId"]),
  //   getAllFromSchema(USERPACKAGE),
  //   redirectIf(SCHEMARESULT, false, "/{id}", [SCHEMAQUERY]),
  //   copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
  //   addToSchema(SITEDATA, {
  //     page: "subscriptions",
  //     title: "Artist Subscriptions"
  //   }),
  //   seeStore([SITEDATA, PAGEDATA]),
  //   pageRender()
  // );

  return router;
};
