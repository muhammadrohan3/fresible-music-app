"use strict";
module.exports = (sequelize, DataTypes) => {
  const Userprofile = sequelize.define(
    "userprofiles",
    {
      twitter: DataTypes.STRING,
      instagram: DataTypes.STRING,
      label: DataTypes.STRING,
      stageName: DataTypes.STRING,
      phone: DataTypes.STRING,
      bank: DataTypes.STRING,
      bankAccount: DataTypes.STRING,
      bankAccountNo: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      avatar: DataTypes.STRING,
    },
    {}
  );
  Userprofile.associate = function ({}) {};
  return Userprofile;
};
