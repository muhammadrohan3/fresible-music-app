const fs = require("fs");
const {
  User,
  Userprofile,
  Userpackage,
  Package,
  Payment,
  Track,
  Video,
  Album,
  Albumtrack,
  Release,
  Log,
  Link,
  Labelartist
} = require("../database/models/index");

const route = [
  ["users", User, ["id"]],
  ["packages", Package, ["id"]],
  ["labelartists", Labelartist, ["id", "userId"]],
  ["userprofiles", Userprofile, ["id", "userId"]],
  ["userpackages", Userpackage, ["id", "userId", "packageId", "artistId"]],
  ["payments", Payment, ["id", "userId", "userPackageId"], ["packageId"]],
  ["albums", Album, ["id"], ["userId"], [["name", "title"]]],
  ["albumtracks", Albumtrack, ["id", "albumId"]],
  ["tracks", Track, ["id"]],
  ["videos", Video, ["id"]],
  ["links", Link, ["id"]],
  [
    "releases",
    Release,
    [
      "id",
      "userId",
      "userPackageId",
      "albumId",
      "trackId",
      "videoId",
      "artistId",
      "linkId"
    ]
  ],
  ["logs", Log, ["id", "userId"]]
];

const jsonData = JSON.parse(
  fs.readFileSync("../blueoqom_music.json", {
    encoding: "utf-8"
  })
);

const dataHash = jsonData.reduce((acc, { type, name, data }) => {
  if (type !== "table") return acc;
  return { ...acc, [name.toLowerCase()]: data };
}, {});

//

(async () => {
  try {
    for (let r of route) {
      const [name, Handler, toChange, toRemove, toRename = []] = r;
      console.log("Processing: ", name);
      let table = dataHash[name];
      if (!table) {
        console.log("TABLE NOT FOUND FOR: ", name);
        if (name === "labelartists") table = [{ id: 1 }];
        else continue;
      }
      const idHash = {};
      const data = [];
      table.map(item => {
        if (idHash[item.id]) {
          console.error("CULPRIT FOUND: ", item.id);
          return;
        }
        toChange.forEach(change => {
          let value = parseInt(item[change]);
          if (!Number.isNaN(value)) item[change] = value + 42351;
        });
        toRemove && toRemove.forEach(tR => delete item[tR]);
        data.push(item);
        idHash[item.id] = 1;
        toRename.forEach(([key, newKey]) => {
          if (item.hasOwnProperty(key)) {
            let value = item[key];
            item[newKey] = value;
            delete item[key];
          }
        });
      });
      const response = JSON.parse(
        JSON.stringify(await Handler.bulkCreate(data))
      );
      if (response.id) console.log("Done with: ", name);
    }
  } catch (e) {
    console.log(e);
  }
})();
