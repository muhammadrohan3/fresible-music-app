"use strict";
module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define(
    "links",
    {
      slug: DataTypes.STRING,
      spotify: DataTypes.STRING,
      apple: DataTypes.STRING,
      itunes: DataTypes.STRING,
      amazon: DataTypes.STRING,
      deezer: DataTypes.STRING,
      boomplay: DataTypes.STRING,
      audiomack: DataTypes.STRING
    },
    {}
  );
  Link.associate = function({ Release }) {
    this.hasOne(Release, { foreignKey: "linkId", as: "release" });
  };
  return Link;
};
