const router = require("express").Router();

const { SCHEMARESULT, USERPACKAGE, NEWSUBSCRIPTION } = require("../constants");

module.exports = Controller => {
  const {
    seeStore,
    respondIf,
    respond,
    schemaDataConstructor,
    createSchemaData,
    pageRender,
    urlFormer,
    fromStore,
    sendMail
  } = Controller;

  // This GET ROUTE renders the select package page
  router.get("/", pageRender());

  // This POST route creates a new package for the user
  router.post(
    "/",
    schemaDataConstructor("body", ["packageId"]),
    schemaDataConstructor("user", ["id"], ["userId"]),
    createSchemaData(USERPACKAGE),
    respondIf(
      SCHEMARESULT,
      false,
      "Could not process the request, try again..."
    ),
    fromStore(SCHEMARESULT, ["id"], "tempKey"),
    urlFormer("/subscription", "tempKey"),
    sendMail(NEWSUBSCRIPTION),
    respond(1)
  );

  return router;
};
