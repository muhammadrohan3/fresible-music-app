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
    royalties_GenerateStructureForEdit,
    royalties_queryIntercept,
    royalties_OverviewStructure,
    royalties_monthSerializer,
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
    "/index/data/month",
    addToSchema(SCHEMAQUERY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ROYALTY,
        al: "royalties",
        at: [
          ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
          ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
          ["SUM", "trackStreamEarning", "trackStreamEarning"],
        ],
      },
    ]),
    getAllFromSchema(MONTHLYROYALTY, ["id", "monthValue", "yearValue"], {
      limit: 2,
      order: [
        ["monthValue", "DESC"],
        ["yearValue", "DESC"],
      ],
    }),
    royalties_monthSerializer(),
    respond(["MONTH_SERIALIZED_DATA"])
  );

  router.get(
    "/index/data/months",
    addToSchema(SCHEMAQUERY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: ROYALTY,
        al: "royalties",
        at: [
          ["SUM", "releaseDownloadEarning", "releaseDownloadEarning"],
          ["SUM", "trackDownloadEarning", "trackDownloadEarning"],
          ["SUM", "trackStreamEarning", "trackStreamEarning"],
        ],
      },
    ]),
    getAllFromSchema(MONTHLYROYALTY, ["id", "monthValue", "yearValue"], {
      limit: 12,
      order: [
        ["monthValue", "DESC"],
        ["yearValue", "DESC"],
      ],
    }),
    respond([SCHEMARESULT])
  );

  router.get(
    "/index/data/top-countries",
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: COUNTRY, at: ["id", "name", "code"] },
      { m: MONTHLYROYALTY, w: [TEMPKEY], al: "monthlyroyalty", at: [] },
    ]),
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
    "/index/data/top-stores",
    addToSchema(TEMPKEY, { status: "published" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: STORE, at: ["id", "store"] },
      { m: MONTHLYROYALTY, w: [TEMPKEY], al: "monthlyroyalty", at: [] },
    ]),
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
    "/index/data/total",
    addToSchema(SCHEMAINCLUDE, [
      {
        m: MONTHLYROYALTY,
        w: [{ status: "published" }],
        at: [],
        al: "monthlyroyalty",
      },
    ]),
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
    royalties_GenerateStructureForEdit(),
    respond(["ROYALTIES_EDIT_STRUCTURE"])
  );

  return router;
};
