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
          key: "id",
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        }
      },
      packageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "packages",
          key: "id",
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
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
      artistId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "labelartists",
          key: "id",
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        }
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
