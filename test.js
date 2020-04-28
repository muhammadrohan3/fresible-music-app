// function test(schemaResult, range) {
//   const Colors = [
//     { borderColor: "#3f91f3", backgroundColor: "#d9e9fc" },
//     { borderColor: "#FF006E", backgroundColor: "#ffcce2" },
//     { borderColor: "#12c1ae", backgroundColor: "#c9f9f4" },
//     { borderColor: "#C482DB", backgroundColor: "#f3e6f7" },
//     { borderColor: "#d4008b", backgroundColor: "#fec4ea" },
//     { borderColor: "#3F0099", backgroundColor: "#d5b8ff" },
//     { borderColor: "#940062", backgroundColor: "#ffb7e7" },
//   ];
//   let ChartDataHash = {};
//   let CurrentDataHash = {};
//   let PreviousDataHash = {};

//   const _getRandomColorId = () => Math.floor(Math.random() * Colors.length);
//   const _growthCalc = (current, previous) => {
//     if (current === 0 || previous === 0) return [null, null];
//     let rate = ((current - previous) / previous) * 100;
//     rate = Math.round(rate * 100) / 100;
//     if (rate === 0) return [null, null];
//     return [rate, rate > 0];
//   };

//   const Dates = [];
//   const currentData = schemaResult.slice(0, 2);
//   const previousData = schemaResult.slice(2);
//   for (let i = 0; i < range; i++) {
//     let holdRelease = {};
//     Dates.push(currentData[i].date);
//     const currentItem = currentData[i].analytics;
//     const previousItem = previousData[i].analytics;
//     for (let j = 0; j < currentItem.length; j++) {
//       const currentDataItem = currentItem[j];
//       const previousDataItem = previousItem[j];
//       //
//       const _sumCount = (currentValue, dataItem, name, value) => {
//         return (currentValue || 0) + value;
//       };
//       const Rep = {
//         key: "releaseId",
//         name: "release",
//         props: [
//           { name: "title", key: ["release", "title"] },
//           { name: "type", key: ["release", "type"] },
//           { name: "count", key: "count", cb: _sumCount },
//         ],
//         children: {
//           key: "trackId",
//           name: "track",
//           props: [
//             { name: "title", key: ["track", "title"] },
//             { name: "count", key: "count", cb: _sumCount },
//           ],
//           children: {
//             key: "storeId",
//             name: "store",
//             props: [
//               { name: "title", key: ["store", "store"] },
//               { name: "count", key: "count", cb: _sumCount },
//             ],
//           },
//         },
//       };
//       let Location; //holds the current location of the object
//       const { key, name } = Rep; //destructures the key and name from the data representation sent in as param
//       // console.log(currentDataItem, currentDataItem[key]);
//       holdRelease = {
//         ...holdRelease,
//         [currentDataItem[key]]: {
//           ...(Location = holdRelease[currentDataItem[key]] || {}),
//           title: currentDataItem[name].title,
//           count: (Location["count"] || 0) + (currentDataItem["count"] || 0),
//         },
//       };

//       const _generateHash = (hash = {}, dataItem, rep, level = 1) => {
//         const { key, props, children } = rep;
//         let keyValue = hash[dataItem[key]] || {};
//         keyValue.level = level;
//         props.forEach((prop) => {
//           const { name, key, cb } = prop;
//           let value;
//           if (Array.isArray(key)) {
//             let tempVal;
//             key.forEach((k) => (tempVal = tempVal ? tempVal[k] : dataItem[k]));
//             value = tempVal;
//           } else {
//             value = dataItem[key];
//           }
//           if (cb) keyValue[name] = cb(keyValue[name], dataItem, name, value);
//           else keyValue[name] = value;
//         });
//         if (children)
//           keyValue.children = _generateHash(
//             keyValue.children,
//             dataItem,
//             children,
//             level + 1
//           );
//         hash[dataItem[key]] = keyValue;
//         return hash;
//       };

