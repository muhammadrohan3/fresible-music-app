"use strict";
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    "countries",
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      logo: DataTypes.STRING,
      longitude: DataTypes.STRING,
      latitude: DataTypes.STRING,
    },
    {}
  );
  Country.associate = function (models) {
    // associations can be defined here
  };
  Country.toBeCalled = "Country";
  return Country;
};
