const fs = require("fs");

module.exports = (() => {
  const fileNames = fs.readdirSync(__dirname, "utf-8");
  const middlewares = [];
  fileNames.forEach((file) => {
    let name = file.split(".")[0];
    if (name === "index") return;
    const item = require(`./${name}`);
    Object.entries(item).forEach(([name, fn]) => {
      middlewares.push([name, fn]);
    });
  });
  return middlewares;
})();
