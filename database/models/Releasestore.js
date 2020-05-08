"use strict";
module.exports = (sequelize, DataTypes) => {
  const Releasestore = sequelize.define(
    "releasestores",
    {
      releaseId: DataTypes.INTEGER,
      storeId: DataTypes.INTEGER,
    },
    { timestamps: false }
  );
  Releasestore.associate = function ({ Release, Store }) {
    this.belongsTo(Release, { foreignKey: "releaseId", as: "release" });
    this.belongsTo(Store, { foreignKey: "storeId", as: "store" });
  };
  return Releasestore;
};
