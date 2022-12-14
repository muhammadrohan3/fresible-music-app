const router = require("express").Router();
const addMusic = require("./add-music");
const contactUs = require("./contact-us");
const confirmAccount = require("./confirm-account");
const payment = require("./payment");
const profile = require("./profile");
const account = require("./account");
const artists = require("./artists");
const royalties = require("./royalties");
const analytics = require("./analytics");
const invoice = require("./invoices");
const wallet = require("./wallet");
const adminIndex = require("./admin/index");

const {
  SCHEMARESULT,
  RELEASE,
  ALBUM,
  ALBUMTRACK,
  VIDEO,
  TRACK,
  SCHEMAQUERY,
  SCHEMAINCLUDE,
  SCHEMAMUTATED,
  USERPACKAGE,
  TEMPKEY,
  SCHEMADATA,
  PACKAGE,
  PAGEDATA,
  USER,
  LINK,
  SITEDATA,
  LABELARTIST,
  SAMEAS,
  USERPROFILE,
  NEWSUBSCRIPTION,
} = require("../constants");

const Controller = require("../controller")();

const {
  seeStore,
  sendMail,
  schemaDataConstructor,
  schemaQueryConstructor,
  updateSchemaData,
  getOneFromSchema,
  getAllFromSchema,
  createSchemaData,
  getAndCountAllFromSchema,
  addToSchema,
  pageRender,
  resetKey,
  copyKeyTo,
  respond,
  respondIf,
  redirectIf,
  urlFormer,
  redirect,
  sameAs,
  isAuthenticated,
  isUserAccountOnSetup,
  handleProfileSetupUpdate,
  idMiddleWare,
  addSiteDefaultData,
  addUserToStore,
  fromReq,
  fromStore,
  setStoreIf,
  isValueIn,
} = Controller;

router.use(isAuthenticated("/account"));
router.use("/account", account(Controller));
router.use(isUserAccountOnSetup());
router.use(idMiddleWare());
router.use(addUserToStore());
router.use(addSiteDefaultData());

//This GET Route handles the main page ==> (music.fresible.com)
router.get(
  "/",
  addToSchema(SITEDATA, { page: "index", title: "Dashboard" }),
  pageRender()
);

router.use("/fmadmincp", adminIndex(Controller));
router.use("/add-music", addMusic(Controller));
router.use("/confirm-account", confirmAccount(Controller));
router.use("/payment", payment(Controller));
router.use("/profile", profile(Controller));
router.use("/contact-us", contactUs(Controller));
router.use("/artists", artists(Controller));
router.use("/royalties", royalties(Controller));
router.use("/analytics", analytics(Controller));
router.use("/invoices", invoice(Controller));
router.use("/wallet", wallet(Controller));

// This POST route is used by the frontend to next each stage of activating a new user (paying subscriber)
router.post(
  "/profile-setup",
  schemaDataConstructor("body", ["profileActive"]),
  schemaQueryConstructor("user", ["id"]),
  updateSchemaData(USER),
  respond(1)
);

router.get(
  "/profile-setup/skip-add-artist",
  sameAs("profileActive", 3, USER),
  redirectIf(SAMEAS, false, "/"),
  addToSchema(SCHEMADATA, { profileActive: 4 }),
  schemaQueryConstructor("user", ["id"]),
  updateSchemaData(USER),
  redirect("/")
);

router.get(
  "/select-account",
  sameAs("profileSetup", "select-account", USER),
  redirectIf(SAMEAS, false, "/"),
  pageRender()
);

router.post(
  "/select-account",
  sameAs("profileSetup", "select-account", USER),
  respondIf(SAMEAS, false, "Error: access denied"),
  schemaDataConstructor("body", ["accountType"], ["type"]),
  respondIf(SCHEMADATA, false, "Error: request incomplete"),
  schemaQueryConstructor(USER, ["id"]),
  updateSchemaData(USER),
  respondIf(SCHEMAMUTATED, false, "Error: could not update data"),
  handleProfileSetupUpdate("select-account"),
  respond(1)
);

/// This GET route renders the complete-profile page
router.get(
  "/complete-profile",
  sameAs("profileSetup", "complete-profile", USER),
  redirectIf(SAMEAS, false, "/"),
  pageRender()
);

/// This POST route submits user profile details
router.post(
  "/complete-profile",
  schemaDataConstructor("body"),
  schemaDataConstructor("user", ["id"], ["userId"]),
  createSchemaData(USERPROFILE),
  respondIf(SCHEMARESULT, false, "Error: could not create profile"),
  handleProfileSetupUpdate("complete-profile"),
  respond(1)
);

// This GET ROUTE renders the select package page
router.get(
  "/select-package",
  getAllFromSchema(PACKAGE),
  copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
  pageRender()
);

router.get(
  "/select-package/get-artists",
  schemaQueryConstructor("user", ["id"], ["userId"]),
  getAllFromSchema(LABELARTIST),
  respond([SCHEMARESULT])
);

