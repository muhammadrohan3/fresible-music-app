const { Release, Userpackage } = require("../../database/models");

const getToBePublishedReleaseStatus = ({ getStore, setStore }) => async (
  source,
  key
) => {
  let status = "pending";
  const attr = getStore()[source];
  const release = await Release.findOne({ where: attr });
  const userPackage = await Userpackage.findByPk(release.userPackageId);
  if (userPackage.status.toLowerCase() === "active") status = "processing";
  return setStore("RELEASE-STATUS", { status });
};

module.exports = { getToBePublishedReleaseStatus };
