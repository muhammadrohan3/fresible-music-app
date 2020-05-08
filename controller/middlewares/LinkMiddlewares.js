const { Link } = require("../../database/models");

const Link_slugGenerator = ({ getStore, setStore }) => async (key) => {
  const { stageName, title } = getStore(key || "tempKey");
  const _slugify = (text) => text.trim().replace(/ /g, "-");
  //Slugifies the stageName and title.
  let slugList = [_slugify(title), _slugify(stageName)];
  //A while loop with the stop boolean
  let stop = false;
  let index = 1;
  let endingNumber = 1;
  let slug = slugList[0];
  while (!stop) {
    //Makes a server request that checks for the slug
    slug = slug.toLowerCase();
    const response = await Link.findOne({ where: { slug } });
    if (response) {
      if (index >= 2) {
        slug = slug.concat(`-${endingNumber}`);
        endingNumber++;
      } else {
        index = index + 1;
        slug = slug.concat(`-${slugList[1]}`);
      }
    } else {
      stop = true;
    }
    setStore("schemaData", { slug });
    return;
  }
};

module.exports = { Link_slugGenerator };
