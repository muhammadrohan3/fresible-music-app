("use strict");
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "payments",
    {
      userPackageId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      reference: DataTypes.STRING,
      date: DataTypes.DATE,
    },
    {}
  );

  Payment.associate = function ({ Userpackage, Package, User }) {
    //User belongsToMany Packages
    this.belongsTo(Userpackage, {
      foreignKey: "userPackageId",
      as: "subscription",
    });

    this.belongsTo(User, {
      foreignKey: "userId",
    });
  };

  return Payment;
};
