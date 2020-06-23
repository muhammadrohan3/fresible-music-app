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
  SCHEMAOPTIONS,
  SITEDATA,
  ANALYTICS,
  ANALYTICSDATE,
  NEWRELEASE,
  PAGEDATA,
  LABELARTIST,
  TEMPKEY,
} = require("../../constants");

module.exports = (Controller) => {
  const {
    seeStore,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
    deleteSchemaData,
    getOneFromSchema,
    getAllFromSchema,
    getOrCreateSchemaData,
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
    analyticsHandler,
    analytics_edit,
    analytics_initiate,
    analytics_intercept,
    analytics_dates,
    cloneKeyData,
    redirect,
    urlFormer,
    sendMail,
    isValueIn,
    setStoreIf,
  } = Controller;

  router.get(
    "/",
    addToSchema(SITEDATA, { page: "analytics", title: "Analytics" }),
    pageRender()
  );

  router.get(
    "/get/dates",
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ANALYTICS,
        i: [
          { m: RELEASE, at: ["title", "id"], al: "release" },
          { m: TRACK, at: ["title", "id"], al: "track" },
          { m: STORE, at: ["store", "id"] },
          { m: ANALYTICSDATE, at: ["date", "id", "status"] },
        ],
        r: false,
      },
    ]),
    analytics_intercept(),
    getAllFromSchema(ANALYTICSDATE, ["id", "date"], {
      order: [["date", "DESC"]],
    }),
    analytics_dates(),
    respond(["ANALYTICS_DATES"])
  );

  router.get(
    "/get/totalStreams",
    schemaQueryConstructor("query", ["releaseId"]),
    addToSchema(SCHEMAQUERY, { type: "stream" }),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [{ m: ANALYTICSDATE, w: [TEMPKEY] }]),
    seeStore([SCHEMAOPTIONS]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]], { limit: 130 }),
    respond([SCHEMARESULT])
  );

  router.get(
    "/get/totalDownloads",
    schemaQueryConstructor("query", ["releaseId"]),
    addToSchema(SCHEMAQUERY, { type: "download" }),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [{ m: ANALYTICSDATE, w: [TEMPKEY] }]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]]),
    respond([SCHEMARESULT])
  );

  router.get(
    "/get/topStores",
    schemaQueryConstructor("query", ["releaseId"]),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: STORE, at: ["store"] },
      { m: ANALYTICSDATE, w: [TEMPKEY] },
    ]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]], {
      group: ["storeId"],
      limit: 3,
      order: [[["SUM", "count", "DESC"]]],
    }),
    respond([SCHEMARESULT])
  );

  router.get(
    "/new",
    getAllFromSchema(ANALYTICSDATE, ["date"]),
    respond([SCHEMARESULT])
  );

  router.post(
    "/new",
    schemaDataConstructor("body", ["date"]),
    respondIf(
      SCHEMADATA,
      false,
      "Error: request body incomplete, date missing"
    ),
    schemaQueryConstructor("body", ["date"]),
    getOrCreateSchemaData(ANALYTICSDATE),
    respondIf("schemaCreated", false, "Error: date already exists"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/releases",
    addToSchema(SCHEMAQUERY, { status: "in stores" }),
    getAllFromSchema(RELEASE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "releasesAnalytics",
      title: "Releases Analytics",
    }),
    pageRender()
  );

  router.get(
    "/releases/get",
    fromReq("query", ["type"], TEMPKEY),
    fromReq("query", ["range"], "ANALYTICS_RANGE"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ANALYTICS,
        w: [TEMPKEY],
        i: [
          { m: RELEASE, at: ["title", "id", "type"], al: "release" },
          { m: TRACK, at: ["title", "id"], al: "track" },
          { m: STORE, at: ["store", "id"] },
          { m: ANALYTICSDATE, at: ["date", "id", "status"] },
        ],
      },
    ]),
    analytics_intercept("multiply", 2, ["ANALYTICS_RANGE", "range"]),
    addToSchema(SCHEMAQUERY, { status: "published" }),
    getAllFromSchema(ANALYTICSDATE, ["id", "date"]),
    analyticsHandler("releases_analytics", ["releaseId", ["release", "title"]]),
    respond(["ANALYTICS"])
  );

  router.get(
    "/releases/:id",
    schemaQueryConstructor("params", ["id"]),
    getOneFromSchema(RELEASE, ["id", "title", "status"]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "releaseAnalytics",
      title: "Release Analytics",
    }),
    pageRender()
  );

  router.get(
    "/releases/:releaseId/get",
    fromReq("params", ["releaseId"], TEMPKEY),
    fromReq("query", ["type"], TEMPKEY),
    fromReq("query", ["range"], "ANALYTICS_RANGE"),
    addToSchema(SCHEMAQUERY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ANALYTICS,
        w: [TEMPKEY],
        i: [
          { m: RELEASE, al: "release", at: ["title"] },
          { m: TRACK, al: "track", at: ["title"] },
          { m: STORE, al: "store", at: ["store"] },
        ],
      },
    ]),
    analytics_intercept("multiply", 2, ["ANALYTICS_RANGE", "range"]),
    addToSchema(SCHEMAQUERY, { status: "published" }),
    seeStore(),
    getAllFromSchema(ANALYTICSDATE),
    analyticsHandler("release_analytics", ["trackId", ["track", "title"]]),
    seeStore([SCHEMARESULT]),
    respondIf("ANALYTICS", false, "Nothing yet"),
    respond(["ANALYTICS"])
  );

  router.get(
    "/:dateId",
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    redirectIf(SCHEMAQUERY, false, "/"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ANALYTICS,
        i: [
          { m: RELEASE, al: ["release"], at: ["id", "title"] },
          { m: TRACK, al: ["track"], at: ["id", "title"] },
          { m: STORE, al: ["store"], at: ["id", "store"] },
        ],
      },
    ]),
    getOneFromSchema(ANALYTICSDATE),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/analytics"),
    sameAs("status", "published", SCHEMARESULT),
    redirectIf(SAMEAS, false, "/fmadmincp/analytics/{id}/edit", [SCHEMAQUERY]),
    resetKey(SCHEMARESULT),
    getAllFromSchema(STORE, ["id", "store"]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "analyticsSingle",
      title: "Analytics",
    }),
    pageRender()
  );

  router.get(
    "/:dateId/initiate",
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    redirectIf(SCHEMAQUERY, false, "/"),
    getOneFromSchema(ANALYTICSDATE),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/analytics"),
    sameAs("status", "initiating", SCHEMARESULT),
    redirectIf(SAMEAS, false, "/fmadmincp/analytics/{id}/edit", [SCHEMAQUERY]),
    resetKey([SCHEMARESULT, SCHEMAQUERY]),
    getAllFromSchema(STORE, ["id", "store"], { limit: null }),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "analyticsInitiate",
      title: "Initiate Analytics",
    }),
    pageRender()
  );

  router.post(
    "/:dateId/initiate",
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    respondIf(
      SCHEMAQUERY,
      false,
      "Error: Date Id missing from query parameters"
    ),
    fromReq("body", ["stream", "download"], TEMPKEY),
    respondIf(TEMPKEY, false, "Error: Request data object empty"),
    getOneFromSchema(ANALYTICSDATE),
    sameAs("status", "initiating", SCHEMARESULT),
    respondIf(
      SAMEAS,
      false,
      "Analytics for this date has already been initiated"
    ),
    resetKey([SCHEMARESULT, SCHEMAQUERY]),
    addToSchema(SCHEMAOPTIONS, { limit: null }),
    addToSchema(SCHEMAQUERY, { status: "in stores" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["id"] },
      { m: TRACK, at: ["id", "title"] },
    ]),
    getAllFromSchema(RELEASE, ["id", "title"]),
    respondIf(SCHEMARESULT, false, "Error: No releases are live in stores yet"),
    fromReq("params", ["dateId"], "analyticsDateId"),
    analytics_initiate(),
    cloneKeyData(["ANALYTICS_INITIATE"], SCHEMADATA),
    bulkCreateSchema(ANALYTICS),
    respondIf(
      SCHEMARESULT,
      false,
      "Error: couldn't initiate analytics for date"
    ),
    resetKey([SCHEMADATA, SCHEMAQUERY]),
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    addToSchema(SCHEMADATA, { status: "processing" }),
    updateSchemaData(ANALYTICSDATE),
    respondIf(SCHEMAMUTATED, false, "Error: couldn't update analytics date"),
    respond(1)
  );

  router.get(
    "/:dateId/edit",
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    redirectIf(SCHEMAQUERY, false, "/"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ANALYTICS,
        i: [
          { m: RELEASE, al: ["release"], at: ["id", "title", "type"] },
          { m: TRACK, al: ["track"], at: ["id", "title"] },
          { m: STORE, al: ["store"], at: ["id", "store"] },
        ],
      },
    ]),
    getOneFromSchema(ANALYTICSDATE),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/analytics"),
    sameAs("status", "initiating", SCHEMARESULT),
    redirectIf(SAMEAS, true, "/fmadmincp/analytics/{id}/initiate", [
      SCHEMAQUERY,
    ]),
    fromStore(SCHEMARESULT, ["id", "date"], PAGEDATA, ["dateId"]),
    analytics_edit(),
    resetKey([SCHEMAQUERY, SCHEMARESULT, SCHEMAINCLUDE]),
    getAllFromSchema(STORE, ["id", "store"]),
    copyKeyTo(SCHEMARESULT, PAGEDATA, "stores"),
    copyKeyTo("ANALYTICS_EDIT", PAGEDATA, "analytics"),
    seeStore(["ANALYTICS_EDIT", 0, "children", 0, "streams", 0]),
    copyKeyTo(PAGEDATA, SITEDATA),
    addToSchema(SITEDATA, {
      page: "analyticsEdit",
      title: "Edit Analytics",
    }),
    pageRender()
  );

  router.post(
    "/:dateId/edit",
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: empty request data"),
    schemaQueryConstructor("params", ["dateId"]),
    deleteSchemaData(ANALYTICS),
    bulkCreateSchema(ANALYTICS),
    respondIf(SCHEMARESULT, false, "Error: could not update data sheet"),
    respond([SCHEMAQUERY])
  );

  router.post(
    "/:dateId/publish",
    schemaQueryConstructor("params", ["dateId"], ["id"]),
    addToSchema(SCHEMADATA, { status: "published" }),
    updateSchemaData(ANALYTICSDATE),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error: could not set datasheet to publish"
    ),
    respond(1)
  );

  router.get(
    "/add",
    addToSchema(SITEDATA, { page: "analyticsAdd", title: "Add Analytics" }),
    pageRender()
  );

  return router;
};
