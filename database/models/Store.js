"use strict";
module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define(
    "store",
    {
      store: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM,
        values: ["streaming", "downloading", "both"],
      },
      goLiveTime: DataTypes.STRING,
      storeLogoId: DataTypes.INTEGER,
    },
    {}
  );
  Store.associate = function ({ Upload }) {
    this.belongsTo(Upload, { foreignKey: "storeLogoId", as: "storeLogo" });
  };
  return Store;
};
