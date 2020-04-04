"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("packages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      package: {
        type: Sequelize.STRING
      },
      period: {
        type: Sequelize.INTEGER
      },
      maxTracks: {
        type: Sequelize.INTEGER
      },
      maxAlbums: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("packages");
  }
};
