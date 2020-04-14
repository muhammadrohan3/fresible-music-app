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
      avatarId: DataTypes.INTEGER,
    },
    {}
  );
  Userprofile.associate = function ({ Upload }) {
    this.belongsTo(Upload, { foreignKey: "avatarId", as: "userAvatar" });
  };
  return Userprofile;
};
