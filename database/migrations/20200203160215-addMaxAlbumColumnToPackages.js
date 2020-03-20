"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn(
      "packages",
      "maxAlbums",
      Sequelize.INTEGER
    );
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn("packages", "maxAlbums");
  }
};
