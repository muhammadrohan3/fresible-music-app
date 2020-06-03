const fs = require("fs");
const path = require("path");
const { royalties_GenerateStructureForEdit } = require("./index");

const jsonData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../jsonData/royalties.json"),
    "utf-8"
  )
);
const mockFn = {
  getStore: () => ({
    schemaResult: jsonData,
  }),
  setStore: (...args) => console.log("SPELL AM FOR ME", ...args),
};

royalties_GenerateStructureForEdit(mockFn)();
// console.log(mockFn);
