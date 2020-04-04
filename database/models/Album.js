"use strict";
module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define(
    "albums",
    {
      title: DataTypes.STRING,
      artwork: DataTypes.STRING
    },
    {}
  );
  Album.associate = function({ Release, Albumtrack, User }) {
    //Album belongsTo Release
    this.hasOne(Release, { foreignKey: "albumId", as: "release" });
    //Album hasMany Albumtrack
    this.hasMany(Albumtrack, { foreignKey: "albumId", as: "tracks" });
  };
  return Album;
};