// This POST route creates a new package for the user
router.post(
  "/select-package",
  schemaDataConstructor("body", ["packageId", "artistId"]),
  schemaDataConstructor("user", ["id"], ["userId"]),
  createSchemaData(USERPACKAGE),
  respondIf(SCHEMARESULT, false, "Could not process the request, try again..."),
  fromStore(SCHEMARESULT, ["id"], "tempKey"),
  urlFormer("/subscription", "tempKey"),
  handleProfileSetupUpdate("select-package"),
  sendMail(NEWSUBSCRIPTION),
  respond(1)
);

// This GET route renders all user submissions
router.get(
  "/submissions",
  schemaQueryConstructor("query", ["artistId"]),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAINCLUDE, [
    { m: USERPACKAGE, al: "subscription", at: ["status"] },
  ]),
  getAndCountAllFromSchema(RELEASE),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  addToSchema(SITEDATA, { title: "Releases" }),
  pageRender()
);

//This GET route handles request for submission store links
router.get(
  "/getReleaseLinks",
  schemaQueryConstructor("query", ["slug"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: RELEASE,
      al: "release",
      at: ["id", "title", "artwork"],
      i: [
        {
          m: USER,
          at: ["id", "type"],
          i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
        },
        {
          m: LABELARTIST,
          at: ["id", "stagename"],
        },
      ],
    },
  ]),
  getOneFromSchema(LINK),
  respondIf(SCHEMARESULT, false, { error: true }),
  respond([SCHEMARESULT])
);

// This GET route renders a single user submission
router.get(
  "/submission/:id",
  schemaQueryConstructor("params", ["id"]),
  redirectIf(SCHEMAQUERY, false, "/submissions"),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: USERPACKAGE,
      al: "subscription",
      at: ["id", "status"],
      i: [{ m: PACKAGE, al: "package", at: ["package"] }],
    },
    { m: TRACK, al: "tracks" },
    {
      m: USER,
      at: ["id"],
      i: [{ m: USERPROFILE, al: "profile", at: ["stageName", "label"] }],
    },
    { m: LABELARTIST, at: ["stageName"] },
    { m: "link", at: ["slug"] },
  ]),
  getOneFromSchema(RELEASE),
  redirectIf(SCHEMARESULT, false, "/submissions"),
  sameAs("status", "incomplete", SCHEMARESULT),
  redirectIf(SAMEAS, true, "/add-music/{id}", [SCHEMAQUERY]),
  sameAs("status", "deleted", SCHEMARESULT),
  redirectIf(SAMEAS, true, "/submissions"),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  addToSchema(SITEDATA, { title: "Release", page: "submission" }),
  seeStore([SITEDATA, PAGEDATA]),
  pageRender()
);

// This GET route renders all user subscriptions
router.get(
  "/subscriptions",
  schemaQueryConstructor("user", ["id"], ["userId"]),
  schemaQueryConstructor("query", ["artistId"]),
  addToSchema(SCHEMAINCLUDE, [
    { m: RELEASE, al: "releases", at: ["id"] },
    { m: PACKAGE },
  ]),
  getAllFromSchema(USERPACKAGE),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  pageRender()
);

// This GET route renders a user's single subscription
router.get(
  "/subscription/:id",
  schemaQueryConstructor("params", ["id"], null, true),
  redirectIf(SCHEMAQUERY, false, "/subscriptions"),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: RELEASE,
      al: "releases",
    },
    { m: PACKAGE, at: ["package", "maxTracks", "maxAlbums"] },
  ]),
  getOneFromSchema(USERPACKAGE),
  redirectIf(SCHEMARESULT, false, "/subscriptions"),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  addToSchema(SITEDATA, { page: "subscription" }),
  seeStore([SITEDATA, PAGEDATA]),
  pageRender()
);

////// FAQ
router.get("/faqs", addToSchema(SITEDATA, { title: "FAQs" }), pageRender());

///////// LOGOUT
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/account");
});

/// mail tester ... testing purposes
router.get("/mail", (req, res) =>
  res.render("mailTemplates/userContact", {
    firstName: "John",
    url: "h",
    email: "h",
    content: "g",
    subject: "j",
  })
);

router.get(
  "/dotest",
  addToSchema(SITEDATA, {
    page: "addMusic/create",
    title: "Release Wizard",
  }),
  pageRender()
  // addToSchema("tempKey", { token: "464646fg" }),
  // addToSchema(SCHEMARESULT, { email: "hope@fresible.com" }),
  // urlFormer("/account", "tempKey"),
  // sendMail("userContact"),
  // respondIf("mailStatus", true, "MAIL SENT"),
  // respond("Mail not sent")
);

router.get(
  "/test-popup",
  addToSchema(SITEDATA, { page: "partials/popups/test", title: "Popup" }),
  pageRender()
);

/// catches all unhandled pages by emitting a 404 page not found
router.all(
  "*",
  (req, res, next) => {
    if (req.method.toLowerCase() === "get") return next();
    return res.status(404).json({ status: "error", data: "route not found" });
  },
  addToSchema(SITEDATA, { page: "404", title: "Page Not Found" }),
  pageRender()
);

module.exports = router;
