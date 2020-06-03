const { SCHEMARESULT, SCHEMAQUERY } = require("../../constants");
const organizeData = require("../util/organizeData");
const handleResponse = require("../util/handleResponse");
const idLookUp = require("../util/idLookUp");
const valExtractor = require("../util/valExtractor");
const {
  User,
  Userprofile,
  Userpackage,
  Package,
  Submission,
  Payment,
  Track,
  Video,
  Album,
  Albumtrack,
  Release,
  Admin,
  Log,
  Link,
  Labelartist,
  Store,
  Analytic,
  Analyticsdate,
  Releasestore,
  Country,
  MonthlyRoyalty,
  Royalty,
  sequelize,
  Sequelize,
} = require("../../database/models");
const logger = require("../logger");

const schemaType = (schema) => {
  console.log(schema);
  schema = schema.toLowerCase();
  if (schema.search(/^users?$/) >= 0) return User;
  if (schema.search(/^userprofiles?$/) >= 0) return Userprofile;
  if (schema.search(/^userpackages?$/) >= 0) return Userpackage;
  if (schema.search(/^packages?$/) >= 0) return Package;
  if (schema.search(/^submissions?$/) >= 0) return Submission;
  if (schema.search(/^payments?$/) >= 0) return Payment;
  if (schema.search(/^releases?$/) >= 0) return Release;
  if (schema.search(/^videos?$/) >= 0) return Video;
  if (schema.search(/^tracks?$/) >= 0) return Track;
  if (schema.search(/^albums?$/) >= 0) return Album;
  if (schema.search(/^albumtracks?$/) >= 0) return Albumtrack;
  if (schema.search(/^admins?$/) >= 0) return Admin;
  if (schema.search(/^logs?$/) >= 0) return Log;
  if (schema.search(/^links?$/) >= 0) return Link;
  if (schema.search(/^labelartists?$/) >= 0) return Labelartist;
  if (schema.search(/^stores?$/) >= 0) return Store;
  if (schema.search(/^analytics?$/) >= 0) return Analytic;
  if (schema.search(/^analyticsdates?$/) >= 0) return Analyticsdate;
  if (schema.search(/^releasestores?$/) >= 0) return Releasestore;
  if (schema.search(/^countr(ies|y)?$/) >= 0) return Country;
  if (schema.search(/^monthlyroyalt(ies|y)?$/) >= 0) return MonthlyRoyalty;
  if (schema.search(/^royalt(ies|y)$/) >= 0) return Royalty;
  return undefined;
};

const valueGetter = (attributes) => {
  return (
    attributes &&
    attributes.map((item) => {
      if (typeof item !== "object") return item;
      const [fn, col, alias] = item;
      return [sequelize.fn(fn, sequelize.col(col)), alias];
    })
  );
};

////////////////////////////////////////SCHEMA INCLUDE GENERATOR ////////////////////////////////
const includeGen = (getStore, includes) => {
  //FORMAT OF PARAM => [[model, as, attributes, innerInclude], [model, as]]
  try {
    if (!includes) return;
    const include = includes.map((include) => {
      if (typeof include !== "object")
        throw new Error(
          `INCLUDEGEN: ${include} includes param must be an object`
        );
      let {
        m: model,
        al: alias,
        at: attributes,
        i: innerInclude,
        w: where,
        r: required,
      } = include;
      if (!alias) alias = model;
      const Model = schemaType(model);
      if (!Model) throw new Error(`INCLUDEGEN: ${model} model not found`);
      if (attributes && !Array.isArray(attributes))
        throw new Error("INCLUDEGEN: attributes must be an array");
      if (where) {
        const [whereKey, whereOp] = where;
        where = whereGen(getStore(), {
          queryKey: whereKey,
          queryMainOp: whereOp,
        });
      }
      return {
        model: Model,
        as: alias,
        ...(where || {}),
        ...(schemaAttributes(attributes) || {}),
        ...includeGen(getStore, innerInclude),
        required,
      };
      // if (where)
    });
    return { include };
  } catch (e) {
    throw new Error(e);
  }
};

const schemaOptionsGen = (getStore, options = {}) => {
  const { schemaQuery = {}, schemaOptions = {} } = getStore();
  const { l = 20, p = 1 } = schemaOptions;
  const schemaOptionsHash = {
    limit: Number(l),
    offset: Number(l) * (Number(p) - 1),
    order: [["id", "DESC"]],
    group: undefined,
    distinct: false,
  };
  //options > schemaOptions > schemaQuery
  Object.keys(schemaOptionsHash).forEach((key) => {
    if (options.hasOwnProperty(key)) schemaOptionsHash[key] = options[key];
    else if (schemaOptions.hasOwnProperty(key))
      schemaOptionsHash[key] = schemaOptions[key];
    else if (schemaQuery.hasOwnProperty(key))
      schemaOptionsHash[key] = schemaQuery[key];
  });

  schemaOptionsHash["order"] = schemaOptionsHash["order"].map((orderItem) =>
    valueGetter(orderItem)
  );
  return schemaOptionsHash;
};

const schemaAttributes = (attributes) => ({
  attributes: valueGetter(attributes),
});

