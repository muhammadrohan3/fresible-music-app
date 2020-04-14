"use strict";
module.exports = (sequelize, DataTypes) => {
  const analytics = sequelize.define(
    "analytics",
    {
      userId: DataTypes.INTEGER,
      releaseId: DataTypes.INTEGER,
      trackId: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM,
        values: ["stream", "download"],
      },
      count: DataTypes.INTEGER,
      dateId: DataTypes.INTEGER,
    },
    {}
  );
  analytics.associate = function (models) {
    // associations can be defined here
  };
  return analytics;
};
