require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  User,
  Userprofile,
  Userpackage,
  Package,
  Payment,
  Track,
  Release,
  Upload,
  Log,
  Link,
  Labelartist,
} = require("../database/models/index");

const route = [
  ["users", User],
  ["packages", Package],
  ["labelartists", Labelartist],
  ["userprofiles", Userprofile],
  ["userpackages", Userpackage],
  ["payments", Payment],
  ["links", Link],
  ["releases", Release],
  ["tracks", Track],
  ["albums"],
  ["albumtracks", Track],
  ["logs", Log],
];

const jsonData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../", "/blueoqom_fresible-music.json"),
    {
      encoding: "utf-8",
    }
  )
);

const dataHash = jsonData.reduce((acc, { type, name, data }) => {
  if (type !== "table") return acc;
  return { ...acc, [name.toLowerCase()]: data };
}, {});

//

(async () => {
  try {
    const tracksHash = {};
    const albumTracksHash = {};
    const _handleResponse = (response) => JSON.parse(JSON.stringify(response));
    const _updateRelease = async ({ title, artwork, id }) => {
      let artworkId = null;

      if (artwork) {
        const { id: artwork_id } = _handleResponse(
          await Upload.create({ secureUrl: artwork })
        );
        artworkId = artwork_id;
      }
      return _handleResponse(
        await Release.update(
          { title, artworkId },
          { where: { id: parseInt(id) } }
        )
      );
    };
    for (let r of route) {
      const [name, Handler] = r;
      let data;
      if (!["releases", "albums", "albumtracks", "tracks"].includes(name)) {
        if (["userprofiles", "labelartists"].includes(name)) {
          let tempData = dataHash[name];
          const newData = [];
          for (let d of tempData) {
            const { avatar } = d;
            let avatarId = null;

            if (avatar) {
              const { id: avatar_id } = await Upload.create({
                secureUrl: avatar,
              });
              avatarId = avatar_id;
            }
            delete d["avatar"];
            console.log(name, ": ", avatarId);
            newData.push({ ...d, avatarId });
          }
          data = newData;
        } else {
          data = dataHash[name];
        }
      } else {
        const processData = dataHash[name];
        for (let toBeProcessed of processData) {
          if (name === "releases") {
            const { type, trackId, albumId, id } = toBeProcessed;
            if (type === "track") trackId && (tracksHash[trackId] = id);
            if (type === "album") albumId && (albumTracksHash[albumId] = id);
            delete toBeProcessed["trackId"];
            delete toBeProcessed["albumId"];
            delete toBeProcessed["videoId"];
          }
          if (name === "tracks") {
            const { id, title, artwork } = toBeProcessed;
            const releaseId = tracksHash[id];
            await _updateRelease({ title, artwork, id: releaseId });
            toBeProcessed["releaseId"] = releaseId;
            delete toBeProcessed["artwork"];
          }
          if (name === "albums") {
            const { id, title, artwork } = toBeProcessed;
            const releaseId = albumTracksHash[id];
            await _updateRelease({ title, artwork, id: releaseId });
            continue;
          }
          if (name === "albumtracks") {
            const { albumId } = toBeProcessed;
            const releaseId = albumTracksHash[albumId];
            toBeProcessed["releaseId"] = releaseId;
            delete toBeProcessed["artwork"];
            delete toBeProcessed["id"];
          }
        }
        if (!Handler) continue;
        data = processData;
      }
      const response = JSON.parse(
        JSON.stringify(await Handler.bulkCreate(data))
      );
    }
    console.log("DONE");
  } catch (e) {
    console.log(e);
  }
})();
