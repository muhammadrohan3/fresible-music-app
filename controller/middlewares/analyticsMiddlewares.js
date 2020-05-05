const moment = require("moment");
const initiateAnalytics = require("../functions/analytics/initiateAnalytics");
const generateStructureHash = require("../functions/analytics/generateStructureHash");
const generateStructure = require("../functions/analytics/generateStructure");
const growthCalc = require("../util/growthCalc");
const analyticsStructureReps = require("../functions/analytics/analyticsRepresentations");
const valExtractor = require("../util/valExtractor");

const analyticsHandler = ({ getStore, setStore }) => (
  dataRepKey,
  lineChartSubjects = []
) => {
  //Gets the required data from the store
  const { schemaResult, ANALYTICS_RANGE = {} } = getStore();
  const { range } = ANALYTICS_RANGE;
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
  const currentData = schemaResult.slice(0, Number(range));
  const previousData = schemaResult.slice(Number(range));
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
          { name: "data", key: "count", cb: "sumCount" },
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
    Object.entries(subjectKeyHash).forEach(([id, { title, data }]) => {
      ChartDataHash = {
        ...ChartDataHash,
        [id]: {
          label: title,
          data: [...((ChartDataHash[id] || {})["data"] || []), data],
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
    return { rate, growing, count: currentTotal, previousTotal };
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

const analytics_intercept = ({ getStore, setStore }) => (
  operator,
  operand,
  keyRoute
) => {
  const { schemaOptions = {} } = getStore();
  let { limit = 20 } = schemaOptions;
  limit = limit + 1;
  if (keyRoute) {
    const keyValue = Number(valExtractor(getStore(), keyRoute));
    if (Number.isNaN(keyValue))
      throw new Error("ANALYTICS-INTERCEPT-ERROR: Keyvalue is not a number");
    switch (operator) {
      case "multiply":
        limit = keyValue * operand;
    }
  }
  setStore("schemaOptions", { ...schemaOptions, limit });
  return;
};

const analytics_dates = ({ getStore, setStore }) => () => {
  const structure = analyticsStructureReps["analytics_dates"];
  let PreviousDataHash = {};
  let CurrentDataHash = {};
  const { schemaResult, limit = 20 } = getStore();
  const hashGenerator = generateStructureHash(structure);
  const CurrentData = schemaResult.slice(0, limit - 1);
  const PreviousData = schemaResult.slice(1, limit);
  for (let i = 0; i < CurrentData.length; i++) {
    const CurrentDataAnalytics = CurrentData[i].analytics;
    const PreviousDataAnalytics = (PreviousData[i] || {}).analytics || [];
    for (let j = 0; j < CurrentDataAnalytics.length; j++) {
      CurrentDataHash = hashGenerator(CurrentDataHash, {
        ...CurrentDataAnalytics[j],
        dateGroupId: i,
      });
    }
    for (let j = 0; j < PreviousDataAnalytics.length; j++) {
      PreviousDataHash = hashGenerator(PreviousDataHash, {
        ...PreviousDataAnalytics[j],
        dateGroupId: i,
      });
    }
  }

  const dataStructure = generateStructure({
    CurrentDataHash,
    PreviousDataHash,
    CountKeys: ["streams", "downloads"],
  });

  const dates = dataStructure.sort((a, b) =>
    moment(a.date).diff(moment(b.date), "days")
  );

  return setStore("ANALYTICS_DATES", dates.reverse());
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
  analytics_intercept,
  analytics_dates,
  analyticsHandler,
};
