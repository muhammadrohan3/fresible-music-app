"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("countries", [
      { name: "Nigeria", code: "NGA" },
      { name: "United Kingdom", code: "GBR" },
      { name: "United States of America", code: "USA" },
      { name: "Canada", code: "CAN" },
      { name: "Sweden", code: "SWE" },
      { name: "France", code: "FRA" },
      { name: "CHINA", code: "CHN" },
      { name: "Bulgaria", code: "BGR" },
      { name: "Netherlands", code: "NLD" },
      { name: "Turkey", code: "TUR" },
      { name: "South Africa", code: "ZAF" },
      { name: "Egypt", code: "EGY" },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("countries");
  },
};
