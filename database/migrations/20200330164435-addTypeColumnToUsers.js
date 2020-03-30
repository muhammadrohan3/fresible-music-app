"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "type", {
      type: Sequelize.ENUM,
      allowNull: true,
      values: ["artist", "label"],
      defaultValue: "artist"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "type");
  }
};
