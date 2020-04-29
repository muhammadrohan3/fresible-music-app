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

const preRun = [
  ["labelartists", [["avatar", "avatarId", "image"]]],
  ["userprofiles", [["avatar", "avatarId", "image"]]],
  ["releases"],
  [
    "tracks",
    [
      ["track", "trackUploadId", "audio"],
      ["artwork", "artworkUploadId", "image"],
    ],
  ],
  ["albums", [["artwork", "artworkUploadId", "image"]]],
  ["albumtracks", [["track", "trackUploadId", "audio"]]],
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

(async () => {
  try {
    const Uploads = [];
    const tracksHash = {};
    const albumTracksHash = {};
    const _uploader = (secureUrl, resourceType) => {
      let index = 42351;
      let id = index + Uploads.length;
      Uploads.push({ id, secureUrl, resourceType });
      return id;
    };

    const _updateRelease = (releaseId, data = {}) => {
      const releases = dataHash["releases"];
      for (let i = 0; releases.length; i++) {
        const { id } = releases[i];
        if (id !== releaseId) continue;
        releases[i] = { ...releases[i], ...data };
        return;
      }
    };

    for (let item of preRun) {
      const [name, options] = item;

      for (let toBeProcessed of dataHash[name]) {
        if (options) {
          options.forEach((option) => {
            const [key, newKey, resourceType] = option;
            if (!toBeProcessed[key]) return;
            const id = _uploader(toBeProcessed[key], resourceType);
            toBeProcessed[newKey] = id;
            delete toBeProcessed[key];
          });
        }

        if (name === "releases") {
          const { type, trackId, albumId, id } = toBeProcessed;
          if (type === "track") trackId && (tracksHash[trackId] = id);
          if (type === "album") albumId && (albumTracksHash[albumId] = id);
          delete toBeProcessed["trackId"];
          delete toBeProcessed["albumId"];
          delete toBeProcessed["videoId"];
        }
        if (name === "tracks") {
          const { id, title, artworkUploadId } = toBeProcessed;
          const releaseId = tracksHash[id];
          if (releaseId) _updateRelease(releaseId, { title, artworkUploadId });
          toBeProcessed["releaseId"] = releaseId;
        }
        if (name === "albums") {
          const { id, title, artworkUploadId } = toBeProcessed;
          const releaseId = albumTracksHash[id];
          if (releaseId) _updateRelease(releaseId, { title, artworkUploadId });
        }
        if (name === "albumtracks") {
          const { albumId } = toBeProcessed;
          const releaseId = albumTracksHash[albumId];
          toBeProcessed["releaseId"] = releaseId;
          delete toBeProcessed["id"];
        }
      }
    }
    await Upload.bulkCreate(Uploads, {
      updateOnDuplicate: ["id", "secureUrl", "resourceType"],
    });
    console.log("processed uploads: ", Uploads.length);
  } catch (err) {
    console.log(err);
  }
})();

//

(async () => {
  try {
    for (let r of route) {
      const [name, Handler] = r;
      if (!Handler) continue;
      console.log("processing: ", name);
      const data = dataHash[name];
      await Handler.bulkCreate(data, { updateOnDuplicate: ["id"] });
    }
    console.log("DONE");
  } catch (e) {
    console.log(e);
  }
})();
