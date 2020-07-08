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
    royalties_query,
  } = Controller;

  router.get(
    "/",
    addToSchema(SITEDATA, { page: "royalties/index", title: "Royalties" }),
    pageRender()
  );

  router.get(
    "/data/table",
    schemaQueryConstructor("query", [
      "releaseId",
      "trackId",
      "storeId",
      "monthId",
      "countryId",
    ]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    fromReq("query", ["groupBy"], TEMPKEY),
    royalties_query(),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/month",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    royalties_query("LATEST_PUBLISHED_MONTH"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/months",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    royalties_query("PAST_12_MONTHS"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/top-countries",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    royalties_query("TOP_COUNTRIES"),
    respond([SCHEMARESULT])
  );

  //TOP STORES
  router.get(
    "/data/top-stores",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    royalties_query("TOP_STORES"),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/total",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    royalties_query("TOTAL"),
    respond([SCHEMARESULT])
  );

  return router;
};
