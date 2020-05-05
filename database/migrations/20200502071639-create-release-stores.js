"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("releasestores", {
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
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "stores",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("releasestores");
  },
};
