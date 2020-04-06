const router = require("express").Router();
const Dashboard = require("./dashboard");
const {
  SITEDATA,
  SAMEAS,
  TEMPKEY,
  USERPACKAGE,
  USER,
  USERPROFILE,
  PACKAGE,
  RELEASE,
  SCHEMAINCLUDE,
  SCHEMARESULT,
  SCHEMAQUERY,
  SCHEMADATA,
  SCHEMAMUTATED,
  PAGEDATA,
  VIDEO,
  TRACK,
  ALBUM,
  ALBUMTRACK,
  PAYMENT,
  LOG,
  LINK,
  LINKSADDED,
  LABELARTIST,
  ACCOUNTTYPECHANGED,
} = require("../../constants");
module.exports = (Controller) => {
  const {
    isAdmin,
    addSiteDefaultData,
    pageRender,
    copyKeyTo,
    addToSchema,
    respond,
    respondIf,
    redirectIf,
    schemaQueryConstructor,
    schemaDataConstructor,
    seeStore,
    sameAs,
    updateSchemaData,
    createSchemaData,
    getAllFromSchema,
    getOneFromSchema,
    getAndCountAllFromSchema,
    idMiddleWare,
    sendMail,
    urlFormer,
    fromReq,
    fromStore,
    runSql,
    resetKey,
    deepKeyExtractor,
    generateSmartLink,
  } = Controller;

  router.use(isAdmin());
  router.use(addToSchema(SITEDATA, { template: "admin/index" }));

  router.get("/", addToSchema(SITEDATA, { page: "dashboard" }), pageRender());

  router.use("/dashboard", Dashboard(Controller));

  ////LOGS
  router.get(
    "/logs",
    schemaQueryConstructor("query", ["t", "r", "uid"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName"] }]),
    getAndCountAllFromSchema(LOG),
    redirectIf(SCHEMARESULT, false, "/fmadmincp"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "logs" }),
    pageRender()
  );

  router.get(
    "/subscriptions",
    schemaQueryConstructor("query", ["t", "s", "artistId"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["firstName", "lastName"] },
      { m: PACKAGE, at: ["package"] },
      { m: RELEASE, al: "releases", at: ["id"], r: false },
    ]),
    getAndCountAllFromSchema(USERPACKAGE, null, { distinct: true }),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "subscriptions",
      title: "All Subscriptions",
    }),
    pageRender()
  );

  router.get(
    "/subscriptions/:userId",
    idMiddleWare("params", null, "userId"),
    schemaQueryConstructor("params", ["userId"]),
    respondIf(SCHEMAQUERY, false, "NOT FOUND"),
    schemaQueryConstructor("query", ["t", "s"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["firstName", "lastName"] },
      { m: PACKAGE, at: ["package"] },
      { m: RELEASE, al: "releases", at: ["id"] },
    ]),
    getAndCountAllFromSchema(USERPACKAGE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "subscriptions",
      title: "Subscriber Subscriptions",
    }),
    pageRender()
  );

  router.get(
    "/subscription",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/subscriptions"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: RELEASE,
        al: "releases",
        i: [
          {
            m: USER,
            at: ["firstName", "lastName"],
            i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
          },
        ],
      },
      { m: PACKAGE, at: ["package", "maxTracks"] },
    ]),
    getOneFromSchema(USERPACKAGE),
    redirectIf(SCHEMARESULT, false, null, "/fmadmincp/subscriptions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "subscription",
      title: "Subscription",
    }),
    pageRender()
  );

  // ACTIVATE SUBSCRIPTION
  router.post(
    "/subscription/action/activate",
    schemaQueryConstructor("query", ["id"]),
    addToSchema(SCHEMADATA, { status: "active", paymentDate: new Date() }),
    updateSchemaData(USERPACKAGE),
    respondIf(SCHEMAMUTATED, false, "Error occured activating subscription"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName", "email", "id"] }]),
    getOneFromSchema(USERPACKAGE, ["id", "user"]),
    urlFormer("/subscription", SCHEMAQUERY),
    sendMail("subscriptionActivated"),
    resetKey(SCHEMAQUERY),
    deepKeyExtractor("store", [SCHEMARESULT, "user", "id"], "id"),
    copyKeyTo("id", SCHEMAQUERY),
    addToSchema(SCHEMADATA, { profileActive: 1000 }),
    updateSchemaData(USER),
    respond(1)
  );

  router.get(
    "/submissions",
    schemaQueryConstructor("query", ["t", "s", "artistId"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName", "lastName"] }]),
    getAndCountAllFromSchema(RELEASE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "submissions",
      title: "All Submissions",
    }),
    pageRender()
  );

  router.get(
    "/submission",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/submissions"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: USERPACKAGE,
        al: "subscription",
        at: ["id", "status"],
        i: [{ m: PACKAGE, at: ["package"] }],
      },
      {
        m: LABELARTIST,
        at: ["stageName"],
      },
      {
        m: USER,
        at: ["id", "firstName", "lastName", "type"],
        i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
      },
      { m: VIDEO },
      { m: TRACK },
      { m: ALBUM, i: [{ m: ALBUMTRACK, al: "tracks" }] },
    ]),
    getOneFromSchema(RELEASE),
    redirectIf(SCHEMARESULT, false, null, "/fmadmincp/submissions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "submission" }),
    seeStore([SITEDATA]),
    pageRender()
  );

  router.get(
    "/submission/album",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/submissions"),
    addToSchema(SCHEMAINCLUDE, [
      { m: ALBUMTRACK, al: "tracks" },
      { m: RELEASE, al: "release", at: ["status", "id"] },
    ]),
    getOneFromSchema(ALBUM),
    redirectIf(SCHEMARESULT, false, "/submissions"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "../album/index", title: "Album" }),
    pageRender()
  );

  router.get(
    "/submission/album-track/:albumId/:trackId",
    schemaQueryConstructor("params", ["albumId"], ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/submissions"),
    fromReq("params", ["trackId"], "trackWhere", ["id"]),
    sameAs("trackId", "", "trackWhere"),
    fromStore(SCHEMAQUERY, ["albumId"], TEMPKEY, ["id"]),
    redirectIf(SAMEAS, true, "/fmadmincp/submission/album", [TEMPKEY]),
    addToSchema(SCHEMAINCLUDE, [
      { m: ALBUMTRACK, al: "tracks", w: ["trackWhere"] },
    ]),
    getOneFromSchema(ALBUM),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/submission/album", [TEMPKEY]),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "../album/track", title: "Album Track" }),
    pageRender()
  );

  //APPROVES SUBMISSION
  router.post(
    "/submission/action/approve",
    schemaQueryConstructor("query", ["id"]),
    addToSchema(SCHEMADATA, {
      status: "approved",
      comment: null,
      approvedDate: new Date(),
    }),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Error occured updating submission"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["email", "firstName"] }]),
    getOneFromSchema(RELEASE, ["id", "user"]),
    urlFormer("/submission", SCHEMAQUERY),
    sendMail("submissionApproved"),
    respond(1)
  );

  //DECLINES SUBMISSION
  router.post(
    "/submission/action/decline",
    schemaQueryConstructor("query", ["id"]),
    schemaDataConstructor("body"),
    respondIf(
      SCHEMADATA,
      false,
      "You have to comment on why the release was declined"
    ),
    addToSchema(SCHEMADATA, { status: "declined" }),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Error occured updating submission"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["email", "firstName"] }]),
    getOneFromSchema(RELEASE, ["user", "id"]),
    urlFormer("/submission", SCHEMAQUERY),
    sendMail("submissionDeclined"),
    respond(1)
  );

  //DELETES SUBMISSION
  router.post(
    "/submission/action/delete",
    schemaQueryConstructor("query", ["id"]),
    addToSchema(SCHEMADATA, { status: "deleted" }),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Error occured deleting submission"),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["email", "firstName"] }]),
    getOneFromSchema(RELEASE, ["id", "user"]),
    sendMail("submissionDeleted"),
    respond(1)
  );

  /////////
  router.post(
    "/submission/action/edit-comment",
    schemaQueryConstructor("query", ["id"]),
    schemaDataConstructor("body"),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Could not update decline comment"),
    respond(1)
  );

  //CREATES NEW STORE LINK FOR A RELEASE AND UPDATES THE RELEASE WITH LINK ID
  router.post(
    "/submission/store-links/create",
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, "Error: request body missing"),
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, "Error: release ID missing from request"),
    createSchemaData(LINK),
    respondIf(SCHEMARESULT, false, "Error: Could not create store links"),
    fromStore(SCHEMARESULT, ["slug"], TEMPKEY),
    resetKey(SCHEMADATA),
    fromStore(SCHEMARESULT, ["id"], SCHEMADATA, ["linkId"]),
    addToSchema(SCHEMADATA, { status: "in stores" }),
    updateSchemaData(RELEASE),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error: Could not update release with link ID"
    ),
    addToSchema(SCHEMAINCLUDE, [{ m: USER, at: ["firstName", "email"] }]),
    getOneFromSchema(RELEASE, ["user"]),
    generateSmartLink(TEMPKEY),
    sendMail(LINKSADDED),
    respond(1)
  );

  //THIS GET ROUTE FETCHES THE LINKS ASSOCIATED WITH THE LINK ID PASSED
  router.get(
    "/submission/store-links",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, { error: "link id missing" }),
    getOneFromSchema(LINK),
    respondIf(SCHEMARESULT, false, "Link not found"),
    respond([SCHEMARESULT])
  );

  //THIS GET ROUTE FETCHES THE LINKS ASSOCIATED WITH THE LINK SLUG PASSED
  router.get(
    "/submission/store-links/slug",
    schemaQueryConstructor("query", ["slug"]),
    respondIf(SCHEMAQUERY, false, { error: "link slug missing" }),
    getOneFromSchema(LINK),
    respondIf(SCHEMARESULT, false, "Link not found for slug"),
    respond([SCHEMARESULT])
  );

  //THIS POST ROUTER UPDATES LINK(S) ASSOCIATED WITH THE LINK ID
  router.post(
    "/submission/store-links/update",
    schemaQueryConstructor("query", ["id"]),
    respondIf(SCHEMAQUERY, false, { error: "link id missing" }),
    schemaDataConstructor("body"),
    respondIf(SCHEMADATA, false, { error: "no data to update found" }),
    updateSchemaData(LINK),
    respondIf(SCHEMAMUTATED, false, "release store links not updated"),
    respond(1)
  );

  //SINGLE USER'S SUBMISSIONS
  router.get(
    "/submissions/:userId",
    idMiddleWare("params", null, "userId"),
    schemaQueryConstructor("query", ["t", "s"]),
    fromReq("query", ["p"], "schemaOptions"),
    schemaQueryConstructor("params", ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, al: "user", at: ["firstName", "lastName"] },
    ]),
    getAndCountAllFromSchema(RELEASE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "submissions",
      title: "Subscriber Submissions",
    }),
    pageRender()
  );

  //LOADS A SUBSCRIBER PROFILE
  router.get(
    "/subscriber",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/subscribers"),
    addToSchema(SCHEMAINCLUDE, [{ m: USERPROFILE, al: "profile" }]),
    getOneFromSchema(USER),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/subscribers"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "subscriber" }),
    seeStore([SITEDATA]),
    pageRender()
  );

  //CHANGES THE ROLE OF A SUBSCRIBER
  router.post(
    "/subscriber/action/change-role",
    sameAs("role", "superAdmin", "user"),
    respondIf(
      SAMEAS,
      false,
      "You don't have the permission to change user roles"
    ),
    schemaQueryConstructor("query", ["id"]),
    schemaDataConstructor("body"),
    updateSchemaData(USER),
    respondIf(SCHEMAMUTATED, false, "Error occured updating user details"),
    getOneFromSchema(USER),
    sendMail("roleChanged"),
    respond(1)
  );

  //CHANGES ACCOUNT TYPE TO LABEL FOR AN ALREADY EXISTING SUBSCRIBER
  router.post(
    "/subscriber/action/change-to-label",
    schemaQueryConstructor("query", ["subscriberId"], ["id"]),
    respondIf(SCHEMAQUERY, false, "Subscriber ID missing in the request"),
    getOneFromSchema(USER),
    respondIf(SCHEMARESULT, false, "Error: Subscriber not found"),
    sameAs("type", "label", SCHEMARESULT),
    respondIf(SAMEAS, true, "This is a label account"),
    //Grabs the subscriber's firstName & email for sendMail
    fromStore(SCHEMARESULT, ["firstName", "email"], TEMPKEY),
    resetKey(SCHEMARESULT),
    resetKey(SCHEMAQUERY),
    schemaQueryConstructor("query", ["subscriberId"], ["userId"]),
    getOneFromSchema(USERPROFILE, ["twitter", "instagram", "stageName", "id"]),
    seeStore(),
    fromStore(
      SCHEMARESULT,
      ["id", "twitter", "instagram", "stageName"],
      SCHEMADATA,
      ["userId"]
    ),
    resetKey(SCHEMARESULT),
    createSchemaData(LABELARTIST),
    resetKey(SCHEMADATA),
    fromStore(SCHEMARESULT, ["id"], SCHEMADATA, ["artistId"]),
    updateSchemaData(USERPACKAGE),
    respondIf(SCHEMAMUTATED, false, "Error Syncing Artist Subscriptions"),
    updateSchemaData(RELEASE),
    respondIf(SCHEMAMUTATED, false, "Error Syncing Artist Releases"),
    resetKey(SCHEMADATA),
    addToSchema(SCHEMADATA, { twitter: "", instagram: "", stageName: "" }),
    updateSchemaData(USERPROFILE),
    respondIf(SCHEMAMUTATED, false, "Error Sanitizing Label Profile Data"),
    resetKey(SCHEMADATA),
    resetKey(SCHEMAQUERY),
    schemaQueryConstructor("query", ["subscriberId"], ["id"]),
    addToSchema(SCHEMADATA, { type: "label" }),
    updateSchemaData(USER),
    respondIf(SCHEMAMUTATED, false, "Error Setting User Account Type"),
    sendMail(ACCOUNTTYPECHANGED),
    respond({ success: "Label Account has been setup successfully" })
  );

  router.get(
    "/subscriber/:id/artists",
    schemaQueryConstructor("params", ["id"], ["userId"]),
    getAllFromSchema(LABELARTIST),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "subscriberArtists",
      title: "Subscriber Artists",
    }),
    pageRender()
  );

  router.get(
    "/subscriber/:id/artist/:artistId",
    schemaQueryConstructor("params", ["id", "artistId"], ["userId", "id"]),
    getOneFromSchema(LABELARTIST),
    redirectIf(SCHEMARESULT, false, "/artists"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "subscriberArtistProfile",
      title: "Subscriber Artist Profile",
    }),
    pageRender()
  );

  //loads/gets the list of all subscribers
  router.get(
    "/subscribers",
    schemaQueryConstructor("query", ["t", "e"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [{ m: USERPROFILE, al: "profile", r: false }]),
    getAndCountAllFromSchema(USER, null, { distinct: true }),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "subscribers" }),
    pageRender()
  );

  ///////PAYMENTS
  router.get(
    "/payments",
    schemaQueryConstructor("query", ["t", "s"]),
    fromReq("query", ["p"], "schemaOptions"),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["firstName", "lastName"] },
      { m: PACKAGE, at: ["package"] },
    ]),
    getAndCountAllFromSchema(PAYMENT),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "paymentHistory", title: "All Payments" }),
    pageRender()
  );

  router.get(
    "/payments/single",
    schemaQueryConstructor("query", ["id"]),
    redirectIf(SCHEMAQUERY, false, "/fmadmincp/payments"),
    addToSchema(SCHEMAINCLUDE, [
      {
        m: USER,
        at: ["id", "firstName", "lastName"],
        i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
      },
      { m: PACKAGE },
      { m: USERPACKAGE, al: "subscription", at: ["id"] },
    ]),
    getOneFromSchema(PAYMENT),
    redirectIf(SCHEMARESULT, false, "/fmadmincp/payments"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "paymentOverview",
      title: "Payment Details",
    }),
    pageRender()
  );

  router.get(
    "/payments/:userId",
    schemaQueryConstructor("query", ["t", "s"]),
    fromReq("query", ["p"], "schemaOptions"),
    idMiddleWare("params", null, "userId"),
    schemaQueryConstructor("params", ["userId"]),
    addToSchema(SCHEMAINCLUDE, [
      { m: USER, at: ["firstName", "lastName"] },
      { m: PACKAGE, at: ["package"] },
    ]),
    getAndCountAllFromSchema(PAYMENT),
    respondIf(SCHEMARESULT, false, "HELLO"),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, {
      page: "paymentHistory",
      title: "Payment History",
    }),
    pageRender()
  );

  router.all(
    "*",
    (req, res, next) => {
      console.log("IT CAME HERE");
      if (req.method.toLowerCase() === "get") return next();
      return res.status(404).json({ status: "error", data: "route not found" });
    },
    addToSchema(SITEDATA, { page: "../404", title: "Page Not Found" }),
    pageRender()
  );

  return router;
};
