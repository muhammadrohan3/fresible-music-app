"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("links", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING
      },
      spotify: {
        type: Sequelize.STRING
      },
      apple: {
        type: Sequelize.STRING
      },
      itunes: {
        type: Sequelize.STRING
      },
      amazon: {
        type: Sequelize.STRING
      },
      deezer: {
        type: Sequelize.STRING
      },
      boomplay: {
        type: Sequelize.STRING
      },
      youtube: {
        type: Sequelize.STRING
      },
      youtubeMusic: {
        type: Sequelize.STRING
      },
      tidal: {
        type: Sequelize.STRING
      },
      napster: {
        type: Sequelize.STRING
      },
      audiomack: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("links");
  }
};
