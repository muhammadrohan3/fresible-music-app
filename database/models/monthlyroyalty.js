"use strict";
module.exports = (sequelize, DataTypes) => {
  const MonthlyRoyalty = sequelize.define(
    "MonthlyRoyalty",
    {
      monthValue: DataTypes.DATEONLY,
      // status: DataTypes.ENUM
    },
    {}
  );
  MonthlyRoyalty.associate = function (models) {
    // associations can be defined here
  };
  return MonthlyRoyalty;
};
