"use strict";
module.exports = (sequelize, DataTypes) => {
  const store = sequelize.define(
    "store",
    {
      store: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM,
        values: ["streaming", "downloading", "both"],
      },
      goLiveTime: DataTypes.STRING,
      logoId: DataTypes.INTEGER,
    },
    {}
  );
  store.associate = function (models) {
    // associations can be defined here
  };
  return store;
};
