import moment from "moment";
import "../../../../node_modules/chart.js/dist/Chart";
import serverRequest, { responseHandler } from "../utilities/serverRequest";
import View from "../View";
import * as ejs from "../ejs.min.js";
import {
  ANALYTICS_REPORT_UI,
  analyticsGraphCanvas,
} from "../templates/analytics";
import LineGraph from "./LineGraph";
import Table from "./Table";
import rangeFormatter from "../utilities/rangeFormatter";

export default () => {
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
    const rangeGrowthValue = rangeFormatter(rate, growing);
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
    View.addContent(
      "#analytics-graph-container",
      ejs.render(analyticsGraphCanvas),
      true
    );
    const data = {
      labels: formattedDates,
      datasets,
    };
    LineGraph(data, "#analytics-graph");
  };

  const _tableUI = (tableData, { type, range }) => {
    const columns = [
      [
        { field: "title", title: "Release", sortable: true },
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
          formatter: "rangeFormatter",
        },
      ],
      [
        { field: "title", title: "Release", sortable: true },
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
          formatter: "rangeFormatter",
        },
      ],
      [
        { field: "title", title: "Store", sortable: true },
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
          formatter: "rangeFormatter",
        },
      ],
    ];
    Table("#analytics-table", tableData, columns, {
      rangeFormatter,
    });
  };

  const handle = (elem = false) => {
    const dataQuery = {
      type: "stream",
      range: 7,
    };
    elem &&
      Array.from(
        View.getElement("#analyticsOptions").querySelectorAll("select")
      ).forEach(
        ({ name, value }) => name && value && (dataQuery[name] = value)
      );
    const { type, range } = dataQuery;
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
      level: 1,
      title: "Joko Sile",
      type: "track",
      stream: {
        count: 167,
        rate: 81.52,
        growing: true,
      },
      children: [
        {
          level: 3,
          title: "Apple Music",
          stream: 49,
          rate: 1125,
          growing: true,
        },
        { level: 3, title: "Spotify", stream: 23, rate: -4.17, growing: false },
      ],
    },
    {
      level: 1,
      title: "Gbe Collection",
      type: "album",
      stream: 178,
      rate: -33.08,
      growing: false,
      children: [
        {
          level: 2,
          title: "Gbe",
          stream: 95,
          rate: -24.6,
          growing: false,
          children: [
            {
              level: 3,
              title: "Apple Music",
              stream: 23,
              rate: -45.24,
              growing: false,
            },
            {
              level: 3,
              title: "Spotify",
              stream: 72,
              rate: -14.29,
              growing: false,
            },
          ],
        },
        {
          level: 2,
          title: "Gbe body",
          stream: 83,
          rate: -40.71,
          growing: false,
          children: [
            {
              level: 3,
              title: "Apple Music",
              stream: 83,
              rate: -40.71,
              growing: false,
            },
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
