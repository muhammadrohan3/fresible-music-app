const { SCHEMAQUERY, SCHEMADATA } = require("../../constants");
const schemaConstructor = require("../util/schemaConstructor");
const valExtractor = require("../util/valExtractor");

//GETS THE DESIRED KEY DATA FROM REQ TO STORE
const fromReq = ({ req, setStore }) => schemaConstructor(req, setStore);

//GETS THE DESIRED KEY DATA FROM A STORE KEY TO ANOTHER KEY IN STORE
const fromStore = ({ getStore, setStore }) =>
  schemaConstructor(getStore(), setStore);

//GETS THE DESIRED DATA FROM QUERY KEY IN REQ TO THE SCHEMAQUERY KEY IN STORE
const schemaQueryConstructor = ({ req, setStore }) => (key, items, aliases) =>
  schemaConstructor(req, setStore).call(null, key, items, SCHEMAQUERY, aliases);

//GETS THE DESIRED DATA FROM QUERY KEY IN REQ TO THE SCHEMAQUERY KEY IN STORE
const schemaDataConstructor = ({ req, setStore }) => (key, items, aliases) =>
  schemaConstructor(req, setStore).call(null, key, items, SCHEMADATA, aliases);

const selectFromList = ({ getStore, setStore }) => (
  storeLocation,
  keys = [],
  destination,
  aliases = []
) => {
  const location = Array.isArray(storeLocation)
    ? storeLocation
    : [storeLocation];
  const list = valExtractor(getStore(), location);
  const extracted = (list || []).map((item = {}) => {
    return keys.reduce(
      (acc, currentKey, index) => ({
        ...acc,
        [aliases[index] || currentKey]: item[currentKey],
      }),
      {}
    );
  });
  if (!destination) throw new Error("SELECT-FROM-LIST: destination not found");
  return setStore(destination, extracted);
};

module.exports = {
  fromReq,
  fromStore,
  schemaQueryConstructor,
  schemaDataConstructor,
  selectFromList,
};
