"use strict";
module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define(
    "tracks",
    {
      title: DataTypes.STRING,
      artiste: DataTypes.STRING,
      featured: DataTypes.STRING,
      genre: DataTypes.STRING,
      track: DataTypes.STRING,
      artwork: DataTypes.STRING,
      explicit: DataTypes.STRING,
      copyrightYear: DataTypes.STRING,
      copyrightHolder: DataTypes.STRING
    },
    {}
  );
  Track.associate = function({ Release }) {
    //Track belongsTo Release
    this.hasOne(Release, { foreignKey: "trackId", as: "release" });
  };
  return Track;
};
