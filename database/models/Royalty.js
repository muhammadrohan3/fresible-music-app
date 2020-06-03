"use strict";
module.exports = (sequelize, DataTypes) => {
  const Royalty = sequelize.define(
    "royalties",
    {
      userId: DataTypes.INTEGER,
      countryId: DataTypes.INTEGER,
      monthId: DataTypes.INTEGER,
      releaseId: DataTypes.INTEGER,
      trackId: DataTypes.INTEGER,
      storeId: DataTypes.INTEGER,
      releaseDownload: DataTypes.INTEGER,
      releaseDownloadEarning: DataTypes.INTEGER,
      trackDownload: DataTypes.INTEGER,
      trackStream: DataTypes.INTEGER,
      trackDownloadEarning: DataTypes.INTEGER,
      trackStreamEarning: DataTypes.INTEGER,
    },
    {
      timestamps: false,
    }
  );
  Royalty.associate = function ({
    Country,
    User,
    MonthlyRoyalty,
    Release,
    Track,
    Store,
  }) {
    this.belongsTo(Country, { foreignKey: "countryId" });
    this.belongsTo(User, { foreignKey: "userId" });
    this.belongsTo(MonthlyRoyalty, { foreignKey: "monthId" });
    this.belongsTo(Release, { foreignKey: "releaseId" });
    this.belongsTo(Track, { foreignKey: "trackId" });
    this.belongsTo(Store, { foreignKey: "storeId" });
  };
  Royalty.toBeCalled = "Royalty";
  return Royalty;
};
