module.exports = ({ setStore, getStore }) => () => {
  const musicComps = ["package", "terms", "information", "release", "overview"];
  const { submitStatus } = getStore("schemaResult");
  const comp = musicComps[submitStatus];
  return setStore("siteData", { comp });
};
