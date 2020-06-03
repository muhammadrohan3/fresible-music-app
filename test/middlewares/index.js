const index = require("../../controller/middlewares");

module.exports = index.reduce(
  (prev, [name, fn]) => ({ ...prev, [name]: fn }),
  {}
);
