module.exports = {
  edit_structure: {
    key: "releaseId",
    name: "release",
    props: [
      { name: "id", key: "releaseId" },
      { name: "userId", key: "userId" },
      { name: "title", key: ["release", "title"] },
      { name: "type", key: ["release", "type"] },
      { name: "releaseDownload", key: "releaseDownload" },
      { name: "releaseDownloadEarning", key: "releaseDownloadEarning" },
      { name: "levels", defaultValue: 3 },
    ],
    children: {
      key: "trackId",
      props: [
        { name: "id", key: "trackId" },
        { name: "title", key: ["track", "title"] },
      ],
      children: {
        key: "countryId",
        props: [
          { name: "id", key: "countryId" },
          { name: "name", key: ["country", "name"] },
        ],
        children: {
          key: "storeId",
          props: [
            { name: "id", key: "storeId" },
            { name: "store", key: ["store", "store"] },
            { name: "trackStream", key: "trackStream", cb: "sumCount" },
            {
              name: "trackStreamEarning",
              key: "trackStreamEarning",
              cb: "sumCount",
            },
            { name: "trackDownload", key: "trackDownload", cb: "sumCount" },
            {
              name: "trackDownloadEarning",
              key: "trackDownloadEarning",
              cb: "sumCount",
            },
          ],
        },
      },
    },
  },
};
