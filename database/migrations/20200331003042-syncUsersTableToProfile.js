"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("userprofiles", "avatar", {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.removeColumn("users", "avatar"),
      queryInterface.removeColumn("users", "bank"),
      queryInterface.removeColumn("users", "bankAccount")
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("users", "avatar", {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn("users", "bank", {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.addColumn("users", "bankAccount", {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.removeColumn("userprofiles", "avatar")
    ]);
  }
};
