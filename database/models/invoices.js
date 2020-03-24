"use strict";
module.exports = (sequelize, DataTypes) => {
  const invoices = sequelize.define(
    "invoices",
    {
      userId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      // type: DataTypes.ENUM,
      // status: DataTypes.ENUM,
      processed: DataTypes.BOOLEAN,
      amount: DataTypes.INTEGER,
      amountPaid: DataTypes.INTEGER
    },
    {}
  );
  invoices.associate = function(models) {
    // associations can be defined here
  };
  return invoices;
};
