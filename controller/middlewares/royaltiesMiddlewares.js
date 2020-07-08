const {
  MONTHLYROYALTY,
  RELEASE,
  TRACK,
  STORE,
  COUNTRY,
  SCHEMAOPTIONS,
  SCHEMAINCLUDE,
  SCHEMARESULT,
} = require("../../constants");
const growthCalc = require("../util/growthCalc");
const {
  representationFormats,
  hashGenerator,
  generateStructure,
} = require("../functions/royalties");

const queries = require("../functions/royalties/queries");
const { convertHashToList } = generateStructure;

const EARNING_KEYS = [
  "releaseDownloadEarning",
  "trackDownloadEarning",
  "trackStreamEarning",
];

const _convertToNairaDenomination = (dataObj = {}) => {
  const newDataObj = {};
  EARNING_KEYS.forEach((key) => {
    const value = Number(dataObj[key]);
    newDataObj[key] = Number.isNaN(value) || value === 0 ? 0 : value / 100;
  });
  return newDataObj;
};

const _convertToKoboDenomination = (dataObj = {}) => {
  const newDataObj = {};
  EARNING_KEYS.forEach((key) => {
    const value = Number(dataObj[key]);
    newDataObj[key] = Number.isNaN(value) || value === 0 ? 0 : value * 100;
  });
  return newDataObj;
};

const royalties_formatToNaira = ({ getStore, setStore }) => (
  key = "schemaResult"
) => {
  const dataset = getStore(key) || [];
  const newdataset = dataset.map((data) => {
    const newEarnings = _convertToNairaDenomination(data);
    return { ...data, ...newEarnings };
  });
  setStore(key, null);
  setStore(key, newdataset);
};
const royalties_formatToKobo = ({ getStore, setStore }) => (
  key = "schemaResult"
) => {
  const dataset = getStore(key) || [];
  const newdataset = dataset.map((data) => {
    const newEarnings = _convertToKoboDenomination(data);
    return { ...data, ...newEarnings };
  });
  setStore(key, null);
  setStore(key, newdataset);
};

const royalties_GenerateStructureForEdit = ({ getStore, setStore }) => () => {
  const { schemaResult } = getStore();
  let dataHash = {};
  const structure = representationFormats["edit_structure"];
  const generateStructureHash = hashGenerator(structure);
  schemaResult.forEach((dataItem) => {
    dataHash = generateStructureHash(dataHash, dataItem);
  });
  const structuredList = convertHashToList(dataHash);
  return setStore("ROYALTIES_EDIT_STRUCTURE", structuredList);
};

const royalties_queryIntercept = ({ getStore, setStore }) => () => {
  const { schemaOptions } = getStore();
  const { groupBy } = schemaOptions;
  const { group, include } = groupByMap[groupBy] || {};
  const includeArray = [
    {
      m: MONTHLYROYALTY,
      w: [{ status: "published" }],
      al: "monthlyroyalty",
      at: ["id", "monthValue", "yearValue"],
    },
  ];
  if (include) includeArray.push(include);
  setStore(SCHEMAINCLUDE, includeArray);
  if (!group) return;
  setStore(SCHEMAOPTIONS, { group });
  return;
};

const _getRowTotalEarning = (row = {}) => {
  const {
    releaseDownloadEarning,
    trackDownloadEarning,
    trackStreamEarning,
  } = row;
  return (
    Number(releaseDownloadEarning) +
    Number(trackDownloadEarning) +
    Number(trackStreamEarning)
  );
};
const royalties_monthSerializer = ({ getStore, setStore }) => () => {
  const { schemaResult } = getStore();
  const [latestPublishedMonth, previousPublishedMonth = {}] = schemaResult;
  const { earning: previousPublishedMonthEarning = 0 } = previousPublishedMonth;
  const { earning: latestPublishedMonthEarning } = latestPublishedMonth;
  const [rate, growth] = growthCalc(
    latestPublishedMonthEarning,
    previousPublishedMonthEarning
  );
  const { monthValue, yearValue } = latestPublishedMonth;
  const responseStructure = {
    monthValue,
    yearValue,
    earning: latestPublishedMonthEarning,
    rate,
    growth,
  };
  setStore("MONTH_SERIALIZED_DATA", responseStructure);
  return;
};

const royalties_OverviewStructure = ({ getStore, setStore }) => () => {
  const {
    schemaResult,
    schemaOptions: { groupBy },
  } = getStore();
  setStore(SCHEMARESULT, null);
  if (groupBy) {
    const { titleKeyData = [] } = groupByMap[groupBy];
    const data = schemaResult.map((row) => {
      const {
        releaseDownloadEarning,
        trackDownloadEarning,
        trackStreamEarning,
        monthlyroyalty: month,
      } = row;
      let earning = Number(trackDownloadEarning) + Number(trackStreamEarning);
      if (groupBy === "releases") earning += Number(releaseDownloadEarning);
      let title = row;
      titleKeyData.forEach((key) => (title = title[key]));
      title = typeof title === "string" ? title : undefined;
      row.monthlyroyalty = undefined;
      return { ...row, month, title, earning };
    });
    setStore(SCHEMARESULT, data);
    return;
  }
  const {
    releaseDownload,
    releaseDownloadEarning,
    trackDownload,
    trackDownloadEarning,
    trackStream,
    trackStreamEarning,
  } = schemaResult[0];

  const structure = [
    {
      name: "Release Downloads",
      count: releaseDownload,
      earning: releaseDownloadEarning,
    },
    {
      name: "Track Downloads",
      count: trackDownload,
      earning: trackDownloadEarning,
    },
    {
      name: "Track Streams",
      count: trackStream,
      earning: trackStreamEarning,
    },
    {
      name: "Total",
      count:
        Number(trackStream) + Number(trackDownload) + Number(releaseDownload),
      earning:
        Number(trackStreamEarning) +
        Number(trackDownloadEarning) +
        Number(releaseDownloadEarning),
    },
  ];
  setStore(SCHEMARESULT, structure);
  return;
};

var groupByMap = {
  releases: {
    group: "releaseId",
    include: { m: RELEASE, al: ["release"], at: ["id", "title"] },
    titleKeyData: ["release", "title"],
  },
  stores: {
    group: "storeId",
    include: { m: STORE, al: ["store"], at: ["id", "store"] },
    titleKeyData: ["store", "store"],
  },
  tracks: {
    group: "trackId",
    include: { m: TRACK, al: ["track"], at: ["id", "title"] },
    titleKeyData: ["track", "title"],
  },
  months: {
    group: "monthId",
  },
  countries: {
    group: "trackId",
    include: { m: COUNTRY, al: ["country"], at: ["id", "name"] },
    titleKeyData: ["country", "name"],
  },
};

const royalties_query = ({ setStore, getStore }) => async (queryKey) => {
  const { tempKey = {} } = getStore();
  const { groupBy = "overview" } = tempKey;
  const QUERY = queryKey || groupBy.toUpperCase();
  const queryHandler = queries[QUERY];
  if (!queryHandler) {
    return setStore(SCHEMARESULT, []);
  }
  return await queryHandler(getStore, setStore);
};

module.exports = {
  royalties_GenerateStructureForEdit,
  royalties_queryIntercept,
  royalties_OverviewStructure,
  royalties_monthSerializer,
  royalties_formatToKobo,
  royalties_formatToNaira,
  royalties_query,
};
