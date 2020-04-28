const { SCHEMAQUERY, SCHEMADATA } = require("../../constants");
const schemaConstructor = require("../util/schemaConstructor");
const valExtractor = require("../util/valExtractor");

const fromReq = ({ req, setStore }) => (
  key,
  items,
  destination,
  aliases,
  dontSet
) =>
  schemaConstructor(
    { setStore },
    req[key],
    items,
    destination,
    aliases,
    dontSet
  );
const fromStore = ({ getStore, setStore }) => (
  key,
  items,
  destination,
  aliases,
  dontSet
) =>
  schemaConstructor(
    { setStore },
    getStore(key),
    items,
    destination,
    aliases,
    dontSet
  );
const schemaQueryConstructor = ({ req, setStore }) => (
  key,
  items,
  aliases,
  dontSet
) =>
  schemaConstructor(
    { setStore },
    req[key],
    items,
    SCHEMAQUERY,
    aliases,
    dontSet
  );
const schemaDataConstructor = ({ req, setStore }) => (
  key,
  items,
  aliases,
  dontSet
) =>
  schemaConstructor(
    { setStore },
    req[key],
    items,
    SCHEMADATA,
    aliases,
    dontSet
  );

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
