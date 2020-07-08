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
  MONTHLYROYALTY,
  ROYALTY,
  COUNTRY,
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
    cloneKeyData,
    redirect,
    urlFormer,
    sendMail,
    isValueIn,
    setStoreIf,
    processRawSQL,
    royalties_GenerateStructureForEdit,
    royalties_queryIntercept,
    royalties_OverviewStructure,
    royalties_monthSerializer,
    royalties_formatToKobo,
    royalties_formatToNaira,
    royalties_query,
  } = Controller;

  router.get(
    "/",
    getAllFromSchema(MONTHLYROYALTY),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "royalties", title: "Royalties" }),
    pageRender()
  );

  router.post(
    "/",
    schemaDataConstructor("body", ["monthValue", "yearValue"]),
    createSchemaData(MONTHLYROYALTY),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index",
    addToSchema(SITEDATA, { page: "royalties_index", title: "Royalties" }),
    pageRender()
  );

  router.get(
    "/index/data/table",
    schemaQueryConstructor("query", [
      "releaseId",
      "trackId",
      "storeId",
      "monthId",
      "countryId",
    ]),
    fromReq("query", ["groupBy"], TEMPKEY),
    royalties_query(),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index/data/month",
    royalties_query("LATEST_PUBLISHED_MONTH"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index/data/months",
    royalties_query("PAST_12_MONTHS"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index/data/top-countries",
    royalties_query("TOP_COUNTRIES"),
    respond([SCHEMARESULT])
  );

  //TOP STORES
  router.get(
    "/index/data/top-stores",
    royalties_query("TOP_STORES"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index/data/total",
    royalties_query("TOTAL"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/search-month",
    schemaQueryConstructor("query", ["monthValue", "yearValue"]),
    respondIf(SCHEMAQUERY, false, "Error: query params missing"),
    getOneFromSchema(MONTHLYROYALTY),
    respondIf(SCHEMARESULT, false, false),
    respond([SCHEMARESULT])
  );

  router.get(
    "/:monthId/edit",
    schemaQueryConstructor("params", ["monthId"], ["id"]),
    redirectIf(SCHEMAQUERY, false, "/"),
    getOneFromSchema(MONTHLYROYALTY),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/royalties"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    seeStore([SCHEMARESULT]),
    addToSchema(SITEDATA, {
      page: "royaltiesEdit",
      title: "Month Royalties Datasheet",
    }),
    pageRender()
  );

  router.post(
    "/:monthId/action/save",
    schemaQueryConstructor("params", ["monthId"]),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: request body missing"),
    deleteSchemaData(ROYALTY),
    royalties_formatToKobo(SCHEMADATA),
    bulkCreateSchema(ROYALTY),
    respond(1)
  );

  router.put(
    "/:monthId/action/publish",
    schemaQueryConstructor("params", ["monthId"], ["id"]),
    addToSchema(SCHEMADATA, { status: "published" }),
    updateSchemaData(MONTHLYROYALTY),
    respondIf(SCHEMAMUTATED, false, "Error: couldn't update month royalty"),
    respond(1)
  );

  router.get(
    "/:monthId/edit/data",
    schemaQueryConstructor("params", ["monthId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: RELEASE, al: ["release"], at: ["title", "type"] },
      { m: TRACK, al: ["track"], at: ["title"] },
      { m: STORE, al: ["store"], at: ["store"] },
      { m: COUNTRY, al: ["country"], at: ["name"] },
    ]),
    getAllFromSchema(ROYALTY, null, { limit: null }),
    royalties_formatToNaira(SCHEMARESULT),
    royalties_GenerateStructureForEdit(),
    respond(["ROYALTIES_EDIT_STRUCTURE"])
  );

  return router;
};
