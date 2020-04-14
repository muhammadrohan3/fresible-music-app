function test(schemaResult, range) {
  let ChartDataHash = {};
  let CurrentDataHash = {};
  let PreviousDataHash = {};
  const _growthCalc = (current, previous) => {
    if (current === 0 || previous === 0) return [null, null];
    let rate = ((current - previous) / current) * 100;
    rate = Math.round(rate * 100) / 100;
    if (rate === 0) return [null, null];
    return [rate, rate > 0];
  };

  const Dates = [];
  const currentData = schemaResult.slice(0, 2);
  const previousData = schemaResult.slice(2);

  for (let i = 0; i < range; i++) {
    let holdRelease = {};
    Dates.push(currentData[i].date);
    const currentDataItem = currentData[i].analytics;
    const previousDataItem = previousData[i].analytics;
    for (let j = 0; j < currentDataItem.length; j++) {
      const {
        releaseId,
        release,
        trackId,
        track,
        storeId,
        store,
        count,
      } = currentDataItem[j];
      const {
        releaseId: preleaseId,
        release: prelease,
        trackId: ptrackId,
        track: ptrack,
        storeId: pstoreId,
        store: pstore,
        count: pcount,
      } = previousDataItem[j];
      // CurrentDataHash[releaseId] = {};
      // PreviousDataHash[preleaseId] = {};
      // console.log(release, currentDataItem[j]);
      // console.log(CurrentDataHash, PreviousDataHash);
      holdRelease = {
        ...holdRelease,
        [releaseId]: {
          ...(holdRelease[releaseId] || {}),
          title: release.title,
          stream:
            ((holdRelease[releaseId] || {})["stream"] || 0) + (count || 0),
        },
      };
      //
      CurrentDataHash = {
        ...CurrentDataHash,
        [releaseId]: {
          title: release.title,
          type: release.type,
          stream:
            ((CurrentDataHash[releaseId] || {})["stream"] || 0) + (count || 0),
          tracks: {
            ...((CurrentDataHash[releaseId] || {})["tracks"] || {}),
            [trackId]: {
              title: track.title,
              stream:
                ((((CurrentDataHash[releaseId] || {})["tracks"] || {})[
                  trackId
                ] || {})["stream"] || 0) + (count || 0),
              stores: {
                ...(((CurrentDataHash[releaseId] || {})[trackId] || {})[
                  "stores"
                ] || {}),
                [storeId]: {
                  title: store.store,
                  stream:
                    (((((((CurrentDataHash[releaseId] || {})["tracks"] || {})[
                      trackId
                    ] || {})["stream"] || {})["stores"] || {})[storeId] || {})[
                      "stream"
                    ] || 0) + (count || 0),
                },
              },
            },
          },
        },
      };

      ///
      PreviousDataHash = {
        ...PreviousDataHash,
        [preleaseId]: {
          title: prelease.title,
          type: prelease.type,
          stream:
            ((PreviousDataHash[preleaseId] || {})["stream"] || 0) +
            (pcount || 0),
          tracks: {
            ...((PreviousDataHash[preleaseId] || {})["tracks"] || {}),
            [ptrackId]: {
              title: ptrack.title,
              stream:
                ((((PreviousDataHash[preleaseId] || {})["tracks"] || {})[
                  ptrackId
                ] || {})["stream"] || 0) + (pcount || 0),
              stores: {
                ...(((PreviousDataHash[preleaseId] || {})[ptrackId] || {})[
                  "stores"
                ] || {}),
                [pstoreId]: {
                  pstore,
                  stream:
                    (((((((PreviousDataHash[preleaseId] || {})["tracks"] || {})[
                      ptrackId
                    ] || {})["stream"] || {})["stores"] || {})[pstoreId] || {})[
                      "stream"
                    ] || 0) + (pcount || 0),
                },
              },
            },
          },
        },
      };
    }
    //populate data for chartjs
    Object.entries(holdRelease).forEach(([releaseId, { title, stream }]) => {
      ChartDataHash = {
        ...ChartDataHash,
        [releaseId]: {
          label: title,
          stream: [
            ...((ChartDataHash[releaseId] || {})["stream"] || []),
            stream,
          ],
        },
      };
    });
  }

  //prepare chartjs data
  const ChartDataset = Object.values(ChartDataHash).map((value) => value);
  const ChartData = {
    dates: Dates,
    dataset: ChartDataset,
  };

  const rangeReport = [0, 0];
  //Prepare Table Data;
  const TableData = Object.entries(CurrentDataHash).map(([id, data]) => {
    const previousData = PreviousDataHash[id];
    const { stream, tracks, type, title } = data;
    rangeReport[0] = rangeReport[0] + stream;
    rangeReport[1] = rangeReport[1] + previousData.stream;
    const [rate, growing] = _growthCalc(stream, previousData.stream);
    const children = Object.entries(tracks).map(([trackId, trackData]) => {
      const previousTrackData = previousData["tracks"][trackId];
      const { stream, title, stores } = trackData;
      const [rate, growing] = _growthCalc(stream, previousTrackData.stream);
      const children = Object.entries(stores).map(([storeId, storeData]) => {
        const previousTrackStoreData =
          previousData["tracks"][trackId]["stores"][storeId];
        const { stream, title } = storeData;
        const [rate, growing] = _growthCalc(
          stream,
          previousTrackStoreData.stream
        );
        return {
          title,
          stream,
          rate,
          growing,
        };
      });
      if (type === "track") return children[0];
      return {
        title,
        stream,
        rate,
        growing,
        children,
      };
    });
    return {
      title,
      type,
      stream,
      rate,
      growing,
      children,
    };
  });

  //

  const [rangeCurrentTotal, rangePreviousTotal] = rangeReport;
  const [rangeRate, rangeGrowing] = _growthCalc(
    rangeCurrentTotal,
    rangePreviousTotal
  );
  const Report = {
    stream: rangeCurrentTotal,
    previous: rangePreviousTotal,
    rate: rangeRate,
    growing: rangeGrowing,
  };
  // setStore("ANALYTICS", { Report, TableData, ChartData });
  return { Report, TableData, ChartData };
}

