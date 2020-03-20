const path = require("path");

module.exports = {
  config: path.resolve("database", "config", "config.js"),
  "migrations-path": path.join(__dirname, "database/migrations"),
  "models-path": path.join(__dirname, "database/models"),
  "seeders-path": path.join(__dirname, "database/seeders")
};
