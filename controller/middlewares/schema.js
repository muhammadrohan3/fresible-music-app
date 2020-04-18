const { SCHEMARESULT, SCHEMAQUERY } = require("../../constants");
const organizeData = require("../util/organizeData");
const handleResponse = require("../util/handleResponse");
const idLookUp = require("../util/idLookUp");
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
  sequelize,
  Sequelize,
} = require("../../database/models");
const logger = require("../logger");

const schemaType = (schema, getStore) => {
  if (Array.isArray(schema)) schema = getStore(schema[0]);
  if (!schema) throw Error("SCHEMATYPE_ERROR: NO SCHEMA FOUND");
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
  return "hi";
};

const valueGetter = (attributes) =>
  attributes &&
  attributes.map((item) => {
    if (typeof item !== "object") return item;
    const [fn, col, alias] = item;
    return [sequelize.fn(fn, col), alias];
  });

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

const schemaOptionsGen = (schemaOptions, options) => {
  let Obj = {};
  const { p = 1, limit = 20 } = schemaOptions || {};
  Obj = { ...Obj, limit, offset: 20 * (p - 1) };

  const { order = [["id", "DESC"]], group, distinct = false } = options || {};
  Obj = { ...Obj, order, group: valueGetter(group), distinct };
  return Obj;
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
        if (Array.isArray(vals)) {
          vals = vals.map(
            (item) => item
            // Array.isArray(item) ? { [item]: store[item] } : item
          );
        }
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

  console.log(items);

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
  else if (actionType === "delete") setStore("schemaDeleted", didMutate);
  else setStore("schemaResult", data);
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
    const Model = schemaType(schema, getStore);
    const { schemaInclude, schemaOptions, schemaData } = getStore();
    const Options = {
      ...whereGen({ ...getStore(), schema }, { mutation }),
      ...includeGen(getStore, schemaInclude),
      ...schemaOptionsGen(schemaOptions, options),
      ...schemaAttributes(attributes),
    };

    const data =
      actionType === "get"
        ? await Model[method](Options)
        : await Model[method](schemaData, Options);
    return schemaResultHandler(
      { setStore, getStore, schema, req },
      data,
      actionType
    );
  } catch (err) {
    return handleResponse("error", err);
  }
};

const getAllFromSchema = _modelWrapper("findAll");
const getAndCountAllFromSchema = _modelWrapper("findAndCountAll");
const getOneFromSchema = _modelWrapper("findOne");
const bulkCreateSchema = _modelWrapper("bulkCreate", { actionType: "create" });
const createSchemaData = _modelWrapper("create", { actionType: "create" });
const updateSchemaData = _modelWrapper("update", {
  mutation: true,
  actionType: "update",
});
const deleteSchemaData = _modelWrapper("delete", {
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
  bulkCreateSchema,
  getAndCountAllFromSchema,
  runSql,
};
