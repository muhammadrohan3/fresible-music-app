const initiateAnalytics = require("../functions/analytics/initiateAnalytics");
const generateStructureHash = require("../functions/analytics/generateStructureHash");
const generateStructure = require("../functions/analytics/generateStructure");
const growthCalc = require("../util/growthCalc");
const analyticsStructureReps = require("../functions/analytics/analyticsRepresentations");

const analyticsHandler = ({ getStore, setStore }) => (
  dataRepKey,
  lineChartSubjects = []
) => {
  //Gets the required data from the store
  const { schemaResult, schemaQuery } = getStore();
  if (!schemaResult.length) return;
  // const { range } = schemaQuery;
  const structure = analyticsStructureReps[dataRepKey];
  const _generateHash = generateStructureHash(structure);
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
  console.log(currentData.length, previousData.length);
  for (let i = 0; i < currentData.length; i++) {
    let subjectKeyHash = {};
    Dates.push(currentData[i].date);
    const currentItem = currentData[i].analytics;
    const previousItem = (previousData[i] || {}).analytics || {};
    for (let j = 0; j < currentItem.length; j++) {
      const currentDataItem = currentItem[j];
      const previousDataItem = previousItem[j] || {};
      //

      const [key, titleRoute = []] = lineChartSubjects; //destructures the key and name from the lineChartSubject sent in as param
      if (!key || !titleRoute.length)
        throw new Error(
          "ANALYTICS-HANDLER-ERROR: lineChartSubjects parameter error"
        );
      const subjectKeyHashStructure = {
        key: key,
        props: [
          { name: "title", key: titleRoute },
          { name: "count", key: "count", cb: "sumCount" },
        ],
      };
      // console.log(currentDataItem, currentDataItem[key]);
      subjectKeyHash = generateStructureHash(subjectKeyHashStructure)(
        subjectKeyHash,
        currentDataItem,
        subjectKeyHashStructure
      );
      //
      CurrentDataHash = _generateHash(CurrentDataHash, currentDataItem);
      PreviousDataHash = _generateHash(
        PreviousDataHash,
        previousDataItem,
        structure
      );
    }
    //populate data for chartjs
    Object.entries(subjectKeyHash).forEach(([id, { title, count }]) => {
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
    // console.log("RELEASE-ID: ", id, valueObj);
    const currentDataForIdCount = CurrentDataHash[id].count; //gets the count value for the ID in the currentDataHash
    const previousDataForIdCount = (PreviousDataHash[id] || {}).count; //gets the count value for the ID in the previousDataHash
    RangeReport = [
      RangeReport[0] + currentDataForIdCount,
      RangeReport[1] + previousDataForIdCount,
    ]; //updates rangeReport
    return valueObj;
  });
  const _getReport = (rangeReport = []) => {
    const [currentTotal, previousTotal] = rangeReport;
    const [rate, growing] = growthCalc(currentTotal, previousTotal);
    return { rate, growing, currentTotal, previousTotal };
  };
  const Report = _getReport(RangeReport);
  const ChartData = {
    dates: Dates,
    datasets: ChartDataset,
  };

  const TableData = generateStructure({
    CurrentDataHash,
    PreviousDataHash,
    ChartDataHash,
    Colors,
  });
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
  const structure = analyticsStructureReps["analytics_default"];
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
  const structure = analyticsStructureReps["analytics_edit"];
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
  analyticsHandler,
};
