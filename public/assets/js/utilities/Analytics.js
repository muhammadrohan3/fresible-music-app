import moment from "moment";
import "../../../../node_modules/chart.js/dist/Chart";
import serverRequest, { responseHandler } from "../utilities/serverRequest";
import View from "../View";
import * as ejs from "../ejs.min.js";
import {
  ANALYTICS_REPORT_UI,
  analyticsGraphCanvas,
} from "../templates/analytics";

export default () => {
  const _rangeFormatter = (value, row) => {
    const growing = typeof row !== "object" ? row : row.growing;
    if (growing === null)
      return `<span class="analytics--range-invalid">N/A</span>`;
    return growing
      ? `<span class="analytics--range-up"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-up" data-inline="false"></span></span>`
      : `<span class="analytics--range-down"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-down" data-inline="false"></span></span>`;
  };

  const _reportUI = (report, { type, range }) => {
    const { rate, growing, stream } = report;
    const groupNames = {
      7: "Weekly",
      14: "Fornightly",
      30: "Monthly",
      stream: "Streams",
      download: "Downloads",
    };
    const groupName = groupNames[range];
    const rangeGrowthValue = _rangeFormatter(rate, growing);
    const typeName = groupNames[type];

    View.addContent(
      "#analytics-report",
      ejs.render(ANALYTICS_REPORT_UI, {
        groupName,
        rangeGrowthValue,
        typeName,
        range,
        stream,
      }),
      true
    );
  };

  const _chartUI = ({ dates, type, datasets }) => {
    const formattedDates = dates.map((date) => {
      const m = moment(date);
      if (type === "day") return m.format("ddd");
      return m.format("mmm DD");
    });

    var data = {
      labels: formattedDates,
      datasets,
    };

    View.addContent(
      "#analytics-graph-container",
      ejs.render(analyticsGraphCanvas),
      true
    );
    new Chart(View.getElement("#analytics-graph"), {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          backgroundColor: "white",
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
          display: false,
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

  const _tableUI = (tableData, { type, range }) => {
    type = type[0].toUpperCase() + type.toLowerCase().substring(1);
    const mainTable = $("#analytics-table").find("table");
    const nameList = ["Release", "Track", "Store"];
    const bgColors = ["rgba(239,240,246, 0.4)", "rgb(239,240,246)"];

    const _getParent = (elem, identifier, type = "tagName") => {
      const parents = $(elem).parents();
      for (parent of parents) {
        if (parent[type].toLowerCase() === identifier.toLowerCase())
          return parent;
      }
      return false;
    };

    const _clickFormatter = `<button class='analytics--view-btn' data-view_open='false'><span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span></button>`;

    const _buildTable = (data, table, nameListIndex = 0) => {
      const columns = [
        { field: "title", title: nameList[nameListIndex], sortable: true },
        {
          field: "stream",
          title: type,
          align: "center",
          sortable: true,
        },
        {
          field: "rate",
          title: `vs Previous ${range} days`,
          align: "center",
          sortable: true,
          formatter: _rangeFormatter,
        },
        {
          field: "click",
          title: "Details",
          align: "center",
          formatter: _clickFormatter,
          events: {
            "click .analytics--view-btn": function (e, val, row, index) {
              const $tr = $(_getParent(e.target, "tr"));
              const { view_open } = $(e.target).data();
              if (!view_open) {
                let next =
                  nameListIndex === 0 && row.type && row.type === "track"
                    ? 2
                    : 1;
                let index = nameListIndex + next;
                const $nTable = $(`<tr><td colspan=12><table
                data-mobile-responsive="true"
                style="width: 95%; margin: 0 auto; background-color: ${
                  bgColors[index - 1]
                }"
              ></table></td></tr>`)
                  .insertAfter($tr)
                  .find("table");
                expandTable(row.children, $nTable, index);
                $(e.target)
                  .data("view_open", true)
                  .html(
                    `<span class="iconify" data-icon="ant-design:up-square-outlined" data-inline="false"></span>`
                  );
              } else {
                $(e.target)
                  .data("view_open", false)
                  .html(
                    `<span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span>`
                  );
                $tr.next().remove();
              }
            },
          },
        },
      ];
      if (nameListIndex === nameList.length - 1) columns.pop();
      //
      table.bootstrapTable({
        columns,
        data,
        classes: "table table-bordered",
        mobile: true,
      });
    };
    function expandTable(data, $detail, index) {
      _buildTable(data, $detail.html("<table></table>"), index);
    }

    _buildTable(tableData, mainTable, 0);
  };

  const handle = (data = {}) => {
    const { type = "stream", range = 7 } = data;
    const { Report, TableData, ChartData } = Response;
    _chartUI(ChartData);
    _tableUI(TableData, { type, range });
    _reportUI(Report, { type, range });
  };
  return { handle };
};

var Response = {
  Report: { stream: 345, previous: 358, rate: -3.63, growing: false },
  TableData: [
    {
      title: "Joko Sile",
      type: "track",
      stream: 167,
      rate: 81.52,
      growing: true,
      children: [
        { title: "Apple Music", stream: 49, rate: 1125, growing: true },
        { title: "Spotify", stream: 23, rate: -4.17, growing: false },
      ],
    },
    {
      title: "Gbe Collection",
      type: "album",
      stream: 178,
      rate: -33.08,
      growing: false,
      children: [
        {
          title: "Gbe",
          stream: 95,
          rate: -24.6,
          growing: false,
          children: [
            { title: "Apple Music", stream: 23, rate: -45.24, growing: false },
            { title: "Spotify", stream: 72, rate: -14.29, growing: false },
          ],
        },
        {
          title: "Gbe body",
          stream: 83,
          rate: -40.71,
          growing: false,
          children: [
            { title: "Apple Music", stream: 83, rate: -40.71, growing: false },
          ],
        },
      ],
    },
  ],
  ChartData: {
    dates: [
      "2020-10-10",
      "2020-10-09",
      "2020-10-08",
      "2020-10-07",
      "2020-10-06",
      "2020-10-05",
      "2020-10-04",
    ],
    type: "day",
    datasets: [
      {
        label: "Joko Sile",
        borderColor: "#000000",
        backgroundColor: "#CCCCCC",
        data: [48, 16, 51, 13, 90, 116, 2],
      },
      {
        label: "Gbe Collection",
        borderColor: "#1DB954",
        backgroundColor: "#D2F1DD",
        data: [133, 200, 400, 23, 90, 100, 75],
      },
    ],
  },
};
