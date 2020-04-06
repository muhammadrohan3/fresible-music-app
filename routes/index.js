const router = require("express").Router();
const completeProfile = require("./complete-profile");
const addMusic = require("./add-music");
const contactUs = require("./contact-us");
const confirmAccount = require("./confirm-account");
const payment = require("./payment");
const profile = require("./profile");
const account = require("./account");
const artists = require("./artists");
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
  isProfileActive,
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
router.use(isProfileActive());
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
router.use("/complete-profile", completeProfile(Controller));
router.use("/artists", artists(Controller));
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

router.get("/select-account", pageRender());

router.post(
  "/select-account",
  sameAs("profileActive", 1, USER),
  respondIf(SAMEAS, false, "Error: access denied"),
  schemaDataConstructor("body", ["accountType"], ["type"]),
  respondIf(SCHEMADATA, false, "Error: request incomplete"),
  addToSchema(SCHEMADATA, { profileActive: 2 }),
  schemaQueryConstructor(USER, ["id"]),
  updateSchemaData(USER),
  respondIf(SCHEMAMUTATED, false, "Error: could not update data"),
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
  sendMail(NEWSUBSCRIPTION),
  sameAs("profileActive", 4, USER),
  redirectIf(SAMEAS, true, "/select-package/proceed"),
  respond(1)
);

//This route is called if the user is still activating his/her profile
router.get(
  "/select-package/proceed",
  sameAs("profileActive", 4, USER),
  respondIf(SAMEAS, false, 1),
  schemaQueryConstructor(USER, ["id"]),
  addToSchema(SCHEMADATA, { profileActive: 5 }),
  updateSchemaData(USER),
  respond(1)
);

// This GET route renders all user submissions
router.get(
  "/submissions",
  schemaQueryConstructor("query", ["artistId"]),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAQUERY, { status: ["not", "deleted"] }),
  addToSchema(SCHEMAINCLUDE, [
    { m: USERPACKAGE, al: "subscription", at: ["status"] },
  ]),
  getAllFromSchema(RELEASE),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  addToSchema(SITEDATA, { title: "Your Releases" }),
  seeStore(),
  pageRender()
);

//This GET route handles request for submission store links
router.get(
  "/getReleaseLinks",
  schemaQueryConstructor("query", ["slug"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: RELEASE,
      i: [
        { m: TRACK, at: ["artwork", "title", "featured"] },
        { m: ALBUM, at: ["artwork", "name"] },
        {
          m: USER,
          at: ["id"],
          i: [{ m: USERPROFILE, al: "profile", at: ["stageName"] }],
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
  "/submission",
  schemaQueryConstructor("query", ["id"]),
  redirectIf(SCHEMAQUERY, false, "/submissions"),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: USERPACKAGE,
      al: "subscription",
      at: ["id", "status"],
      i: [{ m: PACKAGE, al: "package", at: ["package"] }],
    },
    { m: VIDEO },
    { m: TRACK },
    { m: "link", at: ["slug"] },
    { m: ALBUM, i: [{ m: ALBUMTRACK, al: "tracks" }] },
  ]),
  getOneFromSchema(RELEASE),
  redirectIf(SCHEMARESULT, false, "/submissions"),
  sameAs("status", "incomplete", SCHEMARESULT),
  redirectIf(SAMEAS, true, "/add-music", [SCHEMAQUERY], ["id"]),
  sameAs("status", "deleted", SCHEMARESULT),
  redirectIf(SAMEAS, true, "/submissions"),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
  addToSchema(SITEDATA, { title: "Release" }),
  pageRender()
);

router.get(
  "/submission/album",
  schemaQueryConstructor("query", ["id"]),
  redirectIf(SCHEMAQUERY, false, "/submissions"),
  addToSchema(SCHEMAINCLUDE, [
    { m: ALBUMTRACK, al: "tracks" },
    { m: RELEASE, al: "release", at: ["status", "id", "userId"] },
  ]),
  getOneFromSchema(ALBUM),
  redirectIf(SCHEMARESULT, false, "/submissions"),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  setStoreIf(
    [SCHEMARESULT, "release", "userId"],
    [SCHEMAQUERY, "userId"],
    TEMPKEY,
    true
  ),
  redirectIf(TEMPKEY, false, "/submissions"),
  copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
  addToSchema(SITEDATA, { page: "album/index", title: "Album" }),
  pageRender()
);

//This way we can make sure a subscriber can only view album-track related to him/her;
router.get(
  "/submission/album-track/:albumId/:trackId",
  schemaQueryConstructor("params", ["albumId"]),
  redirectIf(SCHEMAQUERY, false, "/submissions"),
  fromReq("params", ["trackId"], "trackInclude", ["id"]),
  sameAs("trackId", "", "trackInclude"),
  redirectIf(SAMEAS, true, "/submission/album", [SCHEMAQUERY]),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  getOneFromSchema(RELEASE),
  redirectIf(SCHEMARESULT, false, "/submissions"),
  isValueIn("status", ["incomplete", "declined"], SCHEMARESULT),
  redirectIf(SAMEAS, false, "/add-music", [SCHEMAQUERY], ["id"]),
  resetKey(SCHEMAQUERY),
  schemaQueryConstructor("params", ["albumId"], ["id"]),
  fromStore(SCHEMAQUERY, ["id"], TEMPKEY),
  addToSchema(SCHEMAINCLUDE, [
    { m: ALBUMTRACK, al: "tracks", w: "trackInclude" },
  ]),
  getOneFromSchema(ALBUM),
  redirectIf(SCHEMARESULT, false, "/submission/album", [TEMPKEY]),
  copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
  addToSchema(SITEDATA, { page: "album/track", title: "Album Track" }),
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
  seeStore(),
  pageRender()
);

// This GET route renders a user's single subscription
router.get(
  "/subscription",
  schemaQueryConstructor("query", ["id"], null, true),
  redirectIf(SCHEMAQUERY, false, "/subscriptions"),
  schemaQueryConstructor("user", ["id"], ["userId"]),
  addToSchema(SCHEMAINCLUDE, [
    {
      m: RELEASE,
      al: "releases",
      w: [{ status: "deleted" }, "not"],
      r: false,
    },
    { m: PACKAGE, at: ["package", "maxTracks", "maxAlbums"] },
  ]),
  getOneFromSchema(USERPACKAGE),
  redirectIf(SCHEMARESULT, false, "/subscriptions"),
  copyKeyTo(SCHEMARESULT, SITEDATA, "pageData"),
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
