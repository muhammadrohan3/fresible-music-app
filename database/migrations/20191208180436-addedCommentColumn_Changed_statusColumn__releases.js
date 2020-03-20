"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("releases", "comment", { type: Sequelize.TEXT }),
      queryInterface.changeColumn("releases", "status", {
        type: Sequelize.ENUM,
        values: [
          "incomplete",
          "processing",
          "approved",
          "declined",
          "expired",
          "deleted"
        ],
        defaultValue: "incomplete"
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("releases", "comment"),
      queryInterface.changeColumn("releases", "status", {
        type: Sequelize.ENUM,
        values: [
          "incomplete",
          "processing",
          "approved",
          "declined",
          "expired",
          "deleted"
        ],
        defaultValue: "incomplete"
      })
    ]);
  }
};
