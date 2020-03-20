const router = require("express").Router();

const {
  SAMEAS,
  SCHEMADATA,
  SCHEMAMUTATED,
  SCHEMAQUERY,
  SCHEMARESULT,
  USER,
  TEMPKEY,
  WELCOME,
  PASSWORDCHANGED,
  PASSWORDRESET
} = require("../constants");

module.exports = Controller => {
  const {
    generateToken,
    schemaQueryConstructor,
    schemaDataConstructor,
    updateSchemaData,
    createSchemaData,
    encryptPassword,
    getOneFromSchema,
    comparePassword,
    loginUser,
    seeStore,
    addToSchema,
    fromReq,
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
  } = Controller;

  router.get(
    "/", /// Renders the account page (containing all auth components)
    (req, res) => {
      res.render("account");
    }
  );

  router.post(
    "/login",
    schemaQueryConstructor("body", ["email"]),
    getOneFromSchema(USER),
    respondIf(
      SCHEMARESULT,
      false,
      "User not found for the provided E-mail address"
    ),
    fromReq("body", ["password"], "passwordToCompare"),
    comparePassword(),
    respondIf("loginChecked", false, "Incorrect Password, try again..."),
    loginUser(),
    respondIf("loggedIn", false, "Error logging you in... try again"),
    sameAs("isVerified", false, SCHEMARESULT),
    fromStore(SCHEMARESULT, ["email"], TEMPKEY, ["isVerified"]),
    cookieClearer("isVerified"),
    redirectIf(SAMEAS, true, "/auth/login/set-cookie", TEMPKEY),
    respond(1)
  );

  router.get(
    "/login/set-cookie",
    fromReq("query", ["isVerified"], "cookieKey"),
    cookieSetter("isVerified", 30000),
    respond(1)
  );

  router.post(
    "/register",
    schemaQueryConstructor("body", ["email"]),
    respondIf(SCHEMAQUERY, false, "re-submit the form"),
    getOneFromSchema(USER),
    respondIf(SCHEMARESULT, true, "User with this email address already exist"),
    schemaDataConstructor("body"),
    encryptPassword(SCHEMADATA, "password"),
    createSchemaData(USER),
    loginUser(),
    sendMail(WELCOME),
    respondIf("loggedIn", false, "Login Error"),
    respond(1)
  );

  router.post(
    "/forgot-password",
    schemaQueryConstructor("body", ["email"]),
    addToSchema(SCHEMADATA, { tokenType: "reset" }),
    generateToken(10, SCHEMADATA),
    updateSchemaData(USER),
    respondIf(
      SCHEMAMUTATED,
      false,
      "A user account for that email address isn't found in our database"
    ),
    fromStore(SCHEMADATA, ["token"], TEMPKEY),
    urlFormer("/account", TEMPKEY),
    sendMail(PASSWORDRESET, { email: [SCHEMAQUERY, "email"] }),
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
    getOneFromSchema(USER),
    respondIf(
      SCHEMARESULT,
      false,
      "Token does not match, please request for a new token"
    ),
    resetKey(SCHEMAQUERY),
    fromStore(SCHEMARESULT, ["id"], SCHEMAQUERY),
    encryptPassword(SCHEMADATA, "password"),
    addToSchema(SCHEMADATA, { tokenType: "", token: "" }),
    updateSchemaData(USER),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error occured changing your password... try again"
    ),
    sendMail(PASSWORDCHANGED),
    respond(1)
  );

  router.get("/test", seeStore());

  return router;
};
