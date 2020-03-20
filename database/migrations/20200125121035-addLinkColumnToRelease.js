"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("releases", "linkId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "links",
        key: "id"
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("releases", "linkId");
  }
};
