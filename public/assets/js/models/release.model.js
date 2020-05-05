import ModelIndex from "./modelIndex";

export default class ReleaseModel extends ModelIndex {
  constructor() {
    super();
    this.queries = {
      update: {
        href: "/add-music/updateRelease",
        params: ["id"],
      },
      createTrack: {
        href: "/add-music/createReleaseTrack",
      },
      updateTrack: {
        href: "/add-music/createReleaseTrack",
        params: ["releaseId", "trackId"],
      },
      createOrUpdateAlbumTracks: {
        href: "/add-music/createOrUpdateAlbumTracks",
        params: ["releaseId"],
      },
    };
  }

  query(query, requestInfo = {}) {
    if (!this.queries[query]) throw new Error("QUERY NOT FOUND IN QUERIES");
    const foundQuery = this.queries[query];
    const { href, params = [] } = foundQuery;
    for (const param of params) {
      if (!requestInfo.params[param])
        throw new Error(`QUERY PARAM MISSING KEY: ${param}`);
    }
    this.requestInfo = { ...requestInfo, href };
    return this;
  }
}
