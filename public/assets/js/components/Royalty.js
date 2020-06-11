import moment from "moment";
import Template from "./Template";
import View from "../View";
import serverRequest from "../utilities/serverRequest";
import { horizontalBarChart } from "../components/Barchart";
import DoughnutChart from "../components/DoughnutChart";
import rangeFormatter from "../utilities/rangeFormatter";
import generateRandomNumber from "../utilities/randomNumberGenerator";
import LineGraph from "./LineGraph";

const royalty = (BASEURL) => {
  const CACHE = new Map();
  const _formatAmount = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const _getTableData = async (params) => {
    View.showLoader(true);
    let isDataFromServer = false;
    const key = _getParamsCacheKey(params);
    let tableData;
    if (CACHE.has(key)) {
      const jsonData = CACHE.get(key);
      tableData = JSON.parse(jsonData);
    } else {
      const { data } = await serverRequest({
        href: BASEURL + "/table",
        method: "GET",
        params,
      });
      isDataFromServer = true;
      tableData = data;
    }
    if (isDataFromServer) CACHE.set(key, JSON.stringify(tableData));
    View.showLoader(false);
    return _convertEarningToNairaEquiv(tableData);
  };

  const _getChartData = async (routeName) => {
    const { data } = await serverRequest({
      href: BASEURL + "/" + routeName,
      method: "GET",
    });
    return _convertEarningToNairaEquiv(data);
  };

  const _convertEarningToNairaEquiv = (data) => {
    if (Array.isArray(data)) {
      data.forEach((dataObj) => _convertEarningKeysValueToNairaEquiv(dataObj));
    } else {
      if (_allObjectValuesAreNull(data)) return data;
      _convertEarningKeysValueToNairaEquiv(data);
    }
    return data;
  };

  const _convertEarningKeysValueToNairaEquiv = (dataObj) => {
    const earningKeys = [
      "releaseDownloadEarning",
      "trackStreamEarning",
      "trackDownloadEarning",
      "earning",
    ];
    earningKeys.forEach((key) => {
      let keyValue = dataObj[key];
      if (!keyValue) return;
      dataObj[key] = Number(keyValue) / 100;
    });
  };

  const _injectIfTopGraphSuccess = (topGraphSuccess) => {
    if (!topGraphSuccess) return;
    _injectBaseContainer();
    _handleTopCountriesChart();
    _handleTopStoresChart();
    _insertComponent("#royalties-table", "index");
    _attachTabEvents();
  };

  const _injectBaseContainer = () => {
    View.addHTML(
      "#container-inject",
      Template(["royalties", "CONTAINERINJECT"])
    );
  };

  const _allObjectValuesAreNull = (obj) => {
    if (obj.earning === null) return true; //not reliable
    const objValues = Object.values(obj);
    const nullObjectValues = objValues
      .filter((item) => !Boolean(item))
      .map((item) => item);
    const status = nullObjectValues.length === objValues.length ? true : false;
    return status;
  };

  const _checkIfServerResponseIsNull = (data) => {
    if (Array.isArray(data)) {
      if (data.length > 1) return false;
      const [firstData] = data;
      return _allObjectValuesAreNull(firstData);
    }
    return _allObjectValuesAreNull(data);
  };

  const _handleTopGraphAndTotal = async () => {
    const recentPublishedMonthTotal = await _getChartData("month");
    const isRecentPublishedMonthTotalEmpty = _checkIfServerResponseIsNull(
      recentPublishedMonthTotal
    );
    if (isRecentPublishedMonthTotalEmpty) {
      _renderMonthlySalesGraph();
      return false;
    }
    _renderRecentPublishedMonthTotal(recentPublishedMonthTotal);
    const monthlySalesData = await _getChartData("months");
    _renderMonthlySalesGraph(monthlySalesData);
    const totalSales = await _getChartData("total");
    _renderTotalSales(totalSales);
    _removeTopGraphInactiveOverlay();
    return true;
  };

  const _removeTopGraphInactiveOverlay = () => {
    const TOP_GRAPH_CONTAINER_ID = "#top-graph-container";
    View.removeClass(
      TOP_GRAPH_CONTAINER_ID,
      "royalties__info__graph--inactive"
    );
  };

  const _renderRecentPublishedMonthTotal = (data) => {
    const MONTH_ID = "#monthdata-month";
    const RATE_ID = "#monthdata-rate";
    const EARNING_ID = "#monthdata-earning";
    const rangeHTML = rangeFormatter(data);
    const { earning, monthValue } = data;
    const monthName = moment(monthValue, "M").format("MMM");
    View.addHTML(RATE_ID, rangeHTML);
    View.addContent(MONTH_ID, monthName);
    View.addContent(EARNING_ID, _formatAmount(earning));
  };

  const _renderTotalSales = (data) => {
    const TOTAL_SALES_MAIN = "#total-sales-main";
    const TOTAL_SALES_SUB = "#total-sales-sub";
    const total = _formatAmount(_getRowTotalEarning(data));
    View.addContent(TOTAL_SALES_MAIN, total);
    View.addContent(TOTAL_SALES_SUB, total);
  };

  const _renderMonthlySalesGraph = async (data) => {
    const canvasID = "#royalties-graph";
    let dataToBeRendered;
    if (data) dataToBeRendered = _processMonthlySalesGraphData(data);
    else dataToBeRendered = _monthlySalesGraphDefaultData(canvasID);
    const { months, monthValues, fullMonths } = dataToBeRendered;
    const graphData = {
      labels: months.reverse(),
      datasets: [
        {
          data: monthValues.reverse(),
          fullMonths: fullMonths.reverse(),
          backgroundColor: "#F6FAFF",
          borderColor: "#418DF8",
        },
      ],
    };
    LineGraph(graphData, canvasID, _monthlySalesGraphConfig());
  };

  const _processMonthlySalesGraphData = (data) => {
    const months = [];
    const monthValues = [];
    const fullMonths = [];
    let dataToBeRendered = data;
    const monthsNotComplete = data.length < 12;
    if (monthsNotComplete)
      dataToBeRendered = _fillUpMissingMonthlySalesGraphData(data);
    dataToBeRendered.forEach(({ monthValue, earning }) => {
      const month = moment(monthValue, "M").format("MMM");
      const fullMonth = moment(monthValue, "M").format("MMMM");
      fullMonths.push(fullMonth);
      months.push(month);
      monthValues.push(earning);
    });
    return { months, monthValues, fullMonths };
  };

  const _fillUpMissingMonthlySalesGraphData = (data) => {
    //This expects the data to already be sorted;
    const dataCopy = [...data];
    let startValue = dataCopy[dataCopy.length - 1]["monthValue"];
    const missingMonthsNumber = 12 - dataCopy.length;
    for (let i = 0; i < missingMonthsNumber; i++) {
      let value = startValue - 1;
      value = value <= 0 ? 12 : value;
      startValue = value;
      dataCopy.push({ monthValue: value, earning: 0 });
    }
    return dataCopy;
  };

  const _monthlySalesGraphDefaultData = (data) => {
    const months = [];
    const monthValues = [];
    const fullMonths = [];
    new Array(12).fill(0).forEach((num, index) => {
      const value = generateRandomNumber(5000);
      const month = moment(index + 1, "M").format("MMM");
      const fullMonth = moment(index + 1, "M").format("MMMM");
      fullMonths.push(fullMonth);
      months.push(month);
      monthValues.push(value);
    });
    return { months, monthValues, fullMonths };
  };

  const _monthlySalesGraphConfig = () => {
    return {
      toolTipsCallback: {
        title: () => "",
        label(tooltipItem, data) {
          const { value, index } = tooltipItem;
          return `${data.datasets[0].fullMonths[index] || ""}: ${_formatAmount(
            value
          )}`;
        },
      },
    };
  };

  const _getRowTotalEarning = (row = {}) => {
    const {
      releaseDownloadEarning,
      trackDownloadEarning,
      trackStreamEarning,
      earning,
    } = row;
    if (earning) return Number(earning);
    return (
      Number(releaseDownloadEarning) +
      Number(trackDownloadEarning) +
      Number(trackStreamEarning)
    );
  };

  const _handleTopCountriesChart = async () => {
    const routeName = "top-countries";
    const containerId = "#countries-chart";
    const responseData = await _getChartData(routeName);
    const dataValues = [];
    const labels = [];
    responseData.forEach(
      ({
        releaseDownloadEarning,
        trackDownloadEarning,
        trackStreamEarning,
        earning,
        country: { code, name },
      }) => {
        let value = earning;
        if (!value) {
          value =
            Number(releaseDownloadEarning) +
            Number(trackDownloadEarning) +
            Number(trackStreamEarning);
        }
        dataValues.push(value);
        labels.push({ code, name });
      }
    );
    const data = {
      datasets: [
        {
          data: dataValues,
          backgroundColor: "#287EF7",
        },
      ],
      labels,
    };
    horizontalBarChart(data, containerId);
  };

  const _handleTopStoresChart = async () => {
    const routeName = "top-stores";
    const containerId = "#stores-chart";
    const containerStoreListId = "#stores-chart-list";
    const responseData = await _getChartData(routeName);
    const backgroundColors = [
      "#1e1e2c",
      "rgb(86, 12, 104)",
      "#91b252",
      "#6262af",
      "#84BC9C",
      "#246EB9",
    ];
    const dataValues = [];
    const labels = [];
    const storeRoyaltyList = [];
    responseData.forEach(
      (
        {
          releaseDownloadEarning,
          trackDownloadEarning,
          trackStreamEarning,
          earning,
          store: { store },
        },
        index
      ) => {
        let value = earning;
        if (!value) {
          value =
            Number(releaseDownloadEarning) +
            Number(trackDownloadEarning) +
            Number(trackStreamEarning);
        }
        dataValues.push(value);
        labels.push(store);
        storeRoyaltyList.push({
          store,
          value: _formatAmount(value),
          bgColor: backgroundColors[index],
        });
      }
    );
    const data = {
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
        },
      ],
      labels,
    };
    const label = (tooltipItem, data) => {
      const { index } = tooltipItem;
      return `${data.labels[index]}: ${_formatAmount(
        data.datasets[0].data[index]
      )}`;
    };
    DoughnutChart(data, containerId, { callbacks: { label } });
    const storeListHTML = Template(
      ["royalties", "storeRoyaltyComp"],
      storeRoyaltyList
    );
    View.getElement(containerStoreListId).innerHTML = storeListHTML;
  };

  const _getParamsCacheKey = (params) => {
    const cloneParams = { ...params };
    const { groupBy } = cloneParams;
    delete cloneParams["groupBy"];
    let cacheKey = groupBy ? groupBy : "";
    Object.entries(cloneParams).forEach(
      ([key, value]) => (cacheKey += key + value)
    );
    return cacheKey;
  };

  const _attachTabEvents = () => {
    const rootTableContainer = View.getElement("#royalties-table");
    rootTableContainer.addEventListener("click", (e) => {
      if (e.target.tagName !== "A") return;
      if (e.target.classList.contains("active")) return;
      const tabParent = $(e.target).closest("ul").get(0);
      tabParent.querySelector(".active").classList.remove("active");
      e.target.classList.add("active");
      return _handleTabChange(e.target);
    });
  };

  const _insertComponent = (container, schemaName, params) => {
    const [tabs, firstTabName] = _getTabHeaders(schemaName, params);
    const { groupBy } = schema[firstTabName];
    const $table = $(container).html(Template("tab", tabs)).find("table");
    const addedRequestParams = { groupBy, ...params };
    return _processTable($table, firstTabName, addedRequestParams);
  };

  const _getTabHeaders = (name, params) => {
    let headerTabs = [];
    console.log("TABS: ", name);
    if (name === "index") headerTabs = schema["index"];
    else headerTabs = schema[name].tabs;
    const [firstTab] = headerTabs;
    const tabs = headerTabs.map((tab) => {
      const { title } = schema[tab];
      return { name: tab, title, params };
    });
    return [tabs, firstTab];
  };

  const _handleTabChange = (target) => {
    const { name, params } = target.dataset;
    const parsedParams = params ? JSON.parse(params) : {};
    const { groupBy } = schema[name];
    const $table = _getTargetParentTable(target);
    const addedRequestParams = { groupBy, ...parsedParams };
    return _processTable($table, name, addedRequestParams);
  };

  const _getTargetParentTable = (target) => {
    const $table = $(target)
      .closest("section")
      .find(".tab-content")
      .html("<table data-mobile-responsive='true'></table>")
      .find("table");
    return $table;
  };

  const _processTable = async ($table, name, params) => {
    const data = await _getTableData(params);
    const { columns, hasSubTable, paramName: nameParamKey } = schema[name];
    const columnsToBeUsed = [...columns]; //to avoid modifying the base array.
    const isNotSubTable = Object.keys(params).length === 1;
    if (isNotSubTable && hasSubTable)
      _addDetailsColumn(columnsToBeUsed, nameParamKey, name);
    return _renderTable($table, data, columnsToBeUsed);
  };

  const _tableFormatters = {
    priceFormat(value, row) {
      return _formatAmount(value);
    },
    monthFormat(value, row) {
      const {
        month: { monthValue, yearValue },
      } = row;
      const month = moment(monthValue, "MM").format("MMMM");
      return `${month} ${yearValue}`;
    },
  };

  const _renderTable = ($table, data, columns) => {
    columns = columns.map((column) => {
      const { formatter } = column;
      if (formatter && typeof formatter === "string") {
        column.formatter = _tableFormatters[formatter];
      }
      return column;
    });
    $table.bootstrapTable({
      data,
      columns,
      classes: "table table-bordered",
    });

    //LISTENS FOR SUBTABLE EVENTS
    $table.on("expand-row.bs.table", (e, params, name) => {
      const $tr = $(e.target);
      const $container = $(
        `<tr><td style="background: rgb(239,240,246)" colspan=12></td></tr>`
      )
        .insertAfter($tr)
        .find("td");
      return _insertComponent($container, name, params);
    });

    //
    $table.on("collapse-row.bs.table", (e) => {
      const $tr = $(e.target);
      $tr.next().remove();
    });
  };

  const _addDetailsColumn = (columns, nameParamKey, name) => {
    const _clickFormatter = (value, row, index) => {
      const params = JSON.stringify({ [nameParamKey]: row[name].id });
      return `<button class='analytics--view-btn' data-view_open='false' data-params=${params} data-parent="${name}"><span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span></button>`;
    };

    const DetailsField = {
      field: "click",
      title: "Details",
      align: "center",
      formatter: _clickFormatter,
      events: {
        "click .analytics--view-btn": (...args) => _handleDetailAction(...args),
      },
    };
    columns.push(DetailsField);
  };

  const _handleDetailAction = (e) => {
    const $target = $(e.target);
    const { params, parent, view_open } = $target.data();
    const $targetRow = $target.closest("tr");
    const subTableNotActive = Boolean(view_open) === false;
    if (subTableNotActive) {
      $target
        .data("view_open", true)
        .html(
          `<span class="iconify" data-icon="ant-design:up-square-outlined" data-inline="false"></span>`
        );
      $targetRow.trigger("expand-row.bs.table", [params, parent]);
    } else {
      $target
        .data("view_open", false)
        .html(
          `<span class="iconify" data-icon="ant-design:down-square-outlined" data-inline="false"></span>`
        );
      $targetRow.trigger("collapse-row.bs.table");
    }
  };

  const initiate = async () => {
    View.showLoader(true);
    const topGraphSuccess = await _handleTopGraphAndTotal();
    _injectIfTopGraphSuccess(topGraphSuccess);
    View.showLoader(false);
  };

  return { initiate };
};

