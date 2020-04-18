// import * as ejs from "../ejs.min.js";
import Chart from "chart.js";

export default () => {
  let data = {
    datasets: [
      {
        data: [2000, 1000, 500],
        backgroundColor: ["#1e1e2c", "rgb(86, 12, 104)", "#91b252"],
      },
    ],
    labels: ["Apple Music", "Spotify", "Deezer"],
  };
  new Chart(View.getElement("#sub-chart"), {
    type: "doughnut",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};
