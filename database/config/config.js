const mysql2 = require("mysql2");
require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: null,
    database: "fresible_music",
    host: "localhost",
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: false,
    },
    logging: false,
  },
  test: {
    username: "root",
    password: null,
    database: "fresible_music-test",
    host: "localhost",
    dialect: "mysql",
    logging: false,
    dialectModule: mysql2,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    dialectModule: mysql2,
    logging: false,
  },
};
