"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("releases", {
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
      userPackageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "userpackages",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ["track", "album", "video"],
      },
      title: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.STRING,
        defaultValue: "99",
      },
      storeType: {
        type: Sequelize.ENUM,
        values: ["all", "stream", "download", "custom"],
        defaultValue: "all",
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        defaultValue: "incomplete",
        values: [
          "incomplete",
          "processing",
          "approved",
          "pre-save",
          "in stores",
          "declined",
          "deleted",
          "expired",
        ],
      },
      originalReleaseDate: {
        type: Sequelize.DATE,
      },
      releaseDate: {
        type: Sequelize.DATE,
      },
      approvedDate: {
        type: Sequelize.DATE,
      },
      manualBarcode: {
        type: Sequelize.STRING,
      },
      comment: {
        type: Sequelize.TEXT,
      },
      copyrightHolder: {
        type: Sequelize.STRING,
      },
      copyrightYear: {
        type: Sequelize.STRING,
      },
      primaryGenre: {
        type: Sequelize.STRING,
      },
      secondaryGenre: {
        type: Sequelize.STRING,
      },
      artwork: {
        type: Sequelize.STRING,
      },
      artistId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "labelartists",
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      linkId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "links",
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
    return queryInterface.dropTable("releases");
  },
};
