("use strict");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("userprofiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
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
    return queryInterface.dropTable("userProfiles");
  }
};
