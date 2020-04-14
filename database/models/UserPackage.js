("use strict");
module.exports = (sequelize, DataTypes) => {
  const UserPackage = sequelize.define(
    "userpackages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: DataTypes.INTEGER,
      packageId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: ["inactive", "active", "expired"],
        defaultValue: "inactive",
      },
      paymentDate: {
        type: DataTypes.DATE,
      },
      artistId: DataTypes.INTEGER,
    },
    {
      timestamps: true,
    }
  );

  UserPackage.associate = function ({
    Package,
    User,
    Submission,
    Payment,
    Release,
    Labelartist,
  }) {
    //UserPackage belongsTo Package
    this.belongsTo(Package, { foreignKey: "packageId", as: "package" });

    //UserPackage belongsTo User
    this.belongsTo(User, { foreignKey: "userId" });

    //UserPackage hasMany Payments
    this.hasMany(Payment, {
      foreignKey: "userPackageId",
      as: "payments",
    });

    //UserPackage hasMany Releases
    this.hasMany(Release, { foreignKey: "userPackageId", as: "releases" });

    this.belongsTo(Labelartist, { foreignKey: "artistId", as: "labelArtist" });
  };
  return UserPackage;
};
