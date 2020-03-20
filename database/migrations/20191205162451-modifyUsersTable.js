"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return Promise.all([
      ...[
        "twitter",
        "instagram",
        "label",
        "stageName",
        "phone",
        "bank",
        "bankAccount",
        "bankAccountNo"
      ].map(item => {
        queryInterface.removeColumn("users", item);
      }),
      queryInterface.addColumn("users", "role", {
        type: Sequelize.ENUM,
        defaultValue: "subscriber",
        values: ["subscriber", "admin", "superAdmin"]
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      ...[
        "twitter",
        "instagram",
        "label",
        "stageName",
        "phone",
        "bank",
        "bankAccount",
        "bankAccountNo"
      ].map(item => {
        queryInterface.addColumn("users", item, { type: Sequelize.STRING });
      }),
      queryInterface.removeColumn("users", "role")
    ]);
  }
};
