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
  SITEDATA,
  NEWRELEASE
} = require("../constants");

module.exports = Controller => {
  const {
    seeStore,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
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
    sendMail
  } = Controller;

  /// This GET ROUTE displays the add music components excluding the package comp
  router.get(
    "/",
    schemaQueryConstructor("query", ["id"], null, true),
    redirectIf(SCHEMAQUERY, false, "/add-music/set-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: USERPACKAGE, al: "subscription", at: ["packageId"] },
      {
        m: USER,
        at: ["id"],
        i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }]
      }
    ]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    addMusicCompSwitcher(),
    sameAs("comp", "overview", SITEDATA),
    redirectIf(SAMEAS, true, "/add-music/confirm", SCHEMAQUERY, ["id"]),
    copyKeyTo(SCHEMARESULT, SITEDATA, COMPDATA),
    pageRender()
    // seeStore(),
    // respond("HELLO")
  );

  /// This POST ROUTE handles submissions
  router.post(
    "/",
    schemaDataConstructor("body"),
    schemaQueryConstructor("query", ["id"]),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Not updated"),
    respond(1)
  );

  /// This GET ROUTE is called internally to set current submission ID if a profile isn't active yet
  router.get(
    "/set-id",
    fromReq("user", ["profileActive"], "tempKey"),
    sameAs("profileActive", 2, "tempKey"),
    redirectIf(SAMEAS, false, "/add-music/create"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music/create"),
    resetKey("tempKey"),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    redirect("/add-music", "tempKey")
  );

  /// This GET ROUTE renders the add-music create page to select a package
  router.get(
    "/create",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: PACKAGE, at: ["id", "package", "maxTracks", "maxAlbums"] },
      { m: "releases" }
    ]),
    getAllFromSchema(USERPACKAGE),
    copyKeyTo(SCHEMARESULT, SITEDATA, COMPDATA),
    addToSchema(SITEDATA, {
      comp: "package",
      page: "add-music",
      title: "Add Music"
    }),
    pageRender()
  );

  /// This POST ROUTE creates a new submission after selecting a package and responds with the newly created ID
  router.post(
    "/create",
    schemaDataConstructor("body"),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(RELEASE),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    respond(["tempKey"])
  );

  /// This GET route renders the add-music confirm page with dynamic data
  router.get(
    "/confirm",
    schemaQueryConstructor("query", ["id"], null, true),
    redirectIf(SCHEMAQUERY, false, "/add-music/create"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: USERPACKAGE,
        al: "subscription",
        at: ["id", "status"],
        i: [{ m: PACKAGE, al: "package", at: ["package"] }]
      },
      { m: VIDEO },
      { m: TRACK },
      { m: ALBUM, i: [{ m: ALBUMTRACK, al: "tracks" }] }
    ]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    sameAs("submitStatus", 4, SCHEMARESULT),
    redirectIf(SAMEAS, false, "/add-music", "tempKey"),
    fromStore(SCHEMARESULT, null, COMPDATA),
    copyKeyTo(COMPDATA, SITEDATA),
    addToSchema(SITEDATA, {
      page: "add-music",
      comp: "overview"
    }),
    pageRender()
  );

  /// This POST route confirms the submission and sends a response back to the user
  router.post(
    "/confirm",
    schemaQueryConstructor("query", ["id"], null, true),
    respondIf(SCHEMAQUERY, false, "Id missing"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    respondIf(SCHEMARESULT, false, null, "record not found for user"),
    schemaDataConstructor("body"),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Error occured confirming your submission"),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    urlFormer("/submissions", "tempKey"),
    sendMail(NEWRELEASE),
    respond(1)
  );

  //// TEST
  // router.get(
  //   "/:id",
  //   fromReq("params", ["id"], SCHEMARESULT, ["submitStatus"]),
  //   redirectIf(SCHEMARESULT, false, "/"),
  //   schemaQueryConstructor("query", ["id"]),
  //   addMusicCompSwitcher(),
  //   resetKey(SCHEMARESULT),
  //   getOneFromSchema(RELEASE),
  //   redirectIf(SCHEMARESULT, false, "/"),
  //   addToSchema(SITEDATA, { page: "add-music", compData: "" }),
  //   pageRender()
  // );

  /////
  router.post(
    "/track",
    schemaDataConstructor("body"),
    createSchemaData(TRACK),
    respondIf(SCHEMARESULT, false, "Could not create track"),
    fromStore(SCHEMARESULT, ["id"], "tempKey", ["trackId"]),
    respond(["tempKey"])
  );

  /////
  router.post(
    "/video",
    schemaDataConstructor("body"),
    createSchemaData(VIDEO),
    respondIf(SCHEMARESULT, false, "Could not create track"),
    fromStore(SCHEMARESULT, ["id"], "tempKey", ["videoId"]),
    respond(["tempKey"])
  );

  //Handles create new album request
  router.post(
    "/album",
    schemaDataConstructor("body"),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(ALBUM),
    respondIf(SCHEMARESULT, false, "Could not create album"),
    fromStore(SCHEMARESULT, ["id"], "tempKey", ["albumId"]),
    seeStore(),
    respond(["tempKey"])
  );

  router.post(
    "/album-tracks",
    schemaDataConstructor("body"),
    bulkCreateSchema(ALBUMTRACK),
    respondIf(SCHEMARESULT, false, "Could not add album tracks"),
    respond(1)
  );

  return router;
};
