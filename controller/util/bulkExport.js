const fs = require("fs");

const exportBulkFiles = (pathName) => {
  return fs.readdirSync(pathName).reduce((previous, file) => {
    const [fileName] = file.split(".");
    const isIndexFile = fileName === "index";
    if (isIndexFile) return previous;
    const importedFile = require(`${pathName}/${file}`);
    return { ...previous, [fileName]: importedFile };
  }, {});
};

module.exports = exportBulkFiles;
