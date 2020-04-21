"use strict";
module.exports = (sequelize, DataTypes) => {
  const Labelartist = sequelize.define(
    "labelartists",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      stageName: DataTypes.STRING,
      twitter: DataTypes.STRING,
      instagram: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      avatarId: DataTypes.INTEGER,
    },
    {}
  );
  Labelartist.associate = function ({ User, Upload }) {
    this.belongsTo(User, { foreignKey: "userId", as: "labelArtist" });
    this.belongsTo(Upload, { foreignKey: "avatarId", as: "artistAvatar" });
  };
  return Labelartist;
};
