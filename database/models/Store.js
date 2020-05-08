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
      storeLogo: DataTypes.STRING,
    },
    { timestamps: false }
  );
  Store.associate = function ({ Release, Releasestore }) {
    //STORE belongsToMany RELEASES
    this.belongsToMany(Release, {
      through: Releasestore,
      foreignKey: "storeId",
      as: "releases",
    });
  };
  return Store;
};
