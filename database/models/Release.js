("use strict");
module.exports = (sequelize, DataTypes) => {
  const Release = sequelize.define(
    "releases",
    {
      userId: DataTypes.INTEGER,
      userPackageId: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM,
        values: ["track", "album", "video"],
      },
      title: DataTypes.STRING,
      price: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM,
        values: [
          "incomplete",
          "processing",
          "approved",
          "pre-save",
          "in stores",
          "declined",
          "deleted",
          "expired",
        ],
      },
      originalReleaseDate: DataTypes.DATE,
      releaseDate: DataTypes.DATE,
      approvedDate: DataTypes.DATE,
      manualBarcode: DataTypes.STRING,
      comment: DataTypes.TEXT,
      linkId: DataTypes.INTEGER,
      artworkUploadId: DataTypes.INTEGER,
      artistId: DataTypes.INTEGER,
    },
    {}
  );

  Release.associate = function ({
    Userpackage,
    User,
    Link,
    Labelartist,
    Upload,
    Track,
  }) {
    this.belongsTo(Userpackage, {
      foreignKey: "userPackageId",
      as: "subscription",
    });
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
    this.belongsTo(Link, { foreignKey: "linkId", as: "link" });
    this.belongsTo(Upload, {
      foreignKey: "artworkUploadId",
      as: "artworkUpload",
    });
    this.belongsTo(Labelartist, { foreignKey: "artistId", as: "labelArtist" });
    this.hasMany(Track, { foreignKey: "releaseId", as: "tracks" });
  };
  return Release;
};
