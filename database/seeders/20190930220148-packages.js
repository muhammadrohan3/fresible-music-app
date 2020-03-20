"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const resData = await queryInterface.bulkInsert(
      "packages",
      [
        {
          package: "BASIC",
          period: 1,
          price: 15000,
          maxTracks: 5
        },
        {
          package: "PROFESSIONAL",
          period: 1,
          price: 25000,
          maxTracks: 5
        },
        {
          package: "WORLD CLASS",
          period: 1,
          price: 50000,
          maxTracks: 5
        },
        {
          package: "LEGENDARY",
          period: 1,
          price: 100000,
          maxTracks: 20
        }
      ],
      {}
    );
    return resData;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("packages", null, {});
  }
};
