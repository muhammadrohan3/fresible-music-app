"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("albums", "userId", {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" }
      })
    ]);
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("albums", "userId")]);
  }
};
