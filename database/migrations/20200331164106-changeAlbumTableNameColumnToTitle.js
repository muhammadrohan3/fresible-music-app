"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.resolve(
      queryInterface.renameColumn("albums", "name", "title")
    );
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve(
      queryInterface.renameColumn("albums", "title", "name")
    );
  }
};