//GENERATES THE WHEN ATTRIBUTE
const whereGen = (store, data = {}) => {
  const { queryKey, queryMainOp, mutation = false } = data;
  //destructures the OP functions provided by sequelize
  const { Op } = Sequelize;
  //Gets the where query in the store
  const schemaQuery =
    typeof queryKey === "object" ? queryKey : store[queryKey || SCHEMAQUERY];
  const items = [];
  if (!schemaQuery) return;
  //Loops through the schemaQuery object to generate the where object array.
  for (let prop in schemaQuery) {
    if (schemaQuery.hasOwnProperty(prop)) {
      let tempData = Number(schemaQuery[prop]);
      schemaQuery[prop] = Number.isNaN(tempData) ? schemaQuery[prop] : tempData;
      if (/^(t|s|r|e|uid|ps)$/.test(prop)) continue;
      const propVal = schemaQuery[prop];
      if (Array.isArray(propVal)) {
        let [operator, vals] = propVal;
        items.push({ [prop]: { [Op[operator || "and"]]: vals } });
      } else {
        items.push({ [prop]: propVal });
      }
    }
  }

  //FILTERING QUERY
  let {
    t: createdAt,
    s: status,
    r: role,
    e: email,
    uid: userId,
    // ps: status
  } = schemaQuery;
  const { schema } = store;
  createdAt &&
    items.push(
      sequelize.where(
        sequelize.fn(
          "DATE",
          sequelize.col(
            `${schema.endsWith("s") ? schema : schema + "s"}.createdAt`
          )
        ),
        createdAt
      )
    );
  status && items.push({ status: status === "not queried" ? null : status });
  role && items.push({ role });
  email && items.push({ email });
  userId && items.push({ userId: idLookUp(userId) });

  if (mutation && !items.length)
    throw new Error("ERROR: WHEREGEN, where items empty ");
  console.log("-----SCHEMA-WHERE: ", { [Op[queryMainOp || "and"]]: items });
  return {
    where: {
      [Op[queryMainOp || "and"]]: items,
    },
  };
};

const schemaResultHandler = async (
  { setStore, getStore, schema, req },
  schemaResult,
  actionType
) => {
  //Condition that checks if transaction with the DB was successful
  if (!schemaResult) return;
  actionType = actionType && actionType.toLowerCase();
  const didMutate = Array.isArray(schemaResult) && schemaResult[0] > 0;
  const data = organizeData(schemaResult);
  //This condition checks if the type of action was an update or a delete
  if (actionType === "update") setStore("schemaMutated", didMutate);
  else if (actionType === "delete") {
    setStore("schemaDeleted", didMutate);
  } else if (actionType === "getorcreate") {
    setStore("schemaCreated", data[1]);
    setStore("schemaResult", data[0]);
  } else setStore("schemaResult", data);
  if (actionType) {
    if (Array.isArray(schema)) schema = getStore(schema[0]);
    logger(
      { ...getStore(), schemaResult: data, didMutate },
      schema,
      actionType,
      req.originalUrl
    );
  }
  return;
};

const runSql = ({ getStore, setStore }) => async (model, type, args) => {
  let query;
  if (type === "TIMEINTERVAL")
    query = `SELECT COUNT(*) as 'count', DATE(${model}.createdAt) as 'date' FROM ${model} WHERE createdAt >= date_sub(now(), interval 7 day) GROUP BY DAY(${model}.createdAt)`;
  if (!query) return handleResponse("error", "RUNSQL: NO QUERY TO EXECUTE");
  const data = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  return setStore(SCHEMARESULT, data);
};

const _modelWrapper = (method, extras = {}) => ({
  getStore,
  setStore,
  req,
}) => async (schema, attributes, options) => {
  try {
    const { mutation = false, actionType = "get" } = extras;

    //get the schemaName value;
    const schemaName = Array.isArray(schema)
      ? valExtractor(getStore(), valExtractor)
      : schema;
    if (!schemaName) throw new Error("SCHEMA-HANDLER: schemaName not found");
    const Model = schemaType(schemaName, getStore); //get the model from the schemaType handler
    const { schemaInclude, schemaData } = getStore();
    const Options = {
      ...whereGen({ ...getStore(), schema }, { mutation }),
      ...includeGen(getStore, schemaInclude),
      ...schemaOptionsGen(getStore, options),
      ...schemaAttributes(attributes),
    };
    let data;

    switch (actionType) {
      case "get":
        data = await Model[method](Options);
        break;
      case "delete":
        data = await Model[method](
          whereGen({ ...getStore(), schema }, { mutation })
        );
        break;
      case "create":
        data = await Model[method](schemaData);
        break;
      case "getOrCreate":
        data = await Model[method]({ ...Options, ...{ defaults: schemaData } });
        break;
      default:
        data = await Model[method](schemaData, Options);
    }

    return schemaResultHandler(
      { setStore, getStore, schema, req },
      data,
      actionType
    );
  } catch (err) {
    return handleResponse("error", err);
  }
};

const getAllFromSchema = _modelWrapper("findAll", { actionType: "get" });
const getAndCountAllFromSchema = _modelWrapper("findAndCountAll", {
  actionType: "get",
});
const getOneFromSchema = _modelWrapper("findOne", { actionType: "get" });
const bulkCreateSchema = _modelWrapper("bulkCreate", { actionType: "create" });
const createSchemaData = _modelWrapper("create", { actionType: "create" });
const getOrCreateSchemaData = _modelWrapper("findOrCreate", {
  actionType: "getOrCreate",
});
const updateSchemaData = _modelWrapper("update", {
  mutation: true,
  actionType: "update",
});
const deleteSchemaData = _modelWrapper("destroy", {
  mutation: true,
  actionType: "delete",
});

// const bulkCreateSchema = ({ getStore, setStore }) => async (schema) => {
//   try {
//     const Model = schemaType(schema, getStore);
//     const { schemaData } = getStore();
//     const data = await Model.bulkCreate(schemaData);
//     return schemaResultHandler({ setStore, getStore, schema }, data);
//   } catch (err) {
//     throw new Error(err);
//   }
// };

module.exports = {
  getAllFromSchema,
  getOneFromSchema,
  updateSchemaData,
  deleteSchemaData,
  createSchemaData,
  getOrCreateSchemaData,
  bulkCreateSchema,
  getAndCountAllFromSchema,
  runSql,
};
