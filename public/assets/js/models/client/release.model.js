import ModelIndex from "../modelIndex";

export default class ReleaseModel extends ModelIndex {
  constructor() {
    super();
    this.queries = {
      create: {
        url: "/add-music/create",
      },
      update: {
        url: "/add-music/update",
        params: ["id"],
      },
      createTrack: {
        url: "/add-music/createTrack",
      },
      updateTrack: {
        url: "/add-music/updateTrack",
        params: ["releaseId", "id"],
      },
      createOrUpdateAlbumTracks: {
        url: "/add-music/createOrUpdateAlbumTracks",
        params: ["releaseId"],
      },
      createOrUpdateStores: {
        url: "/add-music/createOrUpdateStores",
        params: ["releaseId"],
      },
      publish: {
        url: "/add-music/publish",
        params: ["id"],
      },
      artistPackages: {
        url: "/add-music/artistPackages",
        params: ["artistId"],
      },
      packageReleaseTypes: {
        url: "/add-music/packageReleaseTypes",
        params: ["packageId"],
      },
    };
  }

  query(query, receivedParams = {}) {
    if (!this.queries[query]) throw new Error("QUERY NOT FOUND IN QUERIES");
    const foundQuery = this.queries[query];
    const { url, params = [] } = foundQuery;
    for (const param of params) {
      if (!receivedParams[param])
        throw new Error(`QUERY PARAM MISSING KEY: ${param}`);
    }
    this.requestInfo = { params: { ...receivedParams }, url };
    return this;
  }
}
