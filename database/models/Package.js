"use strict";
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define(
    "packages",
    {
      package: DataTypes.STRING,
      period: DataTypes.INTEGER,
      maxTracks: DataTypes.INTEGER,
      maxAlbums: DataTypes.INTEGER,
      price: DataTypes.INTEGER
    },
    {
      timestamps: false
    }
  );
  Package.associate = function({ User, Userpackage, Payment }) {
    // Package belongsToMany User
    this.belongsToMany(User, {
      through: Userpackage,
      foreignKey: "packageId",
      as: "packages"
    });

    // Package hasMany Payments
    this.hasMany(Payment, {
      foreignKey: "packageId",
      as: "payments"
    });
  };
  return Package;
};
