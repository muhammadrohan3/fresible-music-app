"use strict";
module.exports = (sequelize, DataTypes) => {
  const Analytic = sequelize.define(
    "analytics",
    {
      userId: DataTypes.INTEGER,
      releaseId: DataTypes.INTEGER,
      trackId: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM,
        values: ["stream", "download"],
      },
      count: DataTypes.INTEGER,
      dateId: DataTypes.INTEGER,
      storeId: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    }
  );
  Analytic.associate = function ({ Analyticsdate, Release, Track, Store }) {
    this.belongsTo(Analyticsdate, { foreignKey: "dateId" });
    this.belongsTo(Release, { foreignKey: "releaseId" });
    this.belongsTo(Track, { foreignKey: "trackId" });
    this.belongsTo(Store, { foreignKey: "storeId" });
  };
  return Analytic;
};