//       CurrentDataHash = _generateHash(CurrentDataHash, currentDataItem, Rep);
//       PreviousDataHash = _generateHash(PreviousDataHash, previousDataItem, Rep);
//     }
//     //populate data for chartjs
//     Object.entries(holdRelease).forEach(([id, { title, count }]) => {
//       ChartDataHash = {
//         ...ChartDataHash,
//         [id]: {
//           label: title,
//           count: [...((ChartDataHash[id] || {})["count"] || []), count],
//         },
//       };
//     });
//   }

//   //Set Range Initials
//   let RangeReport = [0, 0];

//   //prepare chartjs data
//   const ChartDataset = Object.entries(ChartDataHash).map(([id, valueObj]) => {
//     const colorIndex = _getRandomColorId(); //Gets a random color Id
//     ChartDataHash[id]["colorId"] = colorIndex; //Sets the data of this id in the ChartDataHash for the TableData;
//     valueObj = { ...valueObj, ...Colors[colorIndex] }; //Sets the borderColor and backgroundColor for the chart label
//     const currentDataForIdCount = CurrentDataHash[id].count; //gets the count value for the ID in the currentDataHash
//     const previousDataForIdCount = PreviousDataHash[id].count; //gets the count value for the ID in the previousDataHash
//     RangeReport = [
//       RangeReport[0] + currentDataForIdCount,
//       RangeReport[1] + previousDataForIdCount,
//     ]; //updates rangeReport
//     return valueObj;
//   });
//   const ChartData = {
//     dates: Dates,
//     datasets: ChartDataset,
//   };
//   const _getReport = (rangeReport = []) => {
//     const [currentTotal, previousTotal] = rangeReport;
//     const [rate, growing] = _growthCalc(currentTotal, previousTotal);
//     return { rate, growing, currentTotal, previousTotal };
//   };
//   const Report = _getReport(RangeReport);

//   const CountKeys = ["count"];
//   const prepare = (CurrentDataHash, PreviousDataHash) => {
//     const list = Object.entries(CurrentDataHash).map(([id, data]) => {
//       const { children, level } = data;
//       const previousData = PreviousDataHash[id];
//       //Set the color to the corresponding Chart color for the dataset;
//       if (level === 1 && ChartDataHash[id]) {
//         data["color"] = Colors[ChartDataHash[id]["colorId"]].borderColor;
//       }
//       CountKeys.forEach((countKey) => {
//         const [rate, growing] = _growthCalc(
//           data[countKey],
//           previousData[countKey]
//         );
//         data[countKey] = { count: data[countKey], rate, growing };
//       });
//       if (children)
//         data["children"] = prepare(children, previousData["children"]);
//       return data;
//     });
//     return list;
//   };

//   const TableData = prepare(CurrentDataHash, PreviousDataHash);
//   return { Report, TableData, ChartData };
// }

// const dataset = [
//   {
//     date: "2020-10-10",
//     analytics: [
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 2,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 12,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 32,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 0,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 21,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 42,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 4,
//         track: { title: "Gbe body" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 70,
//       },
//     ],
//   },
//   {
//     date: "2020-10-09",
//     analytics: [
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 2,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 12,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 32,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 0,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 21,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 42,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 4,
//         track: { title: "Gbe body" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 70,
//       },
//     ],
//   },
//   {
//     date: "2020-10-08",
//     analytics: [
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 29,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 2,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 52,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 10,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 12,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 24,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 4,
//         track: { title: "Gbe body" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 07,
//       },
//     ],
//   },
//   {
//     date: "2020-10-07",
//     analytics: [
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 20,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile" },
//         trackId: 1,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 21,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 23,
//       },
//       {
//         releaseId: 1,
//         release: { title: "Joko Sile", type: "track" },
//         track: { title: "Joko Sile part 2" },
//         trackId: 2,
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 10,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 11,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 3,
//         track: { title: "Gbe" },
//         storeId: 2,
//         store: { store: "Spotify" },
//         count: 48,
//       },
//       {
//         releaseId: 2,
//         release: { title: "Gbe Collection", type: "album" },
//         trackId: 4,
//         track: { title: "Gbe body" },
//         storeId: 1,
//         store: { store: "Apple Music" },
//         count: 76,
//       },
//     ],
//   },
// ];

// console.log(JSON.stringify(test(dataset, 2)));

const { User } = require("./database/models");
console.log(User.rawAttributes.id.type.toString());
