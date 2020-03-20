const fs = require("fs");

module.exports = (() => {
  const Obj = {};
  const fileNames = fs.readdirSync(__dirname, "utf-8");
  fileNames.forEach(file => {
    let name = file.split(".")[0];
    if (name !== "index") Obj[name] = require(`./${name}`);
  });
  return Obj;
})();
