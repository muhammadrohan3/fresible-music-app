"use strict";
const uuid = require("uuidv4").default;
module.exports = (sequelize, DataTypes) => {
  const Royalty = sequelize.define(
    "royalties",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
      },
      userId: DataTypes.UUID,
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

  Royalty.beforeCreate((royalty) => {
    royalty.id = uuid();
    return royalty;
  });

  Royalty.beforeBulkCreate((royalties) =>
    royalties.map((royalty) => {
      royalty.id = uuid();
      return royalty;
    })
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
