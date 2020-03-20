'use strict';
module.exports = (sequelize, DataTypes) => {
  const referers = sequelize.define('referers', {
    userId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    withdrawn: DataTypes.INTEGER
  }, {});
  referers.associate = function(models) {
    // associations can be defined here
  };
  return referers;
};