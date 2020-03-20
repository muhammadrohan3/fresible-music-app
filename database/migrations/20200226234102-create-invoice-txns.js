'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('invoiceTxns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      invoiceId: {
        type: Sequelize.INTEGER
      },
      reference: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM
      },
      status: {
        type: Sequelize.ENUM
      },
      processed: {
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('invoiceTxns');
  }
};