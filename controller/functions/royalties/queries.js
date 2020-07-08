const { sequelize } = require("../../../database/models");
const growthCalc = require("../../util/growthCalc");

const generateWhere = (keysObj = {}) => {
  const pairs = Object.entries(keysObj).map(
    ([key, value]) => `${key} = ${value}`
  );
  if (pairs.length === 0) return "";
  return `WHERE ${pairs.join(" AND ")}`;
};

const allKeysAreNull = (sqlResult) => {
  if (sqlResult.length > 1) return false;
  const [obj] = sqlResult;
  const notNullValues = Object.values(obj).filter(Boolean);
  return notNullValues.length ? false : true;
};

const makeQuery = async (SQL, getStore) => {
  const { schemaQuery } = getStore();
  const whereString = generateWhere(schemaQuery);
  const query = SQL.replace("{WHERE}", whereString);
  const sqlResult = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
    nest: true,
  });
  if (allKeysAreNull(sqlResult)) return [];
  return sqlResult;
};

const getOverview = async (getStore, setStore) => {
  const SQL = `SELECT monthId, SUM(RD) AS 'releaseDownload', ROUND(SUM(RDE/100), 2) AS 'releaseDownloadEarning', SUM(TD) AS 'trackDownload', ROUND(SUM(TDE/100)) AS 'trackDownloadEarning', SUM(TS) AS 'trackStream', ROUND(SUM(TSE/100), 2) AS 'trackStreamEarning' FROM 
  (SELECT monthId, releaseDownload AS 'RD', releaseDownloadEarning AS 'RDE', SUM(trackDownload) AS 'TD', SUM(trackDownloadEarning/100) AS 'TDE', SUM(trackStream) AS 'TS', SUM(trackStreamEarning) AS 'TSE' FROM royalties 
  {WHERE}
  GROUP BY monthId, royalties.releaseId)R
     JOIN monthlyroyalties M ON M.status = 'published' AND monthId = M.id`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getReleases = async (getStore, setStore) => {
  const SQL = `SELECT C.* FROM 
		(SELECT monthId, R.id AS 'id', R.title as 'title', RO.releaseDownload AS 'releaseDownload', SUM(RO.trackDownload) 'trackDownload', SUM(RO.trackStream) 'trackStream', ROUND((RO.releaseDownloadEarning + SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning))/100,2) AS 'earning' FROM royalties RO
  LEFT  JOIN releases R ON R.id = RO.releaseId
  {WHERE}
   GROUP BY monthId, RO.releaseId) C 
     JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'
   ORDER BY C.earning DESC`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getTracks = async (getStore, setStore) => {
  const SQL = `SELECT C.* FROM (SELECT monthId, T.id AS 'id', T.title as 'title', SUM(RO.trackDownload) 'trackDownload', SUM(RO.trackStream) 'trackStream', ROUND((RO.trackDownloadEarning + SUM(RO.trackStreamEarning))/100, 2) AS 'earning' FROM royalties RO
  LEFT JOIN tracks T ON T.id = RO.trackId
   {WHERE}
  GROUP BY RO.trackId) C 
  JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'
  ORDER BY C.earning DESC`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getStores = async (getStore, setStore) => {
  const SQL = `SELECT C.* FROM (SELECT monthId, S.id AS 'id', S.store as 'title', RO.releaseDownload AS 'releaseDownload', SUM(RO.trackDownload) 'trackDownload', SUM(RO.trackStream) 'trackStream', ROUND((RO.releaseDownloadEarning + SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning))/100,2) AS 'earning' FROM royalties RO
  LEFT  JOIN stores S ON S.id = RO.storeId
  {WHERE}
    GROUP BY RO.storeId) C 
    JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'
    ORDER BY C.earning DESC`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getCountries = async (getStore, setStore) => {
  const SQL = `SELECT C.* FROM (SELECT monthId, CO.id AS 'id', CO.name as 'title', RO.releaseDownload AS 'releaseDownload', SUM(RO.trackDownload) 'trackDownload', SUM(RO.trackStream) 'trackStream', ROUND((SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning))/100,2) AS 'earning' FROM royalties RO
  LEFT  JOIN countries CO ON CO.id = RO.countryId
  {WHERE}
    GROUP BY RO.countryId) C 
    JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'
    ORDER BY C.earning DESC`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getMonths = async (getStore, setStore) => {
  const SQL = `SELECT M.*, SUM(RO.RD) AS 'releaseDownload', SUM(RO.TD) 'trackDownload', SUM(RO.trackStream) 'trackStream', ROUND(SUM(RO.earning)/100,2) AS 'earning' FROM (
    SELECT monthId, RO.releaseDownload AS 'RD', SUM(RO.trackDownload) 'TD', SUM(RO.trackStream) 'trackStream', (RO.releaseDownloadEarning + SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning)) AS 'earning' FROM royalties RO
    {WHERE} 
    GROUP BY RO.releaseId, RO.monthId
) RO
 JOIN monthlyroyalties M ON M.id = RO.monthId AND M.status = 'published'
  GROUP BY RO.monthId
  ORDER BY M.yearValue, M.monthValue DESC`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getTopCountries = async (getStore, setStore) => {
  const SQL = `SELECT O.* FROM (SELECT monthId, C.id 'country.id', C.name 'country.name', C.code 'country.code', C.logo 'country.logo', C.longitude 'country.longitude', C.latitude 'country.latitude', ROUND((SUM(RO.trackDownloadEarning/100) + SUM(RO.trackStreamEarning/100)), 2) 'earning' FROM royalties RO
  LEFT  JOIN countries C ON C.id = RO.countryId
    {WHERE}
    GROUP BY RO.countryId) O
    JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'
    ORDER BY earning DESC LIMIT 6`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);

  return;
};

const getTotalEarned = async (getStore, setStore) => {
  const SQL = `SELECT ROUND(SUM(earning), 2) 'earning' FROM (
    SELECT monthId, (RO.releaseDownloadEarning/100 + SUM(RO.trackDownloadEarning/100) + SUM(RO.trackStreamEarning/100)) 'earning' FROM royalties RO
    {WHERE}
    GROUP BY monthId, RO.releaseId
    ) RO  
    JOIN monthlyroyalties M ON M.id = monthId AND M.status = 'published'`;
  const sqlResult = await makeQuery(SQL, getStore);
  const [earning] = sqlResult;
  setStore("schemaResult", earning);
  return;
};

const getLatestPublished = async (getStore, setStore) => {
  const SQL = `SELECT M.id 'month.id', M.monthValue 'month.monthValue', M.yearValue 'month.yearValue', ROUND(SUM(RO.earning)/100,2) AS 'earning' FROM (
    SELECT monthId, (RO.releaseDownloadEarning + SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning)) AS 'earning' FROM royalties RO 
    {WHERE}
    GROUP BY RO.releaseId, RO.monthId
) RO
 JOIN monthlyroyalties M ON M.id = RO.monthId AND M.status = 'published'
  GROUP BY RO.monthId
  ORDER BY M.yearValue, M.monthValue DESC
  limit 2`;
  const sqlResult = await makeQuery(SQL, getStore);
  const [current, previous] = sqlResult;
  const [rate, growing] = growthCalc(current.earning, previous.earning);
  const result = {
    ...current,
    rate,
    growing,
  };
  setStore("schemaResult", result);
  return;
};

const getPast12Months = async (getStore, setStore) => {
  const SQL = `SELECT M.id 'monthId', M.monthValue 'monthValue', M.yearValue 'yearValue', ROUND(SUM(RO.earning)/100,2) AS 'earning' FROM (
    SELECT monthId, (RO.releaseDownloadEarning + SUM(RO.trackDownloadEarning) + SUM(RO.trackStreamEarning)) AS 'earning' FROM royalties RO 
    {WHERE}
    GROUP BY RO.releaseId, RO.monthId
) RO
 JOIN monthlyroyalties M ON M.id = RO.monthId AND M.status = 'published'
  GROUP BY RO.monthId
  ORDER BY M.yearValue, M.monthValue DESC
  limit 12`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

const getTopStores = async (getStore, setStore) => {
  const SQL = `SELECT * FROM (SELECT S.id AS 'store.id', S.store 'store.store', S.storeLogo 'store.logo', ROUND((SUM(RO.trackDownloadEarning/100) + SUM(RO.trackStreamEarning/100)), 2) 'earning' FROM royalties RO
    LEFT  JOIN stores S ON S.id = RO.storeId
    {WHERE}
      GROUP BY RO.storeId) O
      ORDER BY earning DESC LIMIT 6`;
  const sqlResult = await makeQuery(SQL, getStore);
  setStore("schemaResult", sqlResult);
  return;
};

module.exports = {
  OVERVIEW: getOverview,
  RELEASES: getReleases,
  TRACKS: getTracks,
  STORES: getStores,
  COUNTRIES: getCountries,
  MONTHS: getMonths,
  TOP_STORES: getTopStores,
  TOP_COUNTRIES: getTopCountries,
  LATEST_PUBLISHED_MONTH: getLatestPublished,
  PAST_12_MONTHS: getPast12Months,
  TOTAL: getTotalEarned,
};
