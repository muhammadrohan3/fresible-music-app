"use strict";
module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define(
    "tracks",
    {
      title: DataTypes.STRING,
      artiste: DataTypes.STRING,
      featured: DataTypes.STRING,
      genre: DataTypes.STRING,
      explicit: DataTypes.STRING,
      copyrightYear: DataTypes.STRING,
      copyrightHolder: DataTypes.STRING,
      trackUploadId: DataTypes.INTEGER,
      releaseId: DataTypes.INTEGER,
    },
    {}
  );
  Track.associate = function ({ Release, Upload }) {
    //Track belongsTo Release
    this.belongsTo(Release, { foreignKey: "releaseId", as: "release" });
    this.belongsTo(Upload, { foreignKey: "trackUploadId", as: "trackUpload" });
  };
  return Track;
};
