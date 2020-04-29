module.exports = {
  releases_analytics: {
    key: "releaseId",
    name: "release",
    props: [
      { name: "title", key: ["release", "title"] },
      { name: "type", key: ["release", "type"] },
      { name: "count", key: "count", cb: "sumCount" },
      { name: "levels", defaultValue: 3 },
    ],
    children: {
      key: "trackId",
      name: "track",
      props: [
        { name: "title", key: ["track", "title"] },
        { name: "count", key: "count", cb: "sumCount" },
      ],
      children: {
        key: "storeId",
        name: "store",
        props: [
          { name: "title", key: ["store", "store"] },
          { name: "count", key: "count", cb: "sumCount" },
        ],
      },
    },
  },
  release_analytics: {
    key: "trackId",
    props: [
      { name: "title", key: ["track", "title"] },
      { name: "count", key: "count", cb: "sumCount" },
      { name: "levels", defaultValue: 2 },
    ],
    children: {
      key: "storeId",
      props: [
        { name: "title", key: ["store", "store"] },
        { name: "count", key: "count", cb: "sumCount" },
      ],
    },
  },
  analytics_dates: {
    key: "dateId",
    name: "date",
    props: [
      { name: "date", key: ["analyticsdate", "date"] },
      { name: "status", key: ["analyticsdate", "status"] },
      { name: "dateId", key: "dateId" },
      { name: "streams", key: "count", cb: "typeSumCount" },
      { name: "downloads", key: "count", cb: "typeSumCount" },
    ],
    children: {
      key: "releaseId",
      name: "release",
      props: [
        { name: "title", key: ["release", "title"] },
        { name: "releaseId", key: "releaseId" },
        { name: "streams", key: "count", cb: "typeSumCount" },
        { name: "downloads", key: "count", cb: "typeSumCount" },
      ],
    },
  },
  analytics_edit: {
    key: "releaseId",
    name: "release",
    props: [
      { name: "title", key: ["release", "title"] },
      { name: "releaseId", key: "releaseId" },
      { name: "userId", key: "userId" },
      { name: "type", key: ["release", "type"] },
    ],
    children: {
      key: "trackId",
      name: "track",
      props: [
        { name: "title", key: ["track", "title"] },
        { name: "trackId", key: "trackId" },
        { name: "streams", key: "type", cb: "analyticsTypeStoreGen" },
        { name: "downloads", key: "type", cb: "analyticsTypeStoreGen" },
      ],
    },
  },
};
