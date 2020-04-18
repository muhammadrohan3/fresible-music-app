import moment from "moment";
import serverRequest from "../utilities/serverRequest";
import View from "../View";
import LineGraph from "./LineGraph";
import DoughnutChart from "./DoughnutChart";
import sortGraph from "../utilities/sortGraph";
import { mainChart, subChart } from "../templates/dashboardCanvas";
import rangeFormatter from "../utilities/rangeFormatter";

export default class AdminAnalytics {
  static async getTopBoxesData() {
    const boxes = [
      "totalSubscribers",
      "totalReleases",
      "paidSubscribers",
      "approvedReleases",
    ];
    return await Promise.all(
      boxes.map(async (box) => {
        const { data } = await serverRequest({
          href: `/fmadmincp/dashboard/${box}`,
          method: "get",
        });
        let { count } = data;
        if (Array.isArray(count)) count = count.length;
        return View.addContent(`#${box}`, count);
      })
    );
  }

  static async buildMainChart() {
    const { data: response } = await serverRequest({
      href: "/fmadmincp/dashboard/get-graph-data",
      method: "get",
    });
    if (!response) return;
    const dates = [];
    const days = [];
    const dateObj = {
      releases: Array(7).fill(0),
      subscribers: Array(7).fill(0),
      subscriptions: Array(7).fill(0),
    };

    for (let i = 6; i >= 0; --i) {
      const m = moment().subtract(i, "days");
      dates.push(m.format("YYYY-MM-DD"));
      days.push(m.format("ddd"));
    }
    for (let item in response) {
      if (response.hasOwnProperty(item)) {
        //
        response[item].forEach(({ count, date }) => {
          //
          dateObj[item][dates.indexOf(date)] = count;
        });
      }
    }

    const datasets = sortGraph([
      {
        label: "Subscribers",
        backgroundColor: "#eab8f6",
        borderColor: "rgb(86, 12, 104)",
        data: dateObj.subscribers,
      },
      {
        label: "Subscriptions",
        backgroundColor: "#dae5c5",
        borderColor: "#91b252",
        data: dateObj.subscriptions,
      },
      {
        label: "Releases",
        backgroundColor: "#dfdfef",
        borderColor: "#6262af",
        data: dateObj.releases,
      },
    ]);

    const data = {
      labels: days,
      datasets,
    };

    View.addContent("#dash-graph", ejs.render(mainChart), true);
    LineGraph(data, "#main-chart", { legend: true });
  }

  static async buildStoresChart() {
    // const { data: response } = await serverRequest({
    //   href: "/fmadmincp/dashboard/get-packages-sub-count",
    //   method: "get",
    // });

    const response = [
      { storeId: 1, store: { store: "Apple Music" }, count: 452 },
      { storeId: 2, store: { store: "Spotify" }, count: 300 },
      { storeId: 3, store: { store: "Deezer" }, count: 20 },
    ];

    const dataValues = [];
    const labels = [];

    response.forEach(({ count, store: { store } }) => {
      dataValues.push(count);
      labels.push(store);
    });

    let data = {
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
    DoughnutChart(data, "#admin-analytics-stores-graph", { legend: true });
  }

  static async renderTable() {
    const formatDate = (value, row) => {
      return moment(value).format("Do MMM, YYYY");
    };

    const formatCount = (value, row) => {
      return `<div class='d-flex align-items-center'><span class='mr-1'>${
        row.count
      }</span>${rangeFormatter(value, row)}</div>`;
    };

    const statusFormat = (value) => {
      const statusHash = {
        processing: "info",
        published: "success",
      };
      return `<span class='alert alert-${
        statusHash[value.trim()]
      }'>${value}</span>`;
    };

    const columns = [
      [
        { field: "id", title: "#ID", sortable: true },
        { field: "date", title: "Date", formatter: "formatDate" },
        { field: "status", title: "Status", formatter: "statusFormat" },
        {
          field: "count",
          title: "Stream",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
        {
          field: "count",
          title: "Download",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
      ],
      [
        { field: "id", title: "#ID", sortable: true },
        { field: "release", title: "Release", sortable: true },
        {
          field: "stream",
          title: "Stream",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
        {
          field: "download",
          title: "Download",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
      ],
    ];
    Table("#analytics-table", tableData, columns, {
      formatCount,
      formatDate,
      statusFormat,
    });
    return;
  }
}

function timeFunc(date) {
  const todayTimeHandler = (date) => {
    let t;
    if ((t = moment().diff(moment(date), "s")) < 60) return `${t}s`;
    if ((t = moment().diff(moment(date), "m")) < 60) return `${t}m`;
    if ((t = moment().diff(moment(date), "h")) < 24) return `${t}h`;
  };

  const daysHandler = (date) => {
    if (moment().diff(moment(date), "w") > 0)
      return moment(date).format("YYYY-MM-DD");
    return `${moment().diff(moment(date), "d")}d`;
  };

  if (moment().diff(moment(date), "h") >= 24) return daysHandler(date);
  return todayTimeHandler(date);
}
