"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("payments", {
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
      packageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "packages",
          key: "id"
        }
      },
      status: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      reference: {
        type: Sequelize.STRING,
        allowNull: true
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
    return queryInterface.dropTable("payments");
  }
};
