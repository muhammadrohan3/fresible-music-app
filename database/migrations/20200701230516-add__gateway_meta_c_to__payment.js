"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("payments", "gateway", {
        type: Sequelize.STRING,
        defaultValue: "PAYSTACK",
      }),
      queryInterface.addColumn("payments", "meta", { type: Sequelize.STRING }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("payments", "gateway"),
      queryInterface.removeColumn("payments", "meta"),
    ]);
  },
};
