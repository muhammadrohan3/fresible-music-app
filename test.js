function test(schemaResult, range) {
  const Colors = [
    { color: "#3f91f3", light: "#d9e9fc" },
    { color: "#FF006E", light: "#ffcce2" },
    { color: "#12c1ae", light: "#c9f9f4" },
    { color: "#C482DB", light: "#f3e6f7" },
    { color: "#d4008b", light: "#fec4ea" },
    { color: "#3F0099", light: "#d5b8ff" },
    { color: "#940062", light: "#ffb7e7" },
  ];
  let ChartDataHash = {};
  let CurrentDataHash = {};
  let PreviousDataHash = {};
  const _growthCalc = (current, previous) => {
    if (current === 0 || previous === 0) return [null, null];
    let rate = ((current - previous) / previous) * 100;
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
      let L;
      //
      CurrentDataHash = {
        ...CurrentDataHash,
        [releaseId]: {
          title: release.title,
          type: release.type,
          stream:
            ((L = CurrentDataHash[releaseId] || {})["stream"] || 0) +
            (pcount || 0),
          tracks: {
            ...(L = L["tracks"] || {}),
            [trackId]: {
              title: track.title,
              stream: ((L = L[trackId] || {})["stream"] || 0) + (pcount || 0),
              stores: {
                ...(L = L["stores"] || {}),
                [storeId]: {
                  title: store.store,
                  stream: ((L[storeId] || {})["stream"] || 0) + (pcount || 0),
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
            ((L = PreviousDataHash[preleaseId] || {})["stream"] || 0) +
            (count || 0),
          tracks: {
            ...(L = L["tracks"] || {}),
            [ptrackId]: {
              title: ptrack.title,
              stream: ((L = L[ptrackId] || {})["stream"] || 0) + (count || 0),
              stores: {
                ...(L = L["stores"] || {}),
                [pstoreId]: {
                  title: pstore.store,
                  stream: ((L[pstoreId] || {})["stream"] || 0) + (count || 0),
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
    datasets: ChartDataset,
  };

  let rangeReport = [0, 0];
  //Prepare Table Data;
  //Loops throught the CurrentDataHash by creating an array of entries
  const TableData = Object.entries(CurrentDataHash).map(([id, data]) => {
    //Gets the previous Data for the current Data ID
    const previousData = PreviousDataHash[id];
    //Get the key value pairs
    const { stream, tracks, type, title } = data;
    rangeReport = [
      rangeReport[0] + stream,
      rangeReport[1] + previousData.stream,
    ];
    const [rate, growing] = _growthCalc(stream, previousData.stream);
    const tracksToLoop =
      type === "track" ? [Object.entries(tracks)[0]] : Object.entries(tracks);
    const children = tracksToLoop.map(([trackId, trackData]) => {
      const previousTrackData = previousData["tracks"][trackId];
      const { stream, title, stores } = trackData;
      const releaseTitle = title;
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
      if (type === "track") return children;
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
      children: type === "track" ? children[0] : children,
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
