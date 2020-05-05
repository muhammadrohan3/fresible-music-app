const router = require("express").Router();

const {
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SCHEMARESULT,
  SCHEMAINCLUDE,
  SCHEMAOPTIONS,
  SAMEAS,
  RELEASE,
  RELEASESTORES,
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
  TEMPKEY,
  UPLOAD,
} = require("../constants");

module.exports = (Controller) => {
  const {
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
    addMusic_checkIncompleteCreation,
  } = Controller;

  /// This GET route renders the add music builder page
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
        i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
      },
      {
        m: LABELARTIST,
        at: ["stageName"],
      },
      {
        m: TRACK,
        i: [{ m: UPLOAD, al: "trackUpload", at: ["secureUrl"] }],
      },
      {
        m: STORE,
        al: "stores",
      },
      {
        m: UPLOAD,
        al: "artworkUpload",
        at: ["secureUrl"],
      },
    ]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    isValueIn("status", ["incomplete", "declined"], SCHEMARESULT),
    redirectIf(SAMEAS, false, "/submission", [SCHEMAQUERY], ["id"]),
    sameAs("title", null, SCHEMARESULT),
    redirectIf(SAMEAS, true, "/add-music/removeIncompleteRelease", [
      SCHEMAQUERY,
    ]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    resetKey([SCHEMAQUERY, SCHEMARESULT, SCHEMAINCLUDE, SCHEMAOPTIONS]),
    getAllFromSchema(STORE, null, { limit: null, order: [["id", "ASC"]] }),
    seeStore([SITEDATA, PAGEDATA, "tracks", 0]),
    copyKeyTo(SCHEMARESULT, [SITEDATA, PAGEDATA], "allStores"),
    addToSchema(SITEDATA, { page: "addMusic/index", title: "Release Setup" }),
    pageRender()
  );

  /// This GET ROUTE is called internally to set current release ID if a profile isn't active yet to avoid server error
  router.get(
    "/set-id",
    sameAs("profileActive", 5, USER),
    redirectIf(SAMEAS, false, "/add-music/terms"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music/terms"),
    resetKey("tempKey"),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    redirect("/add-music", "tempKey")
  );

  /// This GET route deletes a release not initiated properly and redirects the subscriber to the add-music create page
  router.get(
    "/removeIncompleteRelease",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/add-music"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    sameAs("title", null, SCHEMARESULT),
    redirectIf(SAMEAS, false, "/add-music"),
    deleteSchemaData(RELEASE),
    redirect("/add-music/create")
  );

  //This GET route renders the terms and conditions page
  router.get(
    "/terms",
    addToSchema(SITEDATA, { page: "addMusic/terms", title: "Add Release" }),
    pageRender()
  );

  //This GET route renders the add-music create page
  router.get(
    "/create",
    sameAs("type", "label", USER),
    redirectIf(SAMEAS, true, "/add-music/create/label"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"],
      },
    ]),
    getAllFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureSubs(),
    redirectIf("USER_SUBSCRIPTIONS", false, "/create"),
    copyKeyTo("USER_SUBSCRIPTIONS", SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "addMusic/create", title: "Create Release" }),
    pageRender()
  );

  //This GET route renders the add-music create variant for label subscribers
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

  //This GET route responds with data about artist's subscription packages for Label subscribers
  router.get(
    "/create/getArtistPackages/:artistId",
    idMiddleWare("params", false, "artistId"),
    schemaQueryConstructor("params", ["artistId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"],
      },
    ]),
    getAllFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureSubs(),
    respondIf("USER_SUBSCRIPTIONS", false, "Error: retry again."),
    respond(["USER_SUBSCRIPTIONS"])
  );

  //This GET route responds with the release types the selected subscription package is eligible to
  router.get(
    "/create/getPackageReleaseTypes/:packageId",
    idMiddleWare("params", false, "packageId"),
    schemaQueryConstructor("params", ["packageId"], ["id"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"] },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"],
      },
    ]),
    getOneFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureReleaseType(),
    respondIf("USER_RELEASE_TYPES", false, "Error: retry again."),
    respond(["USER_RELEASE_TYPES"])
  );

  //This POST route creates/initiates the new release for subsequent updates
  router.post(
    "/create",
    schemaDataConstructor("body", [
      "artistId",
      "userPackageId",
      "trackId",
      "albumId",
      "type",
    ]),
    respondIf(SCHEMADATA, false, "Form data not received"),
    idMiddleWare(SCHEMADATA, true, [
      "artistId",
      "userPackageId",
      "trackId",
      "albumId",
    ]),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(RELEASE),
    respondIf(
      SCHEMARESULT,
      false,
      "Error: Could not create release, try again"
    ),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    respond([TEMPKEY])
  );

  /// This POST route updates the release with data sent by the subscriber
  router.post(
    "/updateRelease",
    schemaDataConstructor("body"),
    respondIf(
      SCHEMADATA,
      false,
      "Error: retry or contact admin if error persists"
    ),
    schemaQueryConstructor("query", ["id"]),
    respondIf(
      SCHEMAQUERY,
      false,
      "Error: retry or contact admin if error persists"
    ),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    updateSchemaData(RELEASE),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error: couldn't update release, try again or contact admin"
    ),
    respond(1)
  );

  //This POST route updates the release status to processing
  router.post(
    "/publishRelease",
    fromReq("body", ["oldStatus"], TEMPKEY), //oldStatus is for the logger to make correct decisions.
    schemaQueryConstructor("query", ["id"]),
    respondIf(
      SCHEMAQUERY,
      false,
      "Error: retry or contact admin if error persist"
    ),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMADATA, { status: "processing", comment: null }),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Not updated"),
    resetKey(TEMPKEY),
    fromStore(SCHEMAQUERY, ["id"], TEMPKEY),
    urlFormer("/submission", TEMPKEY),
    sendMail(NEWRELEASE),
    sameAs("profileActive", 5, USER),
    redirectIf(SAMEAS, true, "/add-music/publishRelease/proceed", [TEMPKEY]),
    respond([TEMPKEY])
  );

  //This route is called if the user is still activating his/her profile
  router.get(
    "/publishRelease/proceed",
    fromReq("query", ["id"], TEMPKEY),
    sameAs("profileActive", 5, USER),
    respondIf(SAMEAS, false, [TEMPKEY]),
    schemaQueryConstructor(USER, ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 6 }),
    updateSchemaData(USER),
    respond([TEMPKEY])
  );

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
    "/updateTrack",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, "Error: could not process"),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: Data not found in the request"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    respondIf(SCHEMARESULT, false, "Error: authorize access rejected"),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["trackId"], SCHEMAQUERY, ["id"]),
    updateSchemaData(TRACK),
    respondIf(SCHEMAMUTATED, false, "Could not update track"),
    respond({ success: "track updated" })
  );

  //Handles update new album request
  router.post(
    "/updateAlbum",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, "Error: could not process"),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: Data not found in the request"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    respondIf(
      SCHEMARESULT,
      false,
      "Error: authorization denied to make changes to release"
    ),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["albumId"], SCHEMAQUERY, ["id"]),
    updateSchemaData(ALBUM),
    respondIf(SCHEMAMUTATED, false, "Could not update album"),
    respond({ success: "album updated" })
  );

  router.post(
    "/album-tracks",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, "Error: could not process, id missing"),
    schemaQueryConstructor("query", ["albumId"]),
    sameAs("albumId", false, SCHEMAQUERY),
    respondIf(SAMEAS, true, "Error: could not process, album id missing"),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: Data not found in the request"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    respondIf(SCHEMARESULT, false, "Error: Could not authorize access"),
    resetKey(SCHEMAQUERY),
    schemaQueryConstructor("query", ["albumId"]),
    deleteSchemaData(ALBUMTRACK),
    bulkCreateSchema(ALBUMTRACK),
    respondIf(SCHEMARESULT, false, "Could not add album tracks"),
    respond(1)
  );

  return router;
};
