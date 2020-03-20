"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("userpackages", {
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
      packageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "packages",
          key: "id"
        }
      },
      paymentDate: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM,
        values: ["inactive", "active", "expired"],
        defaultValue: "inactive"
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
    return queryInterface.dropTable("userpackages");
  }
};
