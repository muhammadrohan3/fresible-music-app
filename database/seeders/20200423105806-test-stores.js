"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("stores", [
      { store: "Apple Music" },
      { store: "Spotify" },
      { store: "Amazon Music" },
      { store: "iTunes" },
      { store: "Boomplay" },
      { store: "Audiomack" },
      { store: "Youtube" },
      { store: "Youtube Music" },
      { store: "Google Play Music" },
      { store: "Tidal" },
      { store: "Napster" },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("stores");
  },
};
