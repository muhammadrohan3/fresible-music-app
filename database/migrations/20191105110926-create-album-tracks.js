"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("albumtracks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      albumId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "albums",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      title: {
        type: Sequelize.STRING
      },
      artiste: {
        type: Sequelize.STRING
      },
      featured: {
        type: Sequelize.STRING
      },
      genre: {
        type: Sequelize.STRING
      },
      track: {
        type: Sequelize.STRING
      },
      explicit: {
        type: Sequelize.STRING
      },
      copyrightYear: {
        type: Sequelize.STRING
      },
      copyrightHolder: {
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
    return queryInterface.dropTable("albumTracks");
  }
};
