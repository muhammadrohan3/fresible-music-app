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
  TEMPKEY,
  ANALYTICS,
  ANALYTICSDATE,
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
    analyticsHandler,
    analytics_edit,
    analytics_initiate,
    analytics_intercept,
    analytics_default,
  } = Controller;

  router.get(
    "/",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAQUERY, { status: "in stores" }),
    getAllFromSchema(RELEASE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "analytics/index", title: "Analytics" }),
    pageRender()
  );

  router.get(
    "/get",
    fromReq("query", ["type"], TEMPKEY),
    fromReq("user", ["id"], TEMPKEY, ["userId"]),
    fromReq("query", ["range"], "ANALYTICS_RANGE"),
    addToSchema(SCHEMAQUERY, { status: "published" }),
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
    getAllFromSchema(ANALYTICSDATE, ["id", "date"]),
    analyticsHandler("releases_analytics", ["releaseId", ["release", "title"]]),
    respondIf("ANALYTICS", false, "Nothing yet"),
    respond(["ANALYTICS"])
  );

  router.get(
    "/get/totalStreams",
    schemaQueryConstructor("query", ["releaseId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAQUERY, { type: "stream" }),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [{ m: ANALYTICSDATE, w: [TEMPKEY] }]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]]),
    respond([SCHEMARESULT])
  );

  router.get(
    "/get/totalDownloads",
    schemaQueryConstructor("query", ["releaseId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAQUERY, { type: "download" }),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [{ m: ANALYTICSDATE, w: [TEMPKEY] }]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]]),
    respond([SCHEMARESULT])
  );

  router.get(
    "/get/topStores",
    schemaQueryConstructor("query", ["releaseId"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema("schemaOptions", { limit: 3 }),
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: STORE, at: ["store"] },
      { m: ANALYTICSDATE, w: [TEMPKEY] },
    ]),
    getAllFromSchema(ANALYTICS, [["SUM", "count", "total"]], {
      group: ["storeId"],
      order: [[["SUM", "count", "DESC"]]],
    }),
    seeStore([SCHEMARESULT]),
    respond([SCHEMARESULT])
  );

  return router;
};
