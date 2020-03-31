const {
  addMusicMiddlewares,
  addToSchema,
  schema,
  isProfileActive,
  isAuthenticated,
  sendMail,
  paystackMiddleWare,
  resetKey,
  redirecter,
  responder,
  sameAs,
  pageRender,
  loginUser,
  isAdmin,
  comparePassword,
  encryptPassword,
  cookies,
  deepKeyExtractor,
  copyKeyTo,
  idMiddleWare,
  urlMiddleWare,
  storeSelector,
  generateToken,
  addUserToStore,
  addSiteDefaultData,
  addMusicCompSwitcher,
  seeStore,
  setStoreIf,
  smartLinkGenerator
} = require("./middlewares/index");

const wrapper = require("./wrapper");
const {
  addMusic_structureReleaseType,
  addMusic_structureSubs
} = addMusicMiddlewares;
const { paystack, paystackConstructor } = paystackMiddleWare;
const {
  getAllFromSchema,
  getOneFromSchema,
  updateSchemaData,
  bulkCreateSchema,
  createSchemaData,
  getAndCountAllFromSchema,
  runSql
} = schema;

const { redirect, redirectIf } = redirecter;
const { respond, respondIf } = responder;
const { cookieClearer, cookieSetter } = cookies;
const {
  fromReq,
  fromStore,
  schemaQueryConstructor,
  schemaDataConstructor
} = storeSelector;

// console.log("TOP INDEX: ", User, Userpackage);

module.exports = function() {
  return {
    resetKey: wrapper(resetKey, "resetKey"),
    pageRender: wrapper(pageRender, "pageRender"),
    separator: (req, res, next) => {
      console.log(
        "NOISE SEPARATOR: ",
        "//////////////////////////////////////////////////////////////"
      );
      next();
    },
    isProfileActive: wrapper(isProfileActive, "isProfileActive"),
    isAuthenticated: wrapper(isAuthenticated, "isAuthenticated"),
    isAdmin: wrapper(isAdmin, "isAdmin"),
    seeStore: wrapper(seeStore, "seeStore"),
    respond: wrapper(respond, "respond"),
    respondIf: wrapper(respondIf, "respondIf"),
    redirect: wrapper(redirect, "redirect"),
    redirectIf: wrapper(redirectIf, "redirectIf"),
    fromReq: wrapper(fromReq, "fromReq"),
    fromStore: wrapper(fromStore, "fromStore"),
    schemaQueryConstructor: wrapper(
      schemaQueryConstructor,
      "schemaQueryConstructor"
    ),
    schemaDataConstructor: wrapper(
      schemaDataConstructor,
      "schemaDataConstructor"
    ),
    addToSchema: wrapper(addToSchema, "addToSchema"),
    copyKeyTo: wrapper(copyKeyTo, "copyKeyTo"),
    deepKeyExtractor: wrapper(deepKeyExtractor, "deepKeyExtractor"),
    runSql: wrapper(runSql, "runSql"),
    getAllFromSchema: wrapper(getAllFromSchema, "getAllFromSchema"),
    getAndCountAllFromSchema: wrapper(
      getAndCountAllFromSchema,
      "getAndCountAllFromSchema"
    ),
    getOneFromSchema: wrapper(getOneFromSchema, "getOneFromSchema"),
    bulkCreateSchema: wrapper(bulkCreateSchema, "bulkCreateSchema"),
    createSchemaData: wrapper(createSchemaData, "createSchemaData"),
    updateSchemaData: wrapper(updateSchemaData, "updateSchemaData"),
    encryptPassword: wrapper(encryptPassword, "encryptPassword"),
    comparePassword: wrapper(comparePassword, "comparePassword"),
    sameAs: wrapper(sameAs, "sameAs"),
    loginUser: wrapper(loginUser, "loginUser"),
    generateToken: wrapper(generateToken, "generateToken"),
    sendMail: wrapper(sendMail, "sendMail"),
    addMusicCompSwitcher: wrapper(addMusicCompSwitcher, "addMusicCompSwitcher"),
    idMiddleWare: wrapper(idMiddleWare, "idMiddleWare"),
    addSiteDefaultData: wrapper(addSiteDefaultData, "addSiteDefaultData"),
    cookieSetter: wrapper(cookieSetter, "cookieSetter"),
    cookieClearer: wrapper(cookieClearer, "cookieClearer"),
    paystackConstructor: wrapper(paystackConstructor, "paystackConstructor"),
    paystack: wrapper(paystack, "paystack"),
    urlFormer: wrapper(urlMiddleWare, "urlFormer"),
    addUserToStore: wrapper(addUserToStore, "addUserToStore"),
    generateSmartLink: wrapper(smartLinkGenerator, "smartLinkGenerator"),
    addMusic_structureReleaseType: wrapper(
      addMusic_structureReleaseType,
      "structureReleaseType"
    ),
    addMusic_structureSubs: wrapper(addMusic_structureSubs, "structureSubs"),
    setStoreIf: wrapper(setStoreIf)
  };
};
