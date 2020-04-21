"use strict";
module.exports = (sequelize, DataTypes) => {
  const Upload = sequelize.define(
    "uploads",
    {
      url: DataTypes.STRING,
      secureUrl: DataTypes.STRING,
      resourceType: DataTypes.STRING,
      format: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      size: DataTypes.INTEGER,
      publicId: DataTypes.STRING,
    },
    {}
  );
  Upload.associate = function ({ Userprofile, Labelartist, Release, Track }) {
    this.hasMany(Userprofile, { foreignKey: "avatarId", as: "userAvatar" });
    this.hasMany(Labelartist, { foreignKey: "avatarId", as: "avatar" });
    this.hasMany(Release, {
      foreignKey: "artworkUploadId",
      as: "artworkUpload",
    });
    this.hasMany(Track, { foreignKey: "trackUploadId", as: "trackUpload" });
  };
  return Upload;
};
