import Chart from "chart.js";
import View from "../View";

export default (data, target, options = {}) => {
  const { legend = false } = options;
  new Chart(View.getElement(target), {
    type: "doughnut",
    data,
    options: {
      legend: {
        display: legend,
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};
