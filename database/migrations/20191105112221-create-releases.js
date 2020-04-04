"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("releases", {
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
      userPackageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "userpackages",
          key: "id",
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        }
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ["track", "album", "video"]
      },
      albumId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "albums",
          key: "id",
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        }
      },
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tracks",
          key: "id",
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        }
      },
      videoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "videos",
          key: "id",
          onDelete: "SET NULL",
          onUpdate: "CASCADE"
        }
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
          "live",
          "declined",
          "deleted",
          "expired"
        ]
      },
      submitStatus: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      releaseDate: {
        type: Sequelize.DATE
      },
      comment: {
        type: Sequelize.TEXT
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
      linkId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "links",
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
    return queryInterface.dropTable("releases");
  }
};
