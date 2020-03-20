"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) =>
    await queryInterface.addColumn("links", "audiomack", Sequelize.STRING),

  down: async (queryInterface, Sequelize) =>
    await queryInterface.removeColumn("links", "audiomack")
};
