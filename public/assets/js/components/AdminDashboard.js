import moment from "moment";
import serverRequest from "../utilities/serverRequest";
import View from "../View";
import LineGraph from "./LineGraph";
import DoughnutChart from "./DoughnutChart";
import Log from "../templates/log";
import { mainChart, subChart } from "../templates/dashboardCanvas";

export default class AdminDashboard {
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

    const datasets = [
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
    ];

    const data = {
      labels: days,
      datasets,
    };

    View.addContent("#dash-graph", ejs.render(mainChart), true);
    LineGraph(data, "#main-chart", { legend: true });
  }

  static async buildSubChart() {
    const { data: response } = await serverRequest({
      href: "/fmadmincp/dashboard/get-packages-sub-count",
      method: "get",
    });
    //COUNTING THE PACKAGE IDS ARE SERIALIZED [1,2,3,4]
    const hashMap = {
      single: 0,
      album: 1,
      basic: 2,
      professional: 3,
      "world class": 4,
      legendary: 5,
    };

    const dataValues = [0, 0, 0, 0, 0, 0];

    response.forEach(
      ({ count, package: { package: packageName } }) =>
        (dataValues[hashMap[packageName.toLowerCase()]] = count)
    );

    let data = {
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "#84BC9C",
            "#246EB9",
            "#1e1e2c",
            "rgb(86, 12, 104)",
            "#91b252",
            "#6262af",
          ],
        },
      ],
      labels: [
        "Single",
        "Album",
        "Basic",
        "Professional",
        "World Class",
        "Legendary",
      ],
    };

    View.addContent("#dash-doughnut", ejs.render(subChart), true);
    DoughnutChart(data, "#sub-chart", { legend: true });
  }

  static async renderLogs() {
    const logs = ["dash-subscriberslog", "dash-adminlog"];
    await Promise.all(
      logs.map(async (log, i) => {
        const { data } = await serverRequest({
          href: `/fmadmincp/dashboard/${log}`,
          method: "get",
        });

        data &&
          View.addContent(
            `#${log}`,
            ejs.render(Log, { data, timeFunc, isAdmin: i }),
            true
          );
      })
    );
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
