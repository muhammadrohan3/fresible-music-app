import Chart from "chart.js";
import View from "../View";

export default (data, target, options = {}) => {
  const { legend = false, callbacks = {} } = options;
  new Chart(View.getElement(target), {
    type: "doughnut",
    data,
    options: {
      legend: {
        display: legend,
      },
      responsive: true,
      maintainAspectRatio: false,
      cutoutPercentage: 30,
      tooltips: {
        callbacks: {
          ...callbacks,
        },
      },
    },
  });
};
