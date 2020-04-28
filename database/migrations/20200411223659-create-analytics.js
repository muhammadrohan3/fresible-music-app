"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("analytics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tracks",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["stream", "download"],
        defaultValue: "stream",
      },
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "stores",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      count: {
        type: Sequelize.INTEGER,
      },
      dateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "analyticsdates",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("analytics");
  },
};
