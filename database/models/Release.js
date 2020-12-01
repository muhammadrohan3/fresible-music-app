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
      storeType: {
        type: DataTypes.ENUM,
        values: ["all", "stream", "download", "custom"],
      },
      status: {
        type: DataTypes.ENUM,
        values: [
          "incomplete",
          "pending",
          "processing",
          "approved",
          "pre-save",
          "in stores",
          "declined",
          "deleted",
          "expired",
        ],
      },
      primaryGenre: DataTypes.STRING,
      secondaryGenre: DataTypes.STRING,
      copyrightHolder: DataTypes.STRING,
      copyrightYear: DataTypes.STRING,
      originalReleaseDate: DataTypes.DATE,
      releaseDate: DataTypes.DATE,
      approvedDate: DataTypes.DATE,
      manualBarcode: DataTypes.STRING,
      comment: DataTypes.TEXT,
      linkId: DataTypes.INTEGER,
      artwork: DataTypes.STRING,
      artistId: DataTypes.INTEGER,
    },
    {}
  );

  Release.associate = function ({
    Userpackage,
    User,
    Link,
    Labelartist,
    Track,
    Analytic,
    Store,
    Releasestore,
  }) {
    this.belongsTo(Userpackage, {
      foreignKey: "userPackageId",
      as: "subscription",
    });
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
    this.belongsTo(Link, { foreignKey: "linkId", as: "link" });
    this.belongsTo(Labelartist, { foreignKey: "artistId", as: "labelArtist" });
    this.hasMany(Track, { foreignKey: "releaseId", as: "tracks" });
    this.hasMany(Analytic, { foreignKey: "releaseId", as: "analytics" });
    //RELEASE belongsToMany STORES
    this.belongsToMany(Store, {
      through: Releasestore,
      foreignKey: "releaseId",
      as: "stores",
    });
  };
  return Release;
};
