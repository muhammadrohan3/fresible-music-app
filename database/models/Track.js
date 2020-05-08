"use strict";
module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define(
    "tracks",
    {
      title: DataTypes.STRING,
      featured: DataTypes.STRING,
      explicit: DataTypes.STRING,
      copyrightYear: DataTypes.STRING,
      copyrightHolder: DataTypes.STRING,
      track: DataTypes.STRING,
      releaseId: DataTypes.INTEGER,
    },
    {}
  );
  Track.associate = function ({ Release }) {
    //Track belongsTo Release
    this.belongsTo(Release, { foreignKey: "releaseId", as: "release" });
  };
  return Track;
};
