"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("stores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      store: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["stream", "download", "both"],
        defaultValue: "both",
      },
      goLiveTime: {
        type: Sequelize.STRING,
      },
      storeLogoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "uploads",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
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
    return queryInterface.dropTable("stores");
  },
};
