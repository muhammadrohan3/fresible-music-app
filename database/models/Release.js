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
      artwork: DataTypes.STRING,
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
      uploadId: DataTypes.INTEGER,
      artworkId: DataTypes.INTEGER,
      artistId: DataTypes.INTEGER,
    },
    {}
  );

  Release.associate = function ({ Userpackage, User, Link, Labelartist }) {
    this.belongsTo(Userpackage, {
      foreignKey: "userPackageId",
      as: "subscription",
    });
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
    this.belongsTo(Link, { foreignKey: "linkId", as: "link" });
    this.belongsTo(Labelartist, { foreignKey: "artistId", as: "labelArtist" });
  };
  return Release;
};
