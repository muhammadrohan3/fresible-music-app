/**
 * @param {Releases} array of releases
 * @param {AnalyticsStores} an object of arrays ('stream' & 'download)
 */
const initiateAnalytics = (monthId, countries, stores, releases) => {
  const ResultDataList = [];
  countries.forEach((countryId) => {
    stores.forEach((storeId) => {
      releases.forEach((release) => {
        release.tracks.forEach((track) => {
          ResultDataList.push({
            countryId,
            monthId,
            trackId,
            releaseId: release.id,
            storeId,
            releaseDownload: 0,
            releaseDownloadEarning: 0,
            trackDownload: 0,
            stream: 0,
          });
        });
      });
    });
  });
  return ResultDataList;
};

module.exports = initiateAnalytics;
