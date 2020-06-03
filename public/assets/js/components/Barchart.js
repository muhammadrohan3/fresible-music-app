import Chart from "chart.js";
import View from "../View";

export const horizontalBarChart = (data, target, options = {}) => {
  const { legend = false } = options;
  const chart = new Chart(View.getElement(target), {
    type: "horizontalBar",
    data,
    options: {
      legend: {
        display: legend,
      },
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "#333",
        callbacks: {
          title: () => "",
          label: function (tooltipItem, data) {
            return `${tooltipItem.yLabel.name}: ₦${tooltipItem.value}`;
          },
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: (value) => {
                return `${value.code}  `;
              },
            },
            gridLines: {
              display: false,
              drawTicks: false,
              drawBorder: false,
            },
          },
        ],
        xAxes: [
          {
            position: "top",
            drawTicks: false,
            ticks: {
              callback: (value) => {
                return `₦${value}  `;
              },
            },
            gridLines: {
              // drawTicks: false,
              // zeroLineWidth: 0,
              // zeroLineColor: "rgba(0, 0, 0, 0)",
              // drawBorder: false,
            },
          },
        ],
      },
    },
  });
};

export default { horizontalBarChart };
