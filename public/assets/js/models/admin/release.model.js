import ModelIndex from "../modelIndex";

export default class ReleaseModel extends ModelIndex {
  constructor() {
    super();
    const _url = (route) => `/fmadmincp/submission${route}`;
    this.queries = {
      approve: {
        url: _url("/action/approve"),
        params: ["id"],
      },
      decline: {
        url: _url("/action/decline"),
        params: ["id"],
      },
      delete: {
        url: _url("/action/delete"),
        params: ["id"],
      },
      editDeclineComment: {
        url: _url("/action/edit-comment"),
        params: ["id"],
      },
      addStoreLinks: {
        url: _url("/action/addLinks"),
        params: ["id"],
      },
      updateStoreLinks: {
        url: _url("/store-links/update"),
        params: ["id"],
      },
      liveForRoyalties: {
        url: "/fmadmincp/submissions/live/data",
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
