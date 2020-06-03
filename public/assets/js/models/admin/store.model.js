import ModelIndex from "../modelIndex";

export default class StoreModel extends ModelIndex {
  constructor() {
    super();
    const _url = (route) => `/fmadmincp/stores${route}`;
    this.queries = {
      all: {
        url: _url("/data"),
      },
    };
  }
}
