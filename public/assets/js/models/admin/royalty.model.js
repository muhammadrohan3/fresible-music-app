import ModelIndex from "../modelIndex";

export default class RoyaltyModel extends ModelIndex {
  constructor() {
    super();
    const _url = (route) => `/fmadmincp/royalties${route}`;
    this.queries = {
      month: {
        url: _url("/{monthId}/edit/data"),
      },
      allMonths: {
        url: _url("/all-months"),
      },
      addMonth: {
        url: _url("/"),
      },
      save: {
        url: _url("/{monthId}/action/save"),
      },
      publish: {
        url: _url("/{monthId}/action/publish"),
      },
      searchForMonth: {
        url: _url("/search-month"),
        params: ["monthValue", "yearValue"],
      },
    };
  }
}
