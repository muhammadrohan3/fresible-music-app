("use strict");
module.exports = (sequelize, DataTypes) => {
  const UserPackage = sequelize.define(
    "userpackages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: DataTypes.INTEGER,
      packageId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: ["inactive", "active", "expired"],
        defaultValue: "inactive"
      },
      paymentDate: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: true
    }
  );

  UserPackage.associate = function({
    Package,
    User,
    Submission,
    Payment,
    Release
  }) {
    //UserPackage belongsTo Package
    this.belongsTo(Package, { foreignKey: "packageId", as: "package" });

    //UserPackage belongsTo User
    this.belongsTo(User, { foreignKey: "userId" });

    //UserPackage hasMany Submissions
    this.hasMany(Submission, {
      foreignKey: "userPackageId",
      as: "submissions"
    });

    //UserPackage hasMany Payments
    this.hasMany(Payment, {
      foreignKey: "userPackageId",
      as: "payments"
    });

    //UserPackage hasMany Releases
    this.hasMany(Release, { foreignKey: "userPackageId", as: "releases" });
  };
  return UserPackage;
};