const dataset = [
  {
    date: "2020-10-10",
    analytics: [
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 2,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 2,
        store: { store: "Spotify" },
        count: 12,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 32,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 2,
        store: { store: "Spotify" },
        count: 0,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 21,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 2,
        store: { store: "Spotify" },
        count: 42,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 4,
        track: { title: "Gbe body" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 70,
      },
    ],
  },
  {
    date: "2020-10-09",
    analytics: [
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 2,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 2,
        store: { store: "Spotify" },
        count: 12,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 32,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 2,
        store: { store: "Spotify" },
        count: 0,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 21,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 2,
        store: { store: "Spotify" },
        count: 42,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 4,
        track: { title: "Gbe body" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 70,
      },
    ],
  },
  {
    date: "2020-10-08",
    analytics: [
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 29,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 2,
        store: { store: "Spotify" },
        count: 2,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 52,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 2,
        store: { store: "Spotify" },
        count: 10,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 12,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 2,
        store: { store: "Spotify" },
        count: 24,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 4,
        track: { title: "Gbe body" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 07,
      },
    ],
  },
  {
    date: "2020-10-07",
    analytics: [
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 20,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile" },
        trackId: 1,
        storeId: 2,
        store: { store: "Spotify" },
        count: 21,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 1,
        store: { store: "Apple Music" },
        count: 23,
      },
      {
        releaseId: 1,
        release: { title: "Joko Sile", type: "track" },
        track: { title: "Joko Sile part 2" },
        trackId: 2,
        storeId: 2,
        store: { store: "Spotify" },
        count: 10,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 11,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 3,
        track: { title: "Gbe" },
        storeId: 2,
        store: { store: "Spotify" },
        count: 48,
      },
      {
        releaseId: 2,
        release: { title: "Gbe Collection", type: "album" },
        trackId: 4,
        track: { title: "Gbe body" },
        storeId: 1,
        store: { store: "Apple Music" },
        count: 76,
      },
    ],
  },
];

console.log(JSON.stringify(test(dataset, 2)));
