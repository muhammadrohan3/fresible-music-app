"use strict";
module.exports = (sequelize, DataTypes) => {
  const invoiceTxns = sequelize.define(
    "invoiceTxns",
    {
      userId: DataTypes.INTEGER,
      invoiceId: DataTypes.INTEGER,
      reference: DataTypes.STRING,
      // type: DataTypes.ENUM,
      // status: DataTypes.ENUM,
      processed: DataTypes.BOOLEAN
    },
    {}
  );
  invoiceTxns.associate = function(models) {
    // associations can be defined here
  };
  return invoiceTxns;
};
