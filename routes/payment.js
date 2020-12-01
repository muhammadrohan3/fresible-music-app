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
  RELEASE,
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
    handleProfileSetupUpdate,
    flutterwave_initiate,
    flutterwave_verify,
    updateReleaseStatusWhenSubscriptionIsActivated,
  } = Controller;

  // This GET Route is internally called to get subscription Id (for new subscribers)
  router.get(
    "/",
    fromReq("user", ["profileSetup"], TEMPKEY),
    sameAs("profileSetup", "payment", TEMPKEY),
    redirectIf(SAMEAS, false, "/"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    getOneFromSchema(USERPACKAGE),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["id"], TEMPKEY),
    redirect("/payment/{id}", TEMPKEY)
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
    seeStore([SCHEMADATA]),
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
    fromStore([PAYSTACK_RESPONSE, "metadata"], null, TEMPKEY),
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
    urlFormer("/subscription", TEMPKEY),
    sendMail(SUBSCRIPTIONACTIVATED),
    handleProfileSetupUpdate("payment"),
    updateReleaseStatusWhenSubscriptionIsActivated(TEMPKEY, ["id"]),
    redirect("/payment/{id}", TEMPKEY)
  );

  /// This POST route does almost the same thing as the route above
  router.get(
    "/paystack/site/verify",
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
    handleProfileSetupUpdate("payment"),
    updateReleaseStatusWhenSubscriptionIsActivated(TEMPKEY, ["id"]),
    respond(1)
  );

  /// This GET Route is called to handle failed payments (!success, then ==> failed)
  router.get(
    "/verify/failed",
    schemaQueryConstructor("query", ["id"]),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMADATA, { status: "failed" }),
    updateSchemaData(PAYMENT),
    seeStore(),
    respondIf(SCHEMAMUTATED, false, "Error: couldn't update payment"),
    respond(1)
  );

  //////////////////////////////////////
  /// >>> FLUTTERWAVE

  // This POST route is called from the frontend to generate a payment URL for the user
  router.post(
    "/rave",
    schemaQueryConstructor("body", ["id"]),
    respondIf(SCHEMAQUERY, false, "query id missing"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    respondIf(SCHEMARESULT, false, "data not found"),
    fromStore(SCHEMARESULT, ["package"], "flutterwave"),
    fromStore(SCHEMARESULT, ["id", "userId"], SCHEMADATA, ["userPackageId"]),
    addToSchema(SCHEMADATA, { gateway: "FLUTTERWAVE" }),
    resetKey(SCHEMARESULT),
    seeStore([SCHEMADATA]),
    createSchemaData(PAYMENT),
    fromStore(SCHEMARESULT, ["id"], "paystackKey"),
    flutterwave_initiate(),
    respondIf("RAVE_RESPONSE", false, "Refresh the page and try again"),
    resetKey(SCHEMAQUERY),
    resetKey(SCHEMADATA),
    fromStore("RAVE_RESPONSE", ["reference"], SCHEMADATA),
    fromStore(SCHEMARESULT, ["id"], SCHEMAQUERY),
    updateSchemaData(PAYMENT),
    fromStore("RAVE_RESPONSE", ["link"], TEMPKEY),
    respond([TEMPKEY])
  );

  // This GET Route is called by flutterwave after the user leaves the payment portal, verification is made and updates made where necessary
  //THIS IS STILL HERE (HAD NO TIME TO BREAK DOWN THIS PAYMENT VERIFY ROUTE)
  router.get(
    "/rave/verify",
    fromReq("query", ["tx_ref", "transaction_id"], "RAVE_PARAMS"),
    redirectIf("RAVE_PARAMS", false, "/payment/history"),
    flutterwave_verify(),
    redirectIf("RAVE_RESPONSE", false, "/payment/{id}", SCHEMAQUERY),
    fromStore("RAVE_RESPONSE", ["paidAt", "status"], SCHEMADATA, ["date"]),
    updateSchemaData(PAYMENT),
    getOneFromSchema(PAYMENT),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["userPackageId"], SCHEMAQUERY, ["id"]),
    addToSchema(SCHEMADATA, { status: "active" }),
    fromStore("RAVE_RESPONSE", ["paidAt"], SCHEMADATA, ["paymentDate"]),
    updateSchemaData(USERPACKAGE),
    getOneFromSchema(USERPACKAGE),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["userPackageId"], TEMPKEY, ["id"]),
    urlFormer("/subscription", TEMPKEY),
    sendMail(SUBSCRIPTIONACTIVATED),
    handleProfileSetupUpdate("payment"),
    updateReleaseStatusWhenSubscriptionIsActivated(TEMPKEY, ["id"]),
    redirect("/payment/{id}", TEMPKEY)
  );

  /////ON-SITE VERIFICATION
  router.get(
    "/rave/site/verify",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, "Error: payment ID missing"),
    getOneFromSchema(PAYMENT),
    sameAs("status", true, SCHEMARESULT),
    respondIf(SAMEAS, true, "Payment has already been queried"),
    fromStore(SCHEMARESULT, ["reference", "meta"], "RAVE_PARAMS"),
    flutterwave_verify(),
    redirectIf("RAVE_RESPONSE", false, "/payment/verify/failed", SCHEMAQUERY),
    fromStore("RAVE_RESPONSE", ["paidAt", "status"], SCHEMADATA, ["date"]),
    updateSchemaData(PAYMENT),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["userPackageId"], SCHEMAQUERY, ["id"]),
    addToSchema(SCHEMADATA, { status: "active" }),
    fromStore("RAVE_RESPONSE", ["paidAt"], SCHEMADATA, ["paymentDate"]),
    updateSchemaData(USERPACKAGE),
    resetKey(TEMPKEY),
    fromStore(SCHEMARESULT, ["userPackageId"], TEMPKEY, ["id"]),
    urlFormer("/subscription", TEMPKEY),
    sendMail(SUBSCRIPTIONACTIVATED),
    handleProfileSetupUpdate("payment"),
    updateReleaseStatusWhenSubscriptionIsActivated(TEMPKEY, ["id"]),
    respond(1)
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
    "/history/single/:id",
    schemaQueryConstructor("params", ["id"]),
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
    seeStore(),
    copyKeyTo(PAGEDATA, SITEDATA),
    addToSchema(SITEDATA, {
      page: "payment/single-payment-history",
      title: "Payment Summary",
    }),
    pageRender()
  );

  //This GET route renders the manual page containing the bank details page
  router.get(
    "/manual/:id",
    schemaQueryConstructor("params", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/payment/get-sub-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    redirectIf(SCHEMARESULT, false, "/subscriptions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { title: "Manual Payment", page: "payment/manual" }),
    pageRender()
  );

  /// This GET route renders the payment page
  router.get(
    "/:id",
    schemaQueryConstructor("params", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/payment/get-sub-id"),
    schemaQueryConstructor("user", ["id"], ["userId"]),
    addToSchema(SCHEMAINCLUDE, [{ m: PACKAGE }]),
    getOneFromSchema(USERPACKAGE),
    redirectIf(SCHEMARESULT, false, "/subscriptions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { Fns, page: "payment/index", title: "Payment" }),
    pageRender()
  );

  return router;
};
