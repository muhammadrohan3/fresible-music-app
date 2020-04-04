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
  ["albums", Album, ["id"], ["userId"]],
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
  fs.readFileSync("../fresible_music.json", {
    encoding: "utf-8"
  })
);

const dataHash = jsonData.reduce((acc, { type, name, data }) => {
  if (type !== "table") return acc;
  return { ...acc, [name]: data };
}, {});

//

(async () => {
  for (let r of route) {
    const [name, Handler, toChange, toRemove] = r;
    console.log("Processing: ", name);
    let table = dataHash[name];
    if (!table) throw new Error("TABLE NOT FOUND FOR: ", name);
    const data = table.map(item => {
      toChange.forEach(change => {
        let value = parseInt(item[change]);
        if (!Number.isNaN(value)) item[change] = value + 42351;
      });
      toRemove && toRemove.forEach(tR => delete item[tR]);
      return item;
    });
    const response = JSON.parse(JSON.stringify(await Handler.bulkCreate(data)));
    if (response.id) console.log("Done with: ", name);
  }
})();
