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
    sendMail,
    setStoreIf,
    addMusic_structureReleaseType,
    addMusic_structureSubs
  } = Controller;

  router.get(
    "/terms",
    addToSchema(SITEDATA, { page: "addMusic/terms", title: "Terms" }),
    pageRender()
  );

  router.get(
    "/create",
    sameAs("type", "label", USER),
    redirectIf(SAMEAS, true, "/add-music/create/label"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"]
      }
    ]),
    getAllFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureSubs(),
    redirectIf("USER_SUBSCRIPTIONS", false, "/create"),
    copyKeyTo("USER_SUBSCRIPTIONS", SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "addMusic/create", title: "Create Release" }),
    pageRender()
  );

  router.post(
    "/create",
    schemaDataConstructor("body", [
      "artistId",
      "userPackageId",
      "trackId",
      "albumId",
      "type"
    ]),
    respondIf(SCHEMADATA, false, "Form data not received"),
    idMiddleWare(SCHEMADATA, true, [
      "artistId",
      "userPackageId",
      "trackId",
      "albumId"
    ]),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(RELEASE),
    respondIf(
      SCHEMARESULT,
      false,
      "Error: Could not create release, try again"
    ),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    seeStore(),
    respond([TEMPKEY])
  );

  router.get(
    "/create/label",
    sameAs("type", "label", USER),
    redirectIf(SAMEAS, false, "/add-music/create"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getAllFromSchema(LABELARTIST, ["id", "stageName"]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "addMusic/create", title: "Create Release" }),
    pageRender()
  );

  router.get(
    "/create/getArtistPackages/:artistId",
    idMiddleWare("params", false, "artistId"),
    schemaQueryConstructor("params", ["artistId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"]
      }
    ]),
    getAllFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureSubs(),
    respondIf("USER_SUBSCRIPTIONS", false, "Error: retry again."),
    respond(["USER_SUBSCRIPTIONS"])
  );

  router.get(
    "/create/getPackageReleaseTypes/:packageId",
    idMiddleWare("params", false, "packageId"),
    schemaQueryConstructor("params", ["packageId"], ["id"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"]
      }
    ]),
    getOneFromSchema(USERPACKAGE, ["id", "status", "releases", "package"]),
    addMusic_structureReleaseType(),
    respondIf("USER_RELEASE_TYPES", false, "Error: retry again."),
    respond(["USER_RELEASE_TYPES"])
  );

  router.post(
    "/create-sub-release",
    schemaDataConstructor("body", ["type", "title"]),
    addToSchema("schema", ALBUM),
    sameAs("type", "track", SCHEMADATA),
    setStoreIf(SAMEAS, true, "schema", TRACK),
    createSchemaData(["schema"]),
    respondIf(
      SCHEMARESULT,
      false,
      "Error: Could not create release, try again."
    ),
    idMiddleWare(SCHEMARESULT, true, "id"),
    setStoreIf(SAMEAS, true, "trackId", [SCHEMARESULT, "id"], TEMPKEY),
    setStoreIf(SAMEAS, false, "albumId", [SCHEMARESULT, "id"], TEMPKEY),
    respond([TEMPKEY])
  );

  /// This GET ROUTE displays the add music components excluding the package comp
  router.get(
    "/",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/add-music/set-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: USERPACKAGE, al: "subscription", at: ["packageId", "status"] },
      {
        m: USER,
        at: ["id"],
        i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }]
      },
      {
        m: LABELARTIST,
        at: ["stageName"]
      },
      {
        m: TRACK
      },
      {
        m: ALBUM,
        i: [{ m: ALBUMTRACK, al: "tracks" }]
      }
    ]),
    getOneFromSchema(RELEASE, [
      "id",
      "type",
      "status",
      "releaseDate",
      "comment",
      "subscription",
      "user",
      "labelArtist",
      "track",
      "album"
    ]),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "addMusic/index", title: "Release Setup" }),
    pageRender()
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
    redirectIf(SAMEAS, false, "/add-music/terms"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music/terms"),
    resetKey("tempKey"),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    redirect("/add-music", "tempKey")
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

  //Creates a new Track release
  router.post(
    "track/create",
    schemaDataConstructor("body", ["title"]),
    createSchemaData(TRACK),
    idMiddleWare(SCHEMARESULT, true, "id"),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY, ["trackId"]),
    respond([TEMPKEY])
  );
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

  //Creates a new Album
  router.post(
    "/album/create",
    schemaDataConstructor("body", ["name"]),
    createSchemaData(ALBUM),
    idMiddleWare(SCHEMARESULT, true, "id"),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY, ["albumId"]),
    respond([TEMPKEY])
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
