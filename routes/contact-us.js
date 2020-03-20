const router = require("express").Router();
const { USERCONTACT, SCHEMADATA } = require("../constants");

module.exports = Controller => {
  const {
    seeStore,
    addToSchema,
    fromReq,
    pageRender,
    copyKeyTo,
    respond,
    respondIf,
    sendMail,
    schemaDataConstructor
  } = Controller;

  // THis GET route renders the contact us page
  router.get("/", pageRender());

  // This GET route handles contact message submitted by the client, sends mail to both the client and admin
  router.post(
    "/",
    schemaDataConstructor("body", ["subject", "content"]),
    respondIf(SCHEMADATA, false, "incomplete contact submission"),
    seeStore(),
    sendMail(USERCONTACT),
    sendMail("contactMessage", {}, "admin"),
    respond(
      "We just established a contact connection with you, an approval has been set to your mail box"
    )
  );

  return router;
};
