const router = require("express").Router();

const {
  PAYSTACK_INITIALIZE,
  PAYSTACK_VERIFY,
  PAYSTACK_RESPONSE,
  PAYSTACK_PARAMS,
  SCHEMADATA,
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SCHEMARESULT,
  SCHEMAINCLUDE,
  SAMEAS,
  TEMPKEY,
  STORE,
  PAYMENT,
  USER,
  USERPACKAGE,
  PACKAGE,
  SUBSCRIPTIONACTIVATED,
  PAGEDATA,
  SITEDATA,
} = require("../constants");

module.exports = (Controller) => {
  const {
    seeStore,
    urlFormer,
    schemaQueryConstructor,
    updateSchemaData,
    getOneFromSchema,
    getAllFromSchema,
    addToSchema,
    createSchemaData,
    fromReq,
    pageRender,
    fromStore,
    Fns,
    resetKey,
    copyKeyTo,
    idMiddleWare,
    sameAs,
    paystack,
    paystackConstructor,
    deepKeyExtractor,
    respond,
    respondIf,
    redirectIf,
    redirect,
    sendMail,
  } = Controller;

  /// This GET route renders the payment page
  router.get(
    "/",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/payment/get-sub-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    redirectIf(SCHEMARESULT, false, "/subscriptions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { Fns, page: "payment/index", title: "Payment" }),
    pageRender()
  );

  // This POST route is called from the frontend to generate a payment URL for the user
  router.post(
    "/",
    schemaQueryConstructor("body", ["id"]),
    respondIf(SCHEMAQUERY, false, "query id missing"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    respondIf(SCHEMARESULT, false, "data not found"),
    fromStore(SCHEMARESULT, ["package"], "paystackKey"),
    fromStore(SCHEMARESULT, ["id", "userId"], SCHEMADATA, ["userPackageId"]),
    resetKey(SCHEMARESULT),
    createSchemaData(PAYMENT),
    fromStore(SCHEMARESULT, ["id"], "paystackKey"),
    paystackConstructor(),
    paystack(PAYSTACK_INITIALIZE),
    respondIf(PAYSTACK_RESPONSE, false, "Refresh the page and try again"),
    resetKey(SCHEMAQUERY),
    resetKey(SCHEMADATA),
    fromStore(PAYSTACK_RESPONSE, ["reference"], SCHEMADATA),
    fromStore(SCHEMARESULT, ["id"], SCHEMAQUERY),
    updateSchemaData(PAYMENT),
    fromStore(PAYSTACK_RESPONSE, ["authorization_url"], TEMPKEY),
    respond([TEMPKEY])
  );

  // This GET Route is called by paystack after the user leaves the payment portal, verification is made and updates made where necessary
  //THIS IS STILL HERE (HAD NO TIME TO BREAK DOWN THIS PAYMENT VERIFY ROUTE)
  router.get(
    "/verify",
    fromReq("query", ["reference"], PAYSTACK_PARAMS),
    redirectIf(PAYSTACK_PARAMS, false, "/payment/history"),
    paystack(PAYSTACK_VERIFY),
    deepKeyExtractor(STORE, [PAYSTACK_RESPONSE, "metadata"], TEMPKEY),
    fromStore(TEMPKEY, ["paymentId"], SCHEMAQUERY, ["id"]),
    sameAs("status", "success", PAYSTACK_RESPONSE),
    redirectIf(SAMEAS, false, "/payment/verify/failed", SCHEMAQUERY),
    fromStore(PAYSTACK_RESPONSE, ["paid_at", "status"], SCHEMADATA, ["date"]),
    updateSchemaData(PAYMENT),
    getOneFromSchema(PAYMENT),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["userPackageId"], SCHEMAQUERY, ["id"]),
    addToSchema(SCHEMADATA, { status: "active" }),
    fromStore(PAYSTACK_RESPONSE, ["paid_at"], SCHEMADATA, ["paymentDate"]),
    updateSchemaData(USERPACKAGE),
    getOneFromSchema(USERPACKAGE),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["userPackageId"], TEMPKEY, ["id"]),
    fromReq("user", ["profileActive"], "tempCompare"),
    sameAs("profileActive", 4, "tempCompare"),
    redirectIf(SAMEAS, false, "/payment", TEMPKEY),
    resetKey(SCHEMAQUERY),
    resetKey(SCHEMADATA),
    schemaQueryConstructor("user", ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 1000 }),
    updateSchemaData("user"),
    redirect("/payment", TEMPKEY)
  );

  /// This POST route does almost the same thing as the route above
  router.post(
    "/verify",
    fromReq("body", ["reference"], PAYSTACK_PARAMS, null, 1),
    respondIf(PAYSTACK_PARAMS, false, "reference missing"),
    paystack(PAYSTACK_VERIFY),
    deepKeyExtractor(STORE, [PAYSTACK_RESPONSE, "metadata"], TEMPKEY),
    fromStore(TEMPKEY, ["paymentId"], SCHEMAQUERY, ["id"]),
    sameAs("status", "success", PAYSTACK_RESPONSE),
    redirectIf(SAMEAS, false, "/payment/verify/failed", SCHEMAQUERY),
    fromStore(PAYSTACK_RESPONSE, ["paid_at", "status"], SCHEMADATA, ["date"]),
    updateSchemaData(PAYMENT),
    getOneFromSchema(PAYMENT),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["userPackageId"], SCHEMAQUERY, ["id"]),
    addToSchema(SCHEMADATA, { status: "active" }),
    fromStore(PAYSTACK_RESPONSE, ["paid_at"], SCHEMADATA, ["paymentDate"]),
    updateSchemaData(USERPACKAGE),
    getOneFromSchema(USERPACKAGE),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    urlFormer("/subscription", TEMPKEY),
    sendMail(SUBSCRIPTIONACTIVATED),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["userPackageId"], TEMPKEY, ["id"]),
    fromReq("user", ["profileActive"], "tempCompare"),
    sameAs("profileActive", 4, "tempCompare"),
    respondIf(SAMEAS, false, 1),
    resetKey(SCHEMAQUERY),
    resetKey(SCHEMADATA),
    schemaQueryConstructor("user", ["id"]),
    addToSchema(SCHEMADATA, { profileActive: 1000 }),
    updateSchemaData(USER),
    respond(1)
  );

  /// This GET Route is called to handle failed payments (!success, then ==> failed)
  router.get(
    "/verify/failed",
    schemaQueryConstructor("query", ["id"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMADATA, { status: "failed" }),
    updateSchemaData(PAYMENT),
    respondIf(SCHEMAMUTATED, false, "Error: couldn't update payment"),
    respond(1)
  );

  // This GET Route is internally called to get subscription Id (for new subscribers)
  router.get(
    "/get-sub-id",
    fromReq("user", ["profileActive"], TEMPKEY),
    sameAs("profileActive", 6, TEMPKEY),
    redirectIf(SAMEAS, false, "/"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(USERPACKAGE),
    resetKey(TEMPKEY),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    redirect("/payment", TEMPKEY)
  );

  // This GET route renders the page containing user's payment history
  router.get(
    "/history",
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: USERPACKAGE,
        at: ["id"],
        al: "subscription",
        i: [{ m: PACKAGE, at: ["package"] }],
      },
    ]),
    getAllFromSchema(PAYMENT),
    fromStore(SCHEMARESULT, null, PAGEDATA),
    copyKeyTo(PAGEDATA, SITEDATA),
    addToSchema(SITEDATA, {
      title: "Payment History",
    }),
    pageRender()
  );

  // This GET route renders the page containing a single payment history
  router.get(
    "/history/single",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/payment/history"),
    schemaQueryConstructor("user", ["id"], ["userid"]),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: USERPACKAGE,
        al: "subscription",
        at: ["id"],
        i: [{ m: PACKAGE }],
      },
    ]),
    getOneFromSchema(PAYMENT),
    redirectIf(SCHEMARESULT, false, "/payment/history"),
    fromStore(SCHEMARESULT, null, PAGEDATA),
    idMiddleWare(PAGEDATA, "store"),
    copyKeyTo(PAGEDATA, SITEDATA),
    addToSchema(SITEDATA, {
      page: "payment/single-payment-history",
      title: "Payment Summary",
    }),
    pageRender()
  );

  //This GET route renders the manual page containing the bank details page
  router.get(
    "/manual",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/payment/get-sub-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    redirectIf(SCHEMARESULT, false, "/subscriptions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { title: "Manual Payment" }),
    pageRender()
  );

  return router;
};
