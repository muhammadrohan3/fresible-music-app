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
  ["labelartists"],
  ["userprofiles"],
  ["releases"],
  ["tracks"],
  ["albums"],
  ["albumtracks"],
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

const users = dataHash["users"];

const filterOut = (schemas = [], userId) => {
  if (!schemas.length || !userId) return;
  schemas.forEach((schema) => {
    if (dataHash[schema]) {
      dataHash[schema] = dataHash[schema].filter((data) => {
        if (data.userId === userId) {
          if (schema === "releases") {
            dataHash["tracks"] = dataHash["tracks"].filter(
              (track) => track.releaseId !== data.id
            );
          }
          return false;
        }
        return true;
      });
    }
  });
};

const getData = (schema, userId) => {
  if (!schema || !userId) return;
  return dataHash[schema].filter((data) => data.userId === userId);
};

for (let user of users) {
  user.profileSetup = "select-account";

  if (Number(user.profileActive) === 1000) {
    user.profileSetup = "completed";
    continue;
  }

  if (!getData("userprofiles", user.id).length) {
    user.profileSetup = "select-account";
    filterOut(
      ["labelartists", "userpackages", "releases", "payments"],
      user.id
    );
    continue;
  }

  if (user.type === "label" && !getData("labelartists", user.id).length) {
    user.profileSetup = "add-artist";
    filterOut(["userpackages", "releases", "payments"], user.id);
    continue;
  }

  if (!getData("userpackages", user.id).length) {
    user.profileSetup = "select-package";
    filterOut(["releases", "payments"], user.id);
    continue;
  }

  const releases = getData("releases", user.id);
  const submittedReleases = releases.filter(
    ({ status }) => status.trim() === "processing"
  );
  if (!submittedReleases.length) {
    user.profileSetup = "add-release";
    filterOut(["payments"], user.id);
    continue;
  }

  const payments = getData("payments", user.id);
  const completedPayments = payments.filter(({ status }) =>
    status ? status.trim() === "active" : false
  );
  if (!completedPayments.length) {
    user.profileSetup = "payment";
    continue;
  }

  user.profileSetup = "completed";
}

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
      const [name] = item;

      for (let toBeProcessed of dataHash[name]) {
        // if (options) {
        //   options.forEach((option) => {
        //     const [key, newKey, resourceType] = option;
        //     if (!toBeProcessed[key]) return;
        //     const id = _uploader(toBeProcessed[key], resourceType);
        //     toBeProcessed[newKey] = id;
        //     delete toBeProcessed[key];
        //   });
        // }

        if (name === "releases") {
          const { type, trackId, albumId, id } = toBeProcessed;
          if (type === "track") trackId && (tracksHash[trackId] = id);
          if (type === "album") albumId && (albumTracksHash[albumId] = id);
          delete toBeProcessed["trackId"];
          delete toBeProcessed["albumId"];
          delete toBeProcessed["videoId"];
        }
        if (name === "tracks") {
          const {
            id,
            title,
            artwork,
            genre: primaryGenre,
            copyrightHolder,
            copyrightYear,
          } = toBeProcessed;
          const releaseId = tracksHash[id];

          if (releaseId) {
            _updateRelease(releaseId, {
              title,
              artwork,
              primaryGenre,
              copyrightHolder,
              copyrightYear,
            });
          }
          toBeProcessed["releaseId"] = releaseId;
        }
        if (name === "albums") {
          const { id, title, artwork } = toBeProcessed;
          const releaseId = albumTracksHash[id];
          if (releaseId) _updateRelease(releaseId, { title, artwork });
        }
        if (name === "albumtracks") {
          const {
            albumId,
            genre: primaryGenre,
            copyrightHolder,
            copyrightYear,
          } = toBeProcessed;
          const releaseId = albumTracksHash[albumId];
          if (releaseId)
            _updateRelease(releaseId, {
              primaryGenre,
              copyrightHolder,
              copyrightYear,
            });
          toBeProcessed["releaseId"] = releaseId;
          delete toBeProcessed["id"];
          delete toBeProcessed["albumId"];
        }
      }
    }
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
      const data = dataHash[name];
      console.log("processing: ", name);
      // if (name === "users") {
      //   dataHash[name].forEach((user) =>
      //     console.log(user.id, user.profileSetup)
      //   );
      // }
      await Handler.bulkCreate(data);
    }
    console.log("DONE");
  } catch (e) {
    console.log(e);
  }
})();
