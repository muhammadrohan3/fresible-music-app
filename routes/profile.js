const router = require("express").Router();

const {
  SCHEMADATA,
  SCHEMAMUTATED,
  SCHEMARESULT,
  SCHEMAINCLUDE,
  SITEDATA,
  PAGEDATA,
  USER,
  USERPROFILE,
  PASSWORDCHANGED,
} = require("../constants");

module.exports = (Controller) => {
  const {
    seeStore,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
    getOneFromSchema,
    addToSchema,
    pageRender,
    fromStore,
    copyKeyTo,
    respond,
    respondIf,
    comparePassword,
    encryptPassword,
    sendMail,
  } = Controller;

  // This GET route renders the profile page
  router.get(
    "/",
    schemaQueryConstructor(USER, ["id"]),
    addToSchema(SCHEMAINCLUDE, [{ m: USERPROFILE, al: "profile" }]),
    getOneFromSchema(USER),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { page: "profile/index", title: "Profile" }),
    seeStore([SITEDATA]),
    pageRender()
  );

  // This GET route renders the profile edit page
  router.get(
    "/edit",
    schemaQueryConstructor(USER, ["id"], ["userId"]),
    getOneFromSchema(USERPROFILE),
    copyKeyTo(SCHEMARESULT, SITEDATA, PAGEDATA),
    addToSchema(SITEDATA, { title: "Edit Profile" }),
    pageRender()
  );

  // This POST route updates user's profile details
  router.post(
    "/edit",
    schemaQueryConstructor(USER, ["id"], ["userId"]),
    schemaDataConstructor("body"),
    updateSchemaData(USERPROFILE),
    respondIf(
      SCHEMAMUTATED,
      false,
      "An error occured updating your profile, please try again."
    ),
    respond(1)
  );

  // This GET route renders the profile change password page
  router.get(
    "/change-password",
    addToSchema(SITEDATA, { title: "Change password" }),
    pageRender()
  );

  // This POST route updates user's password
  router.post(
    "/change-password",
    schemaQueryConstructor(USER, ["id"]),
    schemaDataConstructor("body"),
    getOneFromSchema(USER),
    fromStore(SCHEMADATA, ["oldPassword"], "passwordToCompare", ["password"]),
    comparePassword(),
    respondIf(
      "loginChecked",
      false,
      "Error: couldn't change password, the old password doesn't match the one in the database"
    ),
    encryptPassword(SCHEMADATA, "password"),
    updateSchemaData(USER),
    respondIf(
      SCHEMAMUTATED,
      false,
      "Error: something went wrong, couldn't change password"
    ),
    sendMail(PASSWORDCHANGED),
    respond("Your password has been changed successfully.")
  );

  // This GET Route renders the profile change email page
  router.get(
    "/change-email",
    addToSchema(SITEDATA, { title: "Change Email" }),
    pageRender()
  );

  return router;
};
