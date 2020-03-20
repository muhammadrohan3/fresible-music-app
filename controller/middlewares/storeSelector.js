const { SCHEMAQUERY, SCHEMADATA } = require("../../constants");
const schemaConstructor = require("../util/schemaConstructor");

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

module.exports = {
  fromReq,
  fromStore,
  schemaQueryConstructor,
  schemaDataConstructor
};
