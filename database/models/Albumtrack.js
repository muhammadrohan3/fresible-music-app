"use strict";
module.exports = (sequelize, DataTypes) => {
  const Albumtrack = sequelize.define(
    "albumTracks",
    {
      albumId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      artiste: DataTypes.STRING,
      featured: DataTypes.STRING,
      genre: DataTypes.STRING,
      track: DataTypes.STRING,
      explicit: DataTypes.STRING,
      copyrightYear: DataTypes.STRING,
      copyrightHolder: DataTypes.STRING
    },
    {}
  );
  Albumtrack.associate = function({ Album }) {
    // Albumtrack belongsTo Album
    this.belongsTo(Album, { foreignKey: "albumId", as: "album" });
  };
  return Albumtrack;
};
