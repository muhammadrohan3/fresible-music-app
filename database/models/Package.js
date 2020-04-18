"use strict";
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "packages",
    {
      package: DataTypes.STRING,
      period: DataTypes.INTEGER,
      maxTracks: DataTypes.INTEGER,
      maxAlbums: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: ["inactive", "active"],
        defaultValue: "active",
      },
    },
    {
      timestamps: false,
    }
  );
  Package.associate = function ({ User, Userpackage }) {
    // Package belongsToMany User
    this.belongsToMany(User, {
      through: Userpackage,
      foreignKey: "packageId",
      as: "packages",
    });
  };
  return Package;
};
