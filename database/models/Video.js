"use strict";
module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "videos",
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
  Video.associate = function({ Release }) {
    //Video belongsTo Release
    this.hasOne(Release, { foreignKey: "videoId", as: "release" });
  };
  return Video;
};
