"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("submissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      userPackageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "userpackages",
          key: "id"
        }
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
      releaseDate: {
        type: Sequelize.STRING
      },
      artwork: {
        type: Sequelize.STRING
      },
      music: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        defaultValue: "incomplete",
        values: ["incomplete", "processing", "approved", "declined", "expired"]
      },
      submitStatus: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    return queryInterface.dropTable("submissions");
  }
};
