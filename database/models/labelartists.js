"use strict";
module.exports = (sequelize, DataTypes) => {
  const labelArtists = sequelize.define(
    "labelArtists",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      stageName: DataTypes.STRING,
      twitter: DataTypes.STRING,
      instagram: DataTypes.STRING,
      labelId: DataTypes.INTEGER
    },
    {}
  );
  labelArtists.associate = function(models) {
    // associations can be defined here
  };
  return labelArtists;
};
