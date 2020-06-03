"use strict";
module.exports = (sequelize, DataTypes) => {
  const MonthlyRoyalty = sequelize.define(
    "monthlyroyalties",
    {
      monthValue: DataTypes.INTEGER,
      yearValue: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: ["processing", "published"],
      },
    },
    {}
  );
  MonthlyRoyalty.associate = function ({ Royalty }) {
    this.hasMany(Royalty, { foreignKey: "monthId", as: "royalties" });
  };
  MonthlyRoyalty.toBeCalled = "MonthlyRoyalty";
  return MonthlyRoyalty;
};
