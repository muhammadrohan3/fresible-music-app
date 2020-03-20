const path = require("path");

module.exports = template =>
  path.join(__dirname, "/", "..", "views", "builtMailTemplates", template);
