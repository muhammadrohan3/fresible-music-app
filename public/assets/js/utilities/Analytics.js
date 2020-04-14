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
  const _reportUI = (report) => {
    View.addContent(
      "#analytics-report",
      ejs.render(ANALYTICS_REPORT_UI, report),
      true
    );
  };

  const _chartUI = ({ dates, type, datasets }) => {
    const formattedDates = dates.map((date) => {
      const m = moment(date);
      if (type === "day") return m.format("ddd");
      return m.format("mmm DD");
    });
    const data = {
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
      data,
      options: {
        tooltips: {
          callbacks: {
            title: () => "",
            label: function (tooltipItem, data) {
              return `${
                data.datasets[tooltipItem.datasetIndex].label || ""
              }: ${tooltipItem.yLabel.toString()}`;
            },
          },
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
                drawTicks: false,
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

    const _rangeFormatter = (value, row) => {
      const { growing } = row;
      if (growing === null)
        return `<span class="analytics--range-invalid">N/A</span>`;
      return growing
        ? `<span class="analytics--range-up"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-up" data-inline="false"></span></span>`
        : `<span class="analytics--range-down"><span class='mr-1'>${value}%</span><span class="iconify" data-icon="el:caret-down" data-inline="false"></span></span>`;
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
    _reportUI(Report);
  };
  return { handle };
};

var Response = {
  Report: { stream: 358, previous: 345, rate: 3.63, growing: true },
  TableData: [
    {
      title: "Joko Sile",
      type: "track",
      stream: 92,
      rate: -81.52,
      growing: false,
      children: [
        { title: "Spotify", stream: 12, rate: -75, growing: false },
        { title: "Spotify", stream: 0, rate: null, growing: null },
      ],
    },
    {
      title: "Gbe Collection",
      type: "album",
      stream: 266,
      rate: 33.08,
      growing: true,
      children: [
        {
          title: "Gbe",
          stream: 126,
          rate: 24.6,
          growing: true,
          children: [
            { title: "Spotify", stream: 42, rate: -14.29, growing: false },
          ],
        },
        {
          title: "Gbe body",
          stream: 140,
          rate: 40.71,
          growing: true,
          children: [
            { title: "Apple Music", stream: 70, rate: -8.57, growing: false },
          ],
        },
      ],
    },
  ],
  ChartData: {
    dates: ["2020-10-10", "2020-10-09"],
    dataset: [
      { label: "Joko Sile", stream: [46, 46] },
      { label: "Gbe Collection", stream: [133, 133] },
    ],
  },
};
