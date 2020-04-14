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
    this.hasMany(Release, { foreignKey: "artworkId", as: "artwork" });
    this.hasMany(Track, { foreignKey: "trackId", as: "track" });
  };
  return Upload;
};
