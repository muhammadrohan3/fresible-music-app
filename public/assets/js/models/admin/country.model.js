import ModelIndex from "../modelIndex";

export default class CountryModel extends ModelIndex {
  constructor() {
    super();
    const _url = (route) => `/fmadmincp/countries${route}`;
    this.queries = {
      all: {
        url: _url("/data"),
      },
    };
  }
}
