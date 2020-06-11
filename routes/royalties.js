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
    fromReq("query", ["groupBy"], SCHEMAOPTIONS),
    royalties_queryIntercept(),
    getAllFromSchema(
      ROYALTY,
      [
        ["SUM", "releaseDownload", "releaseDownload"],
        ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
        ["SUM", "trackDownload", "trackDownload"],
        ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
        ["SUM", "trackStream", "trackStream"],
        ["SUM", "trackStreamEarning", "trackStreamEarning"],
      ],
      { limit: null }
    ),
    royalties_OverviewStructure(),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/month",
    fromReq("user", ["id"], "replacements"),
    processRawSQL(`
    SELECT id, monthValue, yearValue, earning FROM monthlyroyalties A JOIN (SELECT B.monthId, SUM(B.trackStreamEarning) + SUM(B.trackDownloadEarning) + SUM(B.releaseDownloadEarning) AS 'earning' FROM royalties B WHERE B.userId = :id GROUP BY B.monthId) B ON A.id = B.monthId WHERE A.status = 'published' ORDER BY A.monthValue DESC, A.yearValue DESC LIMIT 2
    `),
    royalties_monthSerializer(),
    respond(["MONTH_SERIALIZED_DATA"])
  );

  router.get(
    "/data/months",
    fromReq("user", ["id"], "replacements"),
    processRawSQL(`
    SELECT id, monthValue, yearValue, earning FROM monthlyroyalties A JOIN (SELECT B.monthId, SUM(B.trackStreamEarning) + SUM(B.trackDownloadEarning) + SUM(B.releaseDownloadEarning) AS 'earning' FROM royalties B WHERE B.userId = :id GROUP BY B.monthId) B ON A.id = B.monthId WHERE A.status = 'published' ORDER BY A.monthValue DESC, A.yearValue DESC LIMIT 12
    `),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/top-countries",
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: COUNTRY, at: ["id", "name", "code"] },
      { m: MONTHLYROYALTY, w: [TEMPKEY], al: "monthlyroyalty", at: [] },
    ]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getAllFromSchema(
      ROYALTY,
      [
        ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
        ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
        ["SUM", "trackStreamEarning", "trackStreamEarning"],
      ],
      {
        group: ["countryId"],
        limit: 5,
        order: [
          [["SUM", "releaseDownloadEarning", "DESC"]],
          [["SUM", "trackDownloadEarning", "DESC"]],
          [["SUM", "trackStreamEarning", "DESC"]],
        ],
      }
    ),
    respond([SCHEMARESULT])
  );

  //TOP STORES
  router.get(
    "/data/top-stores",
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: STORE, at: ["id", "store"] },
      { m: MONTHLYROYALTY, w: [TEMPKEY], al: "monthlyroyalty", at: [] },
    ]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getAllFromSchema(
      ROYALTY,
      [
        ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
        ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
        ["SUM", "trackStreamEarning", "trackStreamEarning"],
      ],
      {
        group: ["storeId"],
        limit: 6,
        order: [
          [["SUM", "releaseDownloadEarning", "DESC"]],
          [["SUM", "trackDownloadEarning", "DESC"]],
          [["SUM", "trackStreamEarning", "DESC"]],
        ],
      }
    ),
    respond([SCHEMARESULT])
  );

  router.get(
    "/data/total",
    addToSchema(SCHEMAINCLUDE, [
      {
        m: MONTHLYROYALTY,
        w: [{ status: "published" }],
        at: [],
        al: "monthlyroyalty",
      },
    ]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(
      ROYALTY,
      [
        ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
        ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
        ["SUM", "trackStreamEarning", "trackStreamEarning"],
      ],
      { limit: null }
    ),
    respond([SCHEMARESULT])
  );

  return router;
};
