'use strict';
module.exports = (sequelize, DataTypes) => {
  const wallet = sequelize.define('wallet', {
    userId: DataTypes.INTEGER,
    balance: DataTypes.INTEGER
  }, {});
  wallet.associate = function(models) {
    // associations can be defined here
  };
  return wallet;
};