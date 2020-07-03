("use strict");
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "payments",
    {
      userPackageId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      reference: DataTypes.STRING,
      gateway: DataTypes.STRING,
      meta: {
        type: DataTypes.STRING,
        get() {
          const value = this.getDataValue("meta");
          if (!value) return {};
          return JSON.parse(value);
        },
        set() {
          const value = this.getDataValue("meta");
          return JSON.stringify(value || {});
        },
      },
      date: DataTypes.DATE,
    },
    {}
  );

  Payment.associate = function ({ Userpackage, User }) {
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
