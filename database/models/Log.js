"use strict";
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define(
    "logs",
    {
      userId: DataTypes.INTEGER,
      action: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM,
        values: ["subscriber", "admin"],
        defaultValue: "subscriber"
      },
      type: DataTypes.STRING,
      link: DataTypes.STRING
    },
    {}
  );
  Log.associate = function({ User }) {
    this.belongsTo(User, { foreignKey: "userId", as: "user" });
  };
  return Log;
};
