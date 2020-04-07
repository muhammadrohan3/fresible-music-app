const router = require("express").Router();
const {
  TEMPKEY,
  USERPACKAGE,
  USER,
  PACKAGE,
  RELEASE,
  SCHEMAINCLUDE,
  SCHEMARESULT,
  SCHEMAQUERY,
  LOG,
} = require("../../constants");

module.exports = (Controller) => {
  const {
    copyKeyTo,
    addToSchema,
    respond,
    getAllFromSchema,
    getAndCountAllFromSchema,
    fromStore,
    runSql,
    resetKey,
    seeStore,
  } = Controller;

  //   router.use(addToSchema(SCHEMAQUERY, {}))

  router.get(
    "/totalSubscribers",
    addToSchema(SCHEMAQUERY, { role: "subscriber" }),
    getAndCountAllFromSchema(USER, ["id"]),
    fromStore(SCHEMARESULT, ["count"], TEMPKEY),
    respond([TEMPKEY])
  );

  router.get(
    "/totalReleases",
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["id"], w: [{ role: "subscriber" }] },
    ]),
    getAndCountAllFromSchema(RELEASE, ["id"]),
    fromStore(SCHEMARESULT, ["count"], TEMPKEY),
    respond([TEMPKEY])
  );

  router.get(
    "/paidSubscribers",
    addToSchema(SCHEMAQUERY, { status: "active" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["id"], w: [{ role: "subscriber" }] },
    ]),
    getAndCountAllFromSchema(USERPACKAGE, ["id"], {
      group: ["userId"],
    }),
    fromStore(SCHEMARESULT, ["count"], TEMPKEY),
    respond([TEMPKEY])
  );

  router.get(
    "/approvedReleases",
    addToSchema(SCHEMAQUERY, { status: "in stores" }),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["id"], w: [{ role: "subscriber" }] },
    ]),
    getAndCountAllFromSchema(RELEASE, ["id"]),
    fromStore(SCHEMARESULT, ["count"], TEMPKEY),
    respond([TEMPKEY])
  );

  router.get(
    "/get-packages-sub-count",
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["id"], w: [{ role: "subscriber" }] },
      { m: PACKAGE, at: ["package"] },
    ]),
    getAllFromSchema(
      USERPACKAGE,
      ["packageId", ["COUNT", "packageId", "count"]],
      {
        group: ["packageId"],
      }
    ),
    respond([SCHEMARESULT])
  );

  router.get(
    "/get-graph-data",
    addToSchema(TEMPKEY, {}),
    runSql("users", "TIMEINTERVAL"),
    copyKeyTo(SCHEMARESULT, TEMPKEY, "subscribers"),
    resetKey(SCHEMARESULT),
    runSql("userpackages", "TIMEINTERVAL"),
    copyKeyTo(SCHEMARESULT, TEMPKEY, "subscriptions"),
    resetKey(SCHEMARESULT),
    runSql("releases", "TIMEINTERVAL"),
    copyKeyTo(SCHEMARESULT, TEMPKEY, "releases"),
    respond([TEMPKEY])
  );

  router.get(
    "/dash-adminlog",
    addToSchema(SCHEMAQUERY, { role: "admin" }),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName"] }]),
    addToSchema("schemaOptions", { limit: 10 }),
    getAllFromSchema(LOG),
    respond([SCHEMARESULT])
  );

  /////
  router.get(
    "/dash-subscriberslog",
    addToSchema(SCHEMAQUERY, { role: "subscriber" }),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName"] }]),
    addToSchema("schemaOptions", { limit: 10 }),
    getAllFromSchema(LOG),
    respond([SCHEMARESULT])
  );

  return router;
};
