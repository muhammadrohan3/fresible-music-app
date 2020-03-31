import "regenerator-runtime/runtime";
import Swal from "sweetalert2";
import { async, promised } from "q";
import moment from "moment";
import * as ejs from "../ejs.min.js";
import "../../../../node_modules/chart.js/dist/Chart";
import View from "../View";
import serverRequest from "../utilities/serverRequest";
import mobileMenu from "../utilities/handleMobileMenu";
import loader from "../templates/loader";
import Log from "../templates/log";
import { mainChart, subChart } from "../templates/dashboardCanvas";
import submitForm from "../utilities/submitForm";
import AdminModals from "../popups/admin";
import modalPrepare from "../utilities/prepareModal";

export default () => {
  let R;
  const SubmitForm = submitForm(View);

  const prepareModal = modalPrepare(AdminModals);

  const timeFunc = date => {
    const todayTimeHandler = date => {
      let t;
      if ((t = moment().diff(moment(date), "s")) < 60) return `${t}s`;
      if ((t = moment().diff(moment(date), "m")) < 60) return `${t}m`;
      if ((t = moment().diff(moment(date), "h")) < 24) return `${t}h`;
    };

    const daysHandler = date => {
      if (moment().diff(moment(date), "w") > 0)
        return moment(date).format("YYYY-MM-DD");
      return `${moment().diff(moment(date), "d")}d`;
    };

    if (moment().diff(moment(date), "h") >= 24) return daysHandler(date);
    return todayTimeHandler(date);
  };

  const handleMobileMenu = mobileMenu(View);
  const responseHandler = ({ status, data = true }, customMessage) => {
    if (status === "error") {
      View.showAlert(customMessage || data);
      return false;
    }
    return data;
  };

  const handleBasicAction = async elem => {
    const { url: href } = elem.dataset;
    if (!href) return;
    const shouldProceed = await View.confirmAction();
    if (!shouldProceed) return;
    View.showLoader(true);
    const response = await serverRequest({ href });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  const handleDecline = async elem => {
    const { url: href } = elem.dataset;
    if (!href) return;
    const shouldProceed = await View.confirmAction();
    if (!shouldProceed) return;
    const { value: comment } = await Swal.fire({
      input: "textarea",
      inputPlaceholder: "Comment on why the submission is declined here...",
      inputAttributes: {
        "aria-label": "Comment on why the submission is declined"
      },
      showCancelButton: true
    });
    if (!comment) return View.showAlert("Decline comment is required");
    View.showLoader(true);
    const response = await serverRequest({ href, data: { comment } });
    if (!responseHandler(response)) return;
    return View.refresh();
  };

  //This handles the store links modal.
  const handleStoreLinksModal = async elem => {
    View.showLoader(true);
    const form = View.getElement("#links-form");
    //destructures the needed values from the element already set
    const { type, link_id: linkId, details } = elem.dataset;
    form.setAttribute("data-details", details);
    //checks if the links are to be edited if they exist or to add a new set of links.
    if (type === "edit") {
      //Makes a get request to the server for links associated with the linkId in the db
      const response = await serverRequest({
        url: `/fmadmincp/submission/store-links?id=${linkId}`,
        method: "get"
      });
      //handles the response, emits the error "links not found" if there is an error,
      if (!(R = responseHandler(response, "Links not found"))) return;
      //Pre-fills the information to the input boxes, to show its being edited.
      form.querySelectorAll("input").forEach(input => {
        input.value = R[input.name];
      });
      const storeLink = View.getElement(".store-link", form);
      View.addContent(storeLink, `https://fresible.link/${R.slug}`, true);
      //sets the data- attribute in order to submit the form to the right API endpoint.
      form.setAttribute(
        "data-submiturl",
        `/fmadmincp/submission/store-links/update?id=${linkId}`
      );
      form.setAttribute("data-type", "edit");
    }

    View.showLoader(false);
    //Launches the bootstrap modal on the page
    return $("#modal").modal();
  };

  //This function handles the submit and edit functions of the release links form.
  const handleStoreLinks = async form => {
    View.showLoader(true);
    const { type, details } = form.dataset;
    if (type === "add") {
      //Parses the JSON encoded details object
      const { stageName, title } = JSON.parse(details);
      //Slugifies the stageName and title.
      let slug = [title, stageName]
        .map(item => item.replace(/ /g, "-"))
        .join("-")
        .toLowerCase();
      //A while loop with the stop boolean
      let stop = false;
      let index = 0;
      while (!stop) {
        //This condition checks if the loop already ran before in order to remove the added number.

        //Makes a server request that checks for thee
        const { status } = await serverRequest({
          url: `/fmadmincp/submission/store-links/slug?slug=${slug}`,
          method: "get"
        });
        if (status === "success") {
          if (index > 0) {
            let arr = (slug = slug.split("-"));
            arr.pop();
            slug = arr.join("-");
          }
          slug = slug + `-${++index}`;
        } else {
          stop = true;
        }
      }
      form.querySelector("#links-form-slug").value = slug;
      //Submits the form and awaits its response.
      const submitResponse = await SubmitForm(form);
      // A conditional check that assigns the result to the variable R if there is no error in the server response
      if (!(R = responseHandler(submitResponse))) return;
      const { id: linkId } = R;
      const response = await serverRequest({
        url: `/fmadmincp/submission/update-linkid${location.search}`,
        data: { linkId: parseInt(linkId) - 42351 }
      });
      if (!(R = responseHandler(response))) return;
    } else if (type === "edit") {
      await SubmitForm(form);
    }
    return View.refresh();
  };

  //This function handles user role changes
  const handleChangeRole = async elem => {
    const { user_role, url } = elem.dataset;
    if (!user_role) return;
    const roles = {
      subscriber: "Subscriber",
      admin: "Admin",
      superAdmin: "Super Admin"
    };
    delete roles[user_role];
    const { value: role, dismiss } = await Swal.fire({
      title: "Assign New Role",
      input: "select",
      inputOptions: roles,
      inputPlaceholder: "-- select --",
      showCancelButton: true,
      inputValidator: value =>
        new Promise(
          resolve =>
            (value && resolve()) || resolve("You need to select a value")
        )
    });
    if (dismiss) return;
    View.showLoader(true);
    const response = await serverRequest({ data: { role }, href: url });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  //// INJECTS THE LOADERS TO THE COMP DATA TO BE FETCHED.
  const injectDashboardLoader = () => {
    const comps = [
      "dash-graph",
      "dash-doughnut",
      "dash-adminlog",
      "dash-subscriberslog"
    ];
    return comps.forEach(item =>
      View.addContent(`#${item}`, ejs.render(loader), true)
    );
  };

  const getTopBoxesData = async () => {
    const boxes = [
      "totalSubscribers",
      "totalReleases",
      "paidSubscribers",
      "approvedReleases"
    ];
    return await Promise.all(
      boxes.map(async box => {
        const { data } = await serverRequest({
          href: `/fmadmincp/dashboard/${box}`,
          method: "get"
        });
        let { count } = data;
        if (Array.isArray(count)) count = count.length;
        return View.addContent(`#${box}`, count);
      })
    );
  };

  /////////////
  const buildMainChart = async () => {
    const { data: response } = await serverRequest({
      href: "/fmadmincp/dashboard/get-graph-data",
      method: "get"
    });
    if (!response) return;
    const dates = [];
    const days = [];
    const dateObj = {
      releases: Array(7).fill(0),
      subscribers: Array(7).fill(0),
      subscriptions: Array(7).fill(0)
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

    const addedObj = {
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      fill: false,
      lineTension: 0.1
    };

    const options = {};

    var data = {
      labels: days,
      datasets: [
        {
          label: "Subscribers",
          backgroundColor: "rgb(86, 12, 104)",
          borderColor: "rgb(86, 12, 104)",
          data: dateObj.subscribers,
          ...addedObj
        },
        {
          label: "Subscriptions",
          backgroundColor: "#91b252",
          borderColor: "#91b252",
          data: dateObj.subscriptions,
          ...addedObj
        },
        {
          label: "Releases",
          backgroundColor: "#6262af",
          borderColor: "#6262af",
          data: dateObj.releases,
          ...addedObj
        }
      ]
    };

    View.addContent("#dash-graph", ejs.render(mainChart), true);
    new Chart(View.getElement("#main-chart"), {
      type: "line",
      data,
      options
    });
  };

  //////////////////////////>>>>>>>>SUB CHART
  const buildSubChart = async () => {
    const { data: response } = await serverRequest({
      href: "/fmadmincp/dashboard/get-packages-sub-count",
      method: "get"
    });
    //COUNTING THE PACKAGE IDS ARE SERIALIZED [1,2,3,4]
    const hashMap = {
      single: 0,
      album: 1,
      basic: 2,
      professional: 3,
      "world class": 4,
      legendary: 5
    };

    const dataValues = [0, 0, 0, 0, 0, 0];

    response.forEach(
      ({ count, package: { package: packageName } }) =>
        (dataValues[hashMap[packageName.toLowerCase()]] = count)
    );

    console.log("RESPONSE: ", response);

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
            "#6262af"
          ]
        }
      ],
      labels: [
        "Single",
        "Album",
        "Basic",
        "Professional",
        "World Class",
        "Legendary"
      ]
    };
    View.addContent("#dash-doughnut", ejs.render(subChart), true);
    new Chart(View.getElement("#sub-chart"), {
      type: "doughnut",
      data: data,
      options: {}
    });
  };

  const renderLogs = async () => {
    const logs = ["dash-subscriberslog", "dash-adminlog"];
    await Promise.all(
      logs.map(async (log, i) => {
        const { data } = await serverRequest({
          href: `/fmadmincp/dashboard/${log}`,
          method: "get"
        });

        data &&
          View.addContent(
            `#${log}`,
            ejs.render(Log, { data, timeFunc, isAdmin: i }),
            true
          );
      })
    );
  };

  //DECLINE COMMENT EDIT
  const handleDeclineCommentEdit = async elem => {
    const { id } = elem.dataset;
    const declineComment = View.getElement(
      "#decline-comment"
    ).textContent.trim();
    const { value: comment, dismiss } = await Swal.fire({
      input: "textarea",
      inputValue: declineComment,
      showCancelButton: true
    });
    if (dismiss || comment.toLowerCase() === declineComment.toLowerCase())
      return;
    if (!comment)
      return View.showAlert(
        "There should be a comment for the declined release"
      );
    View.showLoader(true);
    const response = await serverRequest({
      href: `/fmadmincp/submission/action/edit-comment?id=${id}`,
      data: { comment }
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  //CONVERT ACCOUNT TO LABEL
  const handleConvertToLabel = async () => {
    View.showLoader(true);
    const response = await serverRequest({
      href: "/fmadmincp/subscriber/action/change-to-label"
    });
    if (!(R = responseHandler(response))) return;
    return View.refresh();
  };

  return {
    handleMobileMenu,
    handleBasicAction,
    handleDecline,
    handleChangeRole,
    getTopBoxesData,
    buildMainChart,
    buildSubChart,
    injectDashboardLoader,
    renderLogs,
    handleDeclineCommentEdit,
    handleStoreLinks,
    handleStoreLinksModal,
    prepareModal,
    handleConvertToLabel
  };
};
