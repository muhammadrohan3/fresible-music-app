"use strict";
module.exports = (sequelize, DataTypes) => {
  const analyticsdates = sequelize.define(
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
  analyticsdates.associate = function (models) {
    // associations can be defined here
  };
  return analyticsdates;
};
