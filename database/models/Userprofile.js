"use strict";
module.exports = (sequelize, DataTypes) => {
  const Userprofile = sequelize.define(
    "userprofiles",
    {
      avatar: DataTypes.STRING,
      twitter: DataTypes.STRING,
      instagram: DataTypes.STRING,
      label: DataTypes.STRING,
      stageName: DataTypes.STRING,
      phone: DataTypes.STRING,
      bank: DataTypes.STRING,
      bankAccount: DataTypes.STRING,
      bankAccountNo: DataTypes.STRING,
      userId: DataTypes.INTEGER
    },
    {}
  );
  Userprofile.associate = function(models) {
    // associations can be defined here
  };
  return Userprofile;
};
