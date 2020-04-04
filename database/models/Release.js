("use strict");
module.exports = (sequelize, DataTypes) => {
  const Release = sequelize.define(
    "releases",
    {
      userId: DataTypes.INTEGER,
      userPackageId: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM,
        values: ["track", "album", "video"]
      },
      albumId: DataTypes.INTEGER,
      trackId: DataTypes.INTEGER,
      videoId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: [
          "incomplete",
          "processing",
          "approved",
          "pre-save",
          "live",
          "declined",
          "deleted",
          "expired"
        ]
      },
      releaseDate: DataTypes.DATE,
      comment: DataTypes.TEXT,
      linkId: DataTypes.INTEGER,
      artistId: DataTypes.INTEGER
    },
    {}
  );

  Release.associate = function({
    Video,
    Album,
    Track,
    Userpackage,
    User,
    Link,
    Labelartist
  }) {
    this.belongsTo(Video, { foreignKey: "videoId", as: "video" });
    this.belongsTo(Album, { foreignKey: "albumId", as: "album" });
    this.belongsTo(Track, { foreignKey: "trackId", as: "track" });
    this.belongsTo(Userpackage, {
      foreignKey: "userPackageId",
      as: "subscription"
    });
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
    this.belongsTo(Link, { foreignKey: "linkId", as: "link" });
    this.belongsTo(Labelartist, { foreignKey: "artistId", as: "labelArtist" });
  };
  return Release;
};
