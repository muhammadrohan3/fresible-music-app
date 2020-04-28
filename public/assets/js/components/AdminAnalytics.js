import moment from "moment";
import serverRequest, { responseHandler } from "../utilities/serverRequest";
import View from "../View";
import LineGraph from "./LineGraph";
import DoughnutChart from "./DoughnutChart";
import sortGraph from "../utilities/sortGraph";
import { mainChart, subChart } from "../templates/dashboardCanvas";
import rangeFormatter from "../utilities/rangeFormatter";
import { modal } from "./Modal";
import Template from "./Template";
import { setStore, getStore } from "../Store";
import Table from "./Table";

let R;
export default class AdminAnalytics {
  static async getTopBoxesData() {
    const boxes = [
      {
        id: "analytics-total-streams",
        href: `${location.pathname}/get/totalStreams`,
      },
      {
        id: "analytics-total-downloads",
        href: `${location.pathname}/get/totalDownloads`,
      },
    ];
    return await Promise.all(
      boxes.map(async ({ id, href }) => {
        const { data } = await serverRequest({
          href,
          method: "get",
        });
        let { total } = data[0];
        return View.addContent(`#${id}`, total);
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
    const response = await serverRequest({
      href: `${location.pathname}/get/topStores`,
      method: "get",
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
    DoughnutChart(data, "#admin-analytics-stores-graph", { legend: true });
  }

  static async renderTable() {
    const response = await serverRequest({
      method: "get",
      href: `${location.pathname}/get/dates`,
    });

    if (!(R = responseHandler(response))) return;
    const tableData = R;
    console.log(tableData);

    const formatDate = (value, row) => {
      return moment(value).format("Do MMM, YYYY");
    };

    const idFormat = (value, row) => {
      const { releaseId } = row;
      let url = `/fmadmincp/analytics/${value}/edit`;
      if (releaseId) url = `/fmadmincp/analytics/releases/${value}`;

      return `<a class='default' href='${url}'>${value}</a>`;
    };

    const formatCount = (value) => {
      return `<div class='d-flex align-items-center'><span class='mr-1'>${
        value.count
      }</span>${rangeFormatter(value)}</div>`;
    };

    const statusFormat = (value) => {
      const statusHash = {
        processing: "info",
        published: "success",
      };
      return `<div><span class='badge badge-${
        statusHash[value.trim()]
      } badge-pill'>${value}</span></div>`;
    };

    const columns = [
      [
        {
          field: "dateId",
          title: "#ID",
          sortable: true,
          formatter: "idFormat",
        },
        { field: "date", title: "Date", formatter: "formatDate" },
        { field: "status", title: "Status", formatter: "statusFormat" },
        {
          field: "streams",
          title: "Stream",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
        {
          field: "downloads",
          title: "Download",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
      ],
      [
        {
          field: "releaseId",
          title: "#ID",
          sortable: true,
          formatter: "idFormat",
        },
        { field: "title", title: "Release" },
        {
          field: "streams",
          title: "Stream",
          align: "center",
          sortable: true,
          formatter: "formatCount",
        },
        {
          field: "downloads",
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
      idFormat,
    });
    return;
  }

  static openSelectStoresModal(target) {
    let { stores } = View.getElement("#analyticsInitiate").dataset;
    stores = JSON.parse(stores);
    const { type } = target.dataset;
    const selectedStores = getStore("ANALYTICS-SELECTED-STORES")?.[type];
    modal.admin().prepare("stores", { type, stores, selectedStores }).launch();
  }

  static handleStoresSelected(form) {
    let { stores } = View.getElement("#analyticsInitiate").dataset;
    stores = JSON.parse(stores);
    const { type } = form.dataset;
    const { rawFormData } = View.getFormData(form);
    const selectedStoresHash = {};
    const selectedStores = stores.filter(
      (store) => rawFormData[store.id] && (selectedStoresHash[store.id] = true)
    );
    if (!selectedStores) return;
    setStore("ANALYTICS-SELECTED-STORES", { [type]: selectedStoresHash });
    const insertSource =
      type === "stream"
        ? "#analyticsInitiate-stream"
        : "#analyticsInitiate-download";
    const TemplateData = { type, selectedStores };
    View.addContent(
      insertSource,
      Template("analyticsStoresList", TemplateData),
      true
    );
    modal.close();
  }

  static handleAddNewStoreInput(target) {
    const { stores } = View.getElement("#analyticsAdd").dataset;
    $(target)
      .next()
      .append(
        Template("analyticsNewStoreInput", { stores: JSON.parse(stores) })
      );
  }

  static handleRemoveStoreInput(target) {
    const $container = $(target).parent();
    if ($container.parent().children().length === 1)
      return View.showAlert("There has to be atleast one store");
    $container.remove();
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
