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
    handleProfileSetupUpdate,
  } = Controller;

  /// This GET ROUTE is called internally to set current release ID if a profile isn't active yet to avoid server error
  router.get(
    "/",
    sameAs("profileActive", "add-release", USER),
    redirectIf(SAMEAS, false, "/add-music/terms"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music/terms"),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    redirect("/add-music/{id}", TEMPKEY)
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
    sameAs("profileSetup", "select-package", USER),
    redirectIf(SAMEAS, true, "/select-package"),
    sameAs("type", "label", USER),
    redirectIf(SAMEAS, true, "/add-music/create/label"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"], w: [{ status: "deleted" }, "not"], r: false },
      {
        m: PACKAGE,
        at: ["package", "maxAlbums", "maxTracks"],
      },
    ]),
    getAllFromSchema(USERPACKAGE, ["id", "status"]),
    addMusic_structureSubs(),
    redirectIf("USER_SUBSCRIPTIONS", false, "/select-package"),
    copyKeyTo("USER_SUBSCRIPTIONS", SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "addMusic/create", title: "Create Release" }),
    pageRender()
  );

  //This GET route renders the add-music create variant for label subscribers
  router.get(
    "/create/label",
    isValueIn("profileSetup", ["select-package"], USER),
    redirectIf(SAMEAS, true, "/select-package"),
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
    "/artistPackages",
    schemaQueryConstructor("query", ["artistId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, at: ["type"], w: [{ status: "deleted" }, "not"] },
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
    "/packageReleaseTypes",
    schemaQueryConstructor("query", ["packageId"], ["id"]),
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
    respondIf("PACKAGE_RELEASE_TYPES", false, "Error: retry again."),
    respond(["PACKAGE_RELEASE_TYPES"])
  );

  //This POST route creates/initiates the new release for subsequent updates
  router.post(
    "/create",
    schemaDataConstructor(
      "body",
      ["packageId", "title", "artistId", "type"],
      ["userPackageId"]
    ),
    respondIf(SCHEMADATA, false, "Form data not received"),
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
  router.put(
    "/update",
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

  //This PUT route updates the release status to processing
  router.put(
    "/publish",
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
    handleProfileSetupUpdate("add-release"),
    addToSchema(SCHEMAINCLUDE, [
      { m: USERPACKAGE, al: "subscription", at: ["status", "id"] },
    ]),
    getOneFromSchema(RELEASE, ["id"]),
    respond([SCHEMARESULT])
  );

  //Creates a new track for a release (happens when a subscriber is adding a new release)
  router.post(
    "/createTrack",
    schemaDataConstructor("body"),
    createSchemaData(TRACK),
    respondIf(SCHEMARESULT, false, "Error: could not create release track"),
    respond(1)
  );

  //Updates release track for a subscriber
  router.put(
    "/updateTrack",
    schemaQueryConstructor("query", ["releaseId", "id"]),
    respondIf(SCHEMAQUERY, false, "Error: query params incomplete"),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: request missing payload"),
    updateSchemaData(TRACK),
    respondIf(SCHEMAMUTATED, false, "Could not update track"),
    respond({ success: "track updated" })
  );

  //this enpoint deletes existing tracks for a particular releaseId, then creates a new one to keep data in sync (BE CAREFUL)
  router.post(
    "/createOrUpdateAlbumTracks",
    schemaQueryConstructor("query", ["releaseId"]),
    respondIf(
      SCHEMAQUERY,
      false,
      "Error: could not process, releaseId param missing"
    ),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: Data not found in the request"),
    deleteSchemaData(TRACK),
    bulkCreateSchema(TRACK),
    respondIf(SCHEMARESULT, false, "Could not add release album tracks"),
    respond(1)
  );

  //this enpoint deletes existing tracks for a particular releaseId, then creates a new one to keep data in sync (BE CAREFUL)
  router.post(
    "/createOrUpdateStores",
    schemaQueryConstructor("query", ["releaseId"]),
    respondIf(
      SCHEMAQUERY,
      false,
      "Error: could not process, releaseId param missing"
    ),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: Data not found in the request"),
    deleteSchemaData(RELEASESTORES),
    bulkCreateSchema(RELEASESTORES),
    respondIf(SCHEMARESULT, false, "Could not add release album tracks"),
    respond(1)
  );

  /// This GET route renders the add music builder page
  router.get(
    "/:id",
    schemaQueryConstructor("params", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/add-music"),
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
      { m: TRACK },
      {
        m: STORE,
        al: "stores",
      },
    ]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, "/add-music"),
    isValueIn("status", ["incomplete", "declined"], SCHEMARESULT),
    redirectIf(SAMEAS, false, "/submission/{id}", [SCHEMAQUERY], ["id"]),
    sameAs("title", null, SCHEMARESULT),
    redirectIf(SAMEAS, true, "/add-music/removeIncompleteRelease", [
      SCHEMAQUERY,
    ]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    resetKey([SCHEMAQUERY, SCHEMARESULT, SCHEMAINCLUDE, SCHEMAOPTIONS]),
    getAllFromSchema(STORE, null, { limit: null, order: [["id", "ASC"]] }),
    copyKeyTo(SCHEMARESULT, [SITEDATA, PAGEDATA], "allStores"),
    addToSchema(SITEDATA, { page: "addMusic/index", title: "Release Setup" }),
    pageRender()
  );

  return router;
};
