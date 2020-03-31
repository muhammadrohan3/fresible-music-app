"use strict";
module.exports = (sequelize, DataTypes) => {
  const Labelartist = sequelize.define(
    "labelArtists",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      stageName: DataTypes.STRING,
      twitter: DataTypes.STRING,
      instagram: DataTypes.STRING,
      userId: DataTypes.INTEGER
    },
    {}
  );
  Labelartist.associate = function({ Userprofile }) {
    this.belongsTo(Userprofile, { foreignKey: "labelId", as: "labelArtist" });
  };
  return Labelartist;
};
