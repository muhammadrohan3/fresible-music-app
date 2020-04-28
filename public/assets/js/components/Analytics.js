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
import formatNumber from "../utilities/formatNumber";

export default (() => {
  const internalCache = {};
  let href;

  const _getTopBoxesData = async ({ baseLink, dataInput = {} }) => {
    const { releaseId, status } = dataInput;
    let params = { releaseId };
    const boxes = [
      {
        id: "analytics-total-streams",
        href: `${baseLink}/totalStreams`,
      },
      {
        id: "analytics-total-downloads",
        href: `${baseLink}/totalDownloads`,
      },
    ];
    return await Promise.all(
      boxes.map(async ({ id, href }) => {
        let total;
        if (status && status !== "in stores") total = 0;
        else {
          const { data } = await serverRequest({
            href,
            method: "get",
            params,
          });
          total = data[0].total;
        }
        return View.addContent(`#${id}`, formatNumber(total));
      })
    );
  };

  const _buildStoresChart = async ({ baseLink, dataInput = {} }) => {
    const { releaseId, status } = dataInput;
    const params = { releaseId };
    if (status !== "in stores") return;
    const response = await serverRequest({
      href: `${baseLink}/topStores`,
      method: "get",
      params,
    });

    const dataValues = [];
    const labels = [];

    response.data.forEach(({ total, store: { store } }) => {
      dataValues.push(total);
      labels.push(store);
    });

    const data = {
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "#1e1e2c",
            "rgb(86, 12, 104)",
            "#91b252",
            "#6262af",
            "#84BC9C",
            "#246EB9",
          ],
        },
      ],
      labels,
    };

    // View.addContent("#dash-doughnut", ejs.render(subChart), true);
    DoughnutChart(data, "#analytics-top-stores", { legend: false });
  };

  const _reportUI = (report, { type, range }) => {
    const { rate, growing, count } = report;
    const groupNames = {
      7: "Weekly",
      14: "Fornightly",
      30: "Monthly",
      stream: "Streams",
      download: "Downloads",
    };
    const groupName = groupNames[range];
    const rangeGrowthValue = rangeFormatter(report);
    const typeName = groupNames[type];

    View.addContent(
      "#analytics-report",
      ejs.render(ANALYTICS_REPORT_UI, {
        groupName,
        rangeGrowthValue,
        typeName,
        range,
        stream: count,
      }),
      true
    );
  };

  const _chartUI = (chartData, query) => {
    const { dates, datasets } = chartData;
    const { range } = query;
    const formattedDates = dates.map((date) => {
      const m = moment(date);
      if (range === 7) return m.format("ddd");
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
    console.log("GRAPH: ", data);
    LineGraph(data, "#analytics-graph");
  };

  const _tableUI = (tableData, tableDataDepth = 3, { type, range }) => {
    const columns = [
      [
        // {
        //   field: "color",
        //   title: "color",
        //   width: 20,
        //   formatter: "colorFormatter",
        // },
        { field: "title", title: "Release", sortable: true },
        {
          field: "",
          title: type,
          align: "center",
          sortable: true,
          formatter: "countFormatter",
        },
        {
          field: "count",
          title: `vs Previous ${range} days`,
          align: "center",
          sortable: true,
          formatter: "rangeFormatter",
        },
      ],
      [
        { field: "title", title: "Track", sortable: true },
        {
          field: "",
          title: type,
          align: "center",
          sortable: true,
          formatter: "countFormatter",
        },
        {
          field: "count",
          title: `vs Previous ${range} days`,
          align: "center",
          sortable: true,
          formatter: "rangeFormatter",
        },
      ],
      [
        { field: "title", title: "Store", sortable: true },
        {
          field: "",
          title: type,
          align: "center",
          sortable: true,
          formatter: "countFormatter",
        },
        {
          field: "count",
          title: `vs Previous ${range} days`,
          align: "center",
          sortable: true,
          formatter: "rangeFormatter",
        },
      ],
    ];

    if (tableDataDepth === 2) columns.shift();

    const countFormatter = (value = null, row) => {
      return row.count.count;
    };

    const colorFormatter = (value) => {
      return `<span style="border: 2px solid ${value}; display: inline-block; width: 2.5rem" class='mx-auto'></span>`;
    };

    Table("#analytics-table", tableData, columns, {
      rangeFormatter,
      colorFormatter,
      countFormatter,
    });
  };

  const _handle = async (query) => {
    if (!href)
      return View.showAlert(
        "ERROR: link missing in analytic handler - contact admin"
      );
    const { type, range } = query;
    const cacheKey = type + range;
    let Response = internalCache[cacheKey];
    if (!Response) {
      Response = await serverRequest({ href, params: query, method: "get" });
    }
    console.log("HANDLE: ", Response);
    const { Report, TableData, ChartData } = Response.data;
    _chartUI(ChartData, query);
    _tableUI(TableData, undefined, query);
    _reportUI(Report, query);
  };

  const reactToChange = () => {
    const query = {};
    View.getElement("#analyticsOptions")
      .querySelectorAll("select")
      .forEach(({ name, value }) => (query[name] = value));
    return _handle(query);
  };

  const initiate = ({ top: { topBoxesBaseLink, dataInput }, bodyLink }) => {
    if (View.getElement("#analytics-empty")) return;
    _getTopBoxesData({ baseLink: topBoxesBaseLink, dataInput });
    _buildStoresChart({ baseLink: topBoxesBaseLink, dataInput });
    const defaultQuery = {
      type: "stream",
      range: 7,
    };
    href = bodyLink;
    return _handle(defaultQuery);
  };

  return { initiate, reactToChange };
})();
