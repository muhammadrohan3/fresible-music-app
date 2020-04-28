"use strict";
module.exports = (sequelize, DataTypes) => {
  const Analyticsdate = sequelize.define(
    "analyticsdates",
    {
      date: DataTypes.DATEONLY,
      status: {
        type: DataTypes.ENUM,
        values: ["initiating", "processing", "published"],
      },
    },
    {}
  );
  Analyticsdate.associate = function ({ Analytic }) {
    this.hasMany(Analytic, { foreignKey: "dateId", as: "analytics" });
  };
  return Analyticsdate;
};
