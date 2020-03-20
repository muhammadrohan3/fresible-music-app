// const { Userprofile } = require("../database/models");

// const fs = require("fs");

// const organizeData = (obj, keys) => {
//   const data = obj;
//   if (!keys || !data) return data;
//   let newData = {};
//   keys.forEach(key => {
//     if (data.hasOwnProperty(key)) {
//       const item = data[key];
//       newData = { ...newData, [key]: item };
//     }
//   });
//   return newData;
// };

// // const dataJson = data => JSON.parse(JSON.stringify(data));

// (async () => {
//   try {
//     const { data } = JSON.parse(
//       fs.readFileSync(__dirname + "/users.json", "utf-8")
//     );
//     for (let user of data) {
//       const profileData = organizeData(user, [
//         "twitter",
//         "instagram",
//         "label",
//         "stageName",
//         "phone",
//         "bank",
//         "bankAccount",
//         "bankAccountNo"
//       ]);
//       const { id } = user;
//       await Userprofile.create({ ...profileData, userId: Number(id) });
//     }
//     console.log("DONE");
//   } catch (err) {
//     console.log(err);
//   }
// })();

const moment = require("moment");

console.log(moment().format("h:mma"));
