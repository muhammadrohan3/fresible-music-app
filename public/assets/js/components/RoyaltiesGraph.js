// import moment from "moment";
// import View from "../View";
// import { royaltiesGraphCanvas } from "../templates/r";
// import "../../../../node_modules/chart.js/dist/Chart";

// const MONTHS = () => {
//   const months = [];
//   const dateStart = moment();
//   const dateEnd = moment().add(10, "month");
//   while (dateEnd.diff(dateStart, "months") >= 0) {
//     months.push(moment(dateStart, "YYY-MM-DD").format("MMM"));
//     dateStart.add(1, "month");
//   }
//   return months;
// };

// export default () => {
//   const addedObj = {
//     borderCapStyle: "butt",
//     borderDash: [],
//     borderWidth: 1,
//     borderDashOffset: 0.0,
//     borderJoinStyle: "miter",
//     pointBorderColor: "rgba(75,192,192,1)",
//     pointBackgroundColor: "#fff",
//     pointBorderWidth: 1,
//     pointHoverRadius: 5,
//     pointHoverBackgroundColor: "rgba(75,192,192,1)",
//     pointHoverBorderColor: "rgba(220,220,220,1)",
//     pointHoverBorderWidth: 2,
//     pointRadius: 1,
//     pointHitRadius: 10,
//     fill: true,
//     lineTension: 0.1,
//   };

//   const months = MONTHS();

//   const _data = () =>
//     new Array(12).fill(0).map((item) => Math.ceil(Math.random() * 50));

//   var data = {
//     labels: months.reverse(),
//     datasets: [
//       {
//         label: "Total Payouts",
//         backgroundColor: "#F6FAFF",
//         borderColor: "#0050bf",
//         data: _data(),
//         ...addedObj,
//       },
//     ],
//   };

//   View.addContent(
//     "#royalties-graph-container",
//     ejs.render(royaltiesGraphCanvas),
//     true
//   );
//   new Chart(View.getElement("#royalties-graph"), {
//     type: "line",
//     data,
//     options: {
//       scales: {
//         yAxes: [
//           {
//             drawTicks: false,
//             ticks: {
//               display: false,
//             },
//             gridLines: {
//               display: false,
//               drawTicks: false,
//               drawBorder: false,
//             },
//           },
//         ],
//         xAxes: [
//           {
//             position: "top",
//             drawTicks: false,
//             gridLines: {
//               drawTicks: false,
//               // zeroLineWidth: 0,
//               // zeroLineColor: "rgba(0, 0, 0, 0)",
//               drawBorder: false,
//             },
//           },
//         ],
//       },
//     },
//   });
// };
