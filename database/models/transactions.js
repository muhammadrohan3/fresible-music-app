"use strict";
module.exports = (sequelize, DataTypes) => {
  const transactions = sequelize.define(
    "transactions",
    {
      userId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      // type: DataTypes.ENUM,
      processed: DataTypes.BOOLEAN,
      amount: DataTypes.INTEGER
    },
    {}
  );
  transactions.associate = function(models) {
    // associations can be defined here
  };
  return transactions;
};
