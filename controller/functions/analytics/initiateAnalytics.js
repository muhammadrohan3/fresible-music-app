/**
 * @param {Releases} array of releases
 * @param {AnalyticsStores} an object of arrays ('stream' & 'download)
 */
const initiateAnalytics = (dateId, Releases, AnalyticsStores = {}) => {
  const RootData = []; //Holds the array of objects [{userId, releaseId, trackId, storeId, type}]
  const { stream, download } = AnalyticsStores;
  Releases.forEach(({ id: releaseId, user: { id: userId }, tracks }) => {
    //loop through each releases
    tracks.forEach(({ id: trackId }) => {
      //loop through each tracks
      //loop through each stream, pushes new object to the rootdata
      stream.forEach((storeId) =>
        RootData.push({
          userId,
          releaseId,
          trackId,
          storeId: Number(storeId),
          type: "stream",
          dateId,
          count: 0,
        })
      );
      //loop through each download, pushes new object to the rootdata
      download.forEach((storeId) =>
        RootData.push({
          userId,
          releaseId,
          trackId,
          storeId: Number(storeId),
          type: "download",
          dateId,
          count: 0,
        })
      );
    });
  });
  return RootData;
};

module.exports = initiateAnalytics;
