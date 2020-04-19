import Chart from "chart.js";
import View from "../View";

export default (data, target, options = {}) => {
  const { legend = false } = options;

  new Chart(View.getElement(target), {
    type: "line",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "#333",
        callbacks: {
          title: () => "",
          label: function (tooltipItem, data) {
            return `${
              data.datasets[tooltipItem.datasetIndex].label || ""
            }: ${tooltipItem.yLabel.toString()}`;
          },
        },
      },
      legend: {
        display: legend,
      },
      scales: {
        yAxes: [
          {
            drawTicks: false,
            ticks: {
              display: false,
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
            gridLines: {
              // drawTicks: false,
              // zeroLineWidth: 0,
              // zeroLineColor: "rgba(0, 0, 0, 0)",
              drawBorder: false,
            },
          },
        ],
      },
      elements: {
        line: {
          tension: 0,
          borderWidth: 1,
          backgroundColor: "rgba(0, 0, 0, 0)",
        },
        point: {
          radius: 4,
          pointStyle: "rect",
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderWidth: 1,
        },
      },
    },
  });
};