export default royalty;

var schema = {
  index: [
    "overview",
    "release",
    "track",
    "store",
    "month",
    "country",
    "export",
  ],
  overview: {
    title: "Overview",
    hasSubTable: false,
    columns: [
      {
        title: "#Item",
        field: "name",
      },
      {
        title: "Total",
        field: "count",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  release: {
    title: "Release",
    hasSubTable: false,
    groupBy: "releases",
    paramName: "releaseId",
    columns: [
      {
        title: "Release",
        field: "title",
      },
      {
        title: "Release Download",
        field: "releaseDownload",
        align: "center",
      },
      {
        title: "Track Download",
        field: "trackDownload",
        align: "center",
      },
      {
        title: "Stream",
        field: "trackStream",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  track: {
    title: "Track",
    hasSubTable: true,
    groupBy: "tracks",
    tabs: ["store", "month", "country"],
    paramName: "trackId",
    columns: [
      {
        title: "Track",
        field: "title",
      },
      {
        title: "Track Download",
        field: "trackDownload",
        align: "center",
      },
      {
        title: "Stream",
        field: "trackStream",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  store: {
    title: "Store",
    hasSubTable: true,
    groupBy: "stores",
    paramName: "storeId",
    tabs: ["release", "track", "month", "country"],
    columns: [
      {
        title: "Store",
        field: "title",
      },
      {
        title: "Release Download",
        field: "releaseDownload",
        align: "center",
      },
      {
        title: "Track Download",
        field: "trackDownload",
        align: "center",
      },
      {
        title: "Stream",
        field: "trackStream",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  month: {
    title: "Month",
    hasSubTable: true,
    groupBy: "months",
    paramName: "monthId",
    tabs: ["release", "track", "store", "country"],
    columns: [
      {
        title: "Month",
        formatter: "monthFormat",
      },
      {
        title: "Release Download",
        field: "releaseDownload",
        align: "center",
      },
      {
        title: "Track Download",
        field: "trackDownload",
        align: "center",
      },
      {
        title: "Stream",
        field: "trackStream",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  country: {
    title: "Country",
    hasSubTable: true,
    paramName: "countryId",
    groupBy: "countries",
    tabs: ["release", "track", "store", "month"],
    columns: [
      {
        title: "Country",
        field: "title",
      },
      {
        title: "Release Download",
        field: "releaseDownload",
        align: "center",
      },
      {
        title: "Track Download",
        field: "trackDownload",
        align: "center",
      },
      {
        title: "Stream",
        field: "trackStream",
        align: "center",
      },
      {
        title: "Earning",
        field: "earning",
        align: "center",
        formatter: "priceFormat",
      },
    ],
  },
  export: {
    title: "Export",
    hasSubTable: false,
  },
};
