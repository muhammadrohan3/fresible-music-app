const router = require("express").Router();

const {
  SAMEAS,
  SCHEMADATA,
  SCHEMAMUTATED,
  SCHEMAQUERY,
  SCHEMARESULT
} = require("../constants");

const {
  generateToken,
  schemaQueryConstructor,
  schemaDataConstructor,
  customConstructor,
  updateSchemaData,
  createSchemaData,
  sendVerifyMail,
  encryptPassword,
  getOneFromSchema,
  comparePassword,
  loginUser,
  pageRedirect,
  customSchemaInfoConstructor,
  shouldProceed,
  seeStore,
  addToSchema,
  sendWelcomeMail,
  fromReq,
  separator,
  clearStore,
  sameAs,
  fromStore,
  cookieSetter,
  cookieClearer,
  redirect,
  redirectIf,
  respond,
  respondIf,
  urlFormer,
  copyKeyTo,
  sendMail,
  resetKey
} = require("../controller");

// router.post("/login", loginUser);

router.post(
  "/login",
  clearStore,
  schemaQueryConstructor("body", ["email"]),
  getOneFromSchema("user"),
  respondIf(
    SCHEMARESULT,
    false,
    "User not found for the provided E-mail address"
  ),
  seeStore(),
  fromReq("body", ["password"], "passwordToCompare"),
  comparePassword,
  shouldProceed("loginChecked", true, "Incorrect Password, try again..."),
  loginUser,
  sameAs("isVerified", false, "schemaResult"),
  fromStore(SCHEMARESULT, ["email"], "tempKey", ["isVerified"]),
  cookieClearer("isVerified"),
  redirectIf(SAMEAS, true, "/auth/login/set-cookie", "tempKey"),
  respond(1)
);

router.get(
  "/login/set-cookie",
  clearStore,
  fromReq("query", ["isVerified"], "cookieKey"),
  cookieSetter("isVerified", 30000),
  separator,
  seeStore(),
  respond(1)
);

router.get("/logout", clearStore, seeStore(), (req, res, next) => {
  req.logout();
  res.redirect("/account");
});

router.post(
  "/register",
  schemaQueryConstructor("body", ["email"]),
  shouldProceed("schemaQuery", true, "re-submit the form"),
  getOneFromSchema("user"),

  seeStore(),
  shouldProceed(
    "schemaResult",
    false,
    "User with this email address already exist"
  ),
  schemaDataConstructor("body"),
  encryptPassword("schemaData", "password"),
  createSchemaData("user"),
  seeStore(),
  loginUser,
  shouldProceed("loggedIn", false, 1)
  // shouldProceed("schemaResult", false, null, {
  //   route: "/auth/account-verify",
  //   params: ["email"]
  // })
);

// router.get("/hi", (req, res) => console.log(req.get("host")));
router.post(
  "/forgot-password",
  schemaQueryConstructor("body", ["email"]),
  addToSchema(SCHEMADATA, { tokenType: "reset" }),
  generateToken(10, SCHEMADATA),
  updateSchemaData("user"),
  respondIf(
    SCHEMAMUTATED,
    false,
    "A user account for that email address isn't found in our database"
  ),
  fromStore(SCHEMADATA, ["token"], "tempKey"),
  urlFormer("/account", "tempKey"),
  addToSchema("mailKey", {
    subject: "Password Reset Instructions",
    template: "passwordReset.ejs"
  }),
  fromStore(SCHEMAQUERY, ["email"], "mailKey"),
  copyKeyTo("url", "templateVars"),
  copyKeyTo("templateVars", "mailKey"),
  sendMail(),
  seeStore(),
  respond(
    "Password reset instruction has been sent to your email address, check to continue..."
  )
);

router.post(
  "/reset-password",
  schemaQueryConstructor("query", ["token"]),
  respondIf(
    SCHEMAQUERY,
    false,
    "Token not found, please request for a new token"
  ),
  schemaDataConstructor("body", ["password"]),
  respondIf(SCHEMADATA, false, "Password missing"),
  getOneFromSchema("user"),
  respondIf(
    SCHEMARESULT,
    false,
    "Token does not match, please request for a new token"
  ),
  resetKey(SCHEMAQUERY),
  fromStore(SCHEMARESULT, ["id"], SCHEMAQUERY),
  encryptPassword(SCHEMADATA, "password"),
  addToSchema(SCHEMADATA, { tokenType: "", token: "" }),
  updateSchemaData("user"),
  respondIf(
    SCHEMAMUTATED,
    false,
    "Error occured changing your password... try again"
  ),
  respond(1)
);

// router.post(
//   "/account-verify",

//   schemaQueryConstructor("body", ["email"]),
//   updateSchemaData("user"),
//   sendVerifyMail,
//   seeStore(),
//   shouldProceed("mailStatus", false, true)
// );

router.get("/test", seeStore());

router.get(
  "/vtc",
  schemaQueryConstructor("query", ["token"], null, 1),
  redirectIf(SCHEMAQUERY, false, "/"),
  addToSchema("schemaData", { isVerified: 1 }),
  updateSchemaData("user"),
  redirectIf(SCHEMAMUTATED, false, "/"),
  getOneFromSchema("user"),
  addToSchema("mailKey", {
    subject: "You are Welcome",
    template: "welcome.ejs"
  }),
  fromStore(SCHEMARESULT, ["email"], "mailKey"),
  fromStore(SCHEMARESULT, ["firstName"], "templateVars"),
  copyKeyTo("templateVars", "mailKey"),
  sendMail(),
  redirect("/")
);

module.exports = router;
