"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      token: {
        type: Sequelize.STRING
      },
      tokenType: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.STRING
      },
      twitter: {
        type: Sequelize.STRING
      },
      instagram: {
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.STRING
      },
      profileActive: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      stageName: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      bank: {
        type: Sequelize.STRING
      },
      bankAccount: {
        type: Sequelize.STRING
      },
      bankAccountNo: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable("users");
  }
};
