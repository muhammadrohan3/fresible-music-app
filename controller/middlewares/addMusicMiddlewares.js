const idLookUp = require("../util/idLookUp");

const addMusic_structureSubs = ({ getStore, setStore }) => () => {
  const data = getStore("schemaResult");
  if (!data) return setStore("USER_SUBSCRIPTIONS", null);
  const USER_SUBSCRIPTIONS = [];
  data.forEach(
    ({ id, status, package: { package, maxAlbums, maxTracks }, releases }) => {
      let trackCount = 0;
      let albumCount = 0;
      releases.forEach(({ type }) =>
        type === "album" ? albumCount++ : trackCount++
      );
      if (trackCount >= maxTracks && albumCount >= maxAlbums) return null;
      return USER_SUBSCRIPTIONS.push([
        idLookUp(id),
        `${package} - (${status})`
      ]);
    }
  );
  return setStore("USER_SUBSCRIPTIONS", USER_SUBSCRIPTIONS);
};

const addMusic_structureReleaseType = ({ getStore, setStore }) => () => {
  const data = getStore("schemaResult");
  if (!data) return setStore("USER_RELEASE_TYPES", null);
  const {
    package: { maxAlbums, maxTracks },
    releases
  } = data;
  let trackCount = 0;
  let albumCount = 0;
  let album = [];
  let track = [];
  releases.forEach(({ type }) =>
    type === "album" ? albumCount++ : trackCount++
  );
  if (maxAlbums > 0 && albumCount < maxAlbums) album = ["album", "Album"];
  if (maxTracks > 0 && trackCount < maxTracks) track = ["track", "Track"];
  const USER_RELEASE_TYPES = [track, album];
  return setStore("USER_RELEASE_TYPES", USER_RELEASE_TYPES);
};

const addMusic_checkIncompleteCreation = ({ getStore, setStore }) => () => {
  const { type, album, track } = getStore("schemaResult");
  const { id } = getStore("schemaQuery");
  let key = type === "track" ? track : album;
  if (key) return setStore("tempKey", false);
  return setStore("tempKey", { id, type });
};

module.exports = {
  addMusic_structureReleaseType,
  addMusic_structureSubs,
  addMusic_checkIncompleteCreation
};
