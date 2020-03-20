"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const resData = await queryInterface.bulkInsert(
      "packages",
      [
        {
          package: "SINGLE",
          period: 1,
          price: 3500,
          maxTracks: 1,
          maxAlbums: 0
        },
        {
          package: "ALBUM",
          period: 1,
          price: 12500,
          maxTracks: 0,
          maxAlbums: 1
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
