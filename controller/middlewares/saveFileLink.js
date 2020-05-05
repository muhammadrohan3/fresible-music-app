const { Upload } = require("../../database/models");

const saveFileLink = ({ getStore, setStore }) => async (
  schemaDataKeys = [],
  toSaveAsKeys = []
) => {
  const { schemaData } = getStore();
  const urls = schemaDataKeys.map((key) => schemaData[key]);
  if (!urls.length) return;
  const response = JSON.parse(JSON.stringify(await Upload.bulkCreate(urls)));
  response.forEach((res, index) => {
    let key = toSaveAsKeys[index] ? toSaveAsKeys[index] : schemaDataKeys[index];
    setStore(["schemaData", key], res.id);
  });
  return;
};

module.exports = { saveFileLink };
