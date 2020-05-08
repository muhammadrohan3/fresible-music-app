"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tracks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      releaseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "releases",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
      },
      featured: {
        type: Sequelize.STRING,
      },
      track: {
        type: Sequelize.STRING,
      },
      explicit: {
        type: Sequelize.STRING,
      },
      copyrightYear: {
        type: Sequelize.STRING,
      },
      copyrightHolder: {
        type: Sequelize.STRING,
      },
      isrcCode: {
        type: Sequelize.STRING,
      },
      trackUploadId: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tracks");
  },
};
