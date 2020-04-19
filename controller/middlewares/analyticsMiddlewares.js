const analyticsHandler = ({ getStore, setStore }) => () => {
  //Gets the required data from the store
  const { schemaResult, schemaQuery } = getStore();
  const { range } = schemaQuery;

  //Hash maps to avoid duplicates data
  let ChartDataHash = {};
  let CurrentDataHash = {};
  let PreviousDataHash = {};

  /**
   *
   * @param {current} number
   * @param {previous} number
   * @return array containing the rate of current to previous and a boolean stating if the current grew in respect to previous
   */
  const _growthCalc = (current, previous) => {
    if (current === 0 || previous === 0) return [null, null];
    let rate = ((current - previous) / current) * 100;
    rate = Math.round(rate * 100) / 100;
    if (rate === 0) return [null, null];
    return [rate, rate > 0];
  };

  //holds the dates for each data sheet
  const Dates = [];
  //Splits the array of data into 2, in other to process for both the current and previous data
  const currentData = schemaResult.slice(0, 2);
  const previousData = schemaResult.slice(2);

  //Loops through the list of dates
  for (let i = 0; i < range; i++) {
    //temporary variable that holds the hash data for each date (meant for the chart);
    let holdRelease = {};
    //adds the current date to the list of dates for the chart
    Dates.push(currentData[i].date);
    //Each holds the analytics record for date (current and previous)
    const currentDataItem = currentData[i].analytics;
    const previousDataItem = previousData[i].analytics;
    //Using the currentDataItem has the source index for looping through both arrays
    for (let j = 0; j < currentDataItem.length; j++) {
      //destructures the data for both data source
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

      //PS: What i did here might not be clear at first but closely looking at the code for sometime will make you understand (Pardon me, I had no other choice);

      //Updates the data for the holdRelease variable (merges duplicate data)
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

      // //Create or updates the data for the CurrentDataHash variable declared at the top
      // CurrentDataHash = {
      //   ...CurrentDataHash,
      //   [releaseId]: {
      //     title: release.title,
      //     type: release.type,
      //     count:
      //       ((L = CurrentDataHash[releaseId] || {})["count"] || 0) +
      //       (count || 0),
      //     tracks: {
      //       ...(L = L["tracks"] || {}),
      //       [trackId]: {
      //         title: track.title,
      //         count: ((L = L[trackId] || {})["count"] || 0) + (count || 0),
      //         stores: {
      //           ...(L = L["stores"] || {}),
      //           [storeId]: {
      //             title: store.store,
      //             count: ((L[storeId] || {})["count"] || 0) + (count || 0),
      //           },
      //         },
      //       },
      //     },
      //   },
      // };

      const _sumCount = (currentValue, data, key) => {
        console.log("CALLBACK CALLED: ", currentValue, data, key);
        return (currentValue || 0) + data[key];
      };

      const rep = {
        key: "releaseId",
        props: [
          { name: "title", key: "title" },
          { name: "type", key: "type" },
          { name: "count", key: "count", cb: _sumCount },
        ],
        children: {
          key: "trackId",
          props: [
            { name: "title", key: "title" },
            { name: "count", key: "count", cb: _sumCount },
          ],
          children: {
            key: "storeId",
            props: [
              { name: "title", key: "title" },
              { name: "count", key: "count", cb: _sumCount },
            ],
          },
        },
      };

      const _generateHash = (hash = {}, dataItem, rep) => {
        const { key, props, children } = rep;
        let keyValue = hash[key] || {};
        props.forEach(({ name, key, cb }) => {
          if (cb) keyValue[name] = cb(keyValue[name], dataItem, key);
          else keyValue[name] = dataItem[key];
        });
        if (children)
          keyValue.children = _generateHash(
            keyValue.children,
            dataItem,
            children
          );
        hash[key] = keyValue;
        return hash;
      };

      CurrentDataHash = _generateHash(CurrentDataHash, currentDataItem[j], rep);
      PreviousDataHash = _generateHash(
        PreviousDataHash,
        previousDataItem[j],
        rep
      );

      ///
      // PreviousDataHash = {
      //   ...PreviousDataHash,
      //   [preleaseId]: {
      //     title: prelease.title,
      //     type: prelease.type,
      //     count:
      //       ((L = PreviousDataHash[preleaseId] || {})["count"] || 0) +
      //       (pcount || 0),
      //     tracks: {
      //       ...(L = L["tracks"] || {}),
      //       [ptrackId]: {
      //         title: ptrack.title,
      //         count: ((L = L[ptrackId] || {})["count"] || 0) + (pcount || 0),
      //         stores: {
      //           ...(L = L["stores"] || {}),
      //           [pstoreId]: {
      //             title: pstore.store,
      //             count: ((L[pstoreId] || {})["count"] || 0) + (pcount || 0),
      //           },
      //         },
      //       },
      //     },
      //   },
      // };
    }
    //populate data for chartjs
    Object.entries(holdRelease).forEach(([releaseId, { title, stream }]) => {
      ChartDataHash = {
        ...ChartDataHash,
        [releaseId]: {
          label: title,
          data: [...((ChartDataHash[releaseId] || {})["data"] || []), stream],
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

  const rangeReport = [0, 0];
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
  return setStore("ANALYTICS", { Report, TableData, ChartData });
};