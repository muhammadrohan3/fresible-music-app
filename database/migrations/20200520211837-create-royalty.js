"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("royalties", {
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
          key: "id",
          model: "users",
        },
      },
      countryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: "id",
          model: "countries",
        },
      },
      monthId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: "id",
          model: "monthlyroyalties",
        },
      },
      releaseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: "id",
          model: "releases",
        },
      },
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: "id",
          model: "tracks",
        },
      },
      storeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          key: "id",
          model: "stores",
        },
      },
      releaseDownload: {
        type: Sequelize.INTEGER,
      },
      releaseDownloadEarning: {
        type: Sequelize.INTEGER,
      },
      trackDownload: {
        type: Sequelize.INTEGER,
      },
      trackDownloadEarning: {
        type: Sequelize.INTEGER,
      },
      trackStream: {
        type: Sequelize.INTEGER,
      },
      trackStreamEarning: {
        type: Sequelize.INTEGER,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("royalties");
  },
};
