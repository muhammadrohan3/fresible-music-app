"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("userPackages", "artistId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "labelArtists",
          key: "id"
        }
      }),
      queryInterface.addColumn("releases", "artistId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "labelArtists",
          key: "id"
        }
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("userPackages", "artistId"),
      queryInterface.removeColumn("releases", "artistId")
    ]);
  }
};
