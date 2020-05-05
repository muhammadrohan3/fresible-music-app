"use strict";
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define(
    "stores",
    {
      store: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM,
        values: ["stream", "download", "both"],
      },
      goLiveTime: DataTypes.STRING,
      storeLogoId: DataTypes.INTEGER,
    },
    {}
  );
  Store.associate = function ({ Upload, Release, Releasestore }) {
    this.belongsTo(Upload, { foreignKey: "storeLogoId", as: "storeLogo" });

    //STORE belongsToMany RELEASES
    this.belongsToMany(Release, {
      through: Releasestore,
      foreignKey: "storeId",
      as: "releases",
    });
  };
  return Store;
};
