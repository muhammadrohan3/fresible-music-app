const initiateAnalytics = require("../functions/analytics/initiateAnalytics");
const generateStructureHash = require("../functions/analytics/generateStructureHash");
const generateStructure = require("../functions/analytics/generateStructure");
const growthCalc = require("../util/growthCalc");

const analyticsHandler = ({ getStore, setStore }) => () => {
  //Gets the required data from the store
  const { schemaResult, schemaQuery } = getStore();
  const { range } = schemaQuery;

  const Colors = [
    { borderColor: "#3f91f3", backgroundColor: "#d9e9fc" },
    { borderColor: "#FF006E", backgroundColor: "#ffcce2" },
    { borderColor: "#12c1ae", backgroundColor: "#c9f9f4" },
    { borderColor: "#C482DB", backgroundColor: "#f3e6f7" },
    { borderColor: "#d4008b", backgroundColor: "#fec4ea" },
    { borderColor: "#3F0099", backgroundColor: "#d5b8ff" },
    { borderColor: "#940062", backgroundColor: "#ffb7e7" },
  ];
  let ChartDataHash = {};
  let CurrentDataHash = {};
  let PreviousDataHash = {};

  const _getRandomColorId = () => Math.floor(Math.random() * Colors.length);

  const Dates = [];
  const currentData = schemaResult.slice(0, 2);
  const previousData = schemaResult.slice(2);
  for (let i = 0; i < range; i++) {
    let holdRelease = {};
    Dates.push(currentData[i].date);
    const currentItem = currentData[i].analytics;
    const previousItem = previousData[i].analytics;
    for (let j = 0; j < currentItem.length; j++) {
      const currentDataItem = currentItem[j];
      const previousDataItem = previousItem[j];
      //

      const Rep = {
        key: "releaseId",
        name: "release",
        props: [
          { name: "title", key: ["release", "title"] },
          { name: "type", key: ["release", "type"] },
          { name: "count", key: "count", cb: _sumCount },
        ],
        children: {
          key: "trackId",
          name: "track",
          props: [
            { name: "title", key: ["track", "title"] },
            { name: "count", key: "count", cb: _sumCount },
          ],
          children: {
            key: "storeId",
            name: "store",
            props: [
              { name: "title", key: ["store", "store"] },
              { name: "count", key: "count", cb: _sumCount },
            ],
          },
        },
      };
      let Location; //holds the current location of the object
      const { key, name } = Rep; //destructures the key and name from the data representation sent in as param
      // console.log(currentDataItem, currentDataItem[key]);
      holdRelease = {
        ...holdRelease,
        [currentDataItem[key]]: {
          ...(Location = holdRelease[currentDataItem[key]] || {}),
          title: currentDataItem[name].title,
          count: (Location["count"] || 0) + (currentDataItem["count"] || 0),
        },
      };

      CurrentDataHash = _generateHash(CurrentDataHash, currentDataItem, Rep);
      PreviousDataHash = _generateHash(PreviousDataHash, previousDataItem, Rep);
    }
    //populate data for chartjs
    Object.entries(holdRelease).forEach(([id, { title, count }]) => {
      ChartDataHash = {
        ...ChartDataHash,
        [id]: {
          label: title,
          count: [...((ChartDataHash[id] || {})["count"] || []), count],
        },
      };
    });
  }

  //Set Range Initials
  let RangeReport = [0, 0];

  //prepare chartjs data
  const ChartDataset = Object.entries(ChartDataHash).map(([id, valueObj]) => {
    const colorIndex = _getRandomColorId(); //Gets a random color Id
    ChartDataHash[id]["colorId"] = colorIndex; //Sets the data of this id in the ChartDataHash for the TableData;
    valueObj = { ...valueObj, ...Colors[colorIndex] }; //Sets the borderColor and backgroundColor for the chart label
    const currentDataForIdCount = CurrentDataHash[id].count; //gets the count value for the ID in the currentDataHash
    const previousDataForIdCount = PreviousDataHash[id].count; //gets the count value for the ID in the previousDataHash
    RangeReport = [
      RangeReport[0] + currentDataForIdCount,
      RangeReport[1] + previousDataForIdCount,
    ]; //updates rangeReport
    return valueObj;
  });
  const ChartData = {
    dates: Dates,
    datasets: ChartDataset,
  };
  const _getReport = (rangeReport = []) => {
    const [currentTotal, previousTotal] = rangeReport;
    const [rate, growing] = growthCalc(currentTotal, previousTotal);
    return { rate, growing, currentTotal, previousTotal };
  };
  const Report = _getReport(RangeReport);

  const TableData = prepare(CurrentDataHash, PreviousDataHash);
  return setStore("ANALYTICS", { Report, TableData, ChartData });
};

const analytics_initiate = ({ getStore, setStore }) => () => {
  const {
    schemaResult,
    analyticsDateId: { dateId },
    tempKey,
  } = getStore();
  const data = initiateAnalytics(Number(dateId), schemaResult, tempKey);
  return setStore("ANALYTICS_INITIATE", data);
};

const analytics_default_intercept = ({ getStore, setStore }) => () => {
  const { schemaOptions = {} } = getStore();
  const { limit = 20 } = schemaOptions;
  setStore("schemaOptions", { ...schemaOptions, limit: limit + 1 });
  return;
};

const analytics_default = ({ getStore, setStore }) => () => {
  const structure = {
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
  };
  let PreviousDataHash = {};
  let CurrentDataHash = {};
  const { schemaResult } = getStore();
  const hashGenerator = generateStructureHash(structure);
  const dataLength = schemaResult.length;
  const CurrentData = schemaResult.slice(0, dataLength - 1);
  const PreviousData = schemaResult.slice(1, dataLength);

  for (let i = 0; i < CurrentData.length; i++) {
    const CurrentDataAnalytics = CurrentData[i].analytics;
    const PreviousDataAnalytics = PreviousData[i].analytics;
    for (let j = 0; j < CurrentDataAnalytics.length; j++) {
      CurrentDataHash = hashGenerator(CurrentDataHash, CurrentDataAnalytics[j]);
      PreviousDataHash = hashGenerator(
        PreviousDataHash,
        PreviousDataAnalytics[j]
      );
    }
  }
  const dataStructure = generateStructure({
    CurrentDataHash,
    PreviousDataHash,
    CountKeys: ["streams", "downloads"],
  });
  return setStore("ANALYTICS_DEFAULT", dataStructure);
};

const analytics_edit = ({ getStore, setStore }) => () => {
  const structure = {
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
  };

  const { schemaResult } = getStore();
  const { analytics } = schemaResult;
  let dataHash = {};
  const hashGenerator = generateStructureHash(structure);
  analytics.forEach((analytic) => {
    dataHash = hashGenerator(dataHash, analytic);
  });
  const dataStructure = generateStructure({
    CurrentDataHash: dataHash,
    CountKeys: [],
  });
  return setStore("ANALYTICS_EDIT", dataStructure);
};

module.exports = {
  analytics_edit,
  analytics_initiate,
  analytics_default_intercept,
  analytics_default,
};
