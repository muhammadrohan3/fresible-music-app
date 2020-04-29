import moment from "moment";
import serverRequest, { responseHandler } from "../utilities/serverRequest";
import View from "../View";
import rangeFormatter from "../utilities/rangeFormatter";
import { modal } from "./Modal";
import Template from "./Template";
import { setStore, getStore } from "../Store";
import Table from "./Table";

let R;
export default class AdminAnalytics {
  static async renderTable() {
    const response = await serverRequest({
      method: "get",
      href: `${location.pathname}/get/dates`,
    });

    if (!(R = responseHandler(response))) return;
    const tableData = R;

    const formatDate = (value, row) => {
      return moment(value).format("Do MMM, YYYY");
    };

    const idFormat = (value, row) => {
      const { releaseId } = row;
      let url = `/fmadmincp/analytics/${value}/edit`;
      if (releaseId) url = `/fmadmincp/analytics/releases/${value}`;

      return `<a class='-u-link-default' href='${url}'>${value}</a>`;
    };

    const formatCount = (value) => {
      return `<span class='d-flex align-items-center justify-content-center'><span class='mr-1'>${
        value.count
      }</span>${rangeFormatter(value)}</span>`;
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
          align: "center",
          sortable: true,
          formatter: "idFormat",
        },
        {
          field: "date",
          title: "Date",
          align: "center",
          formatter: "formatDate",
        },
        {
          field: "status",
          title: "Status",
          align: "center",
          formatter: "statusFormat",
        },
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
          align: "center",
          sortable: true,
          formatter: "idFormat",
        },
        { field: "title", title: "Release", align: "center", sortable: true },
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
