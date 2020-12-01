const { Release } = require("../../database/models");

const updateReleaseStatusWhenSubscriptionIsActivated = ({
  getStore,
  setStore,
}) => async (source, key) => {
  const userPackageId = getStore(source)[key];
  return await Release.update(
    { status: "processing" },
    { where: { userPackageId } }
  );
};

module.exports = { updateReleaseStatusWhenSubscriptionIsActivated };
