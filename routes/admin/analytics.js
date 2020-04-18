const router = require("express").Router();

const {
  SCHEMAQUERY,
  SCHEMAMUTATED,
  SCHEMARESULT,
  SCHEMAINCLUDE,
  SAMEAS,
  RELEASE,
  TRACK,
  ALBUM,
  ALBUMTRACK,
  VIDEO,
  USER,
  USERPACKAGE,
  USERPROFILE,
  PACKAGE,
  STORE,
  COMPDATA,
  SCHEMADATA,
  SITEDATA,
  NEWRELEASE,
  PAGEDATA,
  LABELARTIST,
  TEMPKEY,
} = require("../../constants");

module.exports = (Controller) => {
  const {
    seeStore,
    schemaDataConstructor,
    schemaQueryConstructor,
    updateSchemaData,
    deleteSchemaData,
    getOneFromSchema,
    getAllFromSchema,
    bulkCreateSchema,
    addToSchema,
    createSchemaData,
    fromReq,
    pageRender,
    fromStore,
    addMusicCompSwitcher,
    resetKey,
    copyKeyTo,
    idMiddleWare,
    sameAs,
    deepKeyExtractor,
    respond,
    respondIf,
    redirectIf,
    redirect,
    urlFormer,
    sendMail,
    isValueIn,
    setStoreIf,
    addMusic_structureReleaseType,
    addMusic_structureSubs,
    addMusic_checkIncompleteCreation,
  } = Controller;

  router.get(
    "/",
    addToSchema(SITEDATA, { page: "analytics", title: "Analytics" }),
    pageRender()
  );

  router.get(
    "/add",
    addToSchema(SITEDATA, { page: "analyticsAdd", title: "Add Analytics" }),
    pageRender()
  );

  router.get(
    "/release",
    addToSchema(SITEDATA, {
      page: "releaseAnalytics",
      title: "Release Analytics",
    }),
    pageRender()
  );

  return router;
};
