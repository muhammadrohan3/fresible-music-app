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
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["track", "album", "video"]
      },
      albumId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "albums",
          key: "id"
        }
      },
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "tracks",
          key: "id"
        }
      },
      videoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "videos",
          key: "id"
        }
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        defaultValue: "incomplete",
        values: ["incomplete", "processing", "approved", "declined", "expired"]
      },
      submitStatus: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      releaseDate: {
        type: Sequelize.DATE
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